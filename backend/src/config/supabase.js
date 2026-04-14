require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY;

let supabase;

if (!supabaseUrl || !supabaseKey) {
  if (process.env.NODE_ENV === "test") {
    supabase = {};
  } else {
    throw new Error(
      `Missing Supabase env. SUPABASE_URL=${supabaseUrl} KEY=${supabaseKey ? "OK" : "MISSING"}`,
    );
  }
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

module.exports = supabase;