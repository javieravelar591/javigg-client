import { useState, useEffect } from 'react'
import './App.css'
import { LeftNav } from './components/LeftNav'
import { CombinedSearchBar } from './components/CombinedSearchBar'
import { MatchCard } from './components/MatchCard'
import { ChampionsPage } from './components/ChampionsPage'
import { championService, type ChampionData } from './services/championService'

interface LivePlayerDto {
  puuid: string
  summonerName?: string
  championId: number
  profileIconId: number
  teamId: number
  streak: {
    winStreak: number
    lossStreak: number
    status: 'HOT' | 'COLD' | 'NEUTRAL'
  }
}

interface LiveGameLobbyDto {
  gameId: number
  gameMode: string
  players: LivePlayerDto[]
}

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

interface Account {
  gameName: string
  tagLine: string
}
interface SummonerData {
  summoner: {
    puuid: string
    profileIconId: number
    summonerLevel: number
  }
  account: Account
  matchHistory: string[]
  matchDetails: MatchDto[]
}

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'champions'>('home')
  const [summonerData, setSummonerData] = useState<SummonerData | null>(null)
  const [liveGame, setLiveGame] = useState<LiveGameLobbyDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [navOpen, setNavOpen] = useState(false)
  const [backdropChampion, setBackdropChampion] = useState<{ champion: ChampionData; skinNum: number } | null>(null)

  useEffect(() => {
    const loadChampionBackdrop = async () => {
      const champion = await championService.getRandomChampionWithSkins()
      const skinNum = champion.skins ? champion.skins[Math.floor(Math.random() * champion.skins.length)].num : 0
      setBackdropChampion({ champion, skinNum })
    }

    loadChampionBackdrop()
  }, [])

  const handleSearch = async (gameName: string, tagLine: string) => {
    setLoading(true)
    setError('')
    setLiveGame(null)

    try {
      const response = await fetch(
        `/summoner?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`
      )

      if (!response.ok) throw new Error('Failed to fetch summoner data')

      const data = await response.json()
      setSummonerData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setSummonerData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleViewLiveGame = async () => {
    if (!summonerData) return
    setLoading(true)
    setError('')

    try {
      console.log(`http://localhost:8080/live-game/${summonerData.summoner.puuid}`);
      const response = await fetch(`http://localhost:8080/live-game?puuid=${encodeURIComponent(summonerData.summoner.puuid)}`)
      console.log(response);
      if (!response.ok) throw new Error('Failed to fetch live game')

      const data: LiveGameLobbyDto = await response.json()
      setLiveGame(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLiveGame(null)
    } finally {
      setLoading(false)
    }
  }

  console.log(summonerData);
  return (
    <>
      <LeftNav
        isOpen={navOpen}
        onClose={() => setNavOpen(false)}
        onNavigate={(page) => {
          setCurrentPage(page)
          setNavOpen(false)
        }}
      />
      <div className="app-container">
        {backdropChampion && currentPage === 'home' && (
          <div
            className="backdrop"
            style={{
              backgroundImage: `url('${championService.getSkinSplashUrl(backdropChampion.champion.id, backdropChampion.skinNum)}')`,
            }}
          />
        )}

        <button className="hamburger-btn" onClick={() => setNavOpen(!navOpen)} aria-label="Toggle navigation">
          <span></span>
          <span></span>
          <span></span>
        </button>

        {currentPage === 'home' && (
          <>
            {!summonerData && (
              <>
                <header className="app-header">
                  <h1>Javi GG</h1>
                  <p className="app-subtitle">Search yourself or your friends!</p>
                </header>

                <div className="search-section">
                  <div className="search-inputs">
                    <CombinedSearchBar onSearch={handleSearch} isLoading={loading} />
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}
              </>
            )}

            {summonerData && (
              <div className="results-section">
                <div className="summoner-header">
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/14.2.1/img/profileicon/${summonerData.summoner.profileIconId}.png`}
                    alt={`${summonerData} profile icon`}
                    className="summoner-icon"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://ddragon.leagueoflegends.com/cdn/14.2.1/img/profileicon/0.png'
                    }}
                  />
                  <div className="summoner-info">
                    <h2>
                      {summonerData.account.gameName}
                      <span className="tagline">#{summonerData.account.tagLine}</span>
                    </h2>
                    <p className="level">Level {summonerData.summoner.summonerLevel}</p>
                  </div>

                  {/* Live Game Button */}
                  <button className="live-game-btn" onClick={handleViewLiveGame}>
                    View Live Game
                  </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                {liveGame && (
                  <div className="live-game-section">
                    <h3>Live Game - {liveGame.gameMode}</h3>
                    <div className="teams-container">
                      {['100', '200'].map((teamId) => (
                        <div key={teamId} className={`team team-${teamId}`}>
                          <div className="team-label">Team {teamId}</div>
                          {liveGame.players
                            .filter((p) => p.teamId.toString() === teamId)
                            .map((p) => (
                              <div key={p.puuid} className="player-row">
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/14.2.1/img/profileicon/${p.profileIconId}.png`}
                                  alt="profile icon"
                                  className="match-card-icon"
                                />
                                <div className="player-name">{p?.summonerName}</div>
                                <div className="player-streak">
                                  {p.streak.status === 'HOT'
                                    ? `${p.streak.winStreak} W 🔥`
                                    : p.streak.status === 'COLD'
                                    ? `${p.streak.lossStreak} L ❄️`
                                    : ''}
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!liveGame && (
                  <div className="matches-section">
                    <h3 className="matches-title">Match History ({summonerData.matchHistory.length})</h3>
                    <div className="matches-grid">
                      {summonerData.matchDetails.map((match) => (
                        <MatchCard
                          key={match.metadata.matchId}
                          match={match}
                          gameName={summonerData.account.gameName}
                          tagLine={summonerData.account.tagLine}
                          profileIconId={summonerData.summoner.profileIconId}
                          summonerLevel={summonerData.summoner.summonerLevel}
                          puuid={summonerData.summoner.puuid}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {currentPage === 'champions' && <ChampionsPage />}
      </div>
    </>
  )
}

export default App
