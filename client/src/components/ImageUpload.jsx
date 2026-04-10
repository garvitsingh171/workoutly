import { useEffect, useRef, useState } from "react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_IN_BYTES = 5 * 1024 * 1024;

const ImageUpload = ({ onUpload }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Please select an image file (JPEG, PNG, WebP, or GIF)";
    }

    if (file.size > MAX_SIZE_IN_BYTES) {
      return `File is too large. Maximum size is 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
    }

    return null;
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      setIsUploading(true);
      setError("");

      if (onUpload) {
        await onUpload(formData);
      }

      setSelectedFile(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (uploadError) {
      setError(uploadError?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <form className="image-upload" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="workoutImage" className="form-label">
          Workout Image
        </label>
        <input
          ref={fileInputRef}
          id="workoutImage"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="form-input"
        />
      </div>

      {error ? <p className="field-error">{error}</p> : null}

      {previewUrl ? (
        <div className="image-upload__preview-wrap">
          <p className="image-upload__preview-label">Preview:</p>
          <img
            src={previewUrl}
            alt="Selected file preview"
            className="image-upload__preview-image"
          />
        </div>
      ) : null}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={!selectedFile || Boolean(error) || isUploading}
      >
        {isUploading ? "Uploading..." : "Upload Image"}
      </button>
    </form>
  );
};

export default ImageUpload;
