import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { getErrorMessage } from '../services/api';
import ImageUpload from '../components/ImageUpload';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import WorkoutBuilder from '../components/workouts/WorkoutBuilder';
import {
  createDefaultWorkoutData,
  serializeWorkoutForm,
} from '../utils/workoutBuilderUtils';

const CreateWorkout = () => {
  const navigate = useNavigate();
  const initialWorkoutData = useMemo(() => createDefaultWorkoutData(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleImageUpload = async (uploadFormData) => {
    setUploadError('');
    setIsUploadingImage(true);

    try {
      const response = await api.post('/api/upload', uploadFormData);

      if (!response.data?.success || !response.data?.url) {
        throw new Error('Upload failed. Please try again.');
      }

      setUploadedImage({
        url: response.data.url,
        publicId: response.data.publicId,
        fileName: uploadFormData.get('image')?.name || 'Uploaded image',
      });

      toast.success('Cover image uploaded successfully.');
    } catch (uploadRequestError) {
      const message = getErrorMessage(uploadRequestError, 'Image upload failed. Please try again.');
      setUploadError(message);
      toast.error(message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (formData) => {
    setError('');

    if (isUploadingImage) {
      toast.error('Please wait for the image upload to complete.');
      return;
    }

    setIsSubmitting(true);

    const payload = serializeWorkoutForm(formData, {
      coverImage: uploadedImage?.url || null,
    });

    try {
      const response = await api.post('/api/workouts', payload);
      if (response.data.success) {
        toast.success('Workout template created successfully!');
        navigate('/dashboard');
      }
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'Failed to create workout. Please try again.');
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const coverSlot = (
    <Card className="builder-card">
      <Card.Body>
        <h3 className="form-card__title">Cover Image</h3>
        <p className="form-card__text">Add a visual cover for this workout template.</p>
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
  );

  return (
    <section className="page page-form page-workout-builder">
      <div className="form-page-wrap form-page-wrap--builder">
        <header className="page-heading">
          <Badge color="primary" className="page-heading__eyebrow">Workout Builder</Badge>
          <h1 className="page-heading__title">Create Workout</h1>
          <p className="page-heading__text">
            Build a polished plan with ordered exercises, set targets, rest timing, and coaching notes.
          </p>
        </header>

        {error && <div className="alert alert-error">{error}</div>}

        <WorkoutBuilder
          initialData={initialWorkoutData}
          isSubmitting={isSubmitting || isUploadingImage}
          submitLabel="Save Template"
          submittingLabel={isUploadingImage ? 'Uploading...' : 'Saving...'}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard')}
          coverSlot={coverSlot}
        />
      </div>
    </section>
  );
};

export default CreateWorkout;
