import { useState, useCallback } from 'react';
import { uploadImage } from '@/lib/api';
import { getErrorMessage } from '@/lib/api-errors';

export interface UseImageUploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
}

/**
 * Hook for handling image uploads
 * @example
 * const { upload, loading, error, previewUrl } = useImageUpload();
 * const filename = await upload(file);
 */
export function useImageUpload(options: UseImageUploadOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  const {
    maxSizeMB = 10,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  } = options;

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!allowedTypes.includes(file.type)) {
        return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
      }

      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return `File too large. Maximum size: ${maxSizeMB}MB`;
      }

      return null;
    },
    [allowedTypes, maxSizeMB]
  );

  const createPreview = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return url;
  }, []);

  const revokePreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return null;
      }

      // Create preview
      createPreview(file);

      // Upload
      setLoading(true);
      setError(null);

      try {
        const uploadedFilename = await uploadImage(file);
        setFilename(uploadedFilename);
        return uploadedFilename;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [validateFile, createPreview]
  );

  const reset = useCallback(() => {
    revokePreview();
    setFilename(null);
    setError(null);
    setLoading(false);
  }, [revokePreview]);

  return {
    upload,
    loading,
    error,
    previewUrl,
    filename,
    reset,
  };
}
