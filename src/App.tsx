import { useState, useEffect, useMemo } from 'react'
import './App.css'
import { LeftNav } from './components/LeftNav'
import { CombinedSearchBar } from './components/CombinedSearchBar'
import { MatchCard } from './components/MatchCard'
import { MatchCardSkeleton } from './components/MatchCard/MatchCardSkeleton'
import { ChampionsPage } from './components/ChampionsPage'
import { RankedBadge, type RankedEntry } from './components/RankedBadge'
import { ChampionBreakdown, type ChampionStat } from './components/ChampionBreakdown'
import { RoleBreakdown, type RoleStat } from './components/RoleBreakdown'
import { championService, type ChampionData } from './services/championService'
import { saveRecentSearch } from './services/recentSearches'
import { REGIONS } from './services/regions'

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
  tags: string[]
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
  queueId: number
  gameEndTimestamp: number
  participants: ParticipantDto[]
}

interface ParticipantDto {
  assists: number
  champLevel: number
  championId: number
  championName: string
  damageDealtToBuildings: number
  deaths: number
  doubleKills: number
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
  neutralMinionsKilled: number
  pentaKills: number
  physicalDamageDealt: number
  physicalDamageDealtToChampions: number
  profileIcon: number
  puuid: string
  quadraKills: number
  riotIdGameName: string
  riotIdTagline: string
  role: string
  teamId: number
  teamPosition: string
  totalDamageDealt: number
  totalDamageDealtToChampions: number
  totalDamageTaken: number
  totalMinionsKilled: number
  tripleKills: number
  trueDamageDealt: number
  trueDamageDealtToChampions: number
  visionScore: number
  wardsPlaced: number
  win: boolean
  individualPosition: string
  summonerLevel: number
  summonerName?: string
  summoner1Id: number
  summoner2Id: number
  perks?: {
    styles: {
      description: string
      selections: { perk: number }[]
    }[]
  }
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
// Maps the backend's error statuses (see javigg README) to something a user can act on.
function apiErrorMessage(status: number, notFound: string): string {
  if (status === 404) return notFound
  if (status === 400) return 'Please enter a valid Riot ID (name and tag)'
  if (status === 503) return 'JaviGG is busy right now, please try again in a few seconds'
  return 'Something went wrong talking to Riot, please try again later'
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
  rankedSolo: RankedEntry | null
  rankedFlex: RankedEntry | null
  championStats: ChampionStat[]
  roleStats: RoleStat[]
}

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'champions'>('home')
  const [summonerData, setSummonerData] = useState<SummonerData | null>(null)
  const [liveGame, setLiveGame] = useState<LiveGameLobbyDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [navOpen, setNavOpen] = useState(false)
  const [backdropChampion, setBackdropChampion] = useState<{ champion: ChampionData; skinNum: number } | null>(null)
  // The region a search was run with. /live-game needs it too, since a summoner's active game
  // lives on the same shard as their profile.
  const [searchRegion, setSearchRegion] = useState('NA1')

  useEffect(() => {
    const loadChampionBackdrop = async () => {
      const champion = await championService.getRandomChampionWithSkins()
      const skinNum = champion.skins ? champion.skins[Math.floor(Math.random() * champion.skins.length)].num : 0
      setBackdropChampion({ champion, skinNum })
    }

    loadChampionBackdrop()
  }, [])

  const handleSearch = async (gameName: string, tagLine: string, region: string) => {
    setLoading(true)
    setError('')
    setLiveGame(null)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL ?? ''}/summoner?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}&region=${encodeURIComponent(region)}`
      )

      if (!response.ok) throw new Error(apiErrorMessage(response.status, 'Summoner not found, check the name and tag'))

      const data = await response.json()
      setSummonerData(data)
      setSearchRegion(region)
      saveRecentSearch(gameName, tagLine, region)
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
      const response = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/live-game?puuid=${encodeURIComponent(summonerData.summoner.puuid)}&region=${encodeURIComponent(searchRegion)}`)
      if (!response.ok) throw new Error(apiErrorMessage(response.status, 'This player is not currently in a game'))

      const data: LiveGameLobbyDto = await response.json()
      setLiveGame(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLiveGame(null)
    } finally {
      setLoading(false)
    }
  }

  const matchStats = useMemo(() => {
    if (!summonerData?.matchDetails?.length) return null;
    let wins = 0;
    const champCount: Record<string, number> = {};
    for (const match of summonerData.matchDetails) {
      const me = match.info.participants.find((p) => p.puuid === summonerData.summoner.puuid);
      if (!me) continue;
      if (me.win) wins++;
      champCount[me.championName] = (champCount[me.championName] || 0) + 1;
    }
    const total = summonerData.matchDetails.length;
    const losses = total - wins;
    const winRate = Math.round((wins / total) * 100);
    const mostPlayed = Object.entries(champCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    return { wins, losses, winRate, mostPlayed, total };
  }, [summonerData]);

  return (
    <>
      <LeftNav
        isOpen={navOpen}
        onClose={() => setNavOpen(false)}
        currentPage={currentPage}
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
            {loading && !summonerData && (
              <div className="results-section">
                <div className="summoner-header-skeleton">
                  <div className="sk-block sk-portrait" style={{ width: 100, height: 100, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)', backgroundSize: '800px 100%', animation: 'shimmer 1.6s infinite linear' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                    <div className="sk-block" style={{ width: 220, height: 28, borderRadius: 6, background: 'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)', backgroundSize: '800px 100%', animation: 'shimmer 1.6s infinite linear' }} />
                    <div className="sk-block" style={{ width: 140, height: 14, borderRadius: 4, background: 'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)', backgroundSize: '800px 100%', animation: 'shimmer 1.6s infinite linear' }} />
                  </div>
                </div>
                <div className="matches-grid" style={{ marginTop: 32 }}>
                  {Array(5).fill(0).map((_, i) => <MatchCardSkeleton key={i} />)}
                </div>
              </div>
            )}

            {!loading && !summonerData && (
              <div className="landing-center">
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
              </div>
            )}


            {summonerData && (
              <div className="results-section">
                <div className="summoner-header">
                  <div className="summoner-icon-wrapper">
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/16.6.1/img/profileicon/${summonerData.summoner.profileIconId}.png`}
                      alt="profile icon"
                      className="summoner-icon"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://ddragon.leagueoflegends.com/cdn/16.6.1/img/profileicon/0.png'
                      }}
                    />
                    <span className="summoner-level-badge">Lv. {summonerData.summoner.summonerLevel}</span>
                  </div>

                  <div className="summoner-info">
                    <h2>
                      {summonerData.account.gameName}
                      <span className="tagline">#{summonerData.account.tagLine}</span>
                      <span className="region-badge">{REGIONS.find(r => r.code === searchRegion)?.label ?? searchRegion}</span>
                    </h2>
                    <div className="ranked-badges-row">
                      <RankedBadge queueLabel="Solo/Duo" entry={summonerData.rankedSolo} />
                      <RankedBadge queueLabel="Flex" entry={summonerData.rankedFlex} />
                    </div>
                    {matchStats && (
                      <div className="summoner-stats-row">
                        <span className="stat-wins">{matchStats.wins}W</span>
                        <span className="stat-losses">{matchStats.losses}L</span>
                        <span className="stat-winrate" style={{
                          color: matchStats.winRate >= 60 ? '#0aca00' : matchStats.winRate >= 50 ? '#00d4ff' : '#ff6666'
                        }}>
                          {matchStats.winRate}% WR
                        </span>
                        {matchStats.mostPlayed && (
                          <span className="stat-most-played">· {matchStats.mostPlayed}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="summoner-actions">
                    <button className="live-game-btn" onClick={handleViewLiveGame} disabled={loading}>
                      {loading ? 'Loading...' : 'Live Game'}
                    </button>
                    <button className="new-search-btn" onClick={() => { setSummonerData(null); setLiveGame(null); setError(''); }}>
                      New Search
                    </button>
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="profile-body">
                  <aside className="profile-sidebar">
                    <ChampionBreakdown stats={summonerData.championStats} />
                    <RoleBreakdown stats={summonerData.roleStats} />
                  </aside>

                  <div className="profile-main">
                    {liveGame && (() => {
                      const allChampions = championService.getAllChampions()
                      const getChampName = (championId: number) =>
                        allChampions.find((c) => c.key === championId.toString())?.id ?? null

                      return (
                        <div className="live-game-section">
                          <div className="live-game-header">
                            <span className="live-badge">
                              <span className="live-dot" />
                              Live
                            </span>
                            <span className="live-game-mode">{liveGame.gameMode}</span>
                          </div>
                          <div className="live-game-teams">
                            {([['100', 'blue'], ['200', 'red']] as const).map(([teamId, side]) => (
                              <div key={teamId} className={`live-team ${side}`}>
                                <div className="live-team-label">{side === 'blue' ? 'Blue Side' : 'Red Side'}</div>
                                {liveGame.players
                                  .filter((p) => p.teamId.toString() === teamId)
                                  .map((p) => {
                                    const champName = getChampName(p.championId)
                                    return (
                                      <div key={p.puuid} className={`live-player-row ${p.puuid === summonerData.summoner.puuid ? 'is-current' : ''}`}>
                                        {champName ? (
                                          <img
                                            src={`https://ddragon.leagueoflegends.com/cdn/16.6.1/img/champion/${champName}.png`}
                                            alt={champName}
                                            className="live-champ-portrait"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                          />
                                        ) : (
                                          <img
                                            src={`https://ddragon.leagueoflegends.com/cdn/16.6.1/img/profileicon/${p.profileIconId}.png`}
                                            alt="profile"
                                            className="live-champ-portrait"
                                          />
                                        )}
                                        <div className="live-player-info">
                                          <div className="live-player-name">{p.summonerName ?? '—'}</div>
                                        </div>
                                        <div className="live-player-badges">
                                          {p.streak.status === 'HOT' && (
                                            <span className="live-streak hot">{p.streak.winStreak}W HOT</span>
                                          )}
                                          {p.streak.status === 'COLD' && (
                                            <span className="live-streak cold">{p.streak.lossStreak}L COLD</span>
                                          )}
                                          {p.tags?.map(tag => (
                                            <span key={tag} className={`live-tag live-tag--${tag.toLowerCase().replace(/\s+/g, '-')}`}>{tag}</span>
                                          ))}
                                        </div>
                                      </div>
                                    )
                                  })}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}

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
                </div>
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
