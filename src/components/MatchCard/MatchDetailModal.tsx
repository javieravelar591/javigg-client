import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './MatchDetailModal.css';

import { DDRAGON } from '../../constants';

interface ParticipantDto {
  assists: number;
  champLevel: number;
  championName: string;
  deaths: number;
  goldEarned: number;
  item0: number; item1: number; item2: number; item3: number;
  item4: number; item5: number; item6: number;
  kills: number;
  neutralMinionsKilled: number;
  puuid: string;
  riotIdGameName: string;
  teamId: number;
  totalDamageDealtToChampions: number;
  totalMinionsKilled: number;
  visionScore: number;
  wardsPlaced: number;
  win: boolean;
  summonerName?: string;
}

interface MatchDetailModalProps {
  match: {
    metadata: { matchId: string };
    info: {
      gameDuration: number;
      gameMode: string;
      participants: ParticipantDto[];
    };
  };
  puuid: string;
  onClose: () => void;
}

const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n);

const kdaRatio = (k: number, d: number, a: number) =>
  d === 0 ? 'Perfect' : ((k + a) / d).toFixed(2);

const kdaColor = (k: number, d: number, a: number) => {
  if (d === 0) return '#ffd700';
  const r = (k + a) / d;
  if (r >= 5) return '#ffd700';
  if (r >= 3) return '#00d4ff';
  if (r >= 2) return '#0aca00';
  if (r >= 1) return '#b0b0b0';
  return '#ff6666';
};

const formatDuration = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

const ItemSlot = ({ id }: { id: number }) => (
  <div className="sc-item-slot">
    {id > 0 && (
      <img
        src={`${DDRAGON}/img/item/${id}.png`}
        alt=""
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    )}
  </div>
);

const TeamTable = ({
  players,
  label,
  side,
  maxDmg,
  puuid,
}: {
  players: ParticipantDto[];
  label: string;
  side: 'blue' | 'red';
  maxDmg: number;
  puuid: string;
}) => (
  <div className={`sc-team sc-team-${side}`}>
    <div className="sc-team-header">
      <span className="sc-team-label">{label}</span>
      <span className={`sc-team-result ${players[0]?.win ? 'win' : 'loss'}`}>
        {players[0]?.win ? 'Victory' : 'Defeat'}
      </span>
    </div>

    <div className="sc-col-headers">
      <span className="sc-col-champ">Champion</span>
      <span className="sc-col-kda">KDA</span>
      <span className="sc-col-cs">CS</span>
      <span className="sc-col-gold">Gold</span>
      <span className="sc-col-dmg">Damage</span>
      <span className="sc-col-wards">Wards</span>
      <span className="sc-col-items">Items</span>
    </div>

    {players.map((p) => {
      const cs = (p.totalMinionsKilled ?? 0) + (p.neutralMinionsKilled ?? 0);
      const ratio = kdaRatio(p.kills, p.deaths, p.assists);
      const isMe = p.puuid === puuid;
      const name = p.riotIdGameName || p.summonerName || '—';

      return (
        <div key={p.puuid} className={`sc-row ${isMe ? 'sc-row-me' : ''}`}>
          {/* Champion */}
          <div className="sc-col-champ">
            <div className="sc-champ-wrap">
              <img
                src={`${DDRAGON}/img/champion/${p.championName}.png`}
                alt={p.championName}
                className="sc-champ-img"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <span className="sc-champ-level">{p.champLevel}</span>
            </div>
            <div className="sc-player-info">
              <span className="sc-player-name">{name}</span>
              <span className="sc-champ-name">{p.championName}</span>
            </div>
          </div>

          {/* KDA */}
          <div className="sc-col-kda">
            <span className="sc-kda-nums">
              <span className="sc-k">{p.kills}</span>
              <span className="sc-sep">/</span>
              <span className="sc-d">{p.deaths}</span>
              <span className="sc-sep">/</span>
              <span className="sc-a">{p.assists}</span>
            </span>
            <span className="sc-kda-ratio" style={{ color: kdaColor(p.kills, p.deaths, p.assists) }}>
              {ratio} KDA
            </span>
          </div>

          {/* CS */}
          <div className="sc-col-cs sc-stat">
            <span className="sc-stat-val">{cs}</span>
            <span className="sc-stat-sub">cs</span>
          </div>

          {/* Gold */}
          <div className="sc-col-gold sc-stat">
            <span className="sc-stat-val sc-gold">{fmt(p.goldEarned)}</span>
            <span className="sc-stat-sub">gold</span>
          </div>

          {/* Damage */}
          <div className="sc-col-dmg">
            <div className="sc-dmg-bar-track">
              <div
                className={`sc-dmg-bar-fill sc-dmg-${side}`}
                style={{ width: `${(p.totalDamageDealtToChampions / maxDmg) * 100}%` }}
              />
            </div>
            <span className="sc-dmg-val">{fmt(p.totalDamageDealtToChampions)}</span>
          </div>

          {/* Wards */}
          <div className="sc-col-wards sc-stat">
            <span className="sc-stat-val">{p.wardsPlaced}</span>
            <span className="sc-stat-sub">{p.visionScore > 0 ? `${p.visionScore}vs` : 'wards'}</span>
          </div>

          {/* Items */}
          <div className="sc-col-items">
            {[p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6].map((id, i) => (
              <ItemSlot key={i} id={id} />
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

export const MatchDetailModal = ({ match, puuid, onClose }: MatchDetailModalProps) => {
  const team100 = match.info.participants.filter((p) => p.teamId === 100);
  const team200 = match.info.participants.filter((p) => p.teamId === 200);
  const maxDmg = Math.max(...match.info.participants.map((p) => p.totalDamageDealtToChampions));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="sc-overlay" onClick={onClose}>
      <div className="sc-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal header */}
        <div className="sc-header">
          <div className="sc-header-info">
            <span className="sc-mode">{match.info.gameMode}</span>
            <span className="sc-sep-dot">·</span>
            <span className="sc-duration">{formatDuration(match.info.gameDuration)}</span>
          </div>
          <button className="sc-close" onClick={onClose}>×</button>
        </div>

        {/* Scrollable scoreboard body */}
        <div className="sc-body">
          <TeamTable players={team100} label="Blue Side" side="blue" maxDmg={maxDmg} puuid={puuid} />
          <TeamTable players={team200} label="Red Side"  side="red"  maxDmg={maxDmg} puuid={puuid} />
        </div>
      </div>
    </div>,
    document.body
  );
};
