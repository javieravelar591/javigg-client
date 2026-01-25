import { useState } from 'react';
import './TagLineSearchBar.css';

interface TagLineSearchBarProps {
  onSearch?: (tagLine: string) => void;
  placeholder?: string;
}

export const TagLineSearchBar: React.FC<TagLineSearchBarProps> = ({
  onSearch,
  placeholder = 'Enter tag line (e.g., NA1)...',
}) => {
  const [tagLine, setTagLine] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagLine(e.target.value.toUpperCase());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagLine.trim() && onSearch) {
      onSearch(tagLine);
    }
  };

  return (
    <form className="tagline-search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={tagLine}
        onChange={handleChange}
        placeholder={placeholder}
        className="tagline-input"
        maxLength={10}
      />
      <button type="submit" className="tagline-button">
        Search
      </button>
    </form>
  );
};
