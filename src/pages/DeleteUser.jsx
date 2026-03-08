import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/DeleteUser.css';

const DeleteUser = () => {
    const [username, setUsername] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // { type: 'success' | 'error', message }

    const handleSearch = (e) => {
        e.preventDefault();
        if (!username.trim()) return;
        setConfirming(true);
        setResult(null);
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await api.delete(`/api/v1/admin/user/${username.trim()}`);
            setResult({ type: 'success', message: `User "${username.trim()}" and all their entries have been deleted.` });
            setUsername('');
            setConfirming(false);
        } catch (err) {
            const msg = err.response?.status === 404
                ? `No user found with username "${username.trim()}".`
                : err.response?.status === 403
                ? 'You cannot delete the primary owner account.'
                : err.response?.data || 'Something went wrong. Please try again.';
            setResult({ type: 'error', message: msg });
            setConfirming(false);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setConfirming(false);
        setResult(null);
    };

    return (
        <div className="du-wrapper">
            <div className="du-inner">

                <Link to="/admin/moderate" className="du-back">← Back to Admin</Link>

                <div className="du-header">
                    <span className="du-shield">🛡️</span>
                    <div>
                        <h1 className="du-title">Delete <em>User</em></h1>
                        <p className="du-subtitle">
                            Permanently removes the user and all their recommendations.
                            This action cannot be undone.
                        </p>
                    </div>
                </div>

                <div className="du-card">

                    {!confirming && (
                        <form onSubmit={handleSearch} className="du-form">
                            <label className="du-label">Username</label>
                            <div className="du-input-row">
                                <input
                                    className="du-input"
                                    type="text"
                                    placeholder="e.g. john_doe"
                                    value={username}
                                    onChange={e => {
                                        setUsername(e.target.value);
                                        setResult(null);
                                    }}
                                    autoFocus
                                />
                                <button
                                    className="du-submit"
                                    type="submit"
                                    disabled={!username.trim()}
                                >
                                    Continue
                                </button>
                            </div>
                        </form>
                    )}

                    {confirming && (
                        <div className="du-confirm">
                            <div className="du-confirm-icon">⚠️</div>
                            <p className="du-confirm-title">Are you sure?</p>
                            <p className="du-confirm-body">
                                You are about to permanently delete{' '}
                                <strong>@{username.trim()}</strong> and all their
                                recommendations. This cannot be reversed.
                            </p>
                            <div className="du-confirm-actions">
                                <button
                                    className="du-btn-cancel"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="du-btn-delete"
                                    onClick={handleConfirm}
                                    disabled={loading}
                                >
                                    {loading ? 'Deleting...' : 'Yes, delete user'}
                                </button>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className={`du-result du-result--${result.type}`}>
                            <span className="du-result-icon">
                                {result.type === 'success' ? '✓' : '✕'}
                            </span>
                            {result.message}
                        </div>
                    )}

                </div>

                <div className="du-warning-box">
                    <p className="du-warning-title">What gets deleted</p>
                    <p className="du-warning-body">
                        Deleting a user removes their account and every recommendation
                        they have submitted — including approved, pending, and hidden entries.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default DeleteUser;