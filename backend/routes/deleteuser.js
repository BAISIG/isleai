import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// This code only runs after a network connection is successfully made.
// The ECONNREFUSED error happens before this file's logic is ever executed.

// Ensure these environment variables are loaded from your .env file
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  // This causes the server to stop if keys are missing, which is good practice.
  process.exit(1);
}

// Initialize Supabase Admin client with service role key
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * @route POST /api/delete-user
 * @description Deletes a user account and associated data from Supabase.
 * Requires a userId in the request body and a valid access token in the Authorization header.
 */
router.post("/delete-user", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  console.log("✅ Connection successful! Received delete user request. Body:", req.body);

  const { userId } = req.body;
  const authHeader = req.headers.authorization || "";
  const userAccessToken = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!userId || !userAccessToken) {
    console.error("❌ Missing required fields:", { userId, userAccessToken: userAccessToken ? "Provided" : "Missing" });
    return res.status(400).json({ error: "Missing userId or authorization header." });
  }

  try {
    // Verify JWT token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(userAccessToken);
    if (authError) {
      console.error("❌ Authentication error:", authError.message);
      return res.status(401).json({ error: "Authentication failed: Invalid token." });
    }

    if (!user || user.id !== userId) {
      console.error("❌ Authorization failed:", { tokenUserId: user?.id, requestUserId: userId });
      return res.status(403).json({ error: "Authorization failed: User ID mismatch or unauthorized." });
    }

    // Check if user exists
    const { data: userData, error: userCheckError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userCheckError || !userData.user) {
      console.error("❌ User check failed:", {
        userId,
        message: userCheckError?.message,
        details: userCheckError?.details,
        hint: userCheckError?.hint,
        code: userCheckError?.code
      });
      return res.status(404).json({ error: "User not found or unable to verify." });
    }
    console.log("✅ User exists:", userData.user.id);

    // Delete related data from dependent tables
    const tablesToClear = ['user_packages', 'active_user_package', 'messages', 'saved_chats'];
    for (const table of tablesToClear) {
      console.log(`Attempting to delete data from '${table}' for user: ${userId}`);
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq('user_id', userId);
      if (error) {
        console.error(`⚠️ Failed to delete from ${table} for user ${userId}:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
      } else {
        console.log(`✅ Deleted data from ${table} for user ${userId}`);
      }
    }

    // Delete user from auth.users
    console.log(`Attempting to delete user from auth.users: ${userId}`);
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      console.error("❌ Supabase user deletion error:", {
        userId,
        message: deleteUserError.message,
        details: deleteUserError.details || "No details provided",
        hint: deleteUserError.hint || "No hint provided",
        code: deleteUserError.code || "No code provided"
      });
      return res.status(500).json({
        error: `Failed to delete user from authentication: ${deleteUserError.message}`,
        details: deleteUserError.details,
        hint: deleteUserError.hint,
        code: deleteUserError.code
      });
    }

    console.log(`✅ User ${userId} and associated data deleted successfully.`);
    return res.status(200).json({ message: "Account deleted successfully." });

  } catch (err) {
    console.error("❌ Unexpected error:", {
      message: err.message,
      stack: err.stack,
      requestBody: req.body,
    });
    return res.status(500).json({ error: `An unexpected error occurred: ${err.message}` });
  }
});

export default router;
