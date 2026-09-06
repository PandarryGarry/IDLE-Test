import React from 'react';
import { getSkillVisual } from '@/shared/icons/skillIcons';

interface SkillIconProps {
  skillId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  xs: { box: 'w-5 h-5 text-sm',    img: 'w-full h-full max-w-[95%] max-h-[95%]' },
  sm: { box: 'w-7 h-7 text-lg',    img: 'w-full h-full max-w-[95%] max-h-[95%]' },
  md: { box: 'w-10 h-10 text-2xl', img: 'w-full h-full max-w-[92%] max-h-[92%]' },
  lg: { box: 'w-14 h-14 text-4xl', img: 'w-full h-full max-w-[90%] max-h-[90%]' },
  xl: { box: 'w-20 h-20 text-5xl', img: 'w-full h-full max-w-[90%] max-h-[90%]' },
};

export function SkillIcon({ skillId, size = 'md', className = '' }: SkillIconProps) {
  const visual = getSkillVisual(skillId);
  const style = SIZE_MAP[size] || SIZE_MAP.md;

  if (visual.type === 'image') {
    return (
      <div className={`inline-flex items-center justify-center select-none shrink-0 overflow-hidden ${style.box} ${className}`}>
        <img 
          src={visual.value} 
          alt={skillId} 
          className={`object-contain drop-shadow-sm pointer-events-none ${style.img}`}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center justify-center select-none shrink-0 drop-shadow-sm ${style.box} ${className}`}>
      {visual.value}
    </span>
  );
}
