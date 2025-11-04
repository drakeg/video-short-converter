import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

// Only import FFmpeg in browser environment
let ffmpegInstance: any = null;
let isInitializing = false;

// This ensures FFmpeg is only loaded on the client side
async function getFFmpegClient(progressCallback?: (progress: number) => void) {
  if (typeof window === 'undefined') {
    throw new Error('FFmpeg can only be used in the browser');
  }

  // If already initialized, return the instance
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  // If already initializing, wait for it to complete
  if (isInitializing) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (ffmpegInstance) {
          clearInterval(checkInterval);
          resolve(ffmpegInstance);
        } else if (!isInitializing) {
          clearInterval(checkInterval);
          reject(new Error('FFmpeg initialization failed'));
        }
      }, 100);
    });
  }

  isInitializing = true;
  
  try {
    console.log('Initializing FFmpeg...');
    
    // Use a more reliable CDN for FFmpeg core
    const corePath = 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js';
    
    console.log('Using FFmpeg core from:', corePath);
    
    const ffmpeg = createFFmpeg({ 
      log: true,
      logger: ({ type, message }) => {
        // Filter out excessive logs
        if (!message.includes('Last message repeated') && !message.includes('frame=')) {
          console.log(`[FFmpeg ${type}]:`, message);
        }
      },
      corePath,
      progress: ({ ratio }) => {
        if (ratio < 1 && progressCallback) {
          const percent = Math.min(99, Math.round(ratio * 100));
          progressCallback(percent);
        }
      }
    });

    console.log('Loading FFmpeg core...');
    await ffmpeg.load();
    console.log('FFmpeg core loaded successfully');
    
    ffmpegInstance = ffmpeg;
    isInitializing = false;
    return ffmpeg;
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    isInitializing = false;
    throw new Error('Failed to load video processor. Please check your internet connection and try again.');
  }
}

export async function trimVideo(
  file: File, 
  startTime: number, 
  endTime: number,
  onProgress?: (progress: number) => void
): Promise<File> {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    throw new Error('Video trimming is only available in the browser');
  }
  
  console.log(`Starting video trim: ${file.name}, start: ${startTime}s, end: ${endTime}s`);
  
  // Get FFmpeg instance and fetchFile utility
  const ffmpeg = await getFFmpegClient(onProgress);
  const { fetchFile } = await import('@ffmpeg/ffmpeg');
  
  // Ensure FFmpeg is loaded
  if (!ffmpeg.isLoaded()) {
    console.log('FFmpeg not loaded, attempting to load...');
    await ffmpeg.load();
  }
  
  // Write the file to FFmpeg's virtual file system
  const inputName = 'input.mp4';
  const outputName = 'output.mp4';
  
  try {
    console.log('Reading input file...');
    const fileData = await fetchFile(file);
    const fileSize = fileData instanceof Uint8Array ? fileData.length : (fileData as ArrayBuffer).byteLength;
    console.log(`Input file size: ${(fileSize / (1024 * 1024)).toFixed(2)}MB`);
    
    console.log('Writing file to FFmpeg virtual filesystem...');
    // Convert to Uint8Array if it's an ArrayBuffer
    const fileBuffer = fileData instanceof Uint8Array ? fileData : new Uint8Array(fileData as ArrayBuffer);
    ffmpeg.FS('writeFile', inputName, fileBuffer);
    
    // Verify file was written
    try {
      const files = ffmpeg.FS('readdir', '/');
      console.log('Files in FFmpeg FS:', files);
    } catch (e) {
      console.error('Error listing FFmpeg filesystem:', e);
    }
    
    // Calculate duration
    const duration = endTime - startTime;
    
    // Run FFmpeg command to trim and convert to portrait (9:16)
    console.log('Starting FFmpeg processing...');
    
    // Convert seconds to HH:MM:SS format for FFmpeg
    const formatTime = (seconds: number): string => {
      const date = new Date(0);
      date.setSeconds(seconds);
      return date.toISOString().substr(11, 8);
    };
    
    // Set up progress tracking
    let lastProgressUpdate = 0;
    const updateProgress = (progress: number) => {
      const now = Date.now();
      // Only update progress at most every 100ms to avoid UI thrashing
      if (now - lastProgressUpdate > 100 && onProgress) {
        // Scale progress to 0-90% range to leave room for final processing
        onProgress(progress * 0.9);
        lastProgressUpdate = now;
      }
    };
    
    // FFmpeg command to trim and convert to portrait mode
    const args = [
      // Input file
      '-i', inputName,
      
      // Set start time and duration
      '-ss', formatTime(startTime),
      '-to', formatTime(endTime),
      
      // Video filter for cropping and scaling
      '-vf', 'crop=ih*(9/16):ih,scale=1080:1920',
      
      // Video codec and settings
      '-c:v', 'libx264',     // Use H.264 codec
      '-preset', 'medium',   // Balanced encoding speed and file size
      '-crf', '23',          // Quality (18-28 is good, lower is better quality)
      '-pix_fmt', 'yuv420p', // Standard pixel format for compatibility
      
      // Audio settings
      '-c:a', 'aac',         // Use AAC audio codec
      '-b:a', '128k',        // Audio bitrate
      
      // Output settings
      '-y',                  // Overwrite output file if exists
      outputName
    ];
    
    console.log('Using portrait mode conversion with crop and scale');
    
    console.log('FFmpeg command:', 'ffmpeg ' + args.join(' '));
    
    // Enable FFmpeg logging and progress tracking
    ffmpeg.setLogging(true);
    ffmpeg.setLogger(({ type, message }: { type: string; message: string }) => {
      // Extract progress from FFmpeg output if available
      const timeMatch = message.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
      if (timeMatch && onProgress) {
        const timeParts = timeMatch[1].split(':').map(parseFloat);
        const seconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
        const progress = Math.min(1, seconds / duration);
        updateProgress(progress);
      }
      console.log(`[FFmpeg ${type}]:`, message);
    });
    
    // Set up progress handler for newer versions of FFmpeg.wasm
    ffmpeg.setProgress(({ ratio }: { ratio: number }) => {
      if (onProgress && ratio) {
        updateProgress(ratio);
      }
    });
    
    console.log('Running FFmpeg with args:', args.join(' '));
    
    try {
      // Update progress to show we're starting
      if (onProgress) onProgress(0.05);
      
      // Run FFmpeg
      await ffmpeg.run(...args);
      console.log('FFmpeg processing completed');
      
      // Update progress to show processing is complete
      if (onProgress) onProgress(0.95);
    } catch (error) {
      console.error('FFmpeg error:', error);
      // Try to get FFmpeg logs for debugging
      try {
        const log = ffmpeg.FS('readFile', 'ffmpeg.log');
        console.log('FFmpeg log:', new TextDecoder().decode(log));
      } catch (logError) {
        console.error('Could not read FFmpeg log:', logError);
      }
      throw error;
    }

    // List files in the virtual filesystem for debugging
    try {
      const files = ffmpeg.FS('readdir', '/');
      console.log('Files in FFmpeg FS after processing:', files);
      
      // Check if output file exists
      if (!files.includes(outputName)) {
        throw new Error(`Output file ${outputName} not found in FFmpeg filesystem`);
      }
      
      // Get file stats
      const stats = ffmpeg.FS('stat', `/${outputName}`);
      console.log('Output file stats:', stats);
      
      // Read the output file
      console.log('Reading output file...');
      let data;
      try {
        data = ffmpeg.FS('readFile', outputName);
        
        // Check if the output is valid
        if (!data || data.length === 0) {
          throw new Error('Output file is empty');
        }
      } catch (error) {
        console.error('Error reading output file:', error);
        // Try to get FFmpeg logs for debugging
        try {
          const log = ffmpeg.FS('readFile', 'ffmpeg.log');
          console.log('FFmpeg log:', new TextDecoder().decode(log));
        } catch (logError) {
          console.error('Could not read FFmpeg log:', logError);
        }
        throw error;
      }
      
      // Log the output size for debugging
      console.log(`Output video size: ${(data.length / (1024 * 1024)).toFixed(2)}MB`);
      
      // Create a Blob from the Uint8Array
      const blob = new Blob([data], { type: 'video/mp4' });
      
      // Verify the blob
      if (blob.size === 0) {
        throw new Error('Created blob is empty');
      }
      
      console.log('Blob created successfully, size:', (blob.size / (1024 * 1024)).toFixed(2), 'MB');
      
      // Create a new File object with the trimmed video
      const outputFile = new File(
        [blob], 
        `short-${file.name.replace(/\.[^/.]+$/, '')}-${Date.now()}.mp4`,
        { type: 'video/mp4' }
      );
      
      console.log('Output file created:', outputFile.name, 'size:', (outputFile.size / (1024 * 1024)).toFixed(2), 'MB');
      
      return outputFile;
    } catch (error) {
      console.error('Error reading output file:', error);
      throw new Error(`Failed to read output file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error during video processing:', error);
    
    // Try to get FFmpeg logs
    try {
      if (ffmpeg) {
        const logFiles = ffmpeg.FS('readdir', '/');
        console.log('Available log files:', logFiles);
        
        // Try to read any available log files
        for (const file of logFiles) {
          if (file.endsWith('.log') || file === 'logs.txt' || file === 'ffmpeg.log') {
            try {
              const logContent = ffmpeg.FS('readFile', `/${file}`);
              console.log(`FFmpeg log (${file}):`, new TextDecoder().decode(logContent));
            } catch (e) {
              console.error(`Failed to read log file ${file}:`, e);
            }
          }
        }
      }
    } catch (logError) {
      console.error('Could not read FFmpeg logs:', logError);
    }
    
    throw new Error(`Video processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Clean up in finally block to ensure it runs even if there's an error
    try {
      if (ffmpeg) {
        try {
          // Check if file exists before trying to unlink
          const files = ffmpeg.FS('readdir', '/');
          if (files.includes('input.mp4')) {
            ffmpeg.FS('unlink', 'input.mp4');
          }
          if (files.includes('output.mp4')) {
            ffmpeg.FS('unlink', 'output.mp4');
          }
        } catch (fsError) {
          console.error('Error cleaning up files:', fsError);
        }
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
  }
}
