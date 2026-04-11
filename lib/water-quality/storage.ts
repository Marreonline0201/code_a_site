import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export async function loadTextFromSupabaseStorage(
  bucket: string,
  objectPath: string,
): Promise<{ sourcePath: string; mtimeMs: number; text: string }> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(bucket).download(objectPath);

  if (error || !data) {
    throw new Error(
      `Failed to download Supabase storage object "${bucket}/${objectPath}": ${error?.message ?? "Unknown error"}`,
    );
  }

  const text = await data.text();
  return {
    sourcePath: `supabase://${bucket}/${objectPath}`,
    mtimeMs: hashText(text),
    text,
  };
}
