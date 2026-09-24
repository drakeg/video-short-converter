export interface StreamMappingOptions {
  captionVideoLabel?: string;
  muted?: boolean;
}

export function buildOutputStreamMapping(options: StreamMappingOptions = {}): string[] {
  const args = options.captionVideoLabel
    ? ['-map', options.captionVideoLabel]
    : ['-map', '0:v:0'];

  if (!options.muted) args.push('-map', '0:a:0?');
  return args;
}
