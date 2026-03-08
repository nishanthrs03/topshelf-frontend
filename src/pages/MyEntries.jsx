import { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/MyEntries.css';

const STATUSES = [
    { key: 'VISIBLE',        label: 'Visible' },
    { key: 'PENDING_REVIEW', label: 'In Review' },
    { key: 'HIDDEN',         label: 'Hidden' },
];

const MyEntries = () => {
    const navigate = useNavigate();
    const [entries, setEntries] = useState([]);
    const [confirmingId, setConfirmingId] = useState(null);
    const [status, setStatus] = useState('VISIBLE');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [totalEntries, setTotalEntries] = useState(0);

    const fetchEntries = async (pageNum = 0, reset = false) => {
        setLoading(true);
        try {
            const res = await api.get(`/api/v1/entry/mine`, {
                params: { status, page: pageNum, size: 20 }
            });
            const data = res.data;
            setEntries(prev => reset ? data.content : [...prev, ...data.content]);
            setHasMore(!data.last);
            setTotalEntries(data.totalElements);
            setPage(pageNum);
        } catch (err) {
            console.error("Failed to fetch entries:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setEntries([]);
        setPage(0);
        setHasMore(true);
        fetchEntries(0, true);
    }, [status]);

    const processDelete = async (id) => {
        try {
            await api.delete(`/api/v1/entry/${id}`);
            setEntries(prev => prev.filter(e => e.id !== id));
            setTotalEntries(prev => prev - 1);
            setConfirmingId(null);
        } catch (err) {
            alert("Failed to delete entry");
        }
    };

    const formatLabel = (str) =>
        str?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || '';

    return (
        <div className="me-page">

            {/* ── HEADER ── */}
            <div className="me-header">
                <div className="me-header__inner">
                    <div>
                        <p className="me-eyebrow">Your library</p>
                        <h1 className="me-title">My <em>Collection</em></h1>
                    </div>
                    <Link to="/add" className="me-add-btn">
                        + New pick
                    </Link>
                </div>
                <div className="me-header__rule" />
            </div>

            {/* ── STATUS FILTER — segmented, not tabs ── */}
            <div className="me-filters">
                <div className="me-seg">
                    {STATUSES.map(s => (
                        <button
                            key={s.key}
                            className={`me-seg__btn ${status === s.key ? 'me-seg__btn--active' : ''}`}
                            onClick={() => setStatus(s.key)}
                        >
                            {s.label}
                            {status === s.key && totalEntries > 0 && (
                                <span className="me-seg__count">{totalEntries}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── GRID ── */}
            {loading && entries.length === 0 ? (
                <div className="me-grid">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="me-skeleton" style={{ animationDelay: `${i * 0.05}s` }} />
                    ))}
                </div>
            ) : entries.length === 0 ? (
                <div className="me-empty">
                    <p className="me-empty__text">Nothing here yet.</p>
                    {status === 'VISIBLE' && (
                        <Link to="/add" className="me-empty__cta">Add your first pick →</Link>
                    )}
                </div>
            ) : (
                <div className="me-grid">
                    {entries.map((entry, i) => (
                        <div
                            key={entry.id}
                            className={`me-card ${confirmingId === entry.id ? 'me-card--confirming' : ''}`}
                            style={{ animationDelay: `${(i % 20) * 0.04}s` }}
                        >
                            {/* Poster */}
                            <div className="me-card__poster" onClick={() => navigate(`/entry/${entry.id}`)}>
                                {entry.imageUrl ? (
                                    <img
                                        src={entry.imageUrl}
                                        alt={entry.title}
                                        className="me-card__img"
                                    />
                                ) : (
                                    <div className="me-card__placeholder">
                                        <span>{entry.title?.charAt(0)}</span>
                                    </div>
                                )}
                                <div className="me-card__veil" />

                                {/* Status dot */}
                                {status === 'PENDING_REVIEW' && (
                                    <span className="me-card__status me-card__status--pending" title="Pending Review" />
                                )}
                                {status === 'HIDDEN' && (
                                    <span className="me-card__status me-card__status--hidden" title="Hidden" />
                                )}
                            </div>

                            {/* Info + actions */}
                            <div className="me-card__body">
                                <p className="me-card__category">{entry.category}</p>
                                <h3 className="me-card__title">{entry.title}</h3>
                                <p className="me-card__creator">{entry.creator}</p>
                                {entry.feeling && (
                                    <span className="me-card__feeling">{formatLabel(entry.feeling)}</span>
                                )}

                                {/* Actions */}
                                {confirmingId === entry.id ? (
                                    <div className="me-card__confirm">
                                        <p className="me-card__confirm-text">Delete this pick?</p>
                                        <div className="me-card__confirm-btns">
                                            <button
                                                className="me-card__confirm-yes"
                                                onClick={() => processDelete(entry.id)}
                                            >
                                                Delete
                                            </button>
                                            <button
                                                className="me-card__confirm-no"
                                                onClick={() => setConfirmingId(null)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="me-card__actions">
                                        <Link to={`/entry/${entry.id}`} className="me-card__action-btn me-card__action-btn--view">
                                            View
                                        </Link>
                                        <Link to={`/edit/${entry.id}`} className="me-card__action-btn me-card__action-btn--edit">
                                            Edit
                                        </Link>
                                        <button
                                            className="me-card__action-btn me-card__action-btn--delete"
                                            onClick={() => setConfirmingId(entry.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {hasMore && (
                <div className="me-load-more">
                    <button
                        className="me-load-more-btn"
                        onClick={() => fetchEntries(page + 1)}
                        disabled={loading}
                    >
                        {loading ? 'Loading…' : 'Load more'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyEntries;