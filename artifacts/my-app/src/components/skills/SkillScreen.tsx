import React from 'react';
import { SkillHeader } from '@/components/SkillHeader';
import { CurrentAction } from './CurrentAction';
import { ActionCard } from './ActionCard';
import type { ResourceInfo, SkillAction, SkillId } from '@/data/types';

interface SkillScreenProps {
  skillId: SkillId;
  skillName: string;
  skillIcon: string;

  isTraining: boolean;
  activeAction?: SkillAction;
  onStop: () => void;

  toolName?: string;
  toolIcon?: string;
  toolTier?: number;
  toolDurability?: number;
  toolMaxDurability?: number;
  toolSpeedBonus?: number;

  resourceInfo?: ResourceInfo;

  actions: SkillAction[];
  onActionClick: (actionId: string) => void;
  actionsTitle: string;
  renderActionExtra?: (action: SkillAction) => React.ReactNode;

  t: (key: string) => string;
}

export function SkillScreen({
  skillId, skillName, skillIcon,
  isTraining, activeAction, onStop,
  toolName, toolIcon, toolTier, toolDurability, toolMaxDurability, toolSpeedBonus,
  resourceInfo,
  actions, onActionClick, actionsTitle, renderActionExtra,
  t,
}: SkillScreenProps) {
  return (
    <div className="space-y-4">
      <SkillHeader skillId={skillId} skillName={skillName} skillIcon={skillIcon} />

      <CurrentAction
        skillIcon={skillIcon}
        skillName={skillName}
        actionName={activeAction?.name || ''}
        actionInterval={activeAction?.interval || 3000}
        isTraining={isTraining}
        onStop={onStop}
        toolName={toolName}
        toolIcon={toolIcon}
        toolTier={toolTier}
        toolDurability={toolDurability}
        toolMaxDurability={toolMaxDurability}
        toolSpeedBonus={toolSpeedBonus}
        resourceInfo={resourceInfo}
        t={t}
      />

      <h2 className="text-base font-black uppercase tracking-widest text-muted-foreground px-1">
        {actionsTitle}
      </h2>

      {/* Адаптивная сетка карточек */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {actions.map(action => (
          <ActionCard
            key={action.id}
            skillId={skillId}
            action={action}
            isActive={isTraining && activeAction?.id === action.id}
            onClick={() => onActionClick(action.id)}
            renderExtra={renderActionExtra}
          />
        ))}
      </div>
    </div>
  );
}
