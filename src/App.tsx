import React, { useState, useEffect } from 'react';
import { UserProfile, TeamRegistration } from './types/tournament';
import {
  getUserSession,
  saveUserSession,
  clearUserSession,
  getRegisteredTeam,
} from './utils/storage';
import { isAdminUser, recordProfileVisit, signInWithGoogleDirect } from './services/firebase';

import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Navbar } from './components/Navbar';
import { BottomNavBar } from './components/BottomNavBar';
import { Footer } from './components/Footer';
import { LoginGateScreen } from './components/LoginGateScreen';
import { GoogleAuthDialog } from './components/GoogleAuthDialog';
import { UserDashboardModal } from './components/UserDashboardModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { ShareGatePage } from './pages/ShareGatePage';
import { RegisterPage } from './pages/RegisterPage';
import { SuccessPage } from './pages/SuccessPage';
import { TeamsPage } from './pages/TeamsPage';
import { CoolerPage } from './pages/CoolerPage';
import { MyTeamPage } from './pages/MyTeamPage';
import { QAPage } from './pages/QAPage';
import { AdminPage } from './pages/AdminPage';

function AppContent() {
  const { currentRoute, navigate } = useNavigation();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [registeredTeam, setRegisteredTeam] = useState<TeamRegistration | null>(null);

  // Modals state
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load persistent user and registration state
  useEffect(() => {
    // 1. Check referral visit in URL query parameters (?visit=... or ?ref=...)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const visitCode = urlParams.get('visit') || urlParams.get('ref');
      if (visitCode) {
        recordProfileVisit(visitCode);
      }
    } catch {
      // ignore
    }

    const session = getUserSession();
    if (session) {
      setUser(session);
      // If designated admin, auto-redirect to admin dashboard upon load
      if (isAdminUser(session.email) && window.location.pathname === '/admin') {
        navigate('/admin');
      }
    } else {
      setUser(null);
    }

    const reg = getRegisteredTeam();
    if (reg) {
      setRegisteredTeam(reg);
    }
  }, []);

  // Strict route guard: block non-admins from /admin
  useEffect(() => {
    if (currentRoute === '/admin' && user && !isAdminUser(user.email)) {
      navigate('/');
    }
  }, [currentRoute, user, navigate]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSignInSuccess = (newUser: UserProfile) => {
    saveUserSession(newUser);
    setUser(newUser);
    setIsAuthModalOpen(false);
    showToast(`Signed in: ${newUser.name}`);

    // If designated admin, automatically redirect to admin dashboard
    if (isAdminUser(newUser.email)) {
      navigate('/admin');
    } else {
      // Regular user stays or continues
      if (currentRoute === '/') {
        navigate('/');
      }
    }
  };

  const handleSignOut = () => {
    clearUserSession();
    setUser(null);
    setIsDashboardOpen(false);
    navigate('/');
    showToast('Signed out of tournament session');
  };

  const handleInitiateGoogleAuth = async () => {
    try {
      const authedUser = await signInWithGoogleDirect();
      if (authedUser) {
        handleSignInSuccess(authedUser);
      }
    } catch (err) {
      console.warn('Direct sign-in popup fallback to dialog:', err);
      setIsAuthModalOpen(true);
    }
  };

  // If user is unauthenticated and attempting to access registration gates, show Google Auth Dialog or Login Gate
  const requiresAuthRoutes = ['/register', '/share-gate', '/cooler'];
  if (!user && requiresAuthRoutes.includes(currentRoute)) {
    return <LoginGateScreen onLoginSuccess={handleSignInSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-100 flex flex-col font-inter selection:bg-[#00FF66]/20 selection:text-[#00FF66]">
      {/* Clean Minimal Header Bar: Brand Name on Left, User Profile Avatar on Right */}
      <Navbar
        user={user}
        onOpenProfile={() => setIsDashboardOpen(true)}
        onSignInClick={handleInitiateGoogleAuth}
      />

      {/* Main Content Area with generous bottom padding so sticky bottom bar never overlaps content */}
      <main className="flex-1 pb-28 md:pb-32">
        {currentRoute === '/' && (
          <LandingPage user={user} onLoginSuccess={handleSignInSuccess} />
        )}

        {currentRoute === '/my-team' && (
          <MyTeamPage
            user={user}
            onOpenAuth={handleInitiateGoogleAuth}
          />
        )}

        {currentRoute === '/share-gate' && <ShareGatePage />}

        {currentRoute === '/register' && (
          <RegisterPage
            user={user}
            onOpenAuth={handleInitiateGoogleAuth}
          />
        )}

        {currentRoute === '/success' && <SuccessPage />}

        {currentRoute === '/teams' && <TeamsPage />}

        {currentRoute === '/cooler' && user && <CoolerPage user={user} />}

        {currentRoute === '/qa' && <QAPage />}

        {currentRoute === '/admin' && <AdminPage user={user} />}
      </main>

      {/* Global Footer with bottom padding to stay fully visible above bottom nav */}
      <div className="pb-16 md:pb-14">
        <Footer />
      </div>

      {/* Clean compact Bottom Navigation Bar with 4 primary tabs: Home, My Team, Cooler, Invited Teams */}
      <BottomNavBar />

      {/* Live Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 z-50 p-3 rounded-xl bg-[#0D130E] border border-[#00FF66]/40 shadow-2xl text-xs font-semibold text-white flex items-center gap-2">
          <i className="fa-solid fa-bell text-[#00FF66] text-xs"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Google Account Selector Dialog */}
      <GoogleAuthDialog
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleSignInSuccess}
      />

      {/* User Profile / Dashboard Modal */}
      {user && (
        <UserDashboardModal
          isOpen={isDashboardOpen}
          onClose={() => setIsDashboardOpen(false)}
          user={user}
          registeredTeam={registeredTeam}
          onSignOut={handleSignOut}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
}
