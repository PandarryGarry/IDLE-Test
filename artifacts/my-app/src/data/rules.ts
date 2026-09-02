/** Версия правил. При изменении текста правил — подними версию,
 *  и игроков попросят принять их заново. */
export const RULES_VERSION = '1.0.0';

export const RULES_ACCEPTANCE_KEY = 'aethelia_rules_accepted_version';

export interface RuleBlock {
  icon: string;
  title: string;
  text: string;
}

export const RULES: RuleBlock[] = [
  {
    icon: '🛡️',
    title: 'Прогресс и сохранение',
    text: 'Ваш персонаж, инвентарь и навыки сохраняются за вашим аккаунтом. Прогресс гостя хранится только в текущей сессии браузера и теряется при её закрытии.',
  },
  {
    icon: '⚔️',
    title: 'Честная игра',
    text: 'Запрещены читы, эксплойты и автокликеры. Использование стороннего ПО для автоматизации игрового процесса может привести к ограничениям.',
  },
  {
    icon: '💬',
    title: 'Общение и поведение',
    text: 'Уважайте других игроков: без оскорблений, спама и токсичности. Администрация вправе ограничить доступ при нарушениях.',
  },
  {
    icon: '🛒',
    title: 'Покупки и валюта',
    text: 'Донат-валюта привязана к аккаунту и не теряется при удалении персонажа. Удаление персонажа необратимо удаляет его инвентарь и прогресс.',
  },
  {
    icon: '⚠️',
    title: 'Ответственность',
    text: 'Вы соглашаетесь с текущими правилами. При их изменении вас попросят принять обновлённую версию. Сообщество развивается вместе с игрой.',
  },
];

export interface RulesState {
  acceptedVersion: string | null;
  acceptedAt: number | null;
}

function rulesStorageKey(userId?: string | null): string {
  return userId ? `${RULES_ACCEPTANCE_KEY}:${userId}` : RULES_ACCEPTANCE_KEY;
}

/** Прочитать локально принятую версию правил (fallback-кэш, синхронизируется с БД). */
export function readLocalRulesAccepted(userId?: string | null): RulesState {
  try {
    const raw = window.localStorage.getItem(rulesStorageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw) as RulesState;
      return { acceptedVersion: parsed.acceptedVersion ?? null, acceptedAt: parsed.acceptedAt ?? null };
    }
  } catch {
    // ignore
  }
  return { acceptedVersion: null, acceptedAt: null };
}

export function writeLocalRulesAccepted(version: string, userId?: string | null): void {
  try {
    window.localStorage.setItem(
      rulesStorageKey(userId),
      JSON.stringify({ acceptedVersion: version, acceptedAt: Date.now() }),
    );
  } catch {
    // ignore
  }
}
