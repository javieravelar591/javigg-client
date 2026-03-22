import { useState } from 'react';
import './MatchCard.css';

import { DDRAGON } from '../../constants';
import { spellService } from '../../services/spellService';
import { runeService } from '../../services/runeService';

interface InfoDto {
  gameDuration: number;
  gameMode: string;
  queueId: number;
  gameEndTimestamp: number;
  participants: ParticipantDto[];
}

interface ParticipantDto {
  assists: number;
  champLevel: number;
  championId: number;
  championName: string;
  deaths: number;
  doubleKills: number;
  goldEarned: number;
  item0: number; item1: number; item2: number;
  item3: number; item4: number; item5: number; item6: number;
  kills: number;
  neutralMinionsKilled: number;
  pentaKills: number;
  profileIcon: number;
  puuid: string;
  quadraKills: number;
  riotIdGameName: string;
  teamId: number;
  totalDamageDealtToChampions: number;
  totalMinionsKilled: number;
  tripleKills: number;
  visionScore: number;
  wardsPlaced: number;
  win: boolean;
  summonerLevel: number;
  summonerName?: string;
  summoner1Id: number;
  summoner2Id: number;
  perks?: {
    styles: { description: string; selections: { perk: number }[] }[];
  };
}

interface MatchDto {
  metadata: { matchId: string };
  info: InfoDto;
}

interface MatchCardProps {
  match: MatchDto;
  gameName: string;
  tagLine: string;
  profileIconId: number;
  summonerLevel: number;
  puuid: string;
}

// ── Queue name map ─────────────────────────────────────
const QUEUE_NAMES: Record<number, string> = {
  420: 'Ranked Solo', 440: 'Ranked Flex',
  400: 'Normal Draft', 430: 'Normal Blind',
  450: 'ARAM', 900: 'URF', 1020: 'One for All',
  1400: 'Spellbook', 490: 'Quickplay', 0: 'Custom',
};

// ── Helpers ────────────────────────────────────────────
const formatDuration = (s: number) =>
  `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;

const timeAgo = (ts: number): string => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

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

const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n);

const multiKillLabel = (p: ParticipantDto) => {
  if (p.pentaKills > 0) return 'PENTA';
  if (p.quadraKills > 0) return 'QUADRA';
  if (p.tripleKills > 0) return 'TRIPLE';
  if (p.doubleKills > 0) return 'DOUBLE';
  return null;
};

const truncate = (s: string, n: number) => s.length > n ? s.slice(0, n) + '…' : s;

// ── Sub-components ─────────────────────────────────────
const ItemSlot = ({ id, size = 28 }: { id: number; size?: number }) => (
  <div className="mc-item-slot" style={{ width: size, height: size }}>
    {id > 0 && (
      <img src={`${DDRAGON}/img/item/${id}.png`} alt=""
        onError={(e) => { e.currentTarget.style.display = 'none'; }} />
    )}
  </div>
);

const ScItemSlot = ({ id }: { id: number }) => (
  <div className="sc-item-slot">
    {id > 0 && (
      <img src={`${DDRAGON}/img/item/${id}.png`} alt=""
        onError={(e) => { e.currentTarget.style.display = 'none'; }} />
    )}
  </div>
);

const TeamTable = ({
  players, side, maxDmg, puuid, gameDuration,
}: {
  players: ParticipantDto[];
  side: 'blue' | 'red';
  maxDmg: number;
  puuid: string;
  gameDuration: number;
}) => (
  <div className={`sc-team sc-team-${side}`}>
    <div className="sc-team-header">
      <span className="sc-team-label">{side === 'blue' ? 'Blue Side' : 'Red Side'}</span>
      <span className={`sc-team-result ${players[0]?.win ? 'win' : 'loss'}`}>
        {players[0]?.win ? 'Victory' : 'Defeat'}
      </span>
    </div>
    <div className="sc-col-headers">
      <span className="sc-col-champ">Champion</span>
      <span className="sc-col-kda">KDA</span>
      <span className="sc-col-cs">CS/m</span>
      <span className="sc-col-gold">Gold</span>
      <span className="sc-col-dmg">Damage</span>
      <span className="sc-col-wards">Wards</span>
      <span className="sc-col-items">Items</span>
    </div>
    {players.map((p) => {
      const cs = (p.totalMinionsKilled ?? 0) + (p.neutralMinionsKilled ?? 0);
      const csPerMin = gameDuration > 0 ? (cs / (gameDuration / 60)).toFixed(1) : '0.0';
      const keystoneId = p.perks?.styles?.[0]?.selections?.[0]?.perk ?? null;
      const isMe = p.puuid === puuid;
      const name = p.riotIdGameName || p.summonerName || '—';
      return (
        <div key={p.puuid} className={`sc-row ${isMe ? 'sc-row-me' : ''}`}>
          <div className="sc-col-champ">
            <div className="sc-champ-wrap">
              <img src={`${DDRAGON}/img/champion/${p.championName}.png`} alt={p.championName}
                className="sc-champ-img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <span className="sc-champ-level">{p.champLevel}</span>
            </div>
            <div className="sc-spells-rune">
              {[p.summoner1Id, p.summoner2Id].map((id, i) => {
                const url = spellService.getSpellImageUrl(id);
                return url ? <img key={i} src={url} alt="" className="sc-spell-icon"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : null;
              })}
              {keystoneId && (() => {
                const url = runeService.getRuneIconUrl(keystoneId);
                return url ? <img src={url} alt="" className="sc-rune-icon"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : null;
              })()}
            </div>
            <div className="sc-player-info">
              <span className="sc-player-name">{name}</span>
              <span className="sc-champ-name">{p.championName}</span>
            </div>
          </div>
          <div className="sc-col-kda">
            <span className="sc-kda-nums">
              <span className="sc-k">{p.kills}</span>
              <span className="sc-sep">/</span>
              <span className="sc-d">{p.deaths}</span>
              <span className="sc-sep">/</span>
              <span className="sc-a">{p.assists}</span>
            </span>
            <span className="sc-kda-ratio" style={{ color: kdaColor(p.kills, p.deaths, p.assists) }}>
              {kdaRatio(p.kills, p.deaths, p.assists)} KDA
            </span>
          </div>
          <div className="sc-col-cs sc-stat">
            <span className="sc-stat-val">{csPerMin}</span>
          </div>
          <div className="sc-col-gold sc-stat">
            <span className="sc-stat-val sc-gold">{fmt(p.goldEarned)}</span>
          </div>
          <div className="sc-col-dmg">
            <div className="sc-dmg-bar-track">
              <div className={`sc-dmg-bar-fill sc-dmg-${side}`}
                style={{ width: `${(p.totalDamageDealtToChampions / maxDmg) * 100}%` }} />
            </div>
            <span className="sc-dmg-val">{fmt(p.totalDamageDealtToChampions)}</span>
          </div>
          <div className="sc-col-wards sc-stat">
            <span className="sc-stat-val">{p.wardsPlaced}</span>
            <span className="sc-stat-sub">{p.visionScore > 0 ? `${p.visionScore}vs` : ''}</span>
          </div>
          <div className="sc-col-items">
            {[p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6].map((id, i) => (
              <ScItemSlot key={i} id={id} />
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

// ── Main component ─────────────────────────────────────
export const MatchCard = ({ match, puuid }: MatchCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const me = match.info.participants.find((p) => p.puuid === puuid);
  const isVictory = me?.win ?? false;
  const team100 = match.info.participants.filter((p) => p.teamId === 100);
  const team200 = match.info.participants.filter((p) => p.teamId === 200);
  const maxDmg = Math.max(...match.info.participants.map((p) => p.totalDamageDealtToChampions), 1);

  const cs = me ? (me.totalMinionsKilled ?? 0) + (me.neutralMinionsKilled ?? 0) : 0;
  const csPerMin = match.info.gameDuration > 0
    ? (cs / (match.info.gameDuration / 60)).toFixed(1) : '0.0';
  const keystoneId = me?.perks?.styles?.[0]?.selections?.[0]?.perk ?? null;
  const spell1Url = me ? spellService.getSpellImageUrl(me.summoner1Id) : null;
  const spell2Url = me ? spellService.getSpellImageUrl(me.summoner2Id) : null;
  const keystoneUrl = keystoneId ? runeService.getRuneIconUrl(keystoneId) : null;
  const queueLabel = QUEUE_NAMES[match.info.queueId] ?? match.info.gameMode;
  const multiKill = me ? multiKillLabel(me) : null;

  return (
    <div className={`mc ${isVictory ? 'mc-win' : 'mc-loss'}`}>

      {/* ── Main row ── */}
      <div className="mc-row">

        {/* Col 1 — Result */}
        <div className="mc-col mc-col-result">
          <span className="mc-queue">{queueLabel}</span>
          <span className={`mc-outcome ${isVictory ? 'win' : 'loss'}`}>
            {isVictory ? 'Victory' : 'Defeat'}
          </span>
          <span className="mc-ago">
            {match.info.gameEndTimestamp ? timeAgo(match.info.gameEndTimestamp) : ''}
          </span>
          <span className="mc-dur">{formatDuration(match.info.gameDuration)}</span>
        </div>

        {/* Col 2 — Champion + Spells/Rune */}
        {me && (
          <div className="mc-col mc-col-champ">
            <div className="mc-champ-cluster">
              <div className="mc-portrait-wrap">
                <img src={`${DDRAGON}/img/champion/${me.championName}.png`} alt={me.championName}
                  className="mc-portrait" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <span className="mc-lvl">{me.champLevel}</span>
              </div>
              <div className="mc-sr">
                {spell1Url && <img src={spell1Url} alt="" className="mc-spell" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                {spell2Url && <img src={spell2Url} alt="" className="mc-spell" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                {keystoneUrl && <img src={keystoneUrl} alt="" className="mc-rune" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
              </div>
            </div>
            <span className="mc-champ-name">{me.championName}</span>
          </div>
        )}

        {/* Col 3 — Stats */}
        {me && (
          <div className="mc-col mc-col-stats">
            <div className="mc-kda-nums">
              <span className="mc-k">{me.kills}</span>
              <span className="mc-sep"> / </span>
              <span className="mc-d">{me.deaths}</span>
              <span className="mc-sep"> / </span>
              <span className="mc-a">{me.assists}</span>
            </div>
            <span className="mc-kda-ratio" style={{ color: kdaColor(me.kills, me.deaths, me.assists) }}>
              {kdaRatio(me.kills, me.deaths, me.assists)} KDA
            </span>
            {multiKill && <span className="mc-multikill">{multiKill} KILL</span>}
            <div className="mc-secondaries">
              <span>{cs} CS <span className="mc-cspm">({csPerMin})</span></span>
              <span>{me.visionScore} Vision</span>
            </div>
          </div>
        )}

        {/* Col 4 — Items */}
        {me && (
          <div className="mc-col mc-col-items">
            <div className="mc-items-main">
              {[me.item0, me.item1, me.item2, me.item3, me.item4, me.item5].map((id, i) => (
                <ItemSlot key={i} id={id} size={28} />
              ))}
            </div>
            <div className="mc-trinket">
              <ItemSlot id={me.item6} size={24} />
            </div>
          </div>
        )}

        {/* Col 5 — Participants */}
        <div className="mc-col mc-col-players">
          <div className="mc-team-col">
            {team100.map((p) => (
              <div key={p.puuid} className={`mc-player ${p.puuid === puuid ? 'mc-me' : ''}`}>
                <img src={`${DDRAGON}/img/champion/${p.championName}.png`} alt={p.championName}
                  className="mc-p-img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <span className="mc-p-name">{truncate(p.riotIdGameName || p.summonerName || '—', 9)}</span>
              </div>
            ))}
          </div>
          <div className="mc-team-col">
            {team200.map((p) => (
              <div key={p.puuid} className={`mc-player ${p.puuid === puuid ? 'mc-me' : ''}`}>
                <img src={`${DDRAGON}/img/champion/${p.championName}.png`} alt={p.championName}
                  className="mc-p-img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <span className="mc-p-name">{truncate(p.riotIdGameName || p.summonerName || '—', 9)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Toggle button */}
        <button className={`mc-expand ${expanded ? 'open' : ''}`}
          onClick={() => setExpanded(!expanded)} title="Toggle scoreboard">
          ›
        </button>
      </div>

      {/* ── Expanded scoreboard panel ── */}
      <div className={`mc-panel ${expanded ? 'mc-panel-open' : ''}`}>
        <div className="mc-panel-inner">
          <TeamTable players={team100} side="blue" maxDmg={maxDmg} puuid={puuid}
            gameDuration={match.info.gameDuration} />
          <TeamTable players={team200} side="red" maxDmg={maxDmg} puuid={puuid}
            gameDuration={match.info.gameDuration} />
        </div>
      </div>

    </div>
  );
};
