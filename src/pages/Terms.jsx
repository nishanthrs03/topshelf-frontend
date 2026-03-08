import { Link } from 'react-router-dom';
import '../styles/Legal.css';

const Terms = () => {
    return (
        <div className="legal-wrapper">
            <div className="legal-inner">
                <Link to="/" className="legal-back">← Back to TopShelf</Link>

                <div className="legal-header">
                    <p className="legal-eyebrow">Last updated: March 2026</p>
                    <h1 className="legal-title">Terms of <em>Service</em></h1>
                    <p className="legal-lead">
                        By using TopShelf, you agree to these terms. Please read them — they're
                        written plainly and won't take long.
                    </p>
                </div>

                <div className="legal-body">

                    <section className="legal-section">
                        <h2>1. What TopShelf is</h2>
                        <p>
                            TopShelf is a platform for sharing personal recommendations — films,
                            music, books, podcasts, and games. It is provided free of charge, without any guarantee of uptime,
                            accuracy, or continued availability.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>2. Your account</h2>
                        <p>
                            You sign in via Google OAuth. You are responsible for all activity
                            under your account. We reserve the right to suspend or delete
                            accounts that violate these terms, at our sole discretion and
                            without prior notice.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>3. Content you post</h2>
                        <p>
                            You are solely responsible for the recommendations and text you
                            submit. By posting content you confirm that it does not:
                        </p>
                        <ul>
                            <li>Violate any applicable law or regulation</li>
                            <li>Infringe on the intellectual property rights of any third party</li>
                            <li>Contain hate speech, harassment, or content that targets individuals</li>
                            <li>Include spam, misleading information, or unsolicited promotion</li>
                        </ul>
                        <p>
                            We may remove any content at any time without explanation. We do
                            not endorse user-submitted content and are not responsible for it.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>4. Moderation</h2>
                        <p>
                            We reserve the right to approve, reject, or hide
                            any submission without obligation to explain our decision.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>5. Intellectual property</h2>
                        <p>
                            Poster images and metadata are sourced from third-party APIs
                            (TMDB, MusicBrainz, etc.) and belong to their respective rights
                            holders. TopShelf does not claim ownership of this data.
                            Your written recommendations remain yours.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>6. Limitation of liability</h2>
                        <p>
                            TopShelf is provided <strong>"as is"</strong> without warranty of any
                            kind. To the fullest extent permitted by law, we are not liable for
                            any direct, indirect, incidental, or consequential damages arising
                            from your use of the platform — including but not limited to data
                            loss, service interruptions, or unauthorised access to your data.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>7. Changes to these terms</h2>
                        <p>
                            We may update these terms at any time. Continued use of the
                            platform after changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    

                </div>

                <div className="legal-footer-links">
                    <Link to="/privacy" className="legal-link">Privacy Policy</Link>
                </div>
            </div>
        </div>
    );
};

export default Terms;