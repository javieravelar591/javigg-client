import './LeftNav.css';

interface LeftNavProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: 'home' | 'champions') => void;
  currentPage?: 'home' | 'champions';
}

export const LeftNav = ({ isOpen, onClose, onNavigate, currentPage = 'home' }: LeftNavProps) => {
  return (
    <>
      {isOpen && <div className="nav-overlay" onClick={onClose} />}
      <nav className={`left-nav ${isOpen ? 'open' : ''}`}>
        <button className="nav-close-btn" onClick={onClose} aria-label="Close navigation">×</button>

        <div className="nav-brand">
          <h2>JAVIGG</h2>
          <p className="nav-brand-sub">League Stats</p>
        </div>

        <ul className="nav-links">
          <li>
            <a
              href="/"
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); onNavigate?.('home'); onClose(); }}
            >
              <span className="nav-link-icon">⌂</span>
              Home
            </a>
          </li>
          <li>
            <a
              href="/champions"
              className={`nav-link ${currentPage === 'champions' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); onNavigate?.('champions'); onClose(); }}
            >
              <span className="nav-link-icon">⚔</span>
              Champions
            </a>
          </li>
        </ul>

        <div className="nav-footer">NA · Patch 14.2</div>
      </nav>
    </>
  );
};
