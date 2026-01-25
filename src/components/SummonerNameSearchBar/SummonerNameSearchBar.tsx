import { useState } from 'react';
import './SummonerNameSearchBar.css';

interface SummonerNameSearchBarProps {
  onSearch?: (gameName: string) => void;
  placeholder?: string;
}

export const SummonerNameSearchBar: React.FC<SummonerNameSearchBarProps> = ({
  onSearch,
  placeholder = 'Enter summoner name...',
}) => {
  const [gameName, setGameName] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGameName(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameName.trim() && onSearch) {
      onSearch(gameName);
    }
  };

  return (
    <form className="summoner-search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={gameName}
        onChange={handleChange}
        placeholder={placeholder}
        className="summoner-input"
      />
      <button type="submit" className="summoner-button">
        Search
      </button>
    </form>
  );
};
