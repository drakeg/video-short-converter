import type { AudioExportOptions, CaptionBurnInOptions, OutputOptions } from '@/utils/videoProcessor';
import type { ClipExportSettings, ClipQueueItem } from './clipQueue';
import { sanitizeClipName } from './clipQueue';
import type { VideoExportOptions } from './editorConfig';
import { clipTranscript, type TranscriptCue } from './transcript';

export interface ClipRenderOptions {
  video: VideoExportOptions;
  audio: AudioExportOptions;
  output: OutputOptions;
  captions: CaptionBurnInOptions;
}

export function buildClipRenderOptions(
  clip: ClipQueueItem,
  index: number,
  current: ClipExportSettings,
  transcriptCues: TranscriptCue[],
): ClipRenderOptions {
  const settings = clip.settings ?? current;
  return {
    video: {
      presetId: settings.presetId,
      cropPosition: settings.cropPosition,
      cropPositionY: settings.cropPositionY,
      quality: settings.quality,
      frameRate: settings.frameRate,
    },
    audio: {
      muted: settings.muted,
      gainDb: settings.gainDb,
      normalize: settings.normalize,
      fadeIn: settings.fadeIn,
      fadeOut: settings.fadeOut,
    },
    output: {
      clipName: sanitizeClipName(clip.name, `clip-${index + 1}`),
    },
    captions: {
      enabled: settings.burnCaptions,
      cues: clipTranscript(transcriptCues, clip.start, clip.end),
      style: settings.captionStyle,
    },
  };
}
