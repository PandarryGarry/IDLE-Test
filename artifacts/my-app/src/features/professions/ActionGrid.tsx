import React from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { SkillId } from '@/data/types';
import { ActionCard } from '@/shared/ui/kit/ActionCard';

interface ActionGridProps {
  skillId: SkillId;
  actions: any[];
  onActionClick: (actionId: string) => void;
  renderExtra?: (action: any) => React.ReactNode;
}

export function ActionGrid({ skillId, actions, onActionClick, renderExtra }: ActionGridProps) {
  const playerLevel = usePlayerStore(s => s.skills[skillId]?.level ?? 1);
  const mastery = usePlayerStore(s => s.skills[skillId]?.mastery ?? {});
  const activeActionId = useGameStore(s => s.activeActionId);
  const activeSkill = useGameStore(s => s.activeSkill);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {actions.map(action => {
        const isLocked = playerLevel < action.levelRequired;
        const isActive = activeSkill === skillId && activeActionId === action.id;
        const masteryXp = mastery[action.id] ?? 0;

        return (
          <ActionCard
            key={action.id}
            action={action}
            isLocked={isLocked}
            isActive={isActive}
            masteryXp={masteryXp}
            onActionClick={() => onActionClick(action.id)}
            renderExtra={renderExtra ? renderExtra(action) : undefined}
          />
        );
      })}
    </div>
  );
}
