const SAFE_VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'webm', 'ogg']);

const MIME_EXTENSION_MAP: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'video/ogg': 'ogg',
};

export function resolveVideoSourceExtension(file: Pick<File, 'name' | 'type'>): string {
  const nameExtension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (SAFE_VIDEO_EXTENSIONS.has(nameExtension)) return nameExtension;

  const mimeExtension = MIME_EXTENSION_MAP[file.type.toLowerCase()];
  return mimeExtension ?? 'mp4';
}

export function buildProcessorInputName(
  file: Pick<File, 'name' | 'type'>,
  suffix: string,
): string {
  return `input-${suffix}.${resolveVideoSourceExtension(file)}`;
}
