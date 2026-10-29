import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Missing Supabase credentials' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'products'; // 'products' or 'branding'

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Ensure target bucket exists & is public
    const bucketName = folder === 'branding' ? 'branding' : 'products';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === bucketName);

    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
        fileSizeLimit: 10485760, // 10MB
      });
    }

    // Convert file to Buffer & process via Sharp to WebP format
    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    let processedBuffer = inputBuffer;
    let fileExtension = 'webp';
    let mimeType = 'image/webp';

    try {
      processedBuffer = await sharp(inputBuffer)
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      // If Sharp processing fails (e.g. SVG), fall back to original buffer
      fileExtension = file.name.split('.').pop() || 'png';
      mimeType = file.type || 'image/png';
    }

    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const filename = `${folder}_${uniqueId}.${fileExtension}`;

    // Upload to Supabase Storage bucket
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filename, processedBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
    }

    // Retrieve public CDN URL
    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filename);
    const publicUrl = publicUrlData.publicUrl;

    // Register media table entry
    try {
      await supabase.from('media').insert({
        filename,
        original_name: file.name,
        mime_type: mimeType,
        size_bytes: processedBuffer.length,
        public_url: publicUrl,
        folder: bucketName,
      });
    } catch {
      // Non-blocking if media table registration fails
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      sizeBytes: processedBuffer.length,
    });
  } catch (err: any) {
    console.error('Upload handler error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Upload processing failed' }, { status: 500 });
  }
}
