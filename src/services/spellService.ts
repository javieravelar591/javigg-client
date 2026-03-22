import summonerJson from '../../resources/datadragon/data/en_US/summoner.json';
import { DDRAGON } from '../constants';

interface SpellEntry { id: string; key: string; }
interface SummonerJson { data: { [key: string]: SpellEntry } }

class SpellService {
  private spellMap = new Map<number, string>();

  constructor() {
    const data = summonerJson as unknown as SummonerJson;
    for (const spell of Object.values(data.data)) {
      this.spellMap.set(parseInt(spell.key), spell.id);
    }
  }

  getSpellImageUrl(spellId: number): string | null {
    const name = this.spellMap.get(spellId);
    return name ? `${DDRAGON}/img/spell/${name}.png` : null;
  }
}

export const spellService = new SpellService();
