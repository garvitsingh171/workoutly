import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api, { getErrorMessage } from '../services/api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const categories = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio', 'full_body', 'other'];
const equipmentOptions = ['barbell', 'dumbbell', 'machine', 'bodyweight', 'cable', 'kettlebell', 'other'];

const labelize = (value) => value.replace('_', ' ');

const Exercises = () => {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [equipment, setEquipment] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'other',
    equipment: 'other',
    instructions: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (category) params.set('category', category);
      if (equipment) params.set('equipment', equipment);

      try {
        const response = await api.get(`/api/exercises?${params.toString()}`);
        setExercises(response.data.data || []);
      } catch (requestError) {
        const message = getErrorMessage(requestError, 'Failed to load exercises.');
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [search, category, equipment]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await api.post('/api/exercises', formData);
      setExercises((prev) => [...prev, response.data.data].sort((a, b) => a.name.localeCompare(b.name)));
      setFormData({
        name: '',
        category: 'other',
        equipment: 'other',
        instructions: '',
      });
      toast.success('Exercise added.');
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'Failed to add exercise.');
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page page-dashboard">
      <div className="dashboard-wrap">
        <header className="page-heading">
          <Badge color="primary" className="page-heading__eyebrow">Library</Badge>
          <h1 className="page-heading__title">Exercise Library</h1>
          <p className="page-heading__text">
            Browse default movements and add simple custom exercises for faster workout building.
          </p>
        </header>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="library-layout">
          <Card>
            <Card.Body>
              <h3 className="form-card__title">Add Custom Exercise</h3>
              <form onSubmit={handleSubmit}>
                <div className="ui-input-group">
                  <label htmlFor="exercise-library-name" className="ui-label">Name</label>
                  <input
                    id="exercise-library-name"
                    className="ui-input"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Incline Dumbbell Press"
                    required
                  />
                </div>

                <div className="form-grid form-grid--two">
                  <div className="ui-input-group">
                    <label htmlFor="exercise-library-category" className="ui-label">Category</label>
                    <select
                      id="exercise-library-category"
                      className="ui-input"
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                    >
                      {categories.map((option) => (
                        <option key={option} value={option}>{labelize(option)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="ui-input-group">
                    <label htmlFor="exercise-library-equipment" className="ui-label">Equipment</label>
                    <select
                      id="exercise-library-equipment"
                      className="ui-input"
                      name="equipment"
                      value={formData.equipment}
                      onChange={handleFormChange}
                    >
                      {equipmentOptions.map((option) => (
                        <option key={option} value={option}>{labelize(option)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="ui-input-group">
                  <label htmlFor="exercise-library-instructions" className="ui-label">Instructions</label>
                  <textarea
                    id="exercise-library-instructions"
                    className="ui-input"
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleFormChange}
                    rows="3"
                  />
                </div>

                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Adding...' : 'Add Exercise'}
                </Button>
              </form>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h3 className="form-card__title">Browse Exercises</h3>
              <div className="library-filters">
                <div className="ui-input-group">
                  <label htmlFor="exercise-search" className="ui-label">Search</label>
                  <input
                    id="exercise-search"
                    className="ui-input"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search exercises"
                  />
                </div>

                <div className="ui-input-group">
                  <label htmlFor="exercise-category" className="ui-label">Category</label>
                  <select
                    id="exercise-category"
                    className="ui-input"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    <option value="">All categories</option>
                    {categories.map((option) => (
                      <option key={option} value={option}>{labelize(option)}</option>
                    ))}
                  </select>
                </div>

                <div className="ui-input-group">
                  <label htmlFor="exercise-equipment" className="ui-label">Equipment</label>
                  <select
                    id="exercise-equipment"
                    className="ui-input"
                    value={equipment}
                    onChange={(event) => setEquipment(event.target.value)}
                  >
                    <option value="">All equipment</option>
                    {equipmentOptions.map((option) => (
                      <option key={option} value={option}>{labelize(option)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <p className="dashboard-subtext">Loading exercises...</p>
              ) : exercises.length === 0 ? (
                <p className="dashboard-subtext">No exercises found.</p>
              ) : (
                <div className="exercise-library-list">
                  {exercises.map((exercise) => (
                    <article key={exercise._id || exercise.name} className="exercise-library-item">
                      <div>
                        <h4>{exercise.name}</h4>
                        <p>{labelize(exercise.category)} • {labelize(exercise.equipment)}</p>
                      </div>
                      <Badge color={exercise.isDefault ? 'neutral' : 'accent'}>
                        {exercise.isDefault ? 'Default' : 'Custom'}
                      </Badge>
                    </article>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Exercises;
