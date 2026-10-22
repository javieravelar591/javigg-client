import '../ChampionBreakdown/ChampionBreakdown.css'
import './RoleBreakdown.css'

export interface RoleStat {
  role: string
  games: number
  wins: number
  losses: number
  winRate: number
}

interface RoleBreakdownProps {
  stats: RoleStat[]
}

// Riot's teamPosition values, mapped to the labels players actually use.
const ROLE_LABELS: Record<string, string> = {
  TOP: 'Top',
  JUNGLE: 'Jungle',
  MIDDLE: 'Mid',
  BOTTOM: 'ADC',
  UTILITY: 'Support',
}

function winRateColor(winRate: number): string {
  if (winRate >= 60) return '#0aca00'
  if (winRate >= 50) return '#00d4ff'
  return '#ff6666'
}

export const RoleBreakdown: React.FC<RoleBreakdownProps> = ({ stats }) => {
  if (stats.length === 0) {
    return (
      <div className="insights-card">
        <h3 className="insights-title">Roles</h3>
        <p className="insights-empty">No recent ranked or normal games to show.</p>
      </div>
    )
  }

  const maxGames = Math.max(...stats.map(r => r.games));

  return (
    <div className="insights-card">
      <h3 className="insights-title">Roles</h3>
      <div className="role-rows">
        {stats.map(r => (
          <div key={r.role} className="role-row">
            <div className="role-row-top">
              <span className="role-row-name">{ROLE_LABELS[r.role] ?? r.role}</span>
              <span className="role-row-winrate" style={{ color: winRateColor(r.winRate) }}>
                {r.winRate}%
              </span>
            </div>
            <div className="role-row-bar-track">
              <div className="role-row-bar-fill" style={{ width: `${(r.games / maxGames) * 100}%` }} />
            </div>
            <span className="role-row-meta">{r.games} game{r.games === 1 ? '' : 's'} · {r.wins}W {r.losses}L</span>
          </div>
        ))}
      </div>
    </div>
  )
}
