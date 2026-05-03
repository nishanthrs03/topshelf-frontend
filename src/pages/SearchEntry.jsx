import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/SearchEntry.css';

const CATEGORIES = ['', 'MOVIES', 'TV SHOWS', 'BOOKS', 'MUSIC', 'PODCASTS', 'VIDEO_GAMES'];

const GENRE_MAP = {
    "MOVIES": ["ACTION", "ADVENTURE", "ANIMATION", "BIOGRAPHY", "COMEDY", "CRIME", "DOCUMENTARY", "DRAMA", "FANTASY", "FAMILY", "HISTORICAL", "HORROR", "MUSICAL", "MYSTERY", "NOIR", "PSYCHOLOGICAL", "ROMANCE", "SCI_FI", "SPORTS", "SUPERHERO", "THRILLER", "WAR", "WESTERN"],
    "TV SHOWS": ["ACTION", "ADVENTURE", "ANIMATION", "COMEDY", "CRIME", "DOCUMENTARY", "DRAMA", "FAMILY", "FANTASY", "HISTORICAL", "HORROR", "LEGAL", "MEDICAL", "MINI_SERIES", "MYSTERY", "POLITICAL", "PSYCHOLOGICAL", "REALITY", "ROMANCE", "SCI_FI", "SUPERHERO", "TALK_SHOW", "THRILLER", "WESTERN"],
    "BOOKS": ["AUTOBIOGRAPHY", "BIOGRAPHY", "CLASSIC", "CONTEMPORARY_FICTION", "DYSTOPIAN", "ESSAYS", "FANTASY", "GRAPHIC_NOVEL", "HISTORICAL_FICTION", "HISTORY", "HORROR", "LITERARY_FICTION", "MAGICAL_REALISM", "MEMOIR", "MYSTERY", "PHILOSOPHY", "POETRY", "POLITICS", "PSYCHOLOGY", "ROMANCE", "SCIENCE", "SCIENCE_FICTION", "SELF_HELP", "SHORT_STORIES", "SPIRITUALITY", "THRILLER", "TRAVEL", "TRUE_CRIME", "YOUNG_ADULT"],
    "MUSIC": ["ALTERNATIVE", "AMBIENT", "BLUES", "CLASSICAL", "COUNTRY", "DANCE", "ELECTRONIC", "EXPERIMENTAL", "FOLK", "FUNK", "GOSPEL", "HOUSE", "HIP_HOP", "INDIE", "JAZZ", "LATIN", "METAL", "POP", "PUNK", "R_AND_B", "REGGAE", "ROCK", "SINGER_SONGWRITER", "SOUL", "TECHNO", "WORLD_MUSIC"],
    "PODCASTS": ["ARTS", "BUSINESS", "COMEDY", "EDUCATION", "FICTION", "HEALTH_AND_WELLNESS", "HISTORY", "INTERVIEWS", "MUSIC", "NEWS", "PERSONAL_FINANCE", "PHILOSOPHY", "POLITICS", "PSYCHOLOGY", "SCIENCE", "SOCIETY_AND_CULTURE", "SPIRITUALITY", "SPORTS", "TECHNOLOGY", "TRUE_CRIME", "TV_AND_FILM"],
    "VIDEO_GAMES": ["ACTION", "ACTION_ADVENTURE", "ADVENTURE", "BATTLE_ROYALE", "FIGHTING", "HORROR", "INDIE", "METROIDVANIA", "MMORPG", "OPEN_WORLD", "PLATFORMER", "PUZZLE", "RACING", "RHYTHM", "ROGUELIKE", "RPG", "SANDBOX", "SHOOTER", "SIMULATION", "SPORTS", "STEALTH", "STRATEGY", "TACTICAL", "VISUAL_NOVEL"]
};

const FEELING_OPTIONS = [
  "COMFORTING","DARK","DREAMLIKE","EMOTIONAL","ENERGISING","EUPHORIC","FUNNY","HOPEFUL",
  "IMMERSIVE","INSPIRING","INTENSE","LIGHTHEARTED","MELANCHOLIC","MYSTERIOUS","NOSTALGIC",
  "REFLECTIVE","RELAXING","RESTLESS","SAD","SEEN","SURREAL","THOUGHT_PROVOKING",
  "TRANSPORTED","UNSETTLING","AWE_INSPIRING"
];

// ✅ Image Proxy Helper
const getProxiedImageUrl = (url) => {
    if (!url) return null;

    if (url.includes('archive.org')) {
        return `/imageproxy?url=${encodeURIComponent(url)}`;
    }

    return url;
};

const SearchEntry = () => {
    const navigate = useNavigate();

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [totalResults, setTotalResults] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [feelingSearch, setFeelingSearch] = useState('');

    const [filters, setFilters] = useState({
        title: '', creator: '', username: '',
        category: '', genre: '', feeling: '', sort: 'newest',
    });

    const debounceRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'category') {
            setFilters(prev => ({ ...prev, category: value, genre: '' }));
        } else {
            setFilters(prev => ({ ...prev, [name]: value }));
        }
    };

    const buildParams = (f, pageNum = 0) => {
        const params = { page: pageNum, size: 20 };
        if (f.title) params.title = f.title;
        if (f.creator) params.creator = f.creator;
        if (f.username) params.username = f.username;
        if (f.category) params.category = f.category;
        if (f.genre) params.genre = f.genre;
        if (f.feeling) params.feeling = f.feeling;
        if (f.sort) params.sort = f.sort;
        return params;
    };

    const fetchResults = async (f, pageNum = 0, append = false) => {
        if (append) setLoadingMore(true);
        else setLoading(true);

        setSearched(true);

        try {
            const res = await api.get('/api/v1/entry', {
                params: buildParams(f, pageNum)
            });

            const data = res.data;

            setResults(prev => append ? [...prev, ...data.content] : data.content);
            setHasMore(!data.last);
            setTotalResults(data.totalElements);
            setPage(pageNum);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            fetchResults(filters, 0, false);
        }, 400);

        return () => clearTimeout(debounceRef.current);
    }, [filters]);

    const handleReset = () => {
        setFilters({
            title: '', creator: '', username: '',
            category: '', genre: '', feeling: '', sort: 'newest'
        });

        setResults([]);
        setSearched(false);
        setHasMore(false);
        setTotalResults(0);
        setPage(0);
    };

    const formatLabel = (str) =>
        str.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

    const activeFilterCount = [
        filters.title, filters.creator, filters.username,
        filters.category, filters.genre, filters.feeling
    ].filter(Boolean).length;

    return (
        <div className="find-wrapper">

            <div className="find-header">
                <div className="find-header-inner">
                    <div>
                        <p className="find-eyebrow">Community picks</p>
                        <h1 className="find-title">
                            Find a <em>recommendation</em>
                        </h1>
                    </div>

                    <button
                        className="filter-toggle-btn"
                        onClick={() => setSidebarOpen(o => !o)}
                    >
                        Filters {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
                    </button>
                </div>
                <div className="find-header-rule" />
            </div>

            <div className="find-layout">

                <aside className={`find-sidebar ${sidebarOpen ? 'find-sidebar--open' : ''}`}>
                    {/* (sidebar unchanged) */}
                </aside>

                <main className="find-results">

                    {loading && (
                        <div className="results-state">
                            <span className="find-spinner" />
                            <p>Searching...</p>
                        </div>
                    )}

                    {!loading && searched && results.length === 0 && (
                        <div className="results-state">
                            <p className="results-state-title">No recommendations found</p>
                            <p className="results-state-sub">Try adjusting your filters.</p>
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <>
                            <p className="results-count">
                                {totalResults.toLocaleString()} recommendation{totalResults !== 1 ? 's' : ''}
                            </p>

                            <div className="results-grid">
                                {results.map(entry => (
                                    <div
                                        key={entry.id}
                                        className="result-card"
                                        onClick={() => navigate(`/entry/${entry.id}`)}
                                    >
                                        <div className="result-card__poster">
                                            {entry.imageUrl ? (
                                                <img
                                                    src={getProxiedImageUrl(entry.imageUrl)} // ✅ HERE
                                                    alt={entry.title}
                                                    className="result-card__img"
                                                />
                                            ) : (
                                                <div className="result-card__placeholder">
                                                    <span className="result-card__initial">
                                                        {entry.title?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="result-card__poster-veil" />
                                        </div>

                                        <div className="result-card__info">
                                            <h2 className="result-card__title">{entry.title}</h2>
                                            <p className="result-card__creator">{entry.creator}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {hasMore && (
                                <div className="find-load-more">
                                    <button
                                        className="find-load-more-btn"
                                        onClick={() => fetchResults(filters, page + 1, true)}
                                        disabled={loadingMore}
                                    >
                                        {loadingMore ? 'Loading...' : 'Load more'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SearchEntry;