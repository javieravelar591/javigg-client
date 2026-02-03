interface LivePlayerDto {
  puuid: string;
  championId: number;
  profileIconId: number;
  teamId: number;
  streak: {
    winStreak: number;
    lossStreak: number;
    status: 'HOT' | 'COLD' | 'NEUTRAL';
  };
}

interface LiveGameLobbyDto {
  gameId: number;
  gameMode: string;
  players: LivePlayerDto[];
}

interface LiveGameCardProps {
  lobby: LiveGameLobbyDto;
  currentPuuid: string;
}

import './MatchCard.css';

export const LiveGameCard: React.FC<LiveGameCardProps> = ({ lobby, currentPuuid }) => {
  const team100 = lobby.players.filter(p => p.teamId === 100);
  const team200 = lobby.players.filter(p => p.teamId === 200);

  const getStreakLabel = (streak: { winStreak: number; lossStreak: number; status: string }) => {
    if (streak.status === 'HOT') return `${streak.winStreak} W streak 🔥`;
    if (streak.status === 'COLD') return `${streak.lossStreak} L streak ❄️`;
    return '';
  };

  return (
    <div className="match-card live-game">
      <div className="match-card-header">
        <div className="match-card-title">Live Game: {lobby.gameMode}</div>
      </div>

      <div className="teams-container">
        <div className="team team-100">
          <div className="team-label">Team 100</div>
          {team100.map(p => (
            <div
              key={p.puuid}
              className={`player-row ${p.puuid === currentPuuid ? 'current-player' : ''}`}
            >
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/14.2.1/img/profileicon/${p.profileIconId}.png`}
                alt="profile icon"
                className="match-card-icon"
              />
              <div className="player-name">{p.puuid}</div>
              <div className="player-streak">{getStreakLabel(p.streak)}</div>
            </div>
          ))}
        </div>

        <div className="team team-200">
          <div className="team-label">Team 200</div>
          {team200.map(p => (
            <div
              key={p.puuid}
              className={`player-row ${p.puuid === currentPuuid ? 'current-player' : ''}`}
            >
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/14.2.1/img/profileicon/${p.profileIconId}.png`}
                alt="profile icon"
                className="match-card-icon"
              />
              <div className="player-name">{p.puuid}</div>
              <div className="player-streak">{getStreakLabel(p.streak)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="match-card-footer">
        <span className="match-id-small">Game ID: {lobby.gameId}</span>
      </div>
    </div>
  );
};

