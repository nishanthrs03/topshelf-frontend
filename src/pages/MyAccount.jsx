import { useEffect, useState } from "react"
import api from "../services/api"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from '../context/AuthContext';
import '../styles/MyAccount.css'

const MyAccount = () => {
    const [username, setUsername] = useState("")
    const [bio, setBio] = useState("")
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [showConfirm, setShowConfirm] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await api.get("api/v1/account");
                setBio(res.data.bio);
                setUsername(res.data.username);
            } catch (err) {
                console.log("Error retrieving current user", err);
            } finally {
                setLoading(false);
            }
        }
        fetchCurrentUser();
    }, []);

    const profileUrl = `${window.location.origin}/user/${username}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const processDelete = async () => {
        try {
            await api.delete('/api/v1/account');
            window.location.href = "http://localhost:9090/logout";
            setShowConfirm(false);
        } catch (err) {
            console.log("Error Deleting Profile", err);
        }
    };

    if (loading) return (
        <div className="ma-loading">
            <span>Loading...</span>
        </div>
    );

    const initial = username?.charAt(0).toUpperCase();

    return (
        <div className="ma-page">
            <div className="ma-inner">

                {/* ── HEADER ── */}
                <div className="ma-header">
                    <p className="ma-eyebrow">Account</p>
                    <div className="ma-identity">
                        <div className="ma-avatar">{initial}</div>
                        <h1 className="ma-username">{username}</h1>
                    </div>
                    <div className="ma-rule" />
                </div>

                {/* ── BIO ── */}
                {bio && (
                    <div className="ma-section">
                        <p className="ma-section__label">Bio</p>
                        <p className="ma-bio">{bio}</p>
                    </div>
                )}

                {/* ── PROFILE LINK ── */}
                <div className="ma-section">
                    <p className="ma-section__label">Your public profile</p>
                    <div className="ma-url-row">
                        <Link to={`/user/${username}`} className="ma-url-text">
                            {profileUrl}
                        </Link>
                        <button
                            className={`ma-copy-btn ${copied ? 'ma-copy-btn--copied' : ''}`}
                            onClick={handleCopy}
                        >
                            {copied ? '✓ Copied' : 'Copy'}
                        </button>
                    </div>
                </div>

                <div className="ma-divider" />

                {/* ── ACTIONS ── */}
                {showConfirm ? (
                    <div className="ma-confirm">
                        <p className="ma-confirm__text">
                            This is permanent. Your profile and all picks will be deleted.
                        </p>
                        <div className="ma-confirm__btns">
                            <button className="ma-confirm__yes" onClick={processDelete}>
                                Yes, delete everything
                            </button>
                            <button className="ma-confirm__no" onClick={() => setShowConfirm(false)}>
                                Keep my account
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="ma-actions">
                        <Link to="/edit-profile" className="ma-edit-btn">
                            Edit Profile
                        </Link>
                        <button className="ma-delete-btn" onClick={() => setShowConfirm(true)}>
                            Delete account
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAccount;