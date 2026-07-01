import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api, { getErrorMessage } from '../services/api';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';

const recordLabels = {
  max_weight: 'Max Weight',
  max_reps: 'Max Reps',
  max_volume: 'Max Volume',
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
};

const Records = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/api/records');
        setRecords(response.data.data || []);
      } catch (requestError) {
        const message = getErrorMessage(requestError, 'Failed to load personal records.');
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const groupedRecords = useMemo(() => {
    return records.reduce((groups, record) => {
      const exerciseName = record.exerciseName || 'Unknown Exercise';
      groups[exerciseName] = groups[exerciseName] || {};
      groups[exerciseName][record.recordType] = record;
      return groups;
    }, {});
  }, [records]);

  return (
    <section className="page page-dashboard">
      <div className="dashboard-wrap">
        <header className="page-heading">
          <Badge color="primary" className="page-heading__eyebrow">Records</Badge>
          <h1 className="page-heading__title">Personal Records</h1>
          <p className="page-heading__text">
            Your best weight, reps, and volume are updated automatically when sessions are saved.
          </p>
        </header>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <Card className="empty-state">
            <Card.Body>
              <div className="loading-spinner" aria-hidden="true"></div>
              <p className="dashboard-subtext">Loading records...</p>
            </Card.Body>
          </Card>
        ) : records.length === 0 ? (
          <Card className="empty-state">
            <Card.Body>
              <div className="empty-state__mark" aria-hidden="true">R</div>
              <h3>No records yet</h3>
              <p>Complete a workout session to start building personal records.</p>
            </Card.Body>
          </Card>
        ) : (
          <div className="record-grid">
            {Object.entries(groupedRecords).map(([exerciseName, exerciseRecords]) => (
              <Card key={exerciseName} className="record-card">
                <Card.Body>
                  <h3 className="record-card__title">{exerciseName}</h3>
                  <div className="record-list">
                    {['max_weight', 'max_reps', 'max_volume'].map((recordType) => {
                      const record = exerciseRecords[recordType];

                      return (
                        <div key={recordType} className="record-row">
                          <div>
                            <p className="record-row__label">{recordLabels[recordType]}</p>
                            <p className="record-row__meta">
                              {record ? `${record.workoutName || 'Workout'} • ${formatDate(record.achievedAt)}` : '-'}
                            </p>
                          </div>
                          <strong>{record ? record.value : '-'}</strong>
                        </div>
                      );
                    })}
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Records;
