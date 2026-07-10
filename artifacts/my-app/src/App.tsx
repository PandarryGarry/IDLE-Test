import { useEffect } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

import { tickManager } from '@/gameEngine/tickManager';
import { initGame } from '@/lib/saveManager';
import { Sidebar } from '@/components/Sidebar';
import { NotificationToast } from '@/components/NotificationToast';

import { DashboardPage } from '@/pages/DashboardPage';
import { WoodcuttingPage } from '@/pages/WoodcuttingPage';
import { MiningPage } from '@/pages/MiningPage';
import { FishingPage } from '@/pages/FishingPage';
import { CookingPage } from '@/pages/CookingPage';
import { SmithingPage } from '@/pages/SmithingPage';
import { FiremakingPage } from '@/pages/FiremakingPage';
import { CombatPage } from '@/pages/CombatPage';
import { BankPage } from '@/pages/BankPage';
import { SettingsPage } from '@/pages/SettingsPage';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-black text-destructive drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">404</h1>
        <p className="text-muted-foreground font-mono">Area not found</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Sidebar fixed left */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen overflow-x-hidden">
        <div className="p-8">
          <Switch>
            <Route path="/" component={DashboardPage} />
            <Route path="/woodcutting" component={WoodcuttingPage} />
            <Route path="/mining" component={MiningPage} />
            <Route path="/fishing" component={FishingPage} />
            <Route path="/cooking" component={CookingPage} />
            <Route path="/smithing" component={SmithingPage} />
            <Route path="/firemaking" component={FiremakingPage} />
            <Route path="/combat" component={CombatPage} />
            <Route path="/bank" component={BankPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>

      <NotificationToast />
      <Toaster />
    </div>
  );
}

function App() {
  useEffect(() => {
    // Initialize game state (load save, auto-save interval)
    initGame();
    // Start game loop
    tickManager.start();
    
    // Ensure dark mode is active
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