import { Link } from 'react-router-dom';
import '../styles/Legal.css';

const Privacy = () => {
    return (
        <div className="legal-wrapper">
            <div className="legal-inner">
                <Link to="/" className="legal-back">← Back to TopShelf</Link>

                <div className="legal-header">
                    <p className="legal-eyebrow">Last updated: March 2026</p>
                    <h1 className="legal-title">Privacy <em>Policy</em></h1>
                    <p className="legal-lead">
                        We collect as little as possible and don't sell anything.
                        Here's exactly what we store and why.
                    </p>
                </div>

                <div className="legal-body">

                    <section className="legal-section">
                        <h2>1. What we collect</h2>
                        <p>When you sign in and create a profile, we store:</p>
                        <ul>
                            <li><strong>Email address</strong> — from your Google account, used to identify you</li>
                            <li><strong>Google subject ID</strong> — a unique identifier from Google OAuth</li>
                            <li><strong>Username</strong> — chosen by you during signup</li>
                            <li><strong>Bio</strong> — optional, written by you</li>
                            <li><strong>Recommendations</strong> — entries you submit to the platform</li>
                        </ul>
                        <p>We do not collect passwords, payment information, or location data.</p>
                    </section>

                    <section className="legal-section">
                        <h2>2. How we use your data</h2>
                        <p>Your data is used solely to operate the platform:</p>
                        <ul>
                            <li>To authenticate you via Google OAuth</li>
                            <li>To display your profile and recommendations</li>
                            <li>To moderate submitted content</li>
                        </ul>
                        <p>
                            We do not use your data for advertising, analytics profiling,
                            or any purpose beyond what is listed above.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>3. Who we share data with</h2>
                        <p>
                            We do not sell or share your personal data with third parties.
                        </p>
                        <p>
                            We use Google OAuth for authentication — Google's own privacy
                            policy governs how they handle your data during sign-in.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>4. Data storage and security</h2>
                        <p>
                            Your data is stored in a PostgreSQL database. We take reasonable
                            precautions to protect it, but no system is completely secure.
                            In the event of a data breach we will make reasonable efforts to
                            notify affected users.
                        </p>
                        <p>
                            As stated in our Terms of Service, we are not liable for
                            unauthorised access to your data.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>5. Sessions</h2>
                        <p>
                            We use server-side sessions to keep you logged in. Sessions are
                            stored in the database and expire on logout or after an inactivity
                            period.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>6. Your rights</h2>
                        <p>You have the right to:</p>
                        <ul>
                            <li>Delete your account and all associated data at any time via My Account</li>
                            <li>Correct inaccurate information via your profile</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>7. Children</h2>
                        <p>
                            TopShelf is not directed at children under 13. We do not knowingly
                            collect data from children.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>8. Changes to this policy</h2>
                        <p>
                            We may update this policy at any time. Continued use of the
                            platform after changes constitutes acceptance of the updated policy.
                        </p>
                    </section>

                </div>

                <div className="legal-footer-links">
                    <Link to="/terms" className="legal-link">Terms of Service</Link>
                </div>
            </div>
        </div>
    );
};

export default Privacy;