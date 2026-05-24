import imageCompression from 'browser-image-compression';
import { supabase } from '@/lib/supabase';

export async function uploadImage(file: File, folder: 'requests' | 'success'): Promise<string | null> {
  try {
    // 1. Compress Image
    const options = {
      maxSizeMB: 0.5, // 500KB max size
      maxWidthOrHeight: 1280, // max 1280px to maintain quality but reduce size
      useWebWorker: true,
      fileType: 'image/webp', // Convert everything to WebP for maximum compression
    };
    
    const compressedFile = await imageCompression(file, options);

    // Check if Supabase is actually configured. If it's the default boilerplate or empty, simulate upload.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (!supabaseUrl || supabaseUrl.includes('your-project')) {
      console.warn("⚠️ Supabase is not fully configured. Simulating image upload.");
      // Return a simulated URL using object URL for local testing
      return URL.createObjectURL(compressedFile);
    }

    // 2. Upload to Supabase Storage
    const fileExt = 'webp'; // Force WebP extension since we converted it
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('job-images')
      .upload(fileName, compressedFile, {
        cacheControl: '31536000', // 1 year cache
        upsert: false
      });

    if (error) {
      console.error('Error uploading image to Supabase:', error.message);
      return null;
    }

    // 3. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('job-images')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error in compress & upload process:', error);
    return null;
  }
}
