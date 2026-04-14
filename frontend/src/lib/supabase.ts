import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase env vars ausentes: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseAnonKey || "placeholder-anon-key"
);

export async function uploadToBucket(params: {
    bucket: string;
    path: string;
    file: File;
}) {
    const { bucket, path, file } = params;

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: true,
    });

    if (error) {
        throw error;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    return {
        publicUrl: data.publicUrl,
        path,
    };
}