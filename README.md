# Image Toolbox

Image Toolbox is a full-stack web application that allows users to compress, resize, and convert images directly from the browser.

## Features

- Upload images using file selection or drag and drop
- Supports JPG, PNG, and WebP
- Compress images with adjustable quality
- Resize images using custom width and height
- Maintain image aspect ratio while resizing
- Convert images between JPG, PNG, and WebP
- Preview original and processed images
- Display original and processed file sizes
- Show image dimensions and format
- Download the processed image
- Maximum upload size of 10 MB
- Validation for unsupported files

## Technologies Used

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- Multer
- Sharp
- CORS

## How It Works

The frontend sends the uploaded image and selected processing options to the Express backend using FormData.

Multer receives the uploaded image in memory, and Sharp performs image compression, resizing, or format conversion.

The processed image is then returned to the frontend where it can be previewed and downloaded.

## Run Locally

### Backend

```bash
cd backend
npm install
node server.js