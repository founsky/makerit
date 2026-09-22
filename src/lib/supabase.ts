import { createClient } from '@supabase/supabase-js'

// Client public (browser + server) — lecture des fichiers publics
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Upload un fichier vers Supabase Storage
// bucket: 'models' (STL) ou 'thumbnails' (images)
export async function uploadToStorage(
  bucket: 'models' | 'thumbnails',
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop()
  const filename = `${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, { cacheControl: '3600', upsert: false })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return data.publicUrl
}
