import championDataJson from '../../resources/datadragon/data/en_US/champion.json';

export interface ChampionSkin {
  id: string;
  num: number;
  name: string;
  chromas: boolean;
}

export interface ChampionStats {
  hp: number;
  hpperlevel: number;
  mp: number;
  mpperlevel: number;
  movespeed: number;
  armor: number;
  armorperlevel: number;
  spellblock: number;
  spellblockperlevel: number;
  attackrange: number;
  hpregen: number;
  hpregenperlevel: number;
  mpregen: number;
  mpregenperlevel: number;
  crit: number;
  critperlevel: number;
  attackdamage: number;
  attackdamageperlevel: number;
  attackspeedperlevel: number;
  attackspeed: number;
}

export interface ChampionInfo {
  attack: number;
  defense: number;
  magic: number;
  difficulty: number;
}

export interface ChampionImage {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ChampionData {
  id: string;
  key: string;
  name: string;
  title: string;
  blurb: string;
  image: ChampionImage;
  skins?: ChampionSkin[];
  lore?: string;
  allytips?: string[];
  enemytips?: string[];
  tags: string[];
  partype: string;
  info: ChampionInfo;
  stats: ChampionStats;
}

interface ChampionDataResponse {
  type: string;
  format: string;
  version: string;
  data: {
    [key: string]: ChampionData;
  };
}

interface DetailedChampionResponse {
  type: string;
  format: string;
  version: string;
  data: {
    [key: string]: ChampionData;
  };
}

class ChampionService {
  private static instance: ChampionService;
  private champions: ChampionData[] = [];
  private detailedChampions: Map<string, ChampionData> = new Map();

  private constructor() {
    this.loadChampions();
  }

  static getInstance(): ChampionService {
    if (!ChampionService.instance) {
      ChampionService.instance = new ChampionService();
    }
    return ChampionService.instance;
  }

  private loadChampions() {
    const data = championDataJson as unknown as ChampionDataResponse;
    this.champions = Object.values(data.data);
  }

  private async loadDetailedChampion(championId: string): Promise<ChampionData | null> {
    // Check if already cached
    if (this.detailedChampions.has(championId)) {
      return this.detailedChampions.get(championId) || null;
    }

    try {
      // Dynamically import the champion file
      const championModule = await import(
        `../../resources/datadragon/data/en_US/champion/${championId}.json`
      );
      const detailedData = championModule.default as unknown as DetailedChampionResponse;
      const champData = detailedData.data[championId];

      if (champData) {
        this.detailedChampions.set(championId, champData);
        return champData;
      }
    } catch (error) {
      console.warn(`Failed to load detailed data for ${championId}`);
    }

    return null;
  }

  async getRandomChampionWithSkins(): Promise<ChampionData> {
    const randomIndex = Math.floor(Math.random() * this.champions.length);
    const champion = this.champions[randomIndex];

    // Try to load detailed champion data with skins
    const detailedChampion = await this.loadDetailedChampion(champion.id);
    return detailedChampion || champion;
  }

  getRandomChampion(): ChampionData {
    const randomIndex = Math.floor(Math.random() * this.champions.length);
    return this.champions[randomIndex];
  }

  getChampionById(id: string): ChampionData | undefined {
    return this.champions.find((c) => c.id.toLowerCase() === id.toLowerCase());
  }

  getAllChampions(): ChampionData[] {
    return this.champions;
  }

  getSkinSplashUrl(championId: string, skinNum: number): string {
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_${skinNum}.jpg`;
  }
}

export const championService = ChampionService.getInstance();
