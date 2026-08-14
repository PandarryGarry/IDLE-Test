import { useGameStore } from '@/store/gameStore';
import { useBankStore } from '@/store/bankStore';
import { TREES, WOODCUTTING_TREES_MAP } from '@/data/woodcutting';
import { getItem } from '@/data/items';
import { SkillScreen } from '@/components/skills/SkillScreen';
import { useTranslation } from '@/hooks/useTranslation';
import type { ResourceInfo, WoodcuttingTree } from '@/data/types';

export function WoodcuttingPage() {
  const { t } = useTranslation();

  const startSkillAction = useGameStore(s => s.startSkillAction);
  const stopAction = useGameStore(s => s.stopAction);
  const activeSkill = useGameStore(s => s.activeSkill);
  const activeActionId = useGameStore(s => s.activeActionId);

  const handleActionClick = (actionId: string) => {
    if (activeSkill === 'woodcutting' && activeActionId === actionId) {
      stopAction();
    } else {
      startSkillAction('woodcutting', actionId);
    }
  };

  const activeTree = activeActionId ? WOODCUTTING_TREES_MAP[activeActionId] : undefined;
  const isTraining = activeSkill === 'woodcutting' && !!activeTree;

  // Информация о ресурсе (брёвна) — для панели CurrentAction
  const activeLogId = activeTree?.logId ?? null;
  const inInventory = useBankStore(s =>
    activeLogId ? (s.items.find(i => i.itemId === activeLogId)?.quantity ?? 0) : 0
  );

  const logItem = activeTree ? getItem(activeTree.logId) : undefined;
  const resourceInfo: ResourceInfo | undefined = activeTree && logItem ? {
    icon: logItem.icon ?? '🪵',
    name: logItem.name,
    sellValue: logItem.sellValue,
    xp: activeTree.xp,
    qtyPerAction: activeTree.quantity[0] === activeTree.quantity[1]
      ? `${activeTree.quantity[0]}`
      : `${activeTree.quantity[0]}-${activeTree.quantity[1]}`,
    inInventory,
  } : undefined;

  // TODO: заменить на данные из toolStore
  const demoTool = {
    name: 'Бронзовый топор',
    icon: '🪓',
    tier: 2,
    durability: 85,
    maxDurability: 150,
    speedBonus: 5,
  };

  return (
    <SkillScreen
      skillId="woodcutting"
      skillName={t('skill.woodcutting')}
      skillIcon="🪓"
      isTraining={isTraining}
      activeAction={activeTree}
      onStop={stopAction}
      toolName={demoTool.name}
      toolIcon={demoTool.icon}
      toolTier={demoTool.tier}
      toolDurability={demoTool.durability}
      toolMaxDurability={demoTool.maxDurability}
      toolSpeedBonus={demoTool.speedBonus}
      resourceInfo={resourceInfo}
      actions={TREES}
      onActionClick={handleActionClick}
      actionsTitle={t('woodcutting.availableTrees')}
      // 💰 Цена брёвен на каждой карточке дерева
      renderActionExtra={(action) => {
        const tree = action as WoodcuttingTree;
        const log = getItem(tree.logId);
        if (!log) return null;
        return (
          <div className="text-[10px] font-mono font-bold text-yellow-400">
            💰 {log.sellValue} GP/шт
          </div>
        );
      }}
      t={t}
    />
  );
}
