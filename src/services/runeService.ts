import runesJson from '../../resources/datadragon/data/en_US/runesReforged.json';

interface RuneEntry { id: number; icon: string; }
interface RuneTree { id: number; slots: { runes: RuneEntry[] }[] }

class RuneService {
  private runeMap = new Map<number, string>();

  constructor() {
    for (const tree of runesJson as unknown as RuneTree[]) {
      for (const slot of tree.slots) {
        for (const rune of slot.runes) {
          this.runeMap.set(rune.id, rune.icon);
        }
      }
    }
  }

  getRuneIconUrl(runeId: number): string | null {
    const icon = this.runeMap.get(runeId);
    return icon ? `https://ddragon.leagueoflegends.com/cdn/img/${icon}` : null;
  }
}

export const runeService = new RuneService();
