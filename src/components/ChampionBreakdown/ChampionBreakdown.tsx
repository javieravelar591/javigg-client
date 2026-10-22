import './ChampionBreakdown.css'
import { DDRAGON } from '../../constants'

export interface ChampionStat {
  championId: number
  championName: string
  games: number
  wins: number
  losses: number
  winRate: number
}

interface ChampionBreakdownProps {
  stats: ChampionStat[]
}

function winRateColor(winRate: number): string {
  if (winRate >= 60) return '#0aca00'
  if (winRate >= 50) return '#00d4ff'
  return '#ff6666'
}

export const ChampionBreakdown: React.FC<ChampionBreakdownProps> = ({ stats }) => {
  if (stats.length === 0) {
    return (
      <div className="insights-card">
        <h3 className="insights-title">Champions</h3>
        <p className="insights-empty">No recent ranked or normal games to show.</p>
      </div>
    )
  }

  return (
    <div className="insights-card">
      <h3 className="insights-title">Champions</h3>
      <div className="champion-rows">
        {stats.map(c => (
          <div key={c.championId} className="champion-row">
            <img
              src={`${DDRAGON}/img/champion/${c.championName}.png`}
              alt={c.championName}
              className="champion-row-icon"
              onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
            />
            <span className="champion-row-name">{c.championName}</span>
            <span className="champion-row-games">{c.games} game{c.games === 1 ? '' : 's'}</span>
            <span className="champion-row-record">{c.wins}W {c.losses}L</span>
            <span className="champion-row-winrate" style={{ color: winRateColor(c.winRate) }}>
              {c.winRate}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
