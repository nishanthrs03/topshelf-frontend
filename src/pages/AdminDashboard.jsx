import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/AdminDashboard.css';

const VIEWS = [
    { key: 'pending', label: 'Pending',  sub: 'Awaiting review' },
    { key: 'all',     label: 'All',      sub: 'Master feed' },
    { key: 'hidden',  label: 'Hidden',   sub: 'Archive' },
];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [entries, setEntries] = useState([]);
    const [view, setView] = useState('pending');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeEntryId, setActiveEntryId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const fetchData = async (pageNum = 0, reset = false) => {
        setLoading(true);
        try {
            const endpoint = view === 'all'
                ? '/api/v1/entry'
                : `/api/v1/admin/${view}`;
            const res = await api.get(endpoint, { params: { page: pageNum, size: 20 } });
            const data = res.data;
            setEntries(prev => reset ? data.content : [...prev, ...data.content]);
            setHasMore(!data.last);
            setPage(pageNum);
        } catch (err) {
            console.error("Server error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setEntries([]);
        setPage(0);
        setHasMore(true);
        fetchData(0, true);
    }, [view]);

    const handleApprove = async (e, id) => {
        e.stopPropagation();
        try {
            await api.put(`/api/v1/admin/unhide/${id}`);
            view === 'all' ? fetchData(0, true) : setEntries(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            alert("Failed to update entry.");
        }
    };

    const openRejectModal = (e, id) => {
        e.stopPropagation();
        setActiveEntryId(id);
        setIsModalOpen(true);
        setRejectionReason('');
    };

    const handleConfirmReject = async () => {
        try {
            await api.put(`/api/v1/admin/moderate/${activeEntryId}`, { reason: rejectionReason });
            view === 'all' ? fetchData(0, true) : setEntries(prev => prev.filter(e => e.id !== activeEntryId));
            setIsModalOpen(false);
        } catch (err) {
            alert("Failed to hide entry.");
        }
    };

    const handleAdminDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Permanently delete this entry? This cannot be undone.")) return;
        try {
            await api.delete(`/api/v1/admin/entry/${id}`);
            setEntries(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            alert("Failed to delete entry.");
        }
    };

    const formatLabel = (str) =>
        str?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || '';

    return (
        <div className="adm-page">

            {/* ── HEADER ── */}
            <div className="adm-header">
                <div className="adm-header__inner">
                    <div>
                        <p className="adm-eyebrow">Admin</p>
                        <h1 className="adm-title">Moderation <em>Centre</em></h1>
                    </div>
                </div>
                <div className="adm-header__rule" />
            </div>

            {/* ── VIEW SWITCHER ── */}
            <div className="adm-nav">
                {VIEWS.map(v => (
                    <button
                        key={v.key}
                        className={`adm-nav__btn ${view === v.key ? 'adm-nav__btn--active' : ''}`}
                        onClick={() => setView(v.key)}
                    >
                        <span className="adm-nav__label">{v.label}</span>
                        <span className="adm-nav__sub">{v.sub}</span>
                    </button>
                ))}
            </div>

            {/* ── CONTENT ── */}
            <div className="adm-content">
                {loading && entries.length === 0 ? (
                    <div className="adm-loading">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="adm-skeleton" style={{ animationDelay: `${i * 0.05}s` }} />
                        ))}
                    </div>
                ) : entries.length === 0 ? (
                    <div className="adm-empty">
                        <p className="adm-empty__text">Nothing here.</p>
                    </div>
                ) : (
                    <div className="adm-grid">
                        {entries.map((entry, i) => (
                            <div
                                key={entry.id}
                                className={`adm-card adm-card--${entry.status?.toLowerCase()}`}
                                onClick={() => navigate(`/entry/${entry.id}`)}
                                style={{ animationDelay: `${(i % 20) * 0.03}s` }}
                            >
                                {/* Poster */}
                                <div className="adm-card__poster">
                                    {entry.imageUrl ? (
                                        <img
                                            src={entry.imageUrl}
                                            alt={entry.title}
                                            className="adm-card__img"
                                        />
                                    ) : (
                                        <div className="adm-card__placeholder">
                                            <span>{entry.title?.charAt(0)}</span>
                                        </div>
                                    )}
                                    <div className="adm-card__veil" />

                                    {/* Status pip */}
                                    <span className={`adm-pip adm-pip--${entry.status?.toLowerCase()}`} />
                                </div>

                                {/* Info */}
                                <div className="adm-card__info">
                                    <div className="adm-card__meta">
                                        <span className="adm-card__category">{entry.category}</span>
                                        <span className={`adm-card__status adm-card__status--${entry.status?.toLowerCase()}`}>
                                            {entry.status === 'PENDING_REVIEW' ? 'Pending' :
                                             entry.status === 'HIDDEN' ? 'Hidden' : 'Live'}
                                        </span>
                                    </div>
                                    <h3 className="adm-card__title">{entry.title}</h3>
                                    <p className="adm-card__creator">{entry.creator}</p>
                                    {entry.username && (
                                        <p className="adm-card__user">by @{entry.username}</p>
                                    )}
                                    {entry.notes && (
                                        <p className="adm-card__notes">"{entry.notes}"</p>
                                    )}

                                    {/* Actions */}
                                    <div className="adm-card__actions" onClick={e => e.stopPropagation()}>
                                        {(entry.status === 'HIDDEN' || entry.status === 'PENDING_REVIEW') && (
                                            <button
                                                className="adm-btn adm-btn--approve"
                                                onClick={e => handleApprove(e, entry.id)}
                                            >
                                                {entry.status === 'PENDING_REVIEW' ? 'Approve' : 'Restore'}
                                            </button>
                                        )}
                                        <button
                                            className="adm-btn adm-btn--hide"
                                            onClick={e => openRejectModal(e, entry.id)}
                                        >
                                            {entry.status === 'PENDING_REVIEW' ? 'Reject' :
                                             entry.status === 'HIDDEN' ? 'Edit reason' : 'Hide'}
                                        </button>
                                        <button
                                            className="adm-btn adm-btn--delete"
                                            onClick={e => handleAdminDelete(e, entry.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {hasMore && (
                    <div className="adm-more">
                        <button
                            className="adm-more-btn"
                            onClick={() => fetchData(page + 1)}
                            disabled={loading}
                        >
                            {loading ? 'Loading…' : 'Load more'}
                        </button>
                    </div>
                )}
            </div>

            {/* ── REJECT MODAL ── */}
            {isModalOpen && (
                <div className="adm-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="adm-modal" onClick={e => e.stopPropagation()}>
                        <h3 className="adm-modal__title">Set moderation reason</h3>
                        <p className="adm-modal__sub">
                            This reason will be shown to the user.
                        </p>
                        <textarea
                            className="adm-modal__textarea"
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                            placeholder="Why is this being hidden?"
                            rows={4}
                        />
                        <div className="adm-modal__btns">
                            <button className="adm-modal__cancel" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="adm-modal__confirm" onClick={handleConfirmReject}>
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;