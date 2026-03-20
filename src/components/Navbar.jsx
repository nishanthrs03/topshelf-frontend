import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import '../styles/Navbar.css';

const Navbar = () => {
    const { user, loading } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const [menuOpen, setMenuOpen] = useState(false);

    if (loading) return <nav className="navbar-header">Loading..</nav>;

    return (
        <nav className="navbar-header">
            <div className='navbar-content'>
                <Link to="/" className="nav-brand">TopShelf</Link>

                {/* Desktop nav */}
                <div className='nav-links desktop-nav'>
                    <Link to="/" className="nav-item">Home</Link>
                    <Link to="/community" className="nav-item">Community</Link>
                    {user && user.username ? (
                        <>
                            {isAdmin && (
                                <div className="admin-dropdown">
                                    <span className="nav-item admin-link">🛡️ Admin Panel</span>
                                    <div className="dropdown-menu">
                                        <Link to="/admin/moderate" className="dropdown-item">Moderate Content</Link>
                                        <Link to="/admin/roles" className="dropdown-item">Update User Roles</Link>
                                        <Link to="/admin/delete-user" className="dropdown-item dropdown-item--danger">Delete User</Link>
                                    </div>
                                </div>
                            )}
                            <Link to="/add" className="nav-item">Write a Recommendation</Link>
                            <Link to="/mine" className="nav-item">My Collection</Link>
                            <Link to="/myaccount" className="nav-item">My Account</Link>
                            <a href={`${import.meta.env.VITE_API_URL}/logout`} className="nav-btn">Logout</a>
                        </>
                    ) : (
                        <a href={`${import.meta.env.VITE_API_URL}/oauth2/authorization/google`} className="nav-btn login-btn">Login</a>
                    )}
                </div>

                {/* Hamburger button — mobile only */}
                <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
                    <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
                    <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
                    <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="mobile-menu">
                    <Link to="/" className="mobile-item" onClick={() => setMenuOpen(false)}>Home</Link>
                    <Link to="/community" className="mobile-item" onClick={() => setMenuOpen(false)}>Community</Link>
                    {user && user.username ? (
                        <>
                            {isAdmin && (
                                <>
                                    <Link to="/admin/moderate" className="mobile-item" onClick={() => setMenuOpen(false)}>Moderate Content</Link>
                                    <Link to="/admin/roles" className="mobile-item" onClick={() => setMenuOpen(false)}>Update User Roles</Link>
                                    <Link to="/admin/delete-user" className="mobile-item mobile-item--danger" onClick={() => setMenuOpen(false)}>Delete User</Link>
                                </>
                            )}
                            <Link to="/add" className="mobile-item" onClick={() => setMenuOpen(false)}>Write a Recommendation</Link>
                            <Link to="/mine" className="mobile-item" onClick={() => setMenuOpen(false)}>My Collection</Link>
                            <Link to="/myaccount" className="mobile-item" onClick={() => setMenuOpen(false)}>My Account</Link>
                            <a href={`${import.meta.env.VITE_API_URL}/logout`} className="mobile-item">Logout</a>
                        </>
                    ) : (
                        <a href={`${import.meta.env.VITE_API_URL}/oauth2/authorization/google`} className="mobile-item">Login</a>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;