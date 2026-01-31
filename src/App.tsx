import { useState } from 'react'
import './App.css'
import { SummonerNameSearchBar } from './components/SummonerNameSearchBar'
import { TagLineSearchBar } from './components/TagLineSearchBar'
import { MatchCard } from './components/MatchCard'

interface MetaDataDto {
  dataVersion: string
  matchId: string
  participants: string[]
}

interface InfoDto {
  endOfGameResult: string
  gameDuration: number
  gameMode: string
  participants: ParticipantDto[]
}

interface ParticipantDto {
  assists: number
  champLevel: number
  championId: number
  championName: string
  damageDealtToBuildings: number
  deaths: number
  dragonKills: number
  goldEarned: number
  goldSpent: number
  item0: number
  item1: number
  item2: number
  item3: number
  item4: number
  item5: number
  item6: number
  kills: number
  lane: string
  magicDamageDealt: number
  magicDamageDealtToChampions: number
  physicalDamageDealt: number
  physicalDamageDealtToChampions: number
  profileIcon: number
  puuid: string
  riotIdGameName: string
  riotIdTagline: string
  role: string
  teamId: number
  teamPosition: string
  totalDamageDealt: number
  totalDamageDealtToChampions: number
  totalDamageTaken: number
  trueDamageDealt: number
  trueDamageDealtToChampions: number
  wardsPlaced: number
  win: boolean
  individualPosition: string
  summonerLevel: number
}

interface MatchDto {
  metadata: MetaDataDto
  info: InfoDto
  participants: ParticipantDto[]
}

interface SummonerData {
  summoner: {
    puuid: string
    profileIconId: number
    summonerLevel: number
  }
  gameName: string
  tagLine: string
  matchHistory: string[]
  matchDetails: MatchDto[]
}

function App() {
  const [gameName, setGameName] = useState('')
  const [tagLine, setTagLine] = useState('')
  const [summonerData, setSummonerData] = useState<SummonerData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!gameName.trim() || !tagLine.trim()) {
      setError('Please enter both summoner name and tag line')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `/summoner?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch summoner data')
      }

      const data = await response.json()
      setSummonerData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setSummonerData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Summoner Search</h1>
        <p className="app-subtitle">Find summoner information and match history</p>
      </header>

      <div className="search-section">
        <div className="search-inputs">
          <SummonerNameSearchBar
            onSearch={setGameName}
            placeholder="Enter summoner name..."
          />
          <TagLineSearchBar
            onSearch={setTagLine}
            placeholder="Enter tag line..."
          />
        </div>
        <button
          className="search-submit-btn"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search Summoner'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {summonerData && (
        <div className="results-section">
          <div className="summoner-header">
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/14.2.1/img/profileicon/${summonerData.summoner.profileIconId}.png`}
              alt={`${summonerData.gameName} profile icon`}
              className="summoner-icon"
              onError={(e) => {
                e.currentTarget.src =
                  'https://ddragon.leagueoflegends.com/cdn/14.2.1/img/profileicon/0.png'
              }}
            />
            <div className="summoner-info">
              <h2>
                {summonerData.gameName}
                <span className="tagline">#{summonerData.tagLine}</span>
              </h2>
              <p className="level">Level {summonerData.summoner.summonerLevel}</p>
            </div>
          </div>

          <div className="matches-section">
            <h3 className="matches-title">
              Match History ({summonerData.matchHistory.length})
            </h3>
            <div className="matches-grid">
              {summonerData.matchDetails.map((match) => (
                <MatchCard
                  key={match.metadata.matchId}
                  match={match}
                  gameName={summonerData.gameName}
                  tagLine={summonerData.tagLine}
                  profileIconId={summonerData.summoner.profileIconId}
                  summonerLevel={summonerData.summoner.summonerLevel}
                  puuid={summonerData.summoner.puuid}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
