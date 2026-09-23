export function createReplacementObjectUrl(previousUrl: string | null, file: Blob): string {
  if (previousUrl) URL.revokeObjectURL(previousUrl);
  return URL.createObjectURL(file);
}

export function revokeObjectUrl(url: string | null): void {
  if (url) URL.revokeObjectURL(url);
}

export function downloadBrowserFile(file: File): void {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.name;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
