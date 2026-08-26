import React, { useState } from 'react';
import { useBankStore } from '@/store/bankStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { formatNumber } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { TrendingUp, Package, Coins, ShoppingBag, Sparkles, ArrowUpRight, ShieldCheck, History } from 'lucide-react';
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
  
  const gp = useBankStore(s => s.gp);
  const maxSlots = useBankStore(s => s.maxSlots);
  const items = useBankStore(s => s.items);
  const spendGp = useBankStore(s => s.spendGp);
  const upgradeSlots = useBankStore(s => s.upgradeSlots);
  
  const notifyInfo = useNotificationsStore(s => s.notifyInfo);
  const [log, setLog] = useState<GpTransaction[]>([]);

  const totalSlots = maxSlots;
  const usedSlots  = items.filter(i => i.quantity > 0).length;
  const slotCost   = SLOT_UPGRADE_COST * Math.floor(totalSlots / 5);

  const handleBuySlots = () => {
    if (gp < slotCost) {
      notifyInfo(t('bank.notEnoughGp'));
      return;
    }
    const ok = spendGp(slotCost);
    if (!ok) { notifyInfo(t('bank.notEnoughGp')); return; }
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
      
      {/* Vault Header Card */}
      <div className="fantasy-card border-amber-500/40 p-4 sm:p-6 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500/30 via-yellow-600/20 to-slate-900 rounded-2xl flex items-center justify-center border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0">
              <Coins className="w-7 h-7 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-display font-black text-slate-100">{t('bank.title')}</h1>
                <Link
                  href="/inventory"
                  className="inline-flex items-center gap-1 rounded-xl border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 text-xs font-mono font-bold text-sky-300 transition-colors hover:bg-sky-400/20 active:scale-95"
                >
                  <Package className="h-3 w-3" />
                  {t('nav.inventory')}
                </Link>
              </div>
              <p className="text-xs text-slate-400 font-mono">{t('bank.gpBalance')}</p>
            </div>
          </div>
        </div>

        {/* Big GP Balance Display */}
        <div className="bg-slate-950/80 rounded-2xl p-5 border border-amber-500/30 text-center mb-4 shadow-inner relative overflow-hidden">
          <div className="text-4xl sm:text-5xl font-mono font-black text-amber-400 drop-shadow-[0_0_16px_rgba(245,158,11,0.35)]">
            {formatNumber(gp)}
          </div>
          <div className="text-xs text-amber-400/80 font-mono uppercase tracking-widest font-bold mt-1">
            {t('inventory.gp')} • Imperial Treasury
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard
            icon={<Package className="w-4 h-4 text-sky-400" />}
            label={t('bank.currentSlots')}
            value={`${usedSlots} / ${totalSlots}`}
            sub={`${Math.round(usedSlots / totalSlots * 100)}% used`}
          />
          <StatCard
            icon={<ShoppingBag className="w-4 h-4 text-emerald-400" />}
            label={t('inventory.quantity')}
            value={`${items.reduce((acc, s) => acc + s.quantity, 0)}`}
            sub="total items"
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4 text-purple-400" />}
            label={t('bank.interest')}
            value="0.5%"
            sub="daily yield"
          />
        </div>
      </div>

      {/* Upgrade Slots Section */}
      <div className="fantasy-card border-amber-500/30 p-4 sm:p-5 rounded-3xl shadow-lg">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-amber-400 font-mono mb-4 flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" /> {t('bank.upgradeSlots')}
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="space-y-1.5">
            <div className="text-xs text-slate-400 font-mono">
              {t('bank.currentSlots')}: <span className="font-extrabold text-slate-100">{usedSlots} / {totalSlots}</span>
            </div>
            {/* Capacity bar */}
            <div className="h-2.5 w-60 max-w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usedSlots / totalSlots > 0.85 ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                }`}
                style={{ width: `${Math.min(100, (usedSlots / totalSlots) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {t('bank.slotCost')}: <span className="text-amber-300 font-bold">{formatNumber(slotCost)} GP</span>
            </div>
          </div>

          <button
            onClick={handleBuySlots}
            disabled={gp < slotCost}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-slate-950 font-extrabold rounded-2xl text-xs hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.25)]"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            {t('bank.buySlots')}
          </button>
        </div>
      </div>

      {/* Vault Interest Info */}
      <div className="fantasy-card p-4 rounded-3xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 mb-0.5">{t('bank.interest')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('bank.interestDesc')}</p>
          </div>
        </div>
      </div>

      {/* Transaction Log */}
      <div className="fantasy-card p-4 sm:p-5 rounded-3xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 font-mono flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" /> {t('bank.gpLog')}
          </h2>
        </div>

        {log.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Coins className="w-8 h-8 mx-auto mb-2 opacity-30 text-amber-400" />
            <p className="text-xs font-mono">{t('bank.noLog')}</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {log.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-xs text-slate-300 font-medium">{tx.desc}</span>
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
    <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 text-center shadow-inner">
      <div className="flex justify-center mb-1.5">{icon}</div>
      <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-0.5">{label}</div>
      <div className="font-mono font-black text-sm sm:text-base text-slate-100">{value}</div>
      <div className="text-[10px] text-slate-400 font-mono">{sub}</div>
    </div>
  );
}
