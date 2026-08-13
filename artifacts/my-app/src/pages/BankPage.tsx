import React, { useState } from 'react';
import { useBankStore } from '@/store/bankStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { formatNumber } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { TrendingUp, Package, Coins, ShoppingBag } from 'lucide-react';
import { Link } from 'wouter';

const SLOT_UPGRADE_COST = 200; // GP per 5 slots

interface GpTransaction {
  id: string;
  amount: number;
  desc: string;
  ts: number;
}

export function BankPage() {
  const { t } = useTranslation();
  
  // Точечные селекторы: компонент перерисовывается только при изменении этих значений
  const gp = useBankStore(s => s.gp);
  const maxSlots = useBankStore(s => s.maxSlots);
  const items = useBankStore(s => s.items);
  const spendGp = useBankStore(s => s.spendGp);
  const upgradeSlots = useBankStore(s => s.upgradeSlots);
  
  const notifyInfo = useNotificationsStore(s => s.notifyInfo);
  
  const [log, setLog] = useState<GpTransaction[]>([]);

  const totalSlots = maxSlots;
  const usedSlots  = items.filter(i => i.quantity > 0).length;
  const slotCost   = SLOT_UPGRADE_COST * Math.floor(totalSlots / 5); // scales with upgrades

  const handleBuySlots = () => {
    if (gp < slotCost) {
      notifyInfo(t('bank.notEnoughGp'));
      return;
    }
    const ok = spendGp(slotCost);
    if (!ok) { notifyInfo(t('bank.notEnoughGp')); return; }
    // upgradeSlots adds SLOTS_PER_UPGRADE (12) by default; call it once
    upgradeSlots();
    setLog(prev => [{
      id: Date.now().toString(),
      amount: -slotCost,
      desc: t('bank.upgradeSlots'),
      ts: Date.now(),
    }, ...prev].slice(0, 30));
    notifyInfo(t('bank.slotsUpgraded'));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
            <Coins className="w-6 h-6 text-amber-400" />
          </div>
           <div>
             <div className="flex items-center gap-2">
               <h1 className="text-xl font-black tracking-tight">{t('bank.title')}</h1>
               <Link
                 href="/inventory"
                 className="inline-flex items-center gap-1 rounded-md border border-sky-400/20 bg-sky-400/5 px-1.5 py-0.5 text-[10px] font-bold text-sky-400 transition-colors hover:bg-sky-400/10"
               >
                 <Package className="h-3 w-3" />
                 {t('nav.inventory')}
               </Link>
             </div>
            <p className="text-xs text-muted-foreground">{t('bank.gpBalance')}</p>
          </div>
        </div>

        {/* GP Balance big display */}
        <div className="bg-background rounded-xl p-5 border border-border text-center mb-4">
          <div className="text-4xl md:text-5xl font-black font-mono text-amber-400 drop-shadow-[0_0_16px_rgba(251,191,36,0.3)]">
            {formatNumber(gp)}
          </div>
          <div className="text-sm text-amber-500/70 font-bold mt-1">{t('inventory.gp')}</div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<Package className="w-4 h-4 text-sky-400" />}
            label={t('bank.currentSlots')}
            value={`${usedSlots} / ${totalSlots}`}
            sub={`${Math.round(usedSlots / totalSlots * 100)}%`}
          />
          <StatCard
            icon={<ShoppingBag className="w-4 h-4 text-emerald-400" />}
            label={t('inventory.quantity')}
            value={`${items.reduce((acc, s) => acc + s.quantity, 0)}`}
            sub="items"
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4 text-violet-400" />}
            label={t('bank.interest')}
            value="0.5%"
            sub="/day"
          />
        </div>
      </div>

      {/* Slot Upgrade */}
      <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm">
        <h2 className="font-black text-sm uppercase tracking-widest text-muted-foreground mb-4">{t('bank.upgradeSlots')}</h2>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              {t('bank.currentSlots')}: <span className="font-bold text-foreground font-mono">{usedSlots} / {totalSlots}</span>
            </div>
            {/* Capacity bar */}
            <div className="h-2 w-48 max-w-full bg-background rounded-full overflow-hidden border border-border">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usedSlots / totalSlots > 0.85 ? 'bg-destructive' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(100, (usedSlots / totalSlots) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {t('bank.slotCost')}: <span className="text-amber-400 font-bold">{formatNumber(slotCost)} GP</span>
            </div>
          </div>

          <button
            onClick={handleBuySlots}
            disabled={gp < slotCost}
            className="shrink-0 flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-bold rounded-xl text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_16px_rgba(34,197,94,0.2)]"
          >
            <Package className="w-4 h-4" />
            {t('bank.buySlots')}
          </button>
        </div>
      </div>

      {/* Interest info */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-violet-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold text-sm mb-0.5">{t('bank.interest')}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{t('bank.interestDesc')}</p>
          </div>
        </div>
      </div>

      {/* GP Transaction log */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <h2 className="font-black text-sm uppercase tracking-widest text-muted-foreground mb-3">{t('bank.gpLog')}</h2>
        {log.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Coins className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">{t('bank.noLog')}</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {log.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-accent/50 transition-colors">
                <span className="text-xs text-muted-foreground">{tx.desc}</span>
                <span className={`text-xs font-bold font-mono ${tx.amount < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {tx.amount < 0 ? '' : '+'}{formatNumber(tx.amount)} GP
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="bg-background border border-border rounded-xl p-3 text-center">
      <div className="flex justify-center mb-1.5">{icon}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</div>
      <div className="font-black text-sm font-mono">{value}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}
