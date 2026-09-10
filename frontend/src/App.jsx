import { useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processedPreview, setProcessedPreview] = useState(null);

  const [imageSize, setImageSize] = useState({
    width: 0,
    height: 0,
  });

  const [operation, setOperation] = useState("compress");
  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [outputFormat, setOutputFormat] = useState("webp");
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);

  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectImage = (selectedFile) => {
    if (!selectedFile) return;

    const supportedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!supportedTypes.includes(selectedFile.type)) {
      alert("Please upload a JPG, PNG, or WebP image.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("The image must be smaller than 10 MB.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    if (processedPreview) {
      URL.revokeObjectURL(processedPreview);
    }

    const imageUrl = URL.createObjectURL(selectedFile);

    setFile(selectedFile);
    setPreview(imageUrl);
    setProcessedPreview(null);
    setResult(null);
    setErrorMessage("");

    const image = new Image();

    image.onload = () => {
      setImageSize({
        width: image.width,
        height: image.height,
      });
    };

    image.src = imageUrl;
  };

  const handleFileInput = (event) => {
    selectImage(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    selectImage(event.dataTransfer.files[0]);
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getSizeChange = () => {
    if (!result) return "";

    if (result.compression >= 0) {
      return `${result.compression.toFixed(2)}% smaller`;
    }

    return `${Math.abs(result.compression).toFixed(2)}% larger`;
  };

  const getOperationDescription = () => {
    if (operation === "compress") {
      return "Reduce the file size by adjusting image quality.";
    }

    if (operation === "resize") {
      return "Change the image dimensions while optionally keeping its aspect ratio.";
    }

    return "Change the image format between JPG, PNG, and WebP.";
  };

  const handleProcessImage = async () => {
    if (!file) {
      alert("Please choose an image first.");
      return;
    }

    if (operation === "resize" && !width && !height) {
      alert("Enter at least a width or height.");
      return;
    }

    setProcessing(true);
    setErrorMessage("");
    setResult(null);

    if (processedPreview) {
      URL.revokeObjectURL(processedPreview);
      setProcessedPreview(null);
    }

    try {
      const formData = new FormData();

      formData.append("image", file);
      formData.append("operation", operation);
      formData.append("quality", quality);
      formData.append("width", width);
      formData.append("height", height);
      formData.append("format", outputFormat);
      formData.append(
        "maintainAspect",
        keepAspectRatio.toString()
      );

      const response = await fetch(
        `${API_URL}/api/images/process`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const contentType =
          response.headers.get("content-type");

        if (
          contentType &&
          contentType.includes("application/json")
        ) {
          const errorData = await response.json();

          throw new Error(
            errorData.message || "Unable to process image."
          );
        }

        throw new Error(
          `Server error: ${response.status}`
        );
      }

      const blob = await response.blob();
      const resultUrl = URL.createObjectURL(blob);

      setProcessedPreview(resultUrl);

      setResult({
        blob,

        originalSize: Number(
          response.headers.get("X-Original-Size")
        ),

        processedSize: Number(
          response.headers.get("X-Processed-Size")
        ),

        width: Number(
          response.headers.get("X-Width")
        ),

        height: Number(
          response.headers.get("X-Height")
        ),

        format:
          response.headers.get("X-Format"),

        compression: Number(
          response.headers.get("X-Compression")
        ),
      });
    } catch (error) {
      console.error(error);

      setErrorMessage(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;

    const downloadUrl =
      URL.createObjectURL(result.blob);

    const link = document.createElement("a");

    const extension =
      result.format === "jpeg"
        ? "jpg"
        : result.format;

    link.href = downloadUrl;
    link.download = `processed-image.${extension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(downloadUrl);
  };

  const clearImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    if (processedPreview) {
      URL.revokeObjectURL(processedPreview);
    }

    setFile(null);
    setPreview(null);
    setProcessedPreview(null);

    setImageSize({
      width: 0,
      height: 0,
    });

    setOperation("compress");
    setQuality(80);
    setWidth("");
    setHeight("");
    setOutputFormat("webp");
    setKeepAspectRatio(true);

    setResult(null);
    setErrorMessage("");
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Image Toolbox</h1>

        <p>
          Choose an image to compress, resize, or
          convert directly from your browser.
        </p>
      </header>

      <main className="container">
        <section
          className="upload-box"
          onDragOver={(event) =>
            event.preventDefault()
          }
          onDrop={handleDrop}
        >
          <div className="upload-icon">↑</div>

          <h2>Upload an Image</h2>

          <p>
            Drag and drop an image here or choose one
            from your device.
          </p>

          <p>
            JPG, PNG and WebP • Maximum 10 MB
          </p>

          <label className="browse-button">
            Choose Image

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInput}
            />
          </label>
        </section>

        {file && (
          <>
            <section className="card">
              <h2>Selected Image</h2>

              <div className="image-info-layout">
                <div className="original-preview">
                  <img
                    src={preview}
                    alt="Selected"
                  />
                </div>

                <div className="file-details">
                  <div className="detail-row">
                    <span>Filename</span>
                    <strong>{file.name}</strong>
                  </div>

                  <div className="detail-row">
                    <span>Type</span>
                    <strong>{file.type}</strong>
                  </div>

                  <div className="detail-row">
                    <span>Size</span>
                    <strong>
                      {formatBytes(file.size)}
                    </strong>
                  </div>

                  <div className="detail-row">
                    <span>Dimensions</span>
                    <strong>
                      {imageSize.width} ×{" "}
                      {imageSize.height}
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="card">
              <h2>Image Options</h2>

              <div className="form-group">
                <label>What would you like to do?</label>

                <select
                  value={operation}
                  onChange={(event) => {
                    setOperation(event.target.value);
                    setResult(null);
                    setErrorMessage("");

                    if (processedPreview) {
                      URL.revokeObjectURL(
                        processedPreview
                      );

                      setProcessedPreview(null);
                    }
                  }}
                >
                  <option value="compress">
                    Compress
                  </option>

                  <option value="resize">
                    Resize
                  </option>

                  <option value="convert">
                    Convert Format
                  </option>
                </select>
              </div>

              <p className="operation-description">
                {getOperationDescription()}
              </p>

              {operation === "compress" && (
                <div className="form-group">
                  <label>
                    Image quality: {quality}%
                  </label>

                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(event) =>
                      setQuality(event.target.value)
                    }
                  />
                </div>
              )}

              {operation === "resize" && (
                <>
                  <div className="resize-grid">
                    <div className="form-group">
                      <label>Width</label>

                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 1200"
                        value={width}
                        onChange={(event) =>
                          setWidth(event.target.value)
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Height</label>

                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 800"
                        value={height}
                        onChange={(event) =>
                          setHeight(event.target.value)
                        }
                      />
                    </div>
                  </div>

                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={keepAspectRatio}
                      onChange={(event) =>
                        setKeepAspectRatio(
                          event.target.checked
                        )
                      }
                    />

                    Keep original aspect ratio
                  </label>
                </>
              )}

              {operation === "convert" && (
                <div className="form-group">
                  <label>Output format</label>

                  <select
                    value={outputFormat}
                    onChange={(event) =>
                      setOutputFormat(
                        event.target.value
                      )
                    }
                  >
                    <option value="jpeg">
                      JPG
                    </option>

                    <option value="png">
                      PNG
                    </option>

                    <option value="webp">
                      WebP
                    </option>
                  </select>
                </div>
              )}

              {errorMessage && (
                <p className="error-message">
                  {errorMessage}
                </p>
              )}

              <button
                className="process-button"
                onClick={handleProcessImage}
                disabled={processing}
              >
                {processing
                  ? "Processing image..."
                  : "Process Image"}
              </button>
            </section>
          </>
        )}

        {result && processedPreview && (
          <section className="card result-card">
            <h2>Your Result</h2>

            <div className="comparison-grid">
              <div className="comparison-item">
                <h3>Original</h3>

                <div className="result-preview">
                  <img
                    src={preview}
                    alt="Original"
                  />
                </div>

                <p>
                  {formatBytes(result.originalSize)}
                </p>
              </div>

              <div className="comparison-item">
                <h3>Processed</h3>

                <div className="result-preview">
                  <img
                    src={processedPreview}
                    alt="Processed"
                  />
                </div>

                <p>
                  {formatBytes(result.processedSize)}
                </p>
              </div>
            </div>

            <div className="result-stats">
              <div className="stat-box">
                <span>Original size</span>

                <strong>
                  {formatBytes(result.originalSize)}
                </strong>
              </div>

              <div className="stat-box">
                <span>Processed size</span>

                <strong>
                  {formatBytes(result.processedSize)}
                </strong>
              </div>

              <div className="stat-box">
                <span>Size change</span>

                <strong>
                  {getSizeChange()}
                </strong>
              </div>

              <div className="stat-box">
                <span>Dimensions</span>

                <strong>
                  {result.width} × {result.height}
                </strong>
              </div>

              <div className="stat-box">
                <span>Format</span>

                <strong>
                  {result.format?.toUpperCase()}
                </strong>
              </div>
            </div>

            <button
              className="download-button"
              onClick={downloadResult}
            >
              Download Image
            </button>

            <button
              className="reset-button"
              onClick={clearImage}
            >
              Choose Another Image
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;