import './RankedBadge.css'
import { getRankEmblemUrl } from '../../services/rankIcons'

export interface RankedEntry {
  tier: string
  rank: string
  leaguePoints: number
  wins: number
  losses: number
}

interface RankedBadgeProps {
  queueLabel: string
  entry: RankedEntry | null
}

export const RankedBadge: React.FC<RankedBadgeProps> = ({ queueLabel, entry }) => {
  return (
    <div className="ranked-badge">
      <img
        src={getRankEmblemUrl(entry?.tier)}
        alt={entry ? `${entry.tier} ${entry.rank}` : 'Unranked'}
        className="ranked-emblem"
      />
      <div className="ranked-badge-text">
        <span className="ranked-queue-label">{queueLabel}</span>
        {entry ? (
          <>
            <span className={`ranked-tier ranked-tier-${entry.tier.toLowerCase()}`}>
              {entry.tier} {entry.rank}
            </span>
            <span className="ranked-lp">{entry.leaguePoints} LP</span>
            <span className="ranked-record">{entry.wins}W {entry.losses}L</span>
          </>
        ) : (
          <span className="ranked-tier ranked-tier-unranked">Unranked</span>
        )}
      </div>
    </div>
  )
}
