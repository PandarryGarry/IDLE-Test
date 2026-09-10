import React from 'react';

interface UniqueEmblemProps {
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  title?: string;
}

/**
 * Звезда-эмблема уникального предмета (решение владельца №3, шаг 6 плана):
 * вместо текстовой плашки «УНИК» — золотой знак-сияние. Урок Diablo 4
 * (игроки не различали уники в сетке): топовая вещь обязана выделяться
 * ВСЕГДА и СРАЗУ. Поэтому звезда крупная, с тёмным контуром, светлым
 * бликом и двойным ореолом; свечение усиливает и сама ячейка
 * (item-cell--unique). Числового бейджа у уника нет — только звезда.
 */
export function UniqueEmblem({ size = 'sm', className = '', title = 'Уникальный предмет' }: UniqueEmblemProps) {
  return (
    <span
      className={`unique-emblem unique-emblem--${size} ${className}`}
      role="img"
      aria-label={title}
      title={title}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 1 C13.2 7.5 16.5 10.8 23 12 C16.5 13.2 13.2 16.5 12 23 C10.8 16.5 7.5 13.2 1 12 C7.5 10.8 10.8 7.5 12 1 Z" />
        <circle cx="12" cy="12" r="2.1" className="unique-emblem__glint" />
      </svg>
    </span>
  );
}
