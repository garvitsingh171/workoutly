import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "../services/api";
import ImageUpload from "../components/ImageUpload";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";

const defaultExercise = {
  name: "",
  sets: 3,
  reps: 10,
};

const CreateWorkout = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    duration: 45,
    difficulty: "beginner",
    notes: "",
    exercises: [defaultExercise],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExerciseChange = (index, key, value) => {
    setFormData((prev) => {
      const updatedExercises = [...prev.exercises];
      updatedExercises[index] = {
        ...updatedExercises[index],
        [key]: value,
      };
      return {
        ...prev,
        exercises: updatedExercises,
      };
    });
  };

  const handleAddExercise = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, defaultExercise],
    }));
  };

  const handleRemoveExercise = (index) => {
    setFormData((prev) => {
      if (prev.exercises.length === 1) return prev;
      return {
        ...prev,
        exercises: prev.exercises.filter((_, currentIndex) => currentIndex !== index),
      };
    });
  };

  const handleImageUpload = async (uploadFormData) => {
    setUploadError("");
    setIsUploadingImage(true);

    try {
      const response = await api.post("/api/upload", uploadFormData);

      if (!response.data?.success || !response.data?.url) {
        throw new Error("Upload failed. Please try again.");
      }

      setUploadedImage({
        url: response.data.url,
        publicId: response.data.publicId,
        fileName: uploadFormData.get("image")?.name || "Uploaded image",
      });

      toast.success("Cover image uploaded successfully.");
    } catch (uploadRequestError) {
      const message = getErrorMessage(uploadRequestError, "Image upload failed. Please try again.");
      setUploadError(message);
      toast.error(message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (isUploadingImage) {
      toast.error("Please wait for the image upload to complete.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...formData,
      coverImage: uploadedImage?.url || null,
      duration: Number.parseInt(formData.duration, 10),
      exercises: formData.exercises.map((exercise) => ({
        name: exercise.name.trim(),
        sets: Number.parseInt(exercise.sets, 10),
        reps: Number.parseInt(exercise.reps, 10),
      })),
    };

    try {
      const response = await api.post("/api/workouts", payload);
      if (response.data.success) {
        toast.success("Workout template created successfully!");
        navigate("/dashboard");
      }
    } catch (requestError) {
      const message = getErrorMessage(requestError, "Failed to create workout. Please try again.");
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page page-form">
      <div className="form-page-wrap">
        <header className="page-heading">
          <Badge color="primary" className="page-heading__eyebrow">Template Builder</Badge>
          <h1 className="page-heading__title">Create Template</h1>
          <p className="page-heading__text">Build a reusable routine to track your sessions with clear exercises, duration, and difficulty.</p>
        </header>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="workout-form">
          <Card>
            <Card.Body>
              <h3 className="form-card__title">Workout Details</h3>

              <Input
                label="Workout Name"
                name="name"
                type="text"
                placeholder="e.g., Push Day, Leg Strength, HIIT Burn"
                value={formData.name}
                onChange={handleFieldChange}
                required
              />

              <div className="form-grid form-grid--two">
                <Input
                  label="Duration (minutes)"
                  name="duration"
                  type="number"
                  min="1"
                  max="600"
                  value={formData.duration}
                  onChange={handleFieldChange}
                  required
                />

                <div className="ui-input-group">
                  <label htmlFor="difficulty" className="ui-label">Difficulty</label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    className="ui-input"
                    value={formData.difficulty}
                    onChange={handleFieldChange}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="ui-input-group">
                <label htmlFor="notes" className="ui-label">Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="ui-input"
                  rows="3"
                  maxLength="500"
                  placeholder="Goals, warm-up, cooldown, or special instructions..."
                  value={formData.notes}
                  onChange={handleFieldChange}
                />
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h3 className="form-card__title">Cover Image</h3>
              <p className="form-card__text">
                Add a visual cover for this workout template.
              </p>
              <ImageUpload onUpload={handleImageUpload} />

              {isUploadingImage && <p className="upload-status">Uploading image...</p>}
              {uploadError && <div className="alert alert-error">{uploadError}</div>}

              {uploadedImage && (
                <div className="upload-summary">
                  <img
                    src={uploadedImage.url}
                    alt={uploadedImage.fileName}
                    className="upload-summary__image"
                  />
                  <div>
                    <p className="upload-summary__title">Upload complete</p>
                    <p className="upload-summary__name">{uploadedImage.fileName}</p>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="form-section-header">
                <h3>Exercises</h3>
                <Button type="button" variant="ghost" size="sm" onClick={handleAddExercise}>
                  Add Exercise
                </Button>
              </div>

              <div className="exercise-list">
                {formData.exercises.map((exercise, index) => (
                  <div key={`exercise-${index}`} className="workout-exercise-row">
                    <div className="ui-input-group ui-input-group--compact">
                      <label className="ui-label" htmlFor={`exercise-name-${index}`}>Name</label>
                      <input
                        id={`exercise-name-${index}`}
                        className="ui-input"
                        type="text"
                        value={exercise.name}
                        onChange={(e) => handleExerciseChange(index, "name", e.target.value)}
                        placeholder="e.g. Squat"
                        required
                      />
                    </div>
                    <div className="ui-input-group ui-input-group--compact">
                      <label className="ui-label" htmlFor={`exercise-sets-${index}`}>Sets</label>
                      <input
                        id={`exercise-sets-${index}`}
                        className="ui-input"
                        type="number"
                        min="1"
                        max="20"
                        value={exercise.sets}
                        onChange={(e) => handleExerciseChange(index, "sets", e.target.value)}
                        required
                      />
                    </div>
                    <div className="ui-input-group ui-input-group--compact">
                      <label className="ui-label" htmlFor={`exercise-reps-${index}`}>Reps</label>
                      <input
                        id={`exercise-reps-${index}`}
                        className="ui-input"
                        type="number"
                        min="1"
                        max="100"
                        value={exercise.reps}
                        onChange={(e) => handleExerciseChange(index, "reps", e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="workout-exercise-row__remove"
                      onClick={() => handleRemoveExercise(index)}
                      disabled={formData.exercises.length === 1}
                      aria-label={`Remove exercise ${index + 1}`}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          <div className="form-actions">
            <Button type="button" variant="ghost" onClick={() => navigate("/dashboard")}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || isUploadingImage}>
              {isSubmitting ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CreateWorkout;
