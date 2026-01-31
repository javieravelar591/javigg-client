import { useState } from 'react';
import './CombinedSearchBar.css';

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

  const handleGameNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGameName(e.target.value);
  };

  const handleTagLineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagLine(e.target.value.toUpperCase());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameName.trim() && tagLine.trim()) {
      onSearch(gameName, tagLine);
    }
  };

  return (
    <form className="combined-search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={gameName}
        onChange={handleGameNameChange}
        placeholder="Enter summoner name..."
        className="search-input game-name-input"
      />
      <div className="divider"></div>
      <input
        type="text"
        value={tagLine}
        onChange={handleTagLineChange}
        placeholder="Tag"
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
  );
};
