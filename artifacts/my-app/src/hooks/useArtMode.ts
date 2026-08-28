import { useEffect, useState } from 'react';
import { detectMode, type ArtMode } from '@/components/art/artEngine';

export interface ArtProbe {
  /** Итоговый режим: явный (если передан) либо авто-детект по альфе. */
  mode: ArtMode | null;
  /** Картинка успешно декодирована. */
  loaded: boolean;
  /** Файл не найден / не загрузился. */
  error: boolean;
}

/**
 * Выясняет режим арта и факт загрузки ДО первого кадра canvas, чтобы верстка
 * выбрала раскладку заранее. Картинка при этом попадает в HTTP-кэш,
 * и AnimatedArt берёт её уже горячей.
 *
 * @param src   путь к картинке
 * @param fixed явный режим (перекрывает авто-детект) — для артов с известной природой
 */
export function useArtMode(src: string, fixed?: ArtMode): ArtProbe {
  const [probe, setProbe] = useState<ArtProbe>({ mode: null, loaded: false, error: false });

  useEffect(() => {
    if (!src) {
      setProbe({ mode: null, loaded: false, error: true });
      return;
    }
    let disposed = false;
    setProbe({ mode: fixed ?? null, loaded: false, error: false });

    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (disposed) return;
      setProbe({ mode: fixed ?? detectMode(img), loaded: true, error: false });
    };
    img.onerror = () => {
      if (!disposed) setProbe({ mode: null, loaded: false, error: true });
    };
    img.src = src;

    return () => {
      disposed = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fixed]);

  return probe;
}
