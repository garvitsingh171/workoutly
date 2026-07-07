import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api, { getErrorMessage } from '../services/api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const PAGE_LIMIT = 10;
const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDate = (value, options) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString(undefined, options);
};

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatDateLong = (value) => {
  if (!value) return 'Selected date';
  return new Date(`${value}T00:00:00.000Z`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

const formatMonthLabel = (monthValue) => {
  const [year, month] = monthValue.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

const formatNumber = (value) => Math.round(Number(value) || 0).toLocaleString();

const getCurrentMonthValue = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
};

const buildMonthCells = (monthValue) => {
  const [year, month] = monthValue.split('-').map(Number);
  const firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const placeholders = Array.from({ length: firstDay }, (_, index) => ({
    key: `blank-${monthValue}-${index}`,
    isPlaceholder: true,
  }));
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    return {
      key: `${monthValue}-${String(day).padStart(2, '0')}`,
      day,
      dateKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      isPlaceholder: false,
    };
  });

  return [...placeholders, ...days];
};

const getCompletedSets = (exercise) => {
  if (!Array.isArray(exercise?.sets)) return [];
  return exercise.sets.filter((set) => set.completed);
};

const getBestCompletedSet = (sets) => {
  return sets.reduce(
    (best, set) => {
      const weight = Number(set.weight) || 0;
      const reps = Number(set.actualReps) || 0;
      const volume = weight * reps;

      if (volume > best.volume) {
        return { weight, reps, volume };
      }

      return best;
    },
    { weight: 0, reps: 0, volume: 0 }
  );
};

const getSessionFocus = (session) => {
  const text = [
    session.workoutName,
    ...(session.exercises || []).map((exercise) => exercise.name),
  ].join(' ').toLowerCase();

  const hasLower = /(squat|deadlift|leg|lunge|glute|calf|hamstring|quad)/.test(text);
  const hasUpper = /(press|push|pull|row|curl|raise|fly|chest|back|shoulder|tricep|bicep)/.test(text);
  const hasCardio = /(run|rower|rowing|elliptical|bike|cycling|cardio|zone 2)/.test(text);
  const hasMobility = /(mobility|stretch|yoga|foam|rotation|plank|bug|crunch|core)/.test(text);

  if ((hasLower && hasUpper) || /full body|conditioning/.test(text)) return 'Full body';
  if (hasCardio) return 'Cardio';
  if (hasMobility) return 'Mobility/Core';
  if (hasLower) return 'Lower body';
  if (hasUpper) return 'Upper body';
  return 'Strength';
};

const getFocusColor = (focus) => {
  if (focus === 'Cardio') return 'accent';
  if (focus === 'Mobility/Core') return 'success';
  if (focus === 'Lower body') return 'warning';
  if (focus === 'Upper body') return 'primary';
  if (focus === 'Full body') return 'danger';
  return 'neutral';
};

const HistorySessionCard = ({ session, compact = false }) => {
  const focus = getSessionFocus(session);
  const exerciseCount = session.exercises?.length || 0;

  return (
    <article className={`history-session-card ${compact ? 'history-session-card--compact' : ''}`.trim()}>
      <div className="history-session-card__topline">
        <div>
          <h4>{session.workoutName}</h4>
          <p>{formatDateTime(session.completedAt)}</p>
        </div>
        <Badge color={getFocusColor(focus)}>{focus}</Badge>
      </div>

      <div className="history-session-card__metrics" aria-label={`${session.workoutName} session metrics`}>
        <span>{session.durationMinutes || 0} min</span>
        <span>{session.totalCompletedSets || 0} sets</span>
        <span>{formatNumber(session.totalVolume)} volume</span>
        <span>{exerciseCount} exercise{exerciseCount === 1 ? '' : 's'}</span>
      </div>

      {session.notes && <p className="history-session-card__notes">{session.notes}</p>}

      {session.exercises?.length > 0 && (
        <ul className="history-session-card__exercise-list">
          {session.exercises.slice(0, compact ? 3 : 5).map((exercise) => {
            const completedSets = getCompletedSets(exercise);
            const bestSet = getBestCompletedSet(completedSets);

            return (
              <li key={`${session._id}-${exercise.name}`}>
                <span>{exercise.name}</span>
                <small>
                  {completedSets.length} set{completedSets.length === 1 ? '' : 's'}
                  {bestSet.volume > 0 ? ` · best ${bestSet.weight} x ${bestSet.reps}` : ''}
                </small>
              </li>
            );
          })}
          {session.exercises.length > (compact ? 3 : 5) && (
            <li>
              <span>{session.exercises.length - (compact ? 3 : 5)} more</span>
              <small>Additional logged exercises</small>
            </li>
          )}
        </ul>
      )}
    </article>
  );
};

const History = () => {
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    workoutName: '',
    sortOrder: 'newest',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [sessions, setSessions] = useState([]);
  const [calendarDays, setCalendarDays] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(getCurrentMonthValue());
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDateSessions, setSelectedDateSessions] = useState([]);
  const [selectedDateLoading, setSelectedDateLoading] = useState(false);
  const [selectedDateError, setSelectedDateError] = useState('');
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

  const monthCells = useMemo(() => buildMonthCells(calendarMonth), [calendarMonth]);
  const calendarByDate = useMemo(() => {
    return calendarDays.reduce((lookup, day) => {
      lookup[day.date] = day;
      return lookup;
    }, {});
  }, [calendarDays]);
  const selectedDateSummary = selectedDate ? calendarByDate[selectedDate] : null;

  const visibleStats = useMemo(() => {
    return sessions.reduce(
      (totals, session) => ({
        minutes: totals.minutes + (Number(session.durationMinutes) || 0),
        sets: totals.sets + (Number(session.totalCompletedSets) || 0),
        volume: totals.volume + (Number(session.totalVolume) || 0),
      }),
      { minutes: 0, sets: 0, volume: 0 }
    );
  }, [sessions]);

  const groupedSessions = useMemo(() => {
    const groups = new Map();

    sessions.forEach((session) => {
      const dateKey = new Date(session.completedAt).toISOString().slice(0, 10);
      if (!groups.has(dateKey)) {
        groups.set(dateKey, {
          dateKey,
          label: formatDate(session.completedAt, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
          sessions: [],
        });
      }

      groups.get(dateKey).sessions.push(session);
    });

    return [...groups.values()];
  }, [sessions]);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(PAGE_LIMIT),
      sort: appliedFilters.sortOrder,
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

  const fetchSelectedDateSessions = useCallback(async () => {
    if (!selectedDate) return;

    setSelectedDateLoading(true);
    setSelectedDateError('');

    const params = new URLSearchParams({
      from: selectedDate,
      to: selectedDate,
      limit: '50',
      sort: 'newest',
    });

    try {
      const response = await api.get(`/api/sessions?${params.toString()}`);
      setSelectedDateSessions(response.data.data || []);
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'Failed to load sessions for this date.');
      setSelectedDateError(message);
    } finally {
      setSelectedDateLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  useEffect(() => {
    fetchSelectedDateSessions();
  }, [fetchSelectedDateSessions]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();

    if (filters.from && filters.to && filters.from > filters.to) {
      const message = 'From date must be before or equal to To date.';
      setError(message);
      toast.error(message);
      return;
    }

    setError('');
    setCurrentPage(1);
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    const emptyFilters = { from: '', to: '', workoutName: '', sortOrder: 'newest' };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setError('');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page === currentPage) return;
    setCurrentPage(page);
  };

  const handleMonthChange = (event) => {
    setCalendarMonth(event.target.value || getCurrentMonthValue());
    setSelectedDate('');
    setSelectedDateSessions([]);
    setSelectedDateError('');
  };

  const handleDateSelect = (dateKey) => {
    setSelectedDate(dateKey);
  };

  const closeSelectedDate = () => {
    setSelectedDate('');
    setSelectedDateSessions([]);
    setSelectedDateError('');
  };

  const handleExport = async () => {
    setExporting(true);

    const params = new URLSearchParams();
    if (appliedFilters.from) params.set('from', appliedFilters.from);
    if (appliedFilters.to) params.set('to', appliedFilters.to);
    if (appliedFilters.workoutName.trim()) {
      params.set('workoutName', appliedFilters.workoutName.trim());
    }

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
              Review completed sessions, scan trained days, and open any calendar date for details.
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
              <div className="ui-input-group">
                <label htmlFor="history-sort" className="ui-label">Sort</label>
                <select
                  id="history-sort"
                  name="sortOrder"
                  className="ui-input"
                  value={filters.sortOrder}
                  onChange={handleFilterChange}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
              <div className="history-filters__actions">
                <Button type="submit" variant="primary">Apply</Button>
                <Button type="button" variant="ghost" onClick={clearFilters}>Clear</Button>
              </div>
            </form>
          </Card.Body>
        </Card>

        <div className="stats-grid history-stats-grid" aria-label="Visible history summary">
          <article className="stat-card">
            <p className="stat-card__label">Sessions found</p>
            <p className="stat-card__value">{pagination.total || sessions.length}</p>
            <p className="stat-card__hint">Matching current filters</p>
          </article>
          <article className="stat-card">
            <p className="stat-card__label">Minutes shown</p>
            <p className="stat-card__value">{visibleStats.minutes}</p>
            <p className="stat-card__hint">On this page</p>
          </article>
          <article className="stat-card">
            <p className="stat-card__label">Sets shown</p>
            <p className="stat-card__value">{visibleStats.sets}</p>
            <p className="stat-card__hint">Completed sets on this page</p>
          </article>
          <article className="stat-card">
            <p className="stat-card__label">Volume shown</p>
            <p className="stat-card__value">{formatNumber(visibleStats.volume)}</p>
            <p className="stat-card__hint">Loaded history page total</p>
          </article>
        </div>

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
                  onChange={handleMonthChange}
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
              <div className={`history-calendar-layout ${selectedDate ? 'history-calendar-layout--open' : ''}`.trim()}>
                <div>
                  <div className="history-calendar-weekdays" aria-hidden="true">
                    {weekdayLabels.map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>
                  <div className="history-calendar" aria-label="Workout calendar">
                    {monthCells.map((day) => {
                      if (day.isPlaceholder) {
                        return <span key={day.key} className="history-calendar__placeholder" aria-hidden="true"></span>;
                      }

                      const summary = calendarByDate[day.dateKey];
                      const isSelected = selectedDate === day.dateKey;

                      return (
                        <button
                          key={day.dateKey}
                          type="button"
                          className={`history-calendar__day ${summary ? 'history-calendar__day--trained' : ''} ${isSelected ? 'history-calendar__day--selected' : ''}`.trim()}
                          onClick={() => handleDateSelect(day.dateKey)}
                          aria-pressed={isSelected}
                          aria-label={`${formatDateLong(day.dateKey)}. ${
                            summary
                              ? `${summary.sessionCount} session${summary.sessionCount === 1 ? '' : 's'} recorded.`
                              : 'No workout recorded.'
                          }`}
                        >
                          <span className="history-calendar__date">{day.day}</span>
                          {summary ? (
                            <span className="history-calendar__summary">
                              {summary.sessionCount} session{summary.sessionCount === 1 ? '' : 's'} · {formatNumber(summary.totalVolume)} vol
                            </span>
                          ) : (
                            <span className="history-calendar__summary">No workout</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedDate && (
                  <aside className="selected-date-panel" aria-live="polite" aria-label="Selected date workout details">
                    <div className="selected-date-panel__header">
                      <div>
                        <Badge color={selectedDateSummary ? 'success' : 'neutral'}>
                          {selectedDateSummary ? 'Trained' : 'Rest Day'}
                        </Badge>
                        <h3>{formatDateLong(selectedDate)}</h3>
                      </div>
                      <button
                        type="button"
                        className="selected-date-panel__close"
                        onClick={closeSelectedDate}
                        aria-label="Close selected date details"
                      >
                        Close
                      </button>
                    </div>

                    {selectedDateSummary && (
                      <div className="selected-date-panel__stats">
                        <span>{selectedDateSummary.sessionCount} session{selectedDateSummary.sessionCount === 1 ? '' : 's'}</span>
                        <span>{selectedDateSummary.totalCompletedSets || 0} sets</span>
                        <span>{formatNumber(selectedDateSummary.totalVolume)} volume</span>
                      </div>
                    )}

                    {selectedDateLoading ? (
                      <div className="inline-state" role="status" aria-live="polite">
                        <div className="loading-spinner loading-spinner--sm" aria-hidden="true"></div>
                        <span>Loading this date...</span>
                      </div>
                    ) : selectedDateError ? (
                      <div className="alert alert-error">{selectedDateError}</div>
                    ) : selectedDateSessions.length === 0 ? (
                      <div className="selected-date-panel__empty">
                        <div className="empty-state__mark" aria-hidden="true">0</div>
                        <h4>No workout recorded for this date.</h4>
                        <p>This is useful too: rest days and gaps are now easy to spot.</p>
                      </div>
                    ) : (
                      <div className="selected-date-panel__sessions">
                        {selectedDateSessions.map((session) => (
                          <HistorySessionCard key={session._id} session={session} compact />
                        ))}
                      </div>
                    )}
                  </aside>
                )}
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
              <h3>No sessions match these filters</h3>
              <p>Try a wider date range or clear the workout name search.</p>
              <Button type="button" variant="ghost" onClick={clearFilters}>
                Clear Filters
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <>
            <div className="history-session-groups">
              {groupedSessions.map((group) => (
                <section key={group.dateKey} className="history-session-group">
                  <div className="history-session-group__header">
                    <h3>{group.label}</h3>
                    <Badge color="primary">
                      {group.sessions.length} session{group.sessions.length === 1 ? '' : 's'}
                    </Badge>
                  </div>
                  <div className="history-session-list">
                    {group.sessions.map((session) => (
                      <HistorySessionCard key={session._id} session={session} />
                    ))}
                  </div>
                </section>
              ))}
            </div>

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
