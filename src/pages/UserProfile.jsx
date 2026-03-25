import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/UserProfile.css';

const CATEGORY_COLORS = {
    'MOVIES':      { from: '#FF6B35', to: '#F7C59F' },
    'TV SHOWS':    { from: '#E84393', to: '#FF9ECD' },
    'BOOKS':       { from: '#4ECDC4', to: '#A8E6CF' },
    'MUSIC':       { from: '#A855F7', to: '#E879F9' },
    'PODCASTS':    { from: '#3B82F6', to: '#93C5FD' },
    'VIDEO_GAMES': { from: '#10B981', to: '#6EE7B7' },
};

const DEFAULT_COLOR = { from: '#a855f7', to: '#ec4899' };

const formatLabel = (str) =>
    str?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || '';

const UserProfile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [entries, setEntries] = useState([]);
    const [bio, setBio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [totalEntries, setTotalEntries] = useState(0);
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [heroLoaded, setHeroLoaded] = useState(false);

    const fetchEntries = async (pageNum = 0, reset = false) => {
        if (reset) setLoading(true);
        else setLoadingMore(true);
        try {
            const res = await api.get('/api/v1/entry', {
                params: { username, page: pageNum, size: 40 }
            });
            const data = res.data;
            setEntries(prev => reset ? data.content : [...prev, ...data.content]);
            setHasMore(!data.last);
            setTotalEntries(data.totalElements);
            setPage(pageNum);

            // grab bio from first entry's user if available, or from a dedicated field
            if (reset && data.bio) setBio(data.bio);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setEntries([]);
        setBio(null);
        setPage(0);
        setActiveCategory('ALL');
        setHeroLoaded(false);
        fetchEntries(0, true);
    }, [username]);

    useEffect(() => {
        if (!loading) setTimeout(() => setHeroLoaded(true), 80);
    }, [loading]);

    const categories = useMemo(() =>
        [...new Set(entries.map(e => e.category?.toUpperCase()).filter(Boolean))],
        [entries]);

    const filtered = useMemo(() =>
        activeCategory === 'ALL' ? entries : entries.filter(e => e.category?.toUpperCase() === activeCategory),
        [entries, activeCategory]);

    const topCategory = useMemo(() => {
        if (!entries.length) return null;
        const counts = {};
        entries.forEach(e => { if (e.category) counts[e.category.toUpperCase()] = (counts[e.category.toUpperCase()] || 0) + 1; });
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    }, [entries]);

    const topFeeling = useMemo(() => {
        if (!entries.length) return null;
        const counts = {};
        entries.forEach(e => { if (e.feeling) counts[e.feeling] = (counts[e.feeling] || 0) + 1; });
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    }, [entries]);

    const heroImages = useMemo(() =>
        entries.filter(e => e.imageUrl).slice(0, 8).map(e => e.imageUrl),
        [entries]);

    const activeCatColor = activeCategory !== 'ALL'
        ? (CATEGORY_COLORS[activeCategory] || DEFAULT_COLOR)
        : null;

    if (loading) {
        return (
            <div className="up-page">
                <div className="up-loading">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="up-skeleton" style={{ animationDelay: `${i * 0.05}s` }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="up-page">

            {/* HERO */}
            <div className="up-hero">
                <div className="up-mosaic">
                    {heroImages.map((img, i) => (
                        <div
                            key={i}
                            className="up-mosaic__tile"
                            style={{ backgroundImage: `url(${img})`, animationDelay: `${i * 0.07}s` }}
                        />
                    ))}
                    <div className="up-mosaic__blur" />
                    <div className="up-mosaic__vignette" />
                </div>

                <div className={`up-hero__content ${heroLoaded ? 'up-hero__content--in' : ''}`}>
                    <Link to="/community" className="up-back">← All Curators</Link>

                    <div className="up-hero__identity">
                        <p className="up-hero__eyebrow">The taste of</p>
                        <h1 className="up-hero__name">{username}</h1>
                        {bio && <p className="up-hero__bio">{bio}</p>}
                    </div>

                    <p className="up-hero__prose">
                        <span className="up-hero__num">{totalEntries}</span> picks across&nbsp;
                        <span className="up-hero__num">{categories.length}</span> worlds
                        {topCategory && <> · mostly <em>{formatLabel(topCategory)}</em></>}
                        {topFeeling && <> · always <em>{formatLabel(topFeeling)}</em></>}
                    </p>

                    <div className="up-cats">
                        <button
                            className={`up-cat ${activeCategory === 'ALL' ? 'up-cat--active-all' : ''}`}
                            onClick={() => setActiveCategory('ALL')}
                        >
                            Everything
                        </button>
                        {categories.map(cat => {
                            const col = CATEGORY_COLORS[cat] || DEFAULT_COLOR;
                            const count = entries.filter(e => e.category?.toUpperCase() === cat).length;
                            const isActive = activeCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    className={`up-cat ${isActive ? 'up-cat--active' : ''}`}
                                    style={isActive
                                        ? { background: `linear-gradient(135deg, ${col.from}, ${col.to})`, borderColor: 'transparent', color: '#fff' }
                                        : { '--col-from': col.from }
                                    }
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {formatLabel(cat)}
                                    <span className="up-cat__n">{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* GRID */}
            {filtered.length > 0 ? (
                <div className="up-collection">
                    {activeCatColor && (
                        <div className="up-stripe" style={{ '--s-from': activeCatColor.from }}>
                            <span className="up-stripe__label" style={{ color: activeCatColor.from }}>
                                {formatLabel(activeCategory)}
                            </span>
                            <span className="up-stripe__count">{filtered.length} picks</span>
                        </div>
                    )}

                    <div className="up-grid">
                        {filtered.map((entry, i) => {
                            const col = CATEGORY_COLORS[entry.category?.toUpperCase()] || DEFAULT_COLOR;
                            const isFeatured = i % 9 === 0 && i > 0;
                            return (
                                <div
                                    key={entry.id}
                                    className={`up-card ${isFeatured ? 'up-card--featured' : ''}`}
                                    onClick={() => navigate(`/entry/${entry.id}`)}
                                    style={{
                                        '--c-from': col.from,
                                        '--c-to': col.to,
                                        animationDelay: `${(i % 12) * 0.035}s`
                                    }}
                                >
                                    {entry.imageUrl ? (
                                        <img src={entry.imageUrl} alt={entry.title} className="up-card__img" />
                                    ) : (
                                        <div className="up-card__placeholder">
                                            <span className="up-card__initial" style={{ color: col.from }}>
                                                {entry.title?.charAt(0)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="up-card__veil" />

                                    <div className="up-card__strip">
                                        <p className="up-card__strip-title">{entry.title}</p>
                                    </div>

                                    <div className="up-card__over">
                                        <span className="up-card__over-cat" style={{ color: col.from }}>
                                            {entry.category}
                                        </span>
                                        <h3 className="up-card__over-title">{entry.title}</h3>
                                        <p className="up-card__over-creator">{entry.creator}</p>
                                        {entry.notes && (
                                            <p className="up-card__over-notes">"{entry.notes}"</p>
                                        )}
                                        {entry.feeling && (
                                            <span className="up-card__over-feeling">{formatLabel(entry.feeling)}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {hasMore && (
                        <div className="up-more">
                            <button
                                className="up-more-btn"
                                onClick={() => fetchEntries(page + 1)}
                                disabled={loadingMore}
                            >
                                {loadingMore ? 'Loading…' : 'More picks'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="up-empty"><p>Nothing here yet.</p></div>
            )}
        </div>
    );
};

export default UserProfile;