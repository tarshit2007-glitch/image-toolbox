# Image Toolbox

Image Toolbox is a full-stack web application that allows users to compress, resize, and convert images directly from the browser.

## Live Demo

Frontend: https://image-toolbox-kappa.vercel.app/

Backend API: https://image-toolbox-5796.onrender.com

## Features

- Upload images using file selection or drag and drop
- Supports JPG, PNG, and WebP images
- Compress images with adjustable quality
- Resize images using custom width and height
- Maintain the original aspect ratio while resizing
- Convert images between JPG, PNG, and WebP
- Preview the original and processed images
- Display original and processed file sizes
- Display image dimensions and format
- Show percentage change in file size
- Download the processed image
- Maximum upload size of 10 MB
- Validation for unsupported image formats

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

### Deployment

- Vercel - Frontend
- Render - Backend
- GitHub - Source code

## How It Works

The user selects or drags and drops an image into the application.

The React frontend collects the image and processing options such as compression quality, resize dimensions, or output format.

The frontend sends the image and selected options to the Express backend using `FormData`.

Multer receives the uploaded image and stores it temporarily in memory.

Sharp processes the image based on the selected operation:

- Compression
- Resizing
- Format conversion

The backend returns the processed image along with information such as file size, dimensions, format, and compression percentage.

The frontend then displays a preview of the processed image and allows the user to download it.

## Supported Image Formats

- JPG / JPEG
- PNG
- WebP

## Maximum File Size

The maximum supported upload size is:

```text
10 MB
```

## Run Locally

First clone the repository:

```bash
git clone https://github.com/tarshit2007-glitch/image-toolbox.git
```

Move into the project folder:

```bash
cd image-toolbox
```

### Run the Backend

Move into the backend folder:

```bash
cd backend
```

Install the required packages:

```bash
npm install
```

Start the backend server:

```bash
node server.js
```

The backend will run at:

```text
http://localhost:5000
```

### Run the Frontend

Open another terminal and move into the frontend folder:

```bash
cd frontend
```

Install the frontend dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

Open the frontend URL in your browser to use the application.

## Project Structure

```text
image-toolbox/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## API Endpoint

The main image processing endpoint is:

```text
POST /api/images/process
```

The request is sent using `multipart/form-data`.

Depending on the selected operation, the request can contain:

- `image`
- `operation`
- `quality`
- `width`
- `height`
- `format`
- `maintainAspect`

## Image Processing

### Compression

Users can select an image quality percentage to reduce the file size.

### Resize

Users can provide a custom width or height and choose whether to maintain the original aspect ratio.

### Format Conversion

Images can be converted between:

```text
JPG
PNG
WebP
```

## Validation

The application validates uploaded files before processing.

It rejects:

- Unsupported file formats
- Files larger than 10 MB
- Invalid processing requests

## Deployment

The application is deployed using separate frontend and backend services.

### Frontend

The React frontend is deployed on Vercel:

https://image-toolbox-kappa.vercel.app/

### Backend

The Node.js and Express backend is deployed on Render:

https://image-toolbox-5796.onrender.com

The frontend uses the `VITE_API_URL` environment variable to communicate with the deployed backend.

## Author

Tarshit

## Repository

GitHub Repository:

https://github.com/tarshit2007-glitch/image-toolbox