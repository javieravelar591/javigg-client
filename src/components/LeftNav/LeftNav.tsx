import './LeftNav.css';

interface LeftNavProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: 'home' | 'champions') => void;
}

export const LeftNav = ({ isOpen, onClose, onNavigate }: LeftNavProps) => {
  return (
    <>
      {isOpen && <div className="nav-overlay visible" onClick={onClose} />}
      <nav className={`left-nav ${isOpen ? 'open' : ''}`}>
        <button className="nav-close-btn" onClick={onClose} aria-label="Close navigation">
          ×
        </button>
        <div className="nav-brand">
          <h2>JAVIGG</h2>
        </div>
        <ul className="nav-links">
          <li>
            <a href="/" className="nav-link active" onClick={(e) => {
              e.preventDefault();
              onNavigate?.('home');
              onClose();
            }}>
              Home
            </a>
          </li>
          <li>
            <a href="/champions" className="nav-link" onClick={(e) => {
              e.preventDefault();
              onNavigate?.('champions');
              onClose();
            }}>
              Champions
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
};
