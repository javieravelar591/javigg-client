import './MatchCard.css';

interface MatchCardProps {
  matchId: string;
  gameName: string;
  tagLine: string;
  profileIconId: number;
  summonerLevel: number;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  matchId,
  gameName,
  tagLine,
  profileIconId,
  summonerLevel,
}) => {
  const championUrl = `https://ddragon.leagueoflegends.com/cdn/14.2.1/img/profileicon/${profileIconId}.png`;

  return (
    <div className="match-card">
      <div className="match-card-header">
        <img
          src={championUrl}
          alt={`${gameName} profile icon`}
          className="match-card-icon"
          onError={(e) => {
            e.currentTarget.src =
              'https://ddragon.leagueoflegends.com/cdn/14.2.1/img/profileicon/0.png';
          }}
        />
        <div className="match-card-player-info">
          <h3 className="match-card-player-name">
            {gameName}
            <span className="match-card-tagline">#{tagLine}</span>
          </h3>
          <p className="match-card-level">Level {summonerLevel}</p>
        </div>
      </div>

      <div className="match-card-body">
        <div className="match-id-section">
          <label className="match-id-label">Match ID</label>
          <p className="match-id-value">{matchId}</p>
        </div>
      </div>

      <div className="match-card-footer">
        <button className="match-card-view-btn">View Details</button>
      </div>
    </div>
  );
};
