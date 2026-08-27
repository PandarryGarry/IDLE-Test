import { useEffect, useState } from 'react';
import { Route, Switch, Router as WouterRouter, Redirect } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/error-boundary';

import { tickManager } from '@/gameEngine/tickManager';
import { initGame } from '@/lib/saveManager';
import { Sidebar } from '@/components/Sidebar';
import { TopNavBar } from '@/components/TopNavBar';
import { MobileNav } from '@/components/MobileNav';
import { GlobalActiveBar } from '@/components/GlobalActiveBar';
import { NotificationToast } from '@/components/NotificationToast';
import { SplashScreen } from '@/components/SplashScreen';

import { DashboardPage } from '@/pages/DashboardPage';
import { WoodcuttingPage } from '@/pages/WoodcuttingPage';
import { MiningPage } from '@/pages/MiningPage';
import { FishingPage } from '@/pages/FishingPage';
import { CookingPage } from '@/pages/CookingPage';
import { SmithingPage } from '@/pages/SmithingPage';
import { FiremakingPage } from '@/pages/FiremakingPage';
import { CombatPage } from '@/pages/CombatPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { SettingsPage } from '@/pages/SettingsPage';

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="fantasy-card p-8 rounded-3xl text-center space-y-3 max-w-md mx-auto">
        <div className="text-6xl">🧭</div>
        <h1 className="text-4xl font-display font-black text-amber-400">404</h1>
        <p className="text-stone-500 font-mono text-sm">Локация не найдена</p>
      </div>
    </div>
  );
}

function Router() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-amber-500/30">
      
      {/* Desktop Sidebar (Permanent) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left">
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:ml-60 min-h-screen flex flex-col overflow-x-hidden">

        {/* Unified Top Navigation */}
        <TopNavBar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Global Active Progress Floating Widget */}
        <div className="pt-2">
          <GlobalActiveBar />
        </div>

        {/* Page Content View */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-3 py-4 pb-24 sm:px-4 md:pb-10 md:px-6 lg:px-8">
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
            <Route path="/bank">
              <Redirect to="/inventory" />
            </Route>
            <Route path="/settings" component={SettingsPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>

      {/* Mobile Bottom Quick Bar */}
      <MobileNav className="md:hidden" />

      <NotificationToast />
      <Toaster />
    </div>
  );
}

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      initGame();
      tickManager.start();
      document.documentElement.classList.add('dark');
    } catch (e) {
      console.error('Failed to init game:', e);
    }
    return () => {
      try {
        tickManager.stop();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const basePath = import.meta.env.BASE_URL?.replace(/\/$/, '') || undefined;

  return (
    <ErrorBoundary>
      <TooltipProvider delayDuration={200}>
        <SplashScreen onLoaded={() => setIsReady(true)} minDisplayTimeMs={500} />
        {basePath ? (
          <WouterRouter base={basePath}>
            <Router />
          </WouterRouter>
        ) : (
          <Router />
        )}
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
