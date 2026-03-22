import { useState } from 'react';
import './MatchCard.css';
import { MatchDetailModal } from './MatchDetailModal';

import { DDRAGON } from '../../constants';

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
  doubleKills: number;
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
  neutralMinionsKilled: number;
  pentaKills: number;
  physicalDamageDealt: number;
  physicalDamageDealtToChampions: number;
  profileIcon: number;
  puuid: string;
  quadraKills: number;
  riotIdGameName: string;
  riotIdTagline: string;
  role: string;
  teamId: number;
  teamPosition: string;
  totalDamageDealt: number;
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  totalMinionsKilled: number;
  tripleKills: number;
  trueDamageDealt: number;
  trueDamageDealtToChampions: number;
  visionScore: number;
  wardsPlaced: number;
  win: boolean;
  individualPosition: string;
  summonerLevel: number;
  summonerName?: string;
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
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const getChampionImgUrl = (championName: string) =>
  `${DDRAGON}/img/champion/${championName}.png`;

const getItemImgUrl = (itemId: number) =>
  `${DDRAGON}/img/item/${itemId}.png`;

const getKdaRatio = (kills: number, deaths: number, assists: number): string => {
  if (deaths === 0) return 'Perfect';
  return ((kills + assists) / deaths).toFixed(2);
};

const getKdaColor = (kills: number, deaths: number, assists: number): string => {
  if (deaths === 0) return '#ffd700';
  const ratio = (kills + assists) / deaths;
  if (ratio >= 5) return '#ffd700';
  if (ratio >= 3) return '#00d4ff';
  if (ratio >= 2) return '#0aca00';
  if (ratio >= 1) return '#b0b0b0';
  return '#ff6666';
};

const getMultiKill = (p: ParticipantDto): string | null => {
  if (p.pentaKills > 0) return 'PENTA KILL';
  if (p.quadraKills > 0) return 'QUADRA KILL';
  if (p.tripleKills > 0) return 'TRIPLE KILL';
  if (p.doubleKills > 0) return 'DOUBLE KILL';
  return null;
};

const getItems = (p: ParticipantDto): number[] =>
  [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6];

export const MatchCard = ({
  match,
  puuid,
}: MatchCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const currentPlayer = match.info.participants.find((p) => p.puuid === puuid);
  const isVictory = currentPlayer?.win ?? false;

  const team100 = match.info.participants.filter((p) => p.teamId === 100);
  const team200 = match.info.participants.filter((p) => p.teamId === 200);

  const multiKill = currentPlayer ? getMultiKill(currentPlayer) : null;
  const cs = currentPlayer
    ? (currentPlayer.totalMinionsKilled ?? 0) + (currentPlayer.neutralMinionsKilled ?? 0)
    : 0;

  return (
    <div className={`match-card ${isVictory ? 'victory' : 'defeat'}`}>
      {/* Header */}
      <div className="match-card-header">
        <div className={`match-result ${isVictory ? 'victory' : 'defeat'}`}>
          {isVictory ? 'VICTORY' : 'DEFEAT'}
        </div>
        <div className="match-meta">
          <span className="match-mode">{match.info.gameMode}</span>
          <span className="match-sep">·</span>
          <span className="match-duration">{formatDuration(match.info.gameDuration)}</span>
        </div>
      </div>

      {/* Current player hero section */}
      {currentPlayer && (
        <div className="match-hero">
          <div className="hero-left">
            <div className="hero-champ-wrapper">
              <img
                src={getChampionImgUrl(currentPlayer.championName)}
                alt={currentPlayer.championName}
                className="champ-portrait"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <span className="champ-level">Lv.{currentPlayer.champLevel}</span>
            </div>
            <div className="hero-info">
              <div className="hero-champ-name">{currentPlayer.championName}</div>
              <div className="hero-kda">
                <span className="kda-nums">
                  <span className="kda-k">{currentPlayer.kills}</span>
                  <span className="kda-sep"> / </span>
                  <span className="kda-d">{currentPlayer.deaths}</span>
                  <span className="kda-sep"> / </span>
                  <span className="kda-a">{currentPlayer.assists}</span>
                </span>
                <span
                  className="kda-ratio"
                  style={{ color: getKdaColor(currentPlayer.kills, currentPlayer.deaths, currentPlayer.assists) }}
                >
                  {getKdaRatio(currentPlayer.kills, currentPlayer.deaths, currentPlayer.assists)} KDA
                </span>
              </div>
              {multiKill && <div className="multi-kill-badge">{multiKill}</div>}
              <div className="hero-secondary-stats">
                <span>{cs} CS</span>
                <span className="stat-sep">·</span>
                <span>{formatNumber(currentPlayer.totalDamageDealtToChampions)} DMG</span>
                {currentPlayer.visionScore > 0 && (
                  <>
                    <span className="stat-sep">·</span>
                    <span>{currentPlayer.visionScore} Vision</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="items-row">
            {getItems(currentPlayer).map((itemId, idx) => (
              <div key={idx} className={`item-slot ${itemId === 0 ? 'empty' : ''}`}>
                {itemId > 0 && (
                  <img
                    src={getItemImgUrl(itemId)}
                    alt={`Item ${itemId}`}
                    className="item-icon"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teams */}
      <div className="teams-container">
        <div className="team team-100">
          <div className="team-label">Blue Team</div>
          {team100.map((p) => (
            <div
              key={p.puuid}
              className={`player-row ${p.puuid === puuid ? 'current-player' : ''}`}
            >
              <img
                src={getChampionImgUrl(p.championName)}
                alt={p.championName}
                className="player-champ-icon"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="player-name">{p.riotIdGameName || p.summonerName || '—'}</div>
              <div className="player-stats-mini">
                <span className="kda">{p.kills}/{p.deaths}/{p.assists}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="team team-200">
          <div className="team-label">Red Team</div>
          {team200.map((p) => (
            <div
              key={p.puuid}
              className={`player-row ${p.puuid === puuid ? 'current-player' : ''}`}
            >
              <img
                src={getChampionImgUrl(p.championName)}
                alt={p.championName}
                className="player-champ-icon"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="player-name">{p.riotIdGameName || p.summonerName || '—'}</div>
              <div className="player-stats-mini">
                <span className="kda">{p.kills}/{p.deaths}/{p.assists}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View details button */}
      <button className="expand-btn" onClick={() => setShowModal(true)}>
        ▼ View Full Scoreboard
      </button>

      {/* Scoreboard modal */}
      {showModal && (
        <MatchDetailModal
          match={match}
          puuid={puuid}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};
