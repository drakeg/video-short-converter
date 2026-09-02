export const SUPPORTED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
]);

export const SUPPORTED_VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov', 'ogg']);
export const LARGE_FILE_WARNING_BYTES = 500 * 1024 * 1024;

export interface FileValidationResult {
  error?: string;
  warning?: string;
}

export function validateVideoFile(file: File): FileValidationResult {
  if (file.size <= 0) return { error: 'This video file is empty.' };

  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const hasSupportedType = Boolean(file.type && SUPPORTED_VIDEO_TYPES.has(file.type));
  const hasSupportedExtension = SUPPORTED_VIDEO_EXTENSIONS.has(extension);
  if (!hasSupportedType && !hasSupportedExtension) {
    return { error: 'Unsupported video format. Choose an MP4, WebM, MOV, or OGG file.' };
  }

  if (file.size >= LARGE_FILE_WARNING_BYTES) {
    const sizeGb = (file.size / (1024 ** 3)).toFixed(1);
    return { warning: `This is a large video (${sizeGb} GB). Browser processing may require substantial memory and can be slow on some devices.` };
  }

  return {};
}

export function getRuntimeSupportError(): string | null {
  if (typeof window === 'undefined') return null;
  if (typeof WebAssembly !== 'object') {
    return 'This browser does not support WebAssembly, which is required for local video processing.';
  }
  if (!window.URL?.createObjectURL) {
    return 'This browser cannot create local media URLs required by the editor.';
  }
  if (typeof Worker === 'undefined') {
    return 'This browser does not support Web Workers, which are required for video processing.';
  }
  return null;
}
