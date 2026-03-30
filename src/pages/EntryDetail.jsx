import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/EntryDetail.css';

const EntryDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const [entry, setEntry] = useState(null);
    const [helpfulCount, setHelpfulCount] = useState(0);
    const [isUpdating, setIsUpdating] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const isAdmin = user?.role === 'ADMIN';
        const entryEndpoint = isAdmin
            ? `/api/v1/admin/entry/${id}`
            : `/api/v1/entry/${id}`;

        const fetchEntry = api.get(entryEndpoint);
        const fetchCount = api.get(`/api/v1/entry/helpful-count/${id}`);

        Promise.all([fetchEntry, fetchCount])
            .then(([entryRes, countRes]) => {
                setEntry(entryRes.data);
                setHelpfulCount(countRes.data);
                setTimeout(() => setLoaded(true), 60);
            })
            .catch(console.error);
    }, [id, user]);

    const handleHelpful = async () => {
        if (isUpdating) return;
        setIsUpdating(true);
        try {
            await api.put(`/api/v1/entry/helpful/${id}`);
            const countRes = await api.get(`/api/v1/entry/helpful-count/${id}`);
            setHelpfulCount(countRes.data);
        } catch (err) {
            console.error(err);
            alert("Please login to upvote!");
        } finally {
            setIsUpdating(false);
        }
    };

    if (!entry) return (
        <div className="ed-loading">
            <span className="ed-loading__text">Loading...</span>
        </div>
    );

    const formatGenres = (genre) =>
        genre?.split(',').map(g =>
            g.trim().replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
        ).join(' · ') || '';

    return (
        <div className={`ed-page ${loaded ? 'ed-page--in' : ''}`}>

            {entry.imageUrl && (
                <div className="ed-backdrop">
                    <img src={entry.imageUrl} alt="" className="ed-backdrop__img" />
                    <div className="ed-backdrop__fade" />
                </div>
            )}

            {entry.status === 'PENDING_REVIEW' && (
                <div className="ed-banner ed-banner--pending">
                    <span>⏳</span>
                    <div>
                        <strong>Pending Review</strong>
                        <p>This recommendation is being reviewed. Only you can see it right now.</p>
                    </div>
                </div>
            )}
            {entry.status === 'HIDDEN' && (
                <div className="ed-banner ed-banner--hidden">
                    <span>🚫</span>
                    <div>
                        <strong>Entry Hidden</strong>
                        <p>This content was removed from public view.</p>
                        {entry.moderationReason && (
                            <p className="ed-banner__reason"><strong>Reason:</strong> {entry.moderationReason}</p>
                        )}
                    </div>
                </div>
            )}

            <div className="ed-layout">

                <aside className="ed-poster-col">
                    <div className="ed-poster">
                        {entry.imageUrl ? (
                            <img
                                src={entry.imageUrl}
                                alt={entry.title}
                                className="ed-poster__img"
                            />
                        ) : (
                            <div className="ed-poster__fallback">
                                <span>{entry.title?.charAt(0)}</span>
                            </div>
                        )}
                    </div>

                    <div className="ed-helpful">
                        <button
                            className={`ed-helpful__btn ${isUpdating ? 'ed-helpful__btn--loading' : ''}`}
                            onClick={handleHelpful}
                            disabled={isUpdating}
                        >
                            <span className="ed-helpful__icon">↑</span>
                            <span>{helpfulCount}</span>
                        </button>
                        <p className="ed-helpful__label">Helpful</p>
                    </div>
                </aside>

                <main className="ed-content">
                    <button
                        onClick={() => navigate(-1)}
                        className="ed-back"
                    >
                        ← Back
                    </button>

                    <div className="ed-meta-top">
                        <span className="ed-category">{entry.category}</span>
                        {entry.genre && (
                            <span className="ed-genres">{formatGenres(entry.genre)}</span>
                        )}
                    </div>

                    <h1 className="ed-title">{entry.title}</h1>
                    <p className="ed-creator">by {entry.creator}</p>

                    {entry.feeling && (
                        <span className="ed-feeling">
                            {entry.feeling.replace(/_/g, ' ').toLowerCase()}
                        </span>
                    )}

                    <div className="ed-rule" />

                    <blockquote className="ed-notes">
                        {entry.notes}
                    </blockquote>

                    <div className="ed-curator">
                        <p className="ed-curator__label">Recommended by</p>
                        <Link
                            to={`/user/${entry.username}`}
                            className="ed-curator__name"
                        >
                            {entry.username}
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EntryDetail;