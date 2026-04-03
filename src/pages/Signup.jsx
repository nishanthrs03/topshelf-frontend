import { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Signup.css';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const { checkUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/v1/account/complete-profile', {
                username,
                bio,
                termsAccepted: 'true',
            });
            await checkUser();
            navigate('/');
        } catch (err) {
            console.error(err);
            alert("Username might be taken or your session expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="su-page">
            <div className="su-inner">

                <div className="su-header">
                    <p className="su-eyebrow">Welcome</p>
                    <h1 className="su-title">Join <em>TopShelf</em></h1>
                    <p className="su-sub">Complete your profile to start sharing picks.</p>
                    <div className="su-rule" />
                </div>

                <form className="su-form" onSubmit={handleSubmit}>

                    <div className="su-field">
                        <label className="su-label">Username</label>
                        <input
                            className="su-input"
                            type="text"
                            placeholder="how the world will know you"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="su-field">
                        <label className="su-label">Bio </label>
                        <textarea
                            className="su-textarea"
                            placeholder="a few words about your taste…"
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            rows={4}
                            required
                        />
                    </div>

                    <label className="su-terms-row">
                        <input
                            type="checkbox"
                            className="su-checkbox"
                            checked={termsAccepted}
                            onChange={e => setTermsAccepted(e.target.checked)}
                        />
                        <span className="su-terms-text">
                            I agree to the{' '}
                            <Link to="/terms" target="_blank" className="su-terms-link">
                                Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link to="/privacy" target="_blank" className="su-terms-link">
                                Privacy Policy
                            </Link>
                        </span>
                    </label>

                    <button
                        type="submit"
                        className="su-submit"
                        disabled={loading || !username.trim() || !bio.trim() || !termsAccepted}
                    >
                        {loading ? 'Setting up…' : 'Complete Profile'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default Signup;