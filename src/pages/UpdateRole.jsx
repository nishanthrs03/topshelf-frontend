import { useState } from 'react';
import api from '../services/api';
import '../styles/UpdateRole.css';

const ROLES = ['USER', 'ADMIN',];

const UpdateRole = () => {
    const [username, setUsername] = useState('');

    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // { success: bool, message: string }

    const handleSubmit = async () => {
        if (!username.trim() || !role) return;
        setLoading(true);
        setResult(null);
        try {
            const res = await api.put('/api/v1/admin/updaterole', { username: username.trim(), role });
            setResult({ success: true, message: `Role updated to ${role} for ${res.data.username || username}.` });
            setUsername('');
            setRole('');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Something went wrong.';
            setResult({ success: false, message: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ur-page">
            <div className="ur-inner">

                {/* Header */}
                <div className="ur-header">
                    <p className="ur-eyebrow">Admin</p>
                    <h1 className="ur-title">Update <em>Role</em></h1>
                    <div className="ur-rule" />
                </div>

               {/* Form */}
<div className="ur-form">
    <div className="ur-field">
        <label className="ur-label">Username</label>
        <input
            className="ur-input"
            type="text"
            placeholder="e.g. john_doe"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
    </div>

                    <div className="ur-field">
                        <label className="ur-label">New Role</label>
                        <div className="ur-role-options">
                            {ROLES.map(r => (
                                <button
                                    key={r}
                                    className={`ur-role-btn ${role === r ? 'ur-role-btn--active' : ''}`}
                                    onClick={() => setRole(r)}
                                    type="button"
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Result */}
                    {result && (
                        <div className={`ur-result ${result.success ? 'ur-result--success' : 'ur-result--error'}`}>
                            {result.message}
                        </div>
                    )}

                    <button
                        className="ur-submit"
                        onClick={handleSubmit}
                        disabled={loading || !username.trim() || !role}
                    >
                        {loading ? 'Updating…' : 'Update Role'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateRole;