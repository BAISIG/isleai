
import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

// Supabase REST client
const supabase = createClient(
  process.env.SUPABASE_URL || "https://lgurtucciqvwgjaphdqp.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndXJ0dWNjaXF2d2dqYXBoZHFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTYzODM1MCwiZXhwIjoyMDQ1MjE0MzUwfQ.KqpLlaKcaipG6wqg1lcNrhzUQW_r_uPZXWAmGxZFzv8"
);

// Validate credentials
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY is missing in environment variables.");
  process.exit(1);
}

router.get("/notifications", async (req, res) => {
  try {
    console.log("Attempting Supabase REST API...");
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("❌ Supabase REST API failed:", error);
      throw error;
    }
    console.log("✅ Supabase REST API successful, rows:", data.length);
    return res.json(data);
  } catch (err) {
    console.error("❌ Error in /api/notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications", details: err.message });
  }
});

export default router;
