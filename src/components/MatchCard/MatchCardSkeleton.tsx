import './MatchCardSkeleton.css';

export const MatchCardSkeleton = () => (
  <div className="match-card-skeleton">
    {/* Header */}
    <div className="sk-header">
      <div className="sk-block sk-badge" />
      <div className="sk-block sk-meta" />
    </div>

    {/* Hero */}
    <div className="sk-hero">
      <div className="sk-block sk-portrait" />
      <div className="sk-hero-info">
        <div className="sk-block sk-line sk-line-short" />
        <div className="sk-block sk-line sk-line-med" />
        <div className="sk-block sk-line sk-line-xs" />
      </div>
      <div className="sk-items">
        {Array(7).fill(0).map((_, i) => (
          <div key={i} className="sk-block sk-item" />
        ))}
      </div>
    </div>

    {/* Teams */}
    <div className="sk-teams">
      {[0, 1].map((t) => (
        <div key={t} className="sk-team">
          <div className="sk-block sk-team-label" />
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="sk-player-row">
              <div className="sk-block sk-champ-icon" />
              <div className="sk-block sk-line sk-line-name" />
              <div className="sk-block sk-line sk-line-kda" />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);
