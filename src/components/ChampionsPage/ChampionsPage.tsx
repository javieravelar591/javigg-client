import { useState, useEffect } from 'react'
import { championService, type ChampionData } from '../../services/championService'
import './ChampionsPage.css'

export const ChampionsPage = () => {
  const [champions, setChampions] = useState<ChampionData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChampion, setSelectedChampion] = useState<ChampionData | null>(null)

  useEffect(() => {
    const loadChampions = async () => {
      try {
        const allChampions = championService.getAllChampions()
        setChampions(allChampions)
      } catch (error) {
        console.error('Failed to load champions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadChampions()
  }, [])

  const getChampionSplashUrl = (championId: string) => {
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championId}_0.jpg`
  }

  if (loading) {
    return <div className="champions-container"><div className="loading">Loading champions...</div></div>
  }

  return (
    <div className="champions-page">
      <div className="champions-header">
        <h1>Champions</h1>
        <p className="champions-subtitle">Select a champion to view detailed stats and abilities</p>
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
                src={getChampionSplashUrl(champion.id)}
                alt={champion.name}
                className="champion-image"
                onError={(e) => {
                  e.currentTarget.src = `https://ddragon.leagueoflegends.com/cdn/img/champion/${champion.id}.png`
                }}
              />
              <div className="champion-overlay">
                <button className="view-details-btn">View Details</button>
              </div>
            </div>
            <div className="champion-info">
              <h3>{champion.name}</h3>
              <p className="champion-title">{champion.title}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedChampion && (
        <div className="champion-detail-modal">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setSelectedChampion(null)}>×</button>
            <h2>{selectedChampion.name}</h2>
            <p className="modal-title">{selectedChampion.title}</p>
            <p className="modal-message">Champion detail view coming soon!</p>
          </div>
        </div>
      )}
    </div>
  )
}
