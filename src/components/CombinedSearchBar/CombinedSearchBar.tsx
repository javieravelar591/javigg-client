import { useState, useRef } from 'react';
import './CombinedSearchBar.css';
import { getRecentSearches, type RecentSearch } from '../../services/recentSearches';

interface CombinedSearchBarProps {
  onSearch: (gameName: string, tagLine: string) => void;
  isLoading?: boolean;
}

export const CombinedSearchBar: React.FC<CombinedSearchBarProps> = ({
  onSearch,
  isLoading = false,
}) => {
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<RecentSearch[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = suggestions.filter(s =>
    gameName === '' || s.gameName.toLowerCase().includes(gameName.toLowerCase())
  );

  const handleFocus = () => {
    setSuggestions(getRecentSearches());
    setShowDropdown(true);
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 150);
  };

  const handleSelect = (s: RecentSearch) => {
    setGameName(s.gameName);
    setTagLine(s.tagLine);
    setShowDropdown(false);
    onSearch(s.gameName, s.tagLine);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameName.trim() && tagLine.trim()) {
      setShowDropdown(false);
      onSearch(gameName.trim(), tagLine.trim());
    }
  };

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <form className="combined-search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          value={gameName}
          onChange={e => setGameName(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Enter summoner name..."
          className="search-input game-name-input"
          autoComplete="off"
        />
        <span className="hash-separator">#</span>
        <input
          type="text"
          value={tagLine}
          onChange={e => setTagLine(e.target.value.toUpperCase())}
          placeholder="TAG"
          className="search-input tagline-input"
          maxLength={10}
        />
        <button
          type="submit"
          className="search-button"
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {showDropdown && filtered.length > 0 && (
        <div className="search-dropdown">
          {filtered.map((s, i) => (
            <button
              key={i}
              type="button"
              className="search-suggestion"
              onMouseDown={() => handleSelect(s)}
            >
              <span className="suggestion-name">{s.gameName}</span>
              <span className="suggestion-tag">#{s.tagLine}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
