import { useEffect } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

import { tickManager } from '@/gameEngine/tickManager';
import { initGame } from '@/lib/saveManager';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { TopBar } from '@/components/TopBar';
import { SideMenu } from '@/components/SideMenu';
import { NotificationToast } from '@/components/NotificationToast';
import { useUIStore } from '@/store/uiStore';

import { DashboardPage } from '@/pages/DashboardPage';
import { WoodcuttingPage } from '@/pages/WoodcuttingPage';
import { MiningPage } from '@/pages/MiningPage';
import { FishingPage } from '@/pages/FishingPage';
import { CookingPage } from '@/pages/CookingPage';
import { SmithingPage } from '@/pages/SmithingPage';
import { FiremakingPage } from '@/pages/FiremakingPage';
import { CombatPage } from '@/pages/CombatPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { BankPage } from '@/pages/BankPage';
import { SettingsPage } from '@/pages/SettingsPage';

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-3">
        <h1 className="text-5xl font-black text-destructive">404</h1>
        <p className="text-muted-foreground font-mono text-sm">Area not found</p>
      </div>
    </div>
  );
}

function Router() {
  const updateScrollPosition = useUIStore(s => s.updateScrollPosition);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateScrollPosition(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateScrollPosition]);

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* SideMenu — выдвижное меню для мобильных */}
      <SideMenu />

      {/* Main content — 240px offset on desktop, full-width on mobile */}
      <main className="flex-1 md:ml-60 min-h-screen overflow-x-hidden">
        {/* TopBar — новая верхняя панель */}
        <TopBar />

        {/* NotificationToast — размещаем сразу под TopBar */}
        <NotificationToast />

        <div className="w-full max-w-[1440px] mx-auto px-3 py-4 pb-20 sm:px-4 md:pb-8 md:px-6 lg:px-8">
          <Switch>
            <Route path="/" component={DashboardPage} />
            <Route path="/woodcutting" component={WoodcuttingPage} />
            <Route path="/mining" component={MiningPage} />
            <Route path="/fishing" component={FishingPage} />
            <Route path="/cooking" component={CookingPage} />
            <Route path="/smithing" component={SmithingPage} />
            <Route path="/firemaking" component={FiremakingPage} />
            <Route path="/combat" component={CombatPage} />
            <Route path="/inventory" component={InventoryPage} />
            <Route path="/bank" component={BankPage} />
            <Route path="/shop" component={() => <div className="text-center py-10">🏪 Магазин скоро откроется!</div>} />
            <Route path="/settings" component={SettingsPage} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>

      {/* Mobile bottom nav — hidden on desktop */}
      <MobileNav className="md:hidden" />

      <Toaster />
    </div>
  );
}

function App() {
  useEffect(() => {
    initGame();
    tickManager.start();
    document.documentElement.classList.add('dark');
    return () => {
      tickManager.stop();
    };
  }, []);

  return (
    <TooltipProvider delayDuration={300}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
    </TooltipProvider>
  );
}

export default App;
