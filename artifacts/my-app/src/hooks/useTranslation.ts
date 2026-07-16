import { useSettingsStore } from '@/store/settingsStore';
import { translate, type TranslationKey } from '@/lib/i18n';

/**
 * Returns a `t(key)` function that translates to the current game language.
 * Re-renders on language change only.
 */
export function useTranslation() {
  const lang = useSettingsStore(s => s.language);
  return {
    t: (key: TranslationKey) => translate(key, lang),
    lang,
  };
}
