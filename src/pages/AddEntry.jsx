import { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/EntryForm.css';

const CATEGORIES = ["MOVIES", "TV SHOWS", "MUSIC", "PODCASTS", "BOOKS", "VIDEO_GAMES"];

const FEELING_OPTIONS = [
  "COMFORTING", "DARK", "DREAMLIKE", "EMOTIONAL", "ENERGISING",
  "EUPHORIC", "FUNNY", "HOPEFUL", "IMMERSIVE", "INSPIRING",
  "INTENSE", "LIGHTHEARTED", "MELANCHOLIC", "MYSTERIOUS", "NOSTALGIC",
  "REFLECTIVE", "RELAXING", "RESTLESS", "SAD", "SEEN",
  "SURREAL", "THOUGHT_PROVOKING", "TRANSPORTED", "UNSETTLING", "AWE_INSPIRING"
];

const GENRE_MAP = {
    "MOVIES":      ["ACTION", "ADVENTURE", "ANIMATION", "BIOGRAPHY", "COMEDY", "CRIME", "DOCUMENTARY", "DRAMA", "FANTASY", "FAMILY", "HISTORICAL", "HORROR", "MUSICAL", "MYSTERY", "NOIR", "PSYCHOLOGICAL", "ROMANCE", "SCI_FI", "SPORTS", "SUPERHERO", "THRILLER", "WAR", "WESTERN"],
    "TV SHOWS":    ["ACTION", "ADVENTURE", "ANIMATION", "COMEDY", "CRIME", "DOCUMENTARY", "DRAMA", "FAMILY", "FANTASY", "HISTORICAL", "HORROR", "LEGAL", "MEDICAL", "MINI_SERIES", "MYSTERY", "POLITICAL", "PSYCHOLOGICAL", "REALITY", "ROMANCE", "SCI_FI", "SUPERHERO", "TALK_SHOW", "THRILLER", "WESTERN"],
    "BOOKS":       ["AUTOBIOGRAPHY", "BIOGRAPHY", "CLASSIC", "CONTEMPORARY_FICTION", "DYSTOPIAN", "ESSAYS", "FANTASY", "GRAPHIC_NOVEL", "HISTORICAL_FICTION", "HISTORY", "HORROR", "LITERARY_FICTION", "MAGICAL_REALISM", "MEMOIR", "MYSTERY", "PHILOSOPHY", "POETRY", "POLITICS", "PSYCHOLOGY", "ROMANCE", "SCIENCE", "SCIENCE_FICTION", "SELF_HELP", "SHORT_STORIES", "SPIRITUALITY", "THRILLER", "TRAVEL", "TRUE_CRIME", "YOUNG_ADULT"],
    "MUSIC":       ["ALTERNATIVE", "AMBIENT", "BLUES", "CLASSICAL", "COUNTRY", "DANCE", "ELECTRONIC", "EXPERIMENTAL", "FOLK", "FUNK", "GOSPEL", "HOUSE", "HIP_HOP", "INDIE", "JAZZ", "LATIN", "METAL", "POP", "PUNK", "R_AND_B", "REGGAE", "ROCK", "SINGER_SONGWRITER", "SOUL", "TECHNO", "WORLD_MUSIC"],
    "PODCASTS":    ["ARTS", "BUSINESS", "COMEDY", "EDUCATION", "FICTION", "HEALTH_AND_WELLNESS", "HISTORY", "INTERVIEWS", "MUSIC", "NEWS", "PERSONAL_FINANCE", "PHILOSOPHY", "POLITICS", "PSYCHOLOGY", "SCIENCE", "SOCIETY_AND_CULTURE", "SPIRITUALITY", "SPORTS", "TECHNOLOGY", "TRUE_CRIME", "TV_AND_FILM"],
    "VIDEO_GAMES": ["ACTION", "ACTION_ADVENTURE", "ADVENTURE", "BATTLE_ROYALE", "FIGHTING", "HORROR", "INDIE", "METROIDVANIA", "MMORPG", "OPEN_WORLD", "PLATFORMER", "PUZZLE", "RACING", "RHYTHM", "ROGUELIKE", "RPG", "SANDBOX", "SHOOTER", "SIMULATION", "SPORTS", "STEALTH", "STRATEGY", "TACTICAL", "VISUAL_NOVEL"]
};

const GENRE_DISPLAY = {
    "SCI_FI": "Sci-Fi", "HIP_HOP": "Hip-Hop", "R_AND_B": "R&B",
    "LITERARY_FICTION": "Literary Fiction", "HISTORICAL_FICTION": "Historical Fiction",
    "CONTEMPORARY_FICTION": "Contemporary Fiction", "MAGICAL_REALISM": "Magical Realism",
    "SHORT_STORIES": "Short Stories", "GRAPHIC_NOVEL": "Graphic Novel",
    "YOUNG_ADULT": "Young Adult", "TRUE_CRIME": "True Crime", "SELF_HELP": "Self Help",
    "SINGER_SONGWRITER": "Singer-Songwriter", "WORLD_MUSIC": "World Music",
    "SOCIETY_AND_CULTURE": "Society & Culture", "HEALTH_AND_WELLNESS": "Health & Wellness",
    "TV_AND_FILM": "TV & Film", "PERSONAL_FINANCE": "Personal Finance",
    "ACTION_ADVENTURE": "Action-Adventure", "OPEN_WORLD": "Open World",
    "BATTLE_ROYALE": "Battle Royale", "VISUAL_NOVEL": "Visual Novel",
    "MINI_SERIES": "Mini Series", "TALK_SHOW": "Talk Show", "SCIENCE_FICTION": "Science Fiction",
};

const CREATOR_LABEL = {
    "MOVIES": "Director", "TV SHOWS": "Creator / Showrunner",
    "MUSIC": "Artist", "BOOKS": "Author",
    "PODCASTS": "Host", "VIDEO_GAMES": "Studio",
};

const CREATOR_PLACEHOLDER = {
    "MOVIES": "e.g. Christopher Nolan", "TV SHOWS": "e.g. Vince Gilligan",
    "MUSIC": "e.g. Rosalía", "BOOKS": "e.g. Haruki Murakami",
    "PODCASTS": "e.g. Joe Rogan", "VIDEO_GAMES": "e.g. FromSoftware",
};

const TITLE_PLACEHOLDER = {
    "MOVIES": "Inception", "TV SHOWS": "Breaking Bad",
    "MUSIC": "Motomami", "BOOKS": "Kafka on the Shore",
    "PODCASTS": "Kill Tony", "VIDEO_GAMES": "Elden Ring",
};

const displayGenre = (g) => GENRE_DISPLAY[g] || g.replace(/_/g, ' ');

const AddEntry = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    // ── Form state ────────────────────────────────────────────────────────────
    const [notes, setNotes] = useState('');
    const [feeling, setFeeling] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');
    const [genres, setGenres] = useState([]);
    const [genreError, setGenreError] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    // ── Search state ──────────────────────────────────────────────────────────
    const [query, setQuery] = useState('');
    const [creator, setCreator] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);
    const [searching, setSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [pickerError, setPickerError] = useState(false);
    const [expandedImage, setExpandedImage] = useState(null);

    // ── Edit-mode state ───────────────────────────────────────────────────────
    const [originalExternalId, setOriginalExternalId] = useState(null);
    const [changingContent, setChangingContent] = useState(false);
    const originalResultRef = useRef(null);

    // ── Filter state ──────────────────────────────────────────────────────────
    const [genreSearch, setGenreSearch] = useState('');
    const [feelingSearch, setFeelingSearch] = useState('');

    // ── Fetch entry (edit mode) ───────────────────────────────────────────────
    useEffect(() => {
        if (!id) return;
        const fetchEntry = async () => {
            try {
                const { data } = await api.get(`/api/v1/entry/${id}`);

                if (data.username !== user?.username) {
                    navigate('/mine');
                    return;
                }

                setNotes(data.notes || '');
                setFeeling(data.feeling || '');
                setCategory(data.category || '');
                setStatus(data.status || '');
                setGenres(data.genre ? data.genre.split(',') : []);
                setOriginalExternalId(data.externalId);

                const resultData = {
                    externalId: data.externalId,
                    externalSource: data.externalSource,
                    title: data.title,
                    creator: data.creator,
                    imageUrl: data.imageUrl,
                };
                setSelectedResult(resultData);
                originalResultRef.current = resultData;
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setDataLoaded(true); // ← always fires here
            }
        };
        fetchEntry();
    }, [id]);

    // ── Content search ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!category || query.length < 2) {
            setSearchResults([]);
            setHasSearched(false);
            return;
        }
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const params = { query, category };
                if (creator.trim()) params.creator = creator.trim();
                const { data } = await api.get('/api/v1/search', { params });
                setSearchResults(data || []);
                setHasSearched(true);
            } catch (err) {
                console.error('Search failed:', err);
            } finally {
                setSearching(false);
            }
        }, 600);
        return () => clearTimeout(timer);
    }, [query, creator, category]);

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        setQuery('');
        setCreator('');
        setGenres([]);
        setSearchResults([]);
        setSelectedResult(null);
        setHasSearched(false);
        setPickerError(false);
        setGenreError(false);
        if (isEditMode) setChangingContent(true);
    };

    const handleGenreToggle = (g) => {
        setGenreError(false);
        setGenres(prev => {
            if (prev.includes(g)) return prev.filter(x => x !== g);
            if (prev.length >= 3) return prev;
            return [...prev, g];
        });
    };

    const handleCancelContentChange = () => {
        setChangingContent(false);
        setSelectedResult(originalResultRef.current);
        setQuery('');
        setCreator('');
        setSearchResults([]);
        setHasSearched(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedResult) { setPickerError(true); return; }
        if (genres.length === 0) { setGenreError(true); return; }
        try {
            if (isEditMode) {
                const payload = { notes, feeling, genres, category };
                if (selectedResult.externalId !== originalExternalId) {
                    payload.externalId = selectedResult.externalId;
                    payload.externalSource = selectedResult.externalSource;
                }
                await api.put(`/api/v1/entry/${id}`, payload);
            } else {
                await api.post('/api/v1/entry', {
                    externalId: selectedResult.externalId,
                    externalSource: selectedResult.externalSource,
                    category, genres, feeling, notes,
                });
            }
            navigate('/mine');
        } catch (err) {
            alert(err.response?.data || "Error saving entry.");
        }
    };

    // ── Loading guard ─────────────────────────────────────────────────────────
    if (isEditMode && !dataLoaded) {
        return <div className="loading-container">Loading...</div>;
    }

    const isHiddenEntry = isEditMode && status === 'HIDDEN';
    const contentChanged = isEditMode && selectedResult?.externalId !== originalExternalId;

    const renderSearchPicker = () => (
        <div className="search-section">
            <div className="search-section-header">
                <span className="search-section-icon">⌕</span>
                <div>
                    <p className="search-section-title">Find your pick</p>
                    <p className="search-section-hint">
                        Start typing a title — results appear automatically.
                        {!["MOVIES", "TV SHOWS", "VIDEO_GAMES"].includes(category) &&
                            ` Optionally add a ${CREATOR_LABEL[category]?.toLowerCase()} to narrow results.`}
                    </p>
                </div>
            </div>

            <div className="search-fields-row">
                <div className="search-field-group">
                    <label className="search-field-label">Title</label>
                    <input
                        className="search-input"
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder={`e.g. ${TITLE_PLACEHOLDER[category] || 'search...'}`}
                        autoFocus
                    />
                </div>

                {!["MOVIES", "TV SHOWS", "VIDEO_GAMES"].includes(category) && (
                    <div className="search-field-group">
                        <label className="search-field-label">
                            {CREATOR_LABEL[category] || 'Creator'}
                            <span className="label-optional">optional</span>
                        </label>
                        <input
                            className="search-input"
                            type="text"
                            value={creator}
                            onChange={e => setCreator(e.target.value)}
                            placeholder={CREATOR_PLACEHOLDER[category] || ''}
                        />
                    </div>
                )}
            </div>

            {searching && (
                <div className="search-status">
                    <span className="search-spinner" />
                    Searching...
                </div>
            )}

            {selectedResult && !changingContent && (
                <div className="selected-card">
                    <div className="selected-card-image-wrap">
                        <img
                            src={selectedResult.imageUrl}
                            alt={selectedResult.title}
                            className="selected-card-image"
                            onClick={() => setExpandedImage(selectedResult.imageUrl)}
                        />
                        <div className="selected-card-zoom-hint">enlarge</div>
                    </div>
                    <div className="selected-card-info">
                        <div className="selected-card-badge">✓ Selected</div>
                        <h3 className="selected-card-title">{selectedResult.title}</h3>
                        {selectedResult.year && <span className="selected-card-year">{selectedResult.year}</span>}
                        {selectedResult.creator && <p className="selected-card-creator">{selectedResult.creator}</p>}
                        {selectedResult.description && <p className="selected-card-description">{selectedResult.description}</p>}
                        <button
                            type="button"
                            className="selected-card-change"
                            onClick={() => {
                                setSelectedResult(null);
                                setQuery('');
                                setSearchResults([]);
                                setHasSearched(false);
                            }}
                        >
                            ✕ Pick a different one
                        </button>
                    </div>
                </div>
            )}

            {searchResults.length > 0 && !selectedResult && (
                <div className="results-section">
                    <p className="results-label">
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} — click to select
                    </p>
                    <div className="image-picker-results">
                        {searchResults.map(result => (
                            <button
                                key={result.externalId}
                                type="button"
                                className="image-picker-item"
                                onClick={() => {
                                    setSelectedResult(result);
                                    setSearchResults([]);
                                    setHasSearched(false);
                                    if (isEditMode) {
                                        setChangingContent(false);
                                        setGenres([]);
                                        setGenreError(false);
                                    }
                                }}
                            >
                                <img src={result.imageUrl} alt={result.title} />
                                <div className="picker-item-meta">
                                    <span className="image-picker-item-title">{result.title}</span>
                                    {result.year && <span className="picker-item-year">{result.year}</span>}
                                    {result.creator && <span className="image-picker-item-sub">{result.creator}</span>}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {hasSearched && searchResults.length === 0 && !searching && !selectedResult && (
                <p className="image-picker-hint">No results. Try a different title.</p>
            )}

            {pickerError && (
                <p className="image-picker-error">Please select a result before saving.</p>
            )}

            {isEditMode && (
                <button type="button" className="cancel-change-btn" onClick={handleCancelContentChange}>
                    ← Keep original
                </button>
            )}
        </div>
    );

    return (
        <div className="form-wrapper">
            <Link to={isEditMode ? "/mine" : '/'} className="back-link">
                ← {isEditMode ? 'Back to my picks' : 'Back'}
            </Link>

            <div className="form-card">
                <h2>
                    {isEditMode ? 'Edit your' : 'Write a'} <em>recommendation</em>
                </h2>
                <p className="form-subtitle">
    {isEditMode
        ? 'Update your pick — changes go back to review.'
        : 'Only add what genuinely stayed with you — the 9/10s, the ones you\'d press into someone\'s hands.'}
</p>

                <form onSubmit={handleSubmit}>

                    {/* ── Category ── */}
                    <div className="input-group">
                        <label>Category</label>
                        <select value={category} onChange={handleCategoryChange} required>
                            <option value="" disabled>Select a category</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* ── Search picker (add mode) ── */}
                    {!isEditMode && category && renderSearchPicker()}

                    {/* ── Edit mode ── */}
                    {isEditMode && (
                        <>
                            {selectedResult && !changingContent && (
                                <div className="locked-content-card">
                                    <img
                                        src={selectedResult.imageUrl}
                                        alt={selectedResult.title}
                                        onClick={() => setExpandedImage(selectedResult.imageUrl)}
                                    />
                                    <div className="locked-content-info">
                                        {contentChanged && (
                                            <span className="content-changed-badge">✓ Updated</span>
                                        )}
                                        <p className="locked-title">{selectedResult.title}</p>
                                        {selectedResult.creator && (
                                            <p className="locked-sub">{selectedResult.creator}</p>
                                        )}
                                        <button
                                            type="button"
                                            className="selected-card-change"
                                            style={{ marginTop: '12px' }}
                                            onClick={() => {
                                                setChangingContent(true);
                                                setSelectedResult(null);
                                                setGenres([]);
                                                setGenreError(false);
                                            }}
                                        >
                                            ✕ Wrong item? Change it
                                        </button>
                                    </div>
                                </div>
                            )}
                            {changingContent && renderSearchPicker()}
                        </>
                    )}

                    <div className="form-divider" />

                    {/* ── Genre ── */}
                    {category && (
                        <div className="input-group">
                            <label>
                                Genre <span className="label-hint">— pick up to 3</span>
                            </label>
                            <input
                                className="chip-search-input"
                                type="text"
                                placeholder="Filter genres..."
                                value={genreSearch}
                                onChange={e => setGenreSearch(e.target.value)}
                            />
                            <div className="genre-chip-group">
                                {GENRE_MAP[category]
                                    ?.filter(g => g.toLowerCase().includes(genreSearch.toLowerCase()))
                                    .map(g => (
                                        <label
                                            key={g}
                                            className={`genre-chip ${genres.includes(g) ? 'selected' : ''} ${genres.length >= 3 && !genres.includes(g) ? 'disabled' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                value={g}
                                                checked={genres.includes(g)}
                                                onChange={() => handleGenreToggle(g)}
                                                disabled={genres.length >= 3 && !genres.includes(g)}
                                            />
                                            {displayGenre(g)}
                                        </label>
                                    ))}
                            </div>
                            {genreError && <p className="image-picker-error">Please select at least one genre.</p>}
                        </div>
                    )}

                    {/* ── Feeling ── */}
                    <div className="input-group">
                        <label>Feeling</label>
                        <input
                            className="chip-search-input"
                            type="text"
                            placeholder="Filter feelings..."
                            value={feelingSearch}
                            onChange={e => setFeelingSearch(e.target.value)}
                        />
                        <div className="feeling-radio-group">
                            {FEELING_OPTIONS
                                .filter(v => v.toLowerCase().includes(feelingSearch.toLowerCase()))
                                .map(v => (
                                    <label key={v} className={`feeling-chip ${feeling === v ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="feeling"
                                            value={v}
                                            checked={feeling === v}
                                            onChange={e => setFeeling(e.target.value)}
                                            required
                                        />
                                        {v.replace(/_/g, ' ')}
                                    </label>
                                ))}
                        </div>
                    </div>

                    {/* ── Notes ── */}
                    <div className="input-group">
                        <label>Why do you recommend this?</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="What makes this worth experiencing? Be honest, be specific."
                            required
                        />
                    </div>

                    {isHiddenEntry && (
                        <div className="moderation-notice resubmit-warning">
                            <span className="notice-icon">⚠️</span>
                            <p>
                                <strong>Resubmission:</strong> This entry is hidden.
                                Updating it will resubmit it for review.
                            </p>
                        </div>
                    )}

                    <button type="submit" className="submit-btn">
                        {isEditMode
                            ? (isHiddenEntry ? 'Update & Resubmit' : 'Save Changes')
                            : 'Share this pick'}
                    </button>
                </form>
            </div>

            {expandedImage && (
                <div className="image-modal-overlay" onClick={() => setExpandedImage(null)}>
                    <div className="image-modal-content" onClick={e => e.stopPropagation()}>
                        <img src={expandedImage} alt="Cover" />
                        <button className="image-modal-close" onClick={() => setExpandedImage(null)}>✕</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddEntry;