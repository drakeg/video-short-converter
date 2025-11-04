# Video Shorts Editor

A modern web application for trimming and converting videos to portrait format, perfect for creating Shorts, Reels, and TikTok content.

## Features

- **Simple Video Upload**: Easily upload your videos directly from your device
- **Precise Trimming**: Set exact start and end points for your video clips
- **Portrait Format**: Automatically converts videos to 9:16 aspect ratio (1080x1920)
- **User-Friendly Interface**: Intuitive controls and real-time preview
- **Fast Processing**: Quick trimming and conversion with progress tracking
- **Responsive Design**: Works on both desktop and mobile devices

## Supported Formats

- MP4
- WebM
- MOV

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm, yarn, or pnpm
- Modern web browser with JavaScript enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/video-shorts-editor.git
   cd video-shorts-editor
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. **Upload Your Video**
   - Click "Select Video" to choose a video file from your device
   - Supported formats: MP4, WebM, MOV (up to 100MB)

2. **Trim Your Clip**
   - Play the video to find the perfect start point
   - Click "Mark Start" to set the beginning of your short
   - Click "Mark End" to set the end of your short (max 60 seconds recommended)
   - Use the timeline to fine-tune your selection

3. **Download Your Short**
   - Click "Download Short" to process your video
   - The processed video will automatically download in MP4 format

## Tips for Best Results

- For best quality, use well-lit videos with clear audio
- Keep your shorts under 60 seconds for most platforms
- Center important content in the frame for optimal portrait display
- Use videos with high resolution (at least 1080x1920 for best quality)

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) - For video processing in the browser
- [React Icons](https://react-icons.github.io/react-icons/) - For UI icons

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
