/** Человеческое сообщение вместо сырого TypeError / PostgREST. */
export function describeCharacterError(err: unknown, fallback: string): string {
  const msg = String((err as { message?: string })?.message ?? err ?? '').trim();
  const lower = msg.toLowerCase();

  if (
    !msg ||
    /typeerror|failed to fetch|networkerror|network error|load failed|fetch failed|aborted|econnrefused|offline|internet/.test(
      lower,
    )
  ) {
    return 'Не удалось связаться с сервером. Проверьте интернет и повторите попытку.';
  }

  if (
    /argument types|schema cache|does not exist|could not find the function|is_nickname_taken|explicit type casts/.test(
      lower,
    )
  ) {
    return 'Не удалось проверить ник. Попробуйте другое имя или повторите попытку.';
  }

  if (/row-level security|permission denied|not authorized|jwt|session/.test(lower)) {
    return 'Сессия устарела. Смените аккаунт и войдите снова.';
  }

  if (/duplicate|unique/.test(lower) && /nickname|characters_nickname/.test(lower)) {
    return 'Этот ник уже занят. Выберите другой.';
  }

  return msg || fallback;
}

export function describeCaughtRenderError(err: unknown): string {
  const msg = String((err as { message?: string })?.message ?? err ?? '').trim();
  if (/typeerror|typescript|argument types|cannot read propert/i.test(msg)) {
    return 'Этот экран сломался. Можно попробовать снова или сменить аккаунт.';
  }
  return describeCharacterError(err, 'Что-то пошло не так. Попробуйте снова или смените аккаунт.');
}
