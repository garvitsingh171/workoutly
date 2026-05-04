import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "../services/api";
import ImageUpload from "../components/ImageUpload";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";

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
    <section className="page page-dashboard">
      <div className="dashboard-wrap" style={{ width: 'min(800px, 100%)', margin: '0 auto', textAlign: 'left' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create Template</h2>
          <p style={{ color: 'var(--text-muted)' }}>Build a reusable routine to track your sessions.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <Card>
            <Card.Body>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Workout Details</h3>
              
              <Input
                label="Workout Name"
                name="name"
                type="text"
                placeholder="e.g., Push Day, Leg Strength, HIIT Burn"
                value={formData.name}
                onChange={handleFieldChange}
                required
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div className="ui-input-group" style={{ marginTop: '0.5rem' }}>
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
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Cover Image</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Add a visual cover for this workout template.
              </p>
              <ImageUpload onUpload={handleImageUpload} />

              {isUploadingImage && <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Uploading image...</p>}
              {uploadError && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{uploadError}</div>}

              {uploadedImage && (
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <img
                    src={uploadedImage.url}
                    alt={uploadedImage.fileName}
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                  />
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>Upload complete</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{uploadedImage.fileName}</p>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Exercises</h3>
                <Button type="button" variant="ghost" size="sm" onClick={handleAddExercise}>
                  + Add Exercise
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formData.exercises.map((exercise, index) => (
                  <div key={`exercise-${index}`} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end', background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div className="ui-input-group" style={{ marginBottom: 0 }}>
                      <label className="ui-label" style={{ fontSize: '0.75rem' }}>Name</label>
                      <input
                        className="ui-input"
                        type="text"
                        value={exercise.name}
                        onChange={(e) => handleExerciseChange(index, "name", e.target.value)}
                        placeholder="e.g. Squat"
                        required
                      />
                    </div>
                    <div className="ui-input-group" style={{ marginBottom: 0 }}>
                      <label className="ui-label" style={{ fontSize: '0.75rem' }}>Sets</label>
                      <input
                        className="ui-input"
                        type="number"
                        min="1"
                        max="20"
                        value={exercise.sets}
                        onChange={(e) => handleExerciseChange(index, "sets", e.target.value)}
                        required
                      />
                    </div>
                    <div className="ui-input-group" style={{ marginBottom: 0 }}>
                      <label className="ui-label" style={{ fontSize: '0.75rem' }}>Reps</label>
                      <input
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
                      style={{ color: 'var(--danger)', padding: '0.75rem' }}
                      onClick={() => handleRemoveExercise(index)}
                      disabled={formData.exercises.length === 1}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
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
