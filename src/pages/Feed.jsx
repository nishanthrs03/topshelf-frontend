import { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Feed.css';

const HERO_SLIDES = [
    { image: 'https://image.tmdb.org/t/p/original//563sRDK3rZS31TXCdTY4lfcwrNK.jpg', title: '', category: 'MOVIES', year: '' },
    { image: 'https://image.tmdb.org/t/p/original//w8rTBScgj2MON7eGN7raoU5qChJ.jpg', title: '', category: 'TV SHOWS', year: '' },
    { image: 'https://image.tmdb.org/t/p/original//1LYWnmr5K3Hs3XEZ323bY0dBZsK.jpg', title: '', category: 'MUSIC', year: '' },
    { image: 'https://media.rawg.io/media/games/840/8408ad3811289a6a5830cae60fb0b62a.jpg', title: '', category: 'VIDEO GAMES', year: '' },
];

// ✅ Image proxy helper
const getProxiedImageUrl = (url) => {
    if (!url) return null;

    if (url.includes('archive.org')) {
        return `/imageproxy?url=${encodeURIComponent(url)}`;
    }

    return url;
};

const Feed = () => {
    const [entries, setEntries] = useState([]);
    const [sortBy, setSortBy] = useState('newest');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [totalEntries, setTotalEntries] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [transitioning, setTransitioning] = useState(false);
    const slideTimer = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        slideTimer.current = setInterval(() => {
            setTransitioning(true);
            setTimeout(() => {
                setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
                setTransitioning(false);
            }, 400);
        }, 1800);
        return () => clearInterval(slideTimer.current);
    }, []);

    const goToSlide = (i) => {
        if (i === currentSlide) return;
        setTransitioning(true);
        setTimeout(() => {
            setCurrentSlide(i);
            setTransitioning(false);
        }, 400);
        clearInterval(slideTimer.current);
    };

    const fetchEntries = async (pageNum = 0, reset = false) => {
        setLoading(true);
        try {
            const res = await api.get('/api/v1/entry', {
                params: { sort: sortBy, page: pageNum, size: 20 }
            });

            const data = res.data;

            setEntries(prev => reset ? data.content : [...prev, ...data.content]);
            setHasMore(!data.last);
            setTotalEntries(data.totalElements);
            setPage(pageNum);

        } catch (err) {
            console.error('Failed to fetch entries', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setEntries([]);
        setPage(0);
        setHasMore(true);
        fetchEntries(0, true);
    }, [sortBy]);

    const slide = HERO_SLIDES[currentSlide];

    return (
        <div className="feed-bg">

            {/* ── HERO ── */}
            <section className="hero">
                <div
                    className={`hero__bg ${transitioning ? 'hero__bg--out' : 'hero__bg--in'}`}
                    style={{ backgroundImage: `url(${getProxiedImageUrl(slide.image)})` }} // optional proxy
                />
                <div className="hero__vignette-bottom" />
                <div className="hero__vignette-top" />
                <div className="hero__vignette-sides" />

                <div className="hero__content">
                    <div className="hero__text">
                        <p className="hero__eyebrow">{slide.category} · {slide.year}</p>
                        <h2 className="hero__tagline">
                            Share what moves<br /><em>you.</em>
                        </h2>
                        <Link to="/find" className="hero__cta">
                            Explore the Collection →
                        </Link>
                    </div>

                    <div className="hero__dots">
                        {HERO_SLIDES.map((_, i) => (
                            <button
                                key={i}
                                className={`hero__dot ${i === currentSlide ? 'hero__dot--active' : ''}`}
                                onClick={() => goToSlide(i)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <div className="feed-masthead-wrapper">
    <div className="feed-masthead">
        <div>
<h2 className="feed-masthead__title">The <em>Collection</em></h2>        </div>
        <div className="sort-bar">
            {[
                { label: 'LATEST',       value: 'newest' },
                { label: 'TRENDING',     value: 'trending' },
                { label: 'MOST PRAISED', value: 'top' },
            ].map(tab => (
                <button
                    key={tab.value}
                    className={sortBy === tab.value ? 'active' : ''}
                    onClick={() => setSortBy(tab.value)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    </div>
    <div className="feed-rule" />
</div>

            {/* ── GRID ── */}
            {loading && entries.length === 0 ? (
                <div className="feed-loading"><span /></div>
            ) : entries.length === 0 ? (
                <p className="empty-msg">No discoveries yet.</p>
            ) : (
                <section className="feed-grid">
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="entry-card"
                            onClick={() => navigate(`/entry/${entry.id}`)}
                        >
                            {entry.imageUrl ? (
                                <img
                                    src={getProxiedImageUrl(entry.imageUrl)} // ✅ HERE
                                    alt={entry.title}
                                    className="entry-card__img"
                                />
                            ) : (
                                <div className="entry-card__placeholder">
                                    <span className="entry-card__initial">
                                        {entry.title?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}

                            <div className="entry-card__veil" />

                            <div className="entry-card__body">
                                <span className="entry-card__category">{entry.category}</span>
                                <h3 className="entry-card__title">{entry.title}</h3>
                                <p className="entry-card__meta">{entry.creator}</p>
                                <p
                                    className="entry-card__username"
                                    onClick={e => {
                                        e.stopPropagation();
                                        navigate(`/user/${entry.username}`);
                                    }}
                                >
                                    @{entry.username}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {/* ── LOAD MORE ── */}
            {hasMore && (
                <div className="feed-masthead-wrapper">
                    <div className="load-more-wrap">
                        <button
                            className="load-more-btn"
                            onClick={() => fetchEntries(page + 1)}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Load more'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Feed;