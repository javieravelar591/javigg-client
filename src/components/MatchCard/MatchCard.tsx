import './MatchCard.css';

interface MetaDataDto {
  dataVersion: string;
  matchId: string;
  participants: string[];
}

interface InfoDto {
  endOfGameResult: string;
  gameDuration: number;
  gameMode: string;
  participants: ParticipantDto[];
}

interface ParticipantDto {
  assists: number;
  champLevel: number;
  championId: number;
  championName: string;
  damageDealtToBuildings: number;
  deaths: number;
  dragonKills: number;
  goldEarned: number;
  goldSpent: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  kills: number;
  lane: string;
  magicDamageDealt: number;
  magicDamageDealtToChampions: number;
  physicalDamageDealt: number;
  physicalDamageDealtToChampions: number;
  profileIcon: number;
  puuid: string;
  riotIdGameName: string;
  riotIdTagline: string;
  role: string;
  teamId: number;
  teamPosition: string;
  totalDamageDealt: number;
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  trueDamageDealt: number;
  trueDamageDealtToChampions: number;
  wardsPlaced: number;
  win: boolean;
  individualPosition: string;
  summonerLevel: number;
}

interface MatchDto {
  metadata: MetaDataDto;
  info: InfoDto;
  participants: ParticipantDto[];
}

interface MatchCardProps {
  match: MatchDto;
  gameName: string;
  tagLine: string;
  profileIconId: number;
  summonerLevel: number;
  puuid: string;
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const MatchCard = ({
  match,
  gameName,
  tagLine,
  profileIconId,
  summonerLevel,
  puuid,
}: MatchCardProps) => {
  // Find the current player
  const currentPlayer = match.info.participants.find((p) => p.puuid === puuid);
  const isVictory = currentPlayer?.win ?? false;
  
  // Separate teams
  const team100 = match.info.participants.filter((p) => p.teamId === 100);
  const team200 = match.info.participants.filter((p) => p.teamId === 200);

  const championUrl = `https://ddragon.leagueoflegends.com/cdn/14.2.1/img/profileicon/${profileIconId}.png`;
  return (
    <div className={`match-card ${isVictory ? 'victory' : 'defeat'}`}>
      <div className="match-card-header">
        <div className={`match-result ${isVictory ? 'victory' : 'defeat'}`}>
          {isVictory ? 'VICTORY' : 'DEFEAT'}
        </div>
      </div>

      <div className="match-card-body">
        <div className="match-info-row">
          <div className="match-info-item">
            <span className="label">Mode</span>
            <span className="value">{match.info.gameMode}</span>
          </div>
          <div className="match-info-item">
            <span className="label">Duration</span>
            <span className="value">{formatDuration(match.info.gameDuration)}</span>
          </div>
        </div>

        <div className="teams-container">
          <div className="team team-100">
            <div className="team-label">Team 100</div>
            {team100.map((participant) => (
              <div
                key={participant.puuid}
                className={`player-row ${participant.puuid === puuid ? 'current-player' : ''}`}
              >
                <div className="player-name">{participant.riotIdGameName}</div>
                <div className="player-stats-mini">
                  <span className="kda">
                    {participant.kills}/{participant.deaths}/{participant.assists}
                  </span>
                  <span className="dmg">{formatNumber(participant.totalDamageDealtToChampions)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="team team-200">
            <div className="team-label">Team 200</div>
            {team200.map((participant) => (
              <div
                key={participant.puuid}
                className={`player-row ${participant.puuid === puuid ? 'current-player' : ''}`}
              >
                <div className="player-name">{participant.riotIdGameName}</div>
                <div className="player-stats-mini">
                  <span className="kda">
                    {participant.kills}/{participant.deaths}/{participant.assists}
                  </span>
                  <span className="dmg">{formatNumber(participant.totalDamageDealtToChampions)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="match-card-footer">
        <span className="match-id-small">{match.metadata.matchId.substring(0, 20)}...</span>
        <button className="match-card-view-btn">View Details</button>
      </div>
    </div>
  );
};
