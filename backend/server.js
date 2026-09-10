const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");

const app = express();

app.use(
  cors({
    exposedHeaders: [
      "X-Original-Size",
      "X-Processed-Size",
      "X-Width",
      "X-Height",
      "X-Format",
      "X-Compression",
      "Content-Disposition",
    ],
  })
);

app.use(express.json());


// ------------------------------
// HOME ROUTE
// ------------------------------

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Image Toolbox API is running",
  });
});


// ------------------------------
// MULTER CONFIGURATION
// ------------------------------

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new Error(
          "Only JPG, PNG and WebP images are supported."
        )
      );
    }
  },
});


// ------------------------------
// IMAGE PROCESSING ROUTE
// ------------------------------

app.post(
  "/api/images/process",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload an image.",
        });
      }

      const {
        operation,
        quality,
        width,
        height,
        format,
        maintainAspect,
      } = req.body;

      const inputBuffer = req.file.buffer;

      // Read original image information
      const originalMetadata =
        await sharp(inputBuffer).metadata();

      let image = sharp(inputBuffer);

      const imageQuality = Math.min(
        100,
        Math.max(10, parseInt(quality) || 80)
      );

      let outputFormat = originalMetadata.format;

      // ------------------------------
      // COMPRESS
      // ------------------------------

      if (operation === "compress") {
        if (originalMetadata.format === "jpeg") {
          image = image.jpeg({
            quality: imageQuality,
          });
        }

        else if (originalMetadata.format === "png") {
          image = image.png({
            quality: imageQuality,
            compressionLevel: 9,
          });
        }

        else if (originalMetadata.format === "webp") {
          image = image.webp({
            quality: imageQuality,
          });
        }
      }

      // ------------------------------
      // RESIZE
      // ------------------------------

      else if (operation === "resize") {
        const targetWidth =
          width && Number(width) > 0
            ? Number(width)
            : undefined;

        const targetHeight =
          height && Number(height) > 0
            ? Number(height)
            : undefined;

        if (!targetWidth && !targetHeight) {
          return res.status(400).json({
            success: false,
            message:
              "Please enter a width or height.",
          });
        }

        if (maintainAspect === "true") {
          image = image.resize({
            width: targetWidth,
            height: targetHeight,
            fit: "inside",
          });
        } else {
          image = image.resize({
            width: targetWidth,
            height: targetHeight,
            fit: "fill",
          });
        }

        // Keep original image format
        if (originalMetadata.format === "jpeg") {
          image = image.jpeg({
            quality: imageQuality,
          });
        }

        else if (originalMetadata.format === "png") {
          image = image.png({
            compressionLevel: 9,
          });
        }

        else if (originalMetadata.format === "webp") {
          image = image.webp({
            quality: imageQuality,
          });
        }
      }

      // ------------------------------
      // CONVERT
      // ------------------------------

      else if (operation === "convert") {
        const allowedFormats = [
          "jpeg",
          "png",
          "webp",
        ];

        if (!allowedFormats.includes(format)) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid output format.",
          });
        }

        outputFormat = format;

        if (format === "jpeg") {
          image = image.jpeg({
            quality: imageQuality,
          });
        }

        else if (format === "png") {
          image = image.png({
            compressionLevel: 9,
          });
        }

        else if (format === "webp") {
          image = image.webp({
            quality: imageQuality,
          });
        }
      }

      // ------------------------------
      // INVALID OPERATION
      // ------------------------------

      else {
        return res.status(400).json({
          success: false,
          message:
            "Invalid image processing operation.",
        });
      }


      // Process the image
      const outputBuffer =
        await image.toBuffer();


      // Get processed image information
      const processedMetadata =
        await sharp(outputBuffer).metadata();


      const originalSize =
        inputBuffer.length;

      const processedSize =
        outputBuffer.length;


      const compressionPercentage =
        originalSize > 0
          ? (
              ((originalSize - processedSize) /
                originalSize) *
              100
            ).toFixed(2)
          : 0;


      // Correct file extension
      const extension =
        processedMetadata.format === "jpeg"
          ? "jpg"
          : processedMetadata.format;


      // Send information through response headers
      res.set({
        "Content-Type":
          `image/${processedMetadata.format}`,

        "Content-Disposition":
          `attachment; filename="processed-image.${extension}"`,

        "X-Original-Size":
          originalSize.toString(),

        "X-Processed-Size":
          processedSize.toString(),

        "X-Width":
          processedMetadata.width.toString(),

        "X-Height":
          processedMetadata.height.toString(),

        "X-Format":
          processedMetadata.format,

        "X-Compression":
          compressionPercentage.toString(),
      });


      // Send processed image back
      res.send(outputBuffer);

    } catch (error) {
      console.error(
        "Image processing error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Image processing failed.",
        error: error.message,
      });
    }
  }
);


// ------------------------------
// MULTER ERROR HANDLER
// ------------------------------

app.use((error, req, res, next) => {
  if (
    error instanceof multer.MulterError
  ) {
    if (
      error.code === "LIMIT_FILE_SIZE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Image must be smaller than 10 MB.",
      });
    }
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next();
});


// ------------------------------
// START SERVER
// ------------------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});