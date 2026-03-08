import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/SearchEntry.css';

const CATEGORIES = ['', 'MOVIES', 'TV SHOWS', 'BOOKS', 'MUSIC', 'PODCASTS', 'VIDEO_GAMES'];
const GENRE_MAP = {
    "MOVIES":      ["ACTION", "ADVENTURE", "ANIMATION", "BIOGRAPHY", "COMEDY", "CRIME", "DOCUMENTARY", "DRAMA", "FANTASY", "FAMILY", "HISTORICAL", "HORROR", "MUSICAL", "MYSTERY", "NOIR", "PSYCHOLOGICAL", "ROMANCE", "SCI_FI", "SPORTS", "SUPERHERO", "THRILLER", "WAR", "WESTERN"],
    "TV SHOWS":    ["ACTION", "ADVENTURE", "ANIMATION", "COMEDY", "CRIME", "DOCUMENTARY", "DRAMA", "FAMILY", "FANTASY", "HISTORICAL", "HORROR", "LEGAL", "MEDICAL", "MINI_SERIES", "MYSTERY", "POLITICAL", "PSYCHOLOGICAL", "REALITY", "ROMANCE", "SCI_FI", "SUPERHERO", "TALK_SHOW", "THRILLER", "WESTERN"],
    "BOOKS":       ["AUTOBIOGRAPHY", "BIOGRAPHY", "CLASSIC", "CONTEMPORARY_FICTION", "DYSTOPIAN", "ESSAYS", "FANTASY", "GRAPHIC_NOVEL", "HISTORICAL_FICTION", "HISTORY", "HORROR", "LITERARY_FICTION", "MAGICAL_REALISM", "MEMOIR", "MYSTERY", "PHILOSOPHY", "POETRY", "POLITICS", "PSYCHOLOGY", "ROMANCE", "SCIENCE", "SCIENCE_FICTION", "SELF_HELP", "SHORT_STORIES", "SPIRITUALITY", "THRILLER", "TRAVEL", "TRUE_CRIME", "YOUNG_ADULT"],
    "MUSIC":       ["ALTERNATIVE", "AMBIENT", "BLUES", "CLASSICAL", "COUNTRY", "DANCE", "ELECTRONIC", "EXPERIMENTAL", "FOLK", "FUNK", "GOSPEL", "HOUSE", "HIP_HOP", "INDIE", "JAZZ", "LATIN", "METAL", "POP", "PUNK", "R_AND_B", "REGGAE", "ROCK", "SINGER_SONGWRITER", "SOUL", "TECHNO", "WORLD_MUSIC"],
    "PODCASTS":    ["ARTS", "BUSINESS", "COMEDY", "EDUCATION", "FICTION", "HEALTH_AND_WELLNESS", "HISTORY", "INTERVIEWS", "MUSIC", "NEWS", "PERSONAL_FINANCE", "PHILOSOPHY", "POLITICS", "PSYCHOLOGY", "SCIENCE", "SOCIETY_AND_CULTURE", "SPIRITUALITY", "SPORTS", "TECHNOLOGY", "TRUE_CRIME", "TV_AND_FILM"],
    "VIDEO_GAMES": ["ACTION", "ACTION_ADVENTURE", "ADVENTURE", "BATTLE_ROYALE", "FIGHTING", "HORROR", "INDIE", "METROIDVANIA", "MMORPG", "OPEN_WORLD", "PLATFORMER", "PUZZLE", "RACING", "RHYTHM", "ROGUELIKE", "RPG", "SANDBOX", "SHOOTER", "SIMULATION", "SPORTS", "STEALTH", "STRATEGY", "TACTICAL", "VISUAL_NOVEL"]
};
const FEELING_OPTIONS = [
  "COMFORTING",
  "DARK",
  "DREAMLIKE",
  "EMOTIONAL",
  "ENERGISING",
  "EUPHORIC",
  "FUNNY",
  "HOPEFUL",
  "IMMERSIVE",
  "INSPIRING",
  "INTENSE",
  "LIGHTHEARTED",
  "MELANCHOLIC",
  "MYSTERIOUS",
  "NOSTALGIC",
  "REFLECTIVE",
  "RELAXING",
  "RESTLESS",
  "SAD",
  "SEEN",
  "SURREAL",
  "THOUGHT_PROVOKING",
  "TRANSPORTED",
  "UNSETTLING",
  "AWE_INSPIRING"
];

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
        if (f.title)    params.title    = f.title;
        if (f.creator)  params.creator  = f.creator;
        if (f.username) params.username = f.username;
        if (f.category) params.category = f.category;
        if (f.genre)    params.genre    = f.genre;
        if (f.feeling)     params.feeling     = f.feeling;
        if (f.sort)     params.sort     = f.sort;
        return params;
    };

    const fetchResults = async (f, pageNum = 0, append = false) => {
        if (append) setLoadingMore(true);
        else setLoading(true);
        setSearched(true);
        try {
            const res = await api.get('/api/v1/entry', { params: buildParams(f, pageNum) });
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
        setFilters({ title: '', creator: '', username: '', category: '', genre: '', feeling: '', sort: 'newest' });
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

            {/* ── PAGE HEADER ── */}
            <div className="find-header">
                <div className="find-header-inner">
                    <div>
                        <p className="find-eyebrow">Community picks</p>
                        <h1 className="find-title">
                            Find a <em>recommendation</em>
                        </h1>
                    </div>

                    {/* Mobile filter toggle */}
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

                {/* ── SIDEBAR ── */}
                <aside className={`find-sidebar ${sidebarOpen ? 'find-sidebar--open' : ''}`}>

                    {/* Search inputs */}
                    <div className="sidebar-section">
                        <label className="sidebar-label">Title</label>
                        <input
                            className="sidebar-input"
                            type="text"
                            name="title"
                            placeholder="e.g. Arrival"
                            value={filters.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="sidebar-section">
                        <label className="sidebar-label">Creator</label>
                        <input
                            className="sidebar-input"
                            type="text"
                            name="creator"
                            placeholder="e.g. Denis Villeneuve"
                            value={filters.creator}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="sidebar-section">
                        <label className="sidebar-label">Recommended by</label>
                        <input
                            className="sidebar-input"
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={filters.username}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="sidebar-divider" />

                    <div className="sidebar-section">
                        <label className="sidebar-label">Category</label>
                        <select className="sidebar-select" name="category" value={filters.category} onChange={handleChange}>
                            {CATEGORIES.map(c => (
                                <option key={c} value={c}>{c ? formatLabel(c) : 'All categories'}</option>
                            ))}
                        </select>
                    </div>

                    <div className="sidebar-section">
                        <label className="sidebar-label">Genre</label>
                        <select
                            className="sidebar-select"
                            name="genre"
                            value={filters.genre}
                            onChange={handleChange}
                            disabled={!filters.category}
                        >
                            <option value="">
                                {filters.category ? 'All genres' : 'Select category first'}
                            </option>
                            {(GENRE_MAP[filters.category] || []).map(g => (
                                <option key={g} value={g}>{formatLabel(g)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="sidebar-divider" />

                    <div className="sidebar-section">
    <label className="sidebar-label">Feeling</label>
    <input
        className="sidebar-input"
        type="text"
        placeholder="Filter feelings..."
        value={feelingSearch}
        onChange={e => setFeelingSearch(e.target.value)}
    />
    <div className="feeling-options">
        {FEELING_OPTIONS
            .filter(v => v.toLowerCase().includes(feelingSearch.toLowerCase()))
            .map(v => (
                <button
                    key={v}
                    className={`feeling-chip ${filters.feeling === v ? 'active' : ''}`}
                    onClick={() => setFilters(prev => ({ ...prev, feeling: prev.feeling === v ? '' : v }))}
                >
                    {formatLabel(v)}
                </button>
            ))}
    </div>
</div>

                    <div className="sidebar-divider" />

                    <div className="sidebar-section">
                        <label className="sidebar-label">Sort by</label>
                        <div className="sort-tabs">
                            {[
                                { key: 'newest', label: 'Latest' },
                                { key: 'trending', label: 'Trending' },
                                { key: 'top', label: 'Most Praised' },
                            ].map(s => (
                                <button
                                    key={s.key}
                                    className={`sort-tab ${filters.sort === s.key ? 'active' : ''}`}
                                    onClick={() => setFilters(prev => ({ ...prev, sort: s.key }))}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeFilterCount > 0 && (
                        <button className="reset-btn" onClick={handleReset}>
                            Clear all filters
                        </button>
                    )}
                </aside>

                {/* ── RESULTS ── */}
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
                                        {/* Poster */}
                                        <div className="result-card__poster">
                                            {entry.imageUrl ? (
                                                <img
                                                    src={entry.imageUrl}
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

                                        {/* Info */}
                                        <div className="result-card__info">
                                            <div className="result-card__meta-top">
                                                <span className="result-card__category">{entry.category}</span>
                                                {entry.feeling && (
                                                    <span className="result-card__feeling">
                                                        {formatLabel(entry.feeling)}
                                                    </span>
                                                )}
                                            </div>

                                            <h2 className="result-card__title">{entry.title}</h2>
                                            <p className="result-card__creator">{entry.creator}</p>

                                            {entry.genre && (
                                                <p className="result-card__genre">
                                                    {entry.genre.split(',').map(g => formatLabel(g.trim())).join(' · ')}
                                                </p>
                                            )}

                                            {entry.notes && (
                                                <p className="result-card__notes">"{entry.notes}"</p>
                                            )}

                                            <div className="result-card__footer">
                                                <span className="result-card__by">
                                                    by <strong>{entry.username}</strong>
                                                </span>
                                                {entry.upvoteCount > 0 && (
                                                    <span className="result-card__upvotes">
                                                        ↑ {entry.upvoteCount}
                                                    </span>
                                                )}
                                            </div>
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