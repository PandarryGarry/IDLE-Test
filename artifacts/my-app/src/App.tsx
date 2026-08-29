import { useEffect, useState } from 'react';
import { Route, Switch, Router as WouterRouter, Redirect, useLocation } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/error-boundary';

import { tickManager } from '@/gameEngine/tickManager';
import { initGame, setupOfflineTracking } from '@/lib/saveManager';
import { Sidebar } from '@/components/Sidebar';
import { TopNavBar } from '@/components/TopNavBar';
import { MobileNav } from '@/components/MobileNav';
import { GlobalActiveBar } from '@/components/GlobalActiveBar';
import { NotificationToast } from '@/components/NotificationToast';
import { SplashScreen } from '@/components/SplashScreen';
import { CinematicDirector } from '@/components/CinematicDirector';
import { WhatsNewModal } from '@/components/WhatsNewModal';
import { getUnseenChangelog, markChangelogSeen, type VersionEntry } from '@/data/changelog';
import { getQueuedCinematic } from '@/lib/cinematicState';

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
import { AuthPage } from '@/pages/AuthPage';
import { RulesPage } from '@/pages/RulesPage';
import { CreateCharacterPage } from '@/pages/CreateCharacterPage';
import { SelectCharacterPage } from '@/pages/SelectCharacterPage';
import { useAuthStore } from '@/store/authStore';
import { useCharacterStore } from '@/store/characterStore';
import {
  reconcileCharacterSave,
  startCharacterSaveLoop,
  stopCharacterSaveLoop,
} from '@/lib/characterSave';
import { readLocalRulesAccepted, RULES_VERSION } from '@/data/rules';
import { isGuestBlockedPath } from '@/lib/guestMode';

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

function AuthLoadingScreen() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] text-[var(--text-primary)]">
      <div className="text-center">
        <div className="text-4xl font-display font-black text-amber-400 mb-2">Aethelia</div>
        <div className="text-xs font-mono text-[var(--text-muted)] tracking-widest uppercase">Загрузка...</div>
      </div>
    </main>
  );
}

function Router() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const pathname = location.split(/[?#]/)[0] || '/';

  const authLoading = useAuthStore(s => s.loading);
  const isGuest = useAuthStore(s => s.isGuest);
  const hasUser = useAuthStore(s => Boolean(s.user));
  const user = useAuthStore(s => s.user);
  const profile = useAuthStore(s => s.profile);

  const characters = useCharacterStore(s => s.characters);
  const activeCharacter = useCharacterStore(s => s.activeCharacter);
  const charactersLoading = useCharacterStore(s => s.loading);
  const loadCharacters = useCharacterStore(s => s.loadCharacters);

  const isAuthPath = pathname === '/auth' || pathname === '/login' || pathname === '/register';
  const isOnboardingPath =
    pathname === '/rules' || pathname === '/create-character' || pathname === '/select-character';

  // Загружаем персонажей, как только появился пользователь.
  useEffect(() => {
    if (hasUser && user) {
      void loadCharacters(user.id);
    } else if (!hasUser) {
      useCharacterStore.getState().clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUser, user]);

  // Трёхуровневое сохранение: reconcile + облачный цикл для активного персонажа.
  useEffect(() => {
    if (!isGuest && activeCharacter) {
      const id = activeCharacter.id;
      void reconcileCharacterSave(activeCharacter).then(() => {
        startCharacterSaveLoop(id);
      });
    } else {
      stopCharacterSaveLoop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuest, activeCharacter?.id]);

  // Auth routes: wait for session restore, then send signed-in/guest users home.
  if (isAuthPath) {
    if (authLoading) return <AuthLoadingScreen />;
    if (hasUser || isGuest) return <Redirect to="/" />;
    return <AuthPage initialMode={pathname === '/register' ? 'register' : 'login'} />;
  }

  // Protected game shell: guests are allowed in, signed-out users go to login.
  if (authLoading) return <AuthLoadingScreen />;
  if (!hasUser && !isGuest) return <Redirect to="/login" />;

  // ─── Онбординг / выбор персонажа (только для аккаунтов) ───────────
  if (!isGuest) {
    const { acceptedVersion: localRules } = readLocalRulesAccepted();
    const acceptedVersion = profile?.rulesVersion || localRules;
    const rulesAccepted = acceptedVersion === RULES_VERSION;
    const hasAny = characters.some(c => !c.isDeleted);

    // Отдельные полноэкранные шаги без игрового шелла.
    if (isOnboardingPath) {
      if (pathname === '/rules') {
        if (rulesAccepted) return <Redirect to={hasAny ? '/select-character' : '/create-character'} />;
        return <RulesPage />;
      }
      if (pathname === '/select-character') {
        if (!rulesAccepted) return <Redirect to="/rules" />;
        if (charactersLoading) return <AuthLoadingScreen />;
        if (!hasAny) return <Redirect to="/create-character" />;
        return <SelectCharacterPage />;
      }
      if (pathname === '/create-character') {
        if (rulesAccepted && hasAny && !activeCharacter) return <Redirect to="/select-character" />;
        return <CreateCharacterPage />;
      }
    }

    // Игровой шелл доступен только после правил + выбранного персонажа.
    if (!rulesAccepted) return <Redirect to="/rules" />;
    if (charactersLoading) return <AuthLoadingScreen />;
    if (!hasAny) return <Redirect to="/create-character" />;
    // always_select: при логине (без активного персонажа) показываем выбор.
    if (!activeCharacter) return <Redirect to="/select-character" />;
  }

  // Guests can only open the limited game shell.
  if (isGuest && isGuestBlockedPath(pathname)) return <Redirect to="/" />;

  return (
    <div className="flex min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] selection:bg-amber-500/30">
      
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
      <div className="flex-1 md:ml-[240px] min-h-screen flex flex-col overflow-x-hidden" style={{ background: 'var(--bg-page)' }}>

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
  const [splashComplete, setSplashComplete] = useState(false);
  const [cinematicBusy, setCinematicBusy] = useState(false);

  // «Что нового» должно появляться только когда игрок уже дошёл до игры,
  // а не поверх входной/выходной сцен или создания героя.
  const [unseenChangelog, setUnseenChangelog] = useState<VersionEntry[]>([]);
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  const [changelogChecked, setChangelogChecked] = useState(false);
  const isGuest = useAuthStore(s => s.isGuest);
  const activeCharacter = useCharacterStore(s => s.activeCharacter);

  const handleSplashLoaded = () => {
    setSplashComplete(true);
  };

  useEffect(() => {
    if (changelogChecked || !splashComplete || cinematicBusy || getQueuedCinematic()) return;
    // У аккаунта «Что нового» ждёт выбранного героя; гость попадает в игру сразу.
    if (!isGuest && !activeCharacter) return;

    const unseen = getUnseenChangelog();
    if (unseen.length > 0) {
      setUnseenChangelog(unseen);
      setWhatsNewOpen(true);
    }
    setChangelogChecked(true);
  }, [activeCharacter, changelogChecked, cinematicBusy, isGuest, splashComplete]);

  const handleWhatsNewClose = () => {
    setWhatsNewOpen(false);
    markChangelogSeen();
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await useAuthStore.getState().restoreSession();
        if (cancelled) return;
        initGame();
        setupOfflineTracking();
        tickManager.start();
        document.documentElement.classList.add('dark');
      } catch (e) {
        console.error('Failed to init auth/game:', e);
        if (!cancelled) {
          try {
            initGame();
            setupOfflineTracking();
            tickManager.start();
            document.documentElement.classList.add('dark');
          } catch (inner) {
            console.error('Failed to init game:', inner);
          }
        }
      }
    })();

    return () => {
      cancelled = true;
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
        <SplashScreen onLoaded={handleSplashLoaded} />
        <CinematicDirector splashComplete={splashComplete} onBusyChange={setCinematicBusy} />
        <WhatsNewModal open={whatsNewOpen} entries={unseenChangelog} onClose={handleWhatsNewClose} />
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
