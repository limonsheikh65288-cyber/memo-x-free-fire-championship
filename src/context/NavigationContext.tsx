import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppRoute =
  | '/'
  | '/share-gate'
  | '/register'
  | '/success'
  | '/teams'
  | '/cooler'
  | '/my-team'
  | '/qa'
  | '/admin';

interface NavigationContextType {
  currentRoute: AppRoute;
  navigate: (path: AppRoute | string) => void;
  shareProgress: {
    whatsapp: number;
    messenger: number;
    isComplete: boolean;
  };
  recordShare: (platform: 'whatsapp' | 'messenger') => void;
  resetShareProgress: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

function normalizePath(rawPath: string): AppRoute {
  let path = rawPath;
  if (path.includes('#')) {
    const hashPart = path.split('#')[1] || '';
    if (hashPart.startsWith('/')) {
      path = hashPart;
    } else if (hashPart) {
      path = '/' + hashPart;
    }
  }

  path = path.split('?')[0];
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  const validRoutes: AppRoute[] = [
    '/',
    '/share-gate',
    '/register',
    '/success',
    '/teams',
    '/cooler',
    '/my-team',
    '/qa',
    '/admin',
  ];

  if (validRoutes.includes(path as AppRoute)) {
    return path as AppRoute;
  }
  return '/';
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#/')) {
        return normalizePath(hash);
      }
      return normalizePath(window.location.pathname);
    }
    return '/';
  });

  const [whatsappShares, setWhatsappShares] = useState<number>(() => {
    const saved = localStorage.getItem('memo_ffc_share_wa');
    return saved ? Math.min(5, parseInt(saved, 10) || 0) : 0;
  });

  const [messengerShares, setMessengerShares] = useState<number>(() => {
    const saved = localStorage.getItem('memo_ffc_share_msgr');
    return saved ? Math.min(5, parseInt(saved, 10) || 0) : 0;
  });

  const navigate = (path: AppRoute | string) => {
    const targetRoute = normalizePath(path);
    setCurrentRoute(targetRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      window.history.pushState({}, '', targetRoute);
    } catch {
      window.location.hash = targetRoute;
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#/')) {
        setCurrentRoute(normalizePath(hash));
      } else {
        setCurrentRoute(normalizePath(window.location.pathname));
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  useEffect(() => {
    const titles: Record<AppRoute, string> = {
      '/': 'MEMO X Free Fire Championship | Grand Prize Pool: ৳1,42,000',
      '/share-gate': 'Share Verification Gate | MEMO X Free Fire Championship',
      '/register': 'Team Registration | MEMO X Free Fire Championship',
      '/success': 'Registration Confirmed | Official Community Groups',
      '/teams': 'Invited Teams Roster | MEMO X Free Fire Championship',
      '/cooler': 'Cooler Milestone Campaign | Free Phone Cooler Reward',
      '/my-team': 'My Registered Team | Live Approval Status',
      '/qa': 'সাধারণ প্রশ্ন ও উত্তর (Q&A) | MEMO X FFC',
      '/admin': 'Admin Panel & Operations Dashboard | MEMO X FFC',
    };
    document.title = titles[currentRoute] || titles['/'];
  }, [currentRoute]);

  const recordShare = (platform: 'whatsapp' | 'messenger') => {
    if (platform === 'whatsapp') {
      const next = Math.min(5, whatsappShares + 1);
      setWhatsappShares(next);
      localStorage.setItem('memo_ffc_share_wa', next.toString());
    } else {
      const next = Math.min(5, messengerShares + 1);
      setMessengerShares(next);
      localStorage.setItem('memo_ffc_share_msgr', next.toString());
    }
  };

  const resetShareProgress = () => {
    setWhatsappShares(0);
    setMessengerShares(0);
    localStorage.removeItem('memo_ffc_share_wa');
    localStorage.removeItem('memo_ffc_share_msgr');
  };

  const isComplete = whatsappShares >= 5 && messengerShares >= 5;

  return (
    <NavigationContext.Provider
      value={{
        currentRoute,
        navigate,
        shareProgress: {
          whatsapp: whatsappShares,
          messenger: messengerShares,
          isComplete,
        },
        recordShare,
        resetShareProgress,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
