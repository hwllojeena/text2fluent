import { SupabaseAdapter } from "@auth/supabase-adapter"

async function run() {
  const adapter = SupabaseAdapter({
    url: "https://jcauncqwpfxgszidtiwb.supabase.co",
    secret: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjYXVuY3F3cGZ4Z3N6aWR0aXdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NDU4MTAsImV4cCI6MjA4OTEyMTgxMH0.8gZUEGQi1UMBLZ2x_qK_JGRchoNoKVf6HgVTJTZwUIE",
  });

  try {
    console.log("Attempting to create user...");
    const user = await adapter.createUser({
      email: "test.adapter@example.com",
      emailVerified: null,
      name: "Test Adapter",
      image: "",
    });
    console.log("Success:", user);
  } catch (error) {
    console.error("Adapter Error:", error);
  }
}

run();
