import { useState, useEffect } from 'react'
import { championService, type ChampionData } from '../../services/championService'
import './ChampionsPage.css'

import { DDRAGON } from '../../constants'

const StatBar = ({ label, value }: { label: string; value: number }) => (
  <div className="stat-bar-row">
    <span className="stat-bar-label">{label}</span>
    <div className="stat-bar-track">
      <div
        className="stat-bar-fill"
        style={{ width: `${(value / 10) * 100}%` }}
      />
    </div>
    <span className="stat-bar-value">{value}</span>
  </div>
)

export const ChampionsPage = () => {
  const [champions, setChampions] = useState<ChampionData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChampion, setSelectedChampion] = useState<ChampionData | null>(null)

  useEffect(() => {
    const allChampions = championService.getAllChampions()
    setChampions(allChampions)
    setLoading(false)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedChampion(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (loading) {
    return <div className="champions-page"><div className="loading">Loading champions...</div></div>
  }

  return (
    <div className="champions-page">
      <div className="champions-header">
        <h1>Champions</h1>
        <p className="champions-subtitle">{champions.length} champions · Click to view details</p>
      </div>

      <div className="champions-grid">
        {champions.map((champion) => (
          <div
            key={champion.id}
            className="champion-card"
            onClick={() => setSelectedChampion(champion)}
          >
            <div className="champion-image-wrapper">
              <img
                src={`${DDRAGON}/img/champion/${champion.id}.png`}
                alt={champion.name}
                className="champion-image"
              />
              <div className="champion-overlay" />
            </div>
            <div className="champion-info">
              <h3>{champion.name}</h3>
              <p className="champion-title">{champion.title}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedChampion && (
        <div className="champion-detail-modal" onClick={() => setSelectedChampion(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedChampion(null)}>×</button>

            {/* Splash + identity */}
            <div className="modal-hero">
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${selectedChampion.id}_0.jpg`}
                alt={selectedChampion.name}
                className="modal-splash"
                onError={(e) => {
                  e.currentTarget.src = `${DDRAGON}/img/champion/${selectedChampion.id}.png`
                }}
              />
              <div className="modal-identity">
                <h2>{selectedChampion.name}</h2>
                <p className="modal-title">{selectedChampion.title}</p>
                <div className="modal-tags">
                  {selectedChampion.tags.map((tag) => (
                    <span key={tag} className="modal-tag">{tag}</span>
                  ))}
                </div>
                <p className="modal-blurb">{selectedChampion.blurb}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="modal-stats">
              <div className="modal-stats-title">Champion Ratings</div>
              <StatBar label="Attack"     value={selectedChampion.info.attack} />
              <StatBar label="Defense"    value={selectedChampion.info.defense} />
              <StatBar label="Magic"      value={selectedChampion.info.magic} />
              <StatBar label="Difficulty" value={selectedChampion.info.difficulty} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
