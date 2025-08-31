import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCreateAndDelete() {
  try {
    // Create a test user
    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword'
    });
    if (createError) {
      console.error("Failed to create test user:", createError);
      return;
    }
    console.log("Test user created:", data.user.id);

    // Delete related data
    const tablesToClear = ['user_packages', 'active_user_package', 'messages', 'saved_chats'];
    for (const table of tablesToClear) {
      const { error } = await supabaseAdmin.from(table).delete().eq('user_id', data.user.id);
      if (error) {
        console.error(`Failed to delete from ${table}:`, error);
      } else {
        console.log(`Deleted from ${table}`);
      }
    }

    // Delete user
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    if (error) {
      console.error("Deletion error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return;
    }
    console.log("Test user deleted successfully:", data.user.id);
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

testCreateAndDelete();