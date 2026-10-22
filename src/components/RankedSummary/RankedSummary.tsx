import '../ChampionBreakdown/ChampionBreakdown.css'
import './RankedSummary.css'
import { RankedBadge, type RankedEntry } from '../RankedBadge'

interface RankedSummaryProps {
  solo: RankedEntry | null
  flex: RankedEntry | null
}

export const RankedSummary: React.FC<RankedSummaryProps> = ({ solo, flex }) => {
  return (
    <div className="insights-card">
      <h3 className="insights-title">Ranked</h3>
      <div className="ranked-summary-rows">
        <RankedBadge queueLabel="Solo/Duo" entry={solo} />
        <RankedBadge queueLabel="Flex" entry={flex} />
      </div>
    </div>
  )
}
