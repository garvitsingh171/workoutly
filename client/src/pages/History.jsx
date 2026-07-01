import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api, { getErrorMessage } from '../services/api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const PAGE_LIMIT = 10;

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
};

const formatMonthLabel = (monthValue) => {
  const [year, month] = monthValue.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
};

const getCurrentMonthValue = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
};

const buildMonthDays = (monthValue) => {
  const [year, month] = monthValue.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    return {
      day,
      dateKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    };
  });
};

const History = () => {
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    workoutName: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [sessions, setSessions] = useState([]);
  const [calendarDays, setCalendarDays] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(getCurrentMonthValue());
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [calendarError, setCalendarError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const monthDays = useMemo(() => buildMonthDays(calendarMonth), [calendarMonth]);
  const calendarByDate = useMemo(() => {
    return calendarDays.reduce((lookup, day) => {
      lookup[day.date] = day;
      return lookup;
    }, {});
  }, [calendarDays]);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(PAGE_LIMIT),
    });

    if (appliedFilters.from) params.set('from', appliedFilters.from);
    if (appliedFilters.to) params.set('to', appliedFilters.to);
    if (appliedFilters.workoutName.trim()) {
      params.set('workoutName', appliedFilters.workoutName.trim());
    }

    try {
      const response = await api.get(`/api/sessions?${params.toString()}`);
      setSessions(response.data.data || []);
      setPagination(
        response.data.pagination || {
          page: currentPage,
          limit: PAGE_LIMIT,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        }
      );
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'Failed to load workout history.');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, currentPage]);

  const fetchCalendar = useCallback(async () => {
    setCalendarLoading(true);
    setCalendarError('');

    try {
      const response = await api.get(`/api/sessions/calendar?month=${calendarMonth}`);
      setCalendarDays(response.data.data || []);
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'Failed to load calendar summary.');
      setCalendarError(message);
    } finally {
      setCalendarLoading(false);
    }
  }, [calendarMonth]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    const emptyFilters = { from: '', to: '', workoutName: '' };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page === currentPage) return;
    setCurrentPage(page);
  };

  const handleExport = async () => {
    setExporting(true);

    const params = new URLSearchParams();
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);

    try {
      const response = await api.get(`/api/sessions/export.csv?${params.toString()}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'workoutly-sessions.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('CSV export downloaded.');
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, 'Failed to export sessions.'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="page page-dashboard">
      <div className="dashboard-wrap">
        <header className="page-heading history-heading">
          <div>
            <Badge color="primary" className="page-heading__eyebrow">History</Badge>
            <h1 className="page-heading__title">Workout History</h1>
            <p className="page-heading__text">
              Review completed sessions, scan trained days, and export your workout data.
            </p>
          </div>
          <Button variant="secondary" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </header>

        <Card className="feature-panel">
          <Card.Body>
            <form className="history-filters" onSubmit={handleFilterSubmit}>
              <div className="ui-input-group">
                <label htmlFor="history-from" className="ui-label">From</label>
                <input
                  id="history-from"
                  name="from"
                  className="ui-input"
                  type="date"
                  value={filters.from}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="ui-input-group">
                <label htmlFor="history-to" className="ui-label">To</label>
                <input
                  id="history-to"
                  name="to"
                  className="ui-input"
                  type="date"
                  value={filters.to}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="ui-input-group">
                <label htmlFor="history-workout" className="ui-label">Workout Name</label>
                <input
                  id="history-workout"
                  name="workoutName"
                  className="ui-input"
                  type="text"
                  placeholder="Push Day"
                  value={filters.workoutName}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="history-filters__actions">
                <Button type="submit" variant="primary">Apply</Button>
                <Button type="button" variant="ghost" onClick={clearFilters}>Clear</Button>
              </div>
            </form>
          </Card.Body>
        </Card>

        <Card className="feature-panel">
          <Card.Body>
            <div className="history-section-header">
              <div>
                <h3 className="form-card__title">Calendar Summary</h3>
                <p className="dashboard-subtext">{formatMonthLabel(calendarMonth)}</p>
              </div>
              <div className="ui-input-group history-month-picker">
                <label htmlFor="history-month" className="ui-label">Month</label>
                <input
                  id="history-month"
                  className="ui-input"
                  type="month"
                  value={calendarMonth}
                  onChange={(event) => setCalendarMonth(event.target.value || getCurrentMonthValue())}
                />
              </div>
            </div>

            {calendarError && <div className="alert alert-error">{calendarError}</div>}

            {calendarLoading ? (
              <div className="calendar-loading">
                <div className="loading-spinner" aria-hidden="true"></div>
                <p className="dashboard-subtext">Loading calendar...</p>
              </div>
            ) : (
              <div className="history-calendar" aria-label="Workout calendar">
                {monthDays.map((day) => {
                  const summary = calendarByDate[day.dateKey];

                  return (
                    <div
                      key={day.dateKey}
                      className={`history-calendar__day ${summary ? 'history-calendar__day--trained' : ''}`.trim()}
                    >
                      <span className="history-calendar__date">{day.day}</span>
                      {summary ? (
                        <span className="history-calendar__summary">
                          {summary.sessionCount} session{summary.sessionCount === 1 ? '' : 's'} · {Math.round(summary.totalVolume || 0)} vol
                        </span>
                      ) : (
                        <span className="history-calendar__summary">-</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card.Body>
        </Card>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <Card className="empty-state">
            <Card.Body>
              <div className="loading-spinner" aria-hidden="true"></div>
              <p className="dashboard-subtext">Loading workout history...</p>
            </Card.Body>
          </Card>
        ) : sessions.length === 0 ? (
          <Card className="empty-state">
            <Card.Body>
              <div className="empty-state__mark" aria-hidden="true">H</div>
              <h3>No sessions yet</h3>
              <p>Complete a workout session to see your history.</p>
            </Card.Body>
          </Card>
        ) : (
          <>
            <Card>
              <Card.Body>
                <h3 className="form-card__title">Completed Sessions</h3>
                <div className="table-wrap">
                  <table className="basic-table">
                    <thead>
                      <tr>
                        <th>Workout</th>
                        <th>Completed</th>
                        <th>Duration</th>
                        <th>Completed Sets</th>
                        <th>Total Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((session) => (
                        <tr key={session._id}>
                          <td>{session.workoutName}</td>
                          <td>{formatDate(session.completedAt)}</td>
                          <td>{session.durationMinutes || 0} min</td>
                          <td>{session.totalCompletedSets || 0}</td>
                          <td>{Math.round(session.totalVolume || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>

            {pagination.totalPages > 1 && (
              <div className="dashboard-pagination">
                <Button
                  variant="ghost"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </Button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="ghost"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default History;
