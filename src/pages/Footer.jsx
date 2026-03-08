import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="site-footer-inner">
                <span className="footer-brand">TopShelf</span>
                <div className="footer-links">
                    <Link to="/terms" className="footer-link">Terms of Service</Link>
                    <span className="footer-dot">·</span>
                    <Link to="/privacy" className="footer-link">Privacy Policy</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;