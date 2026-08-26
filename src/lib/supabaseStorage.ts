import { supabase, isSupabaseConfigured } from './supabase';

export const SUPABASE_STORAGE_BUCKET = 'app-files';

export interface UploadFileOptions {
  featureName: 'avatars' | 'logos' | 'students' | 'submissions' | 'documents' | 'media' | 'homework';
  itemId?: string;
  file: File | Blob;
  customFileName?: string;
}

export interface UploadResult {
  filePath: string;
  signedUrl: string;
  error?: Error | null;
}

/**
 * Generates a standard path starting with the user's ID:
 * ${auth.uid()}/${featureName}/${itemId}/${uuid}.${extension}
 */
export async function getStorageUserPath(
  featureName: string,
  itemId: string = 'general',
  fileName: string = 'file'
): Promise<string> {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id || 'anonymous_user';

  const ext = fileName.includes('.') ? fileName.split('.').pop() || 'dat' : 'dat';
  const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'dat';
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return `${userId}/${featureName}/${itemId}/${uniqueId}.${cleanExt}`;
}

/**
 * Uploads a file/blob to the private "app-files" bucket adhering to ${auth.uid()}/... structure
 */
export async function uploadAppFile(options: UploadFileOptions): Promise<UploadResult> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }

  const { featureName, itemId = 'general', file, customFileName } = options;
  const fileName = customFileName || (file instanceof File ? file.name : `file_${Date.now()}`);
  const filePath = await getStorageUserPath(featureName, itemId, fileName);

  const { error: uploadError } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Supabase Storage upload error:', uploadError);
    return { filePath: '', signedUrl: '', error: uploadError };
  }

  // Generate signed URL since "app-files" is private
  const { data: signedData, error: signedError } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days validity

  if (signedError || !signedData?.signedUrl) {
    console.warn('Failed to generate signed URL, falling back to filePath:', signedError);
    return { filePath, signedUrl: filePath, error: signedError };
  }

  return { filePath, signedUrl: signedData.signedUrl, error: null };
}

/**
 * Creates a signed URL for an existing file path in the private "app-files" bucket.
 * If the path is already an external HTTP URL or data URI, returns it directly.
 */
export async function getFileSignedUrl(
  filePathOrUrl: string,
  expiresInSeconds: number = 60 * 60 * 24
): Promise<string> {
  if (!filePathOrUrl) return '';
  if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://') || filePathOrUrl.startsWith('data:')) {
    return filePathOrUrl;
  }

  if (!isSupabaseConfigured()) return filePathOrUrl;

  try {
    const { data, error } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .createSignedUrl(filePathOrUrl, expiresInSeconds);

    if (error || !data?.signedUrl) {
      return filePathOrUrl;
    }
    return data.signedUrl;
  } catch (err) {
    console.warn('Error fetching signed URL for', filePathOrUrl, err);
    return filePathOrUrl;
  }
}

/**
 * Deletes a file from Supabase Storage
 */
export async function deleteAppFile(filePath: string): Promise<boolean> {
  if (!filePath || !isSupabaseConfigured()) return false;
  if (filePath.startsWith('http') || filePath.startsWith('data:')) {
    return true; // Not a storage path
  }

  try {
    const { error } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file from Supabase Storage:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete file from storage:', err);
    return false;
  }
}
