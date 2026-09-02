import type { SaveData } from '@/data/types';
import { useCharacterStore } from '@/store/characterStore';
import { setLiveAttributes, type CharacterAttributeState } from '@/lib/characterAttributes';

/** Живое состояние + save_data активного героя. Облако подхватит collectSaveData. */
export function commitHeroAttributes(next: CharacterAttributeState): void {
  setLiveAttributes(next);
  const store = useCharacterStore.getState();
  const active = store.activeCharacter;
  if (!active) return;
  const saveData = {
    ...(active.saveData ?? {}),
    attributes: next,
  } as SaveData;
  const patched = { ...active, saveData };
  useCharacterStore.setState({
    activeCharacter: patched,
    characters: store.characters.map(row => (row.id === active.id ? patched : row)),
  });
}
