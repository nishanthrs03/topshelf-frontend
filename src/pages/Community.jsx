import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/Community.css';

const avatarColors = [
    ['#FF6B6B', '#FFE66D'], ['#4ECDC4', '#44CF6C'],
    ['#A855F7', '#EC4899'], ['#F97316', '#EAB308'],
    ['#3B82F6', '#06B6D4'], ['#10B981', '#84CC16'],
];

const getInitials = (username) => {
    if (!username) return '?';
    return username.slice(0, 2).toUpperCase();
};

const Community = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [totalUsers, setTotalUsers] = useState(0);

    const fetchUsers = useCallback(async (pageNum = 0, reset = false) => {
        setLoading(true);
        try {
            const res = await api.get('/api/v1/account/users', {
                params: { page: pageNum, size: 20 }
            });
            const data = res.data;
            setUsers(prev => reset ? data.content : [...prev, ...data.content]);
            setHasMore(!data.last);
            setTotalUsers(data.totalElements);
            setPage(pageNum);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(0, true);
    }, [fetchUsers]);

    // Client-side filter on already-loaded users
    // For search across all users you'd want a backend search param
    const filtered = users.filter(u =>
        u.username?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="community-page">
            <div className="community-hero">
                <p className="community-eyebrow">Discover</p>
                <h1 className="community-title">The Curators</h1>
                <p className="community-subtitle">
                    Real people. Real recommendations. Browse the minds behind the picks.
                </p>
                <div className="community-search-wrap">
                    <span className="community-search-icon">⌕</span>
                    <input
                        className="community-search"
                        placeholder="Search curators..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading && users.length === 0 ? (
                <div className="community-loading">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="user-card-skeleton" />
                    ))}
                </div>
            ) : (
                <>
                    <p className="community-count">
                        {search ? `${filtered.length} match${filtered.length !== 1 ? 'es' : ''}` : `${totalUsers} curator${totalUsers !== 1 ? 's' : ''}`}
                    </p>
                    <div className="community-grid">
                        {filtered.map((user, i) => {
                            const [from, to] = avatarColors[i % avatarColors.length];
                            return (
                                <Link
                                    to={`/user/${user.username}`}
                                    key={user.username}
                                    className="user-card"
                                    style={{ animationDelay: `${i * 0.05}s` }}
                                >
                                    <div
                                        className="user-card-avatar"
                                        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                                    >
                                        {getInitials(user.username)}
                                    </div>
                                    <div className="user-card-body">
                                        <h3 className="user-card-name">{user.username}</h3>
                                        <p className="user-card-bio">
                                            {user.bio || ''}
                                        </p>
                                    </div>
                                    <span className="user-card-cta">View profile →</span>
                                </Link>
                            );
                        })}
                    </div>

                    {hasMore && !search && (
                        <div className="load-more-wrap">
                            <button
                                className="load-more-btn"
                                onClick={() => fetchUsers(page + 1)}
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : 'Load more'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Community;