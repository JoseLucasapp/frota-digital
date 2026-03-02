require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    `Missing Supabase env. SUPABASE_URL=${supabaseUrl} KEY=${supabaseKey ? "OK" : "MISSING"}`,
  );
}

console.log("Supabase URL loaded:", supabaseUrl);

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
);
module.exports = supabase;
