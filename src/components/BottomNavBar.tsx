import React from 'react';
import { useNavigation } from '../context/NavigationContext';

export const BottomNavBar: React.FC = () => {
  const { currentRoute, navigate } = useNavigation();

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      path: '/',
      icon: 'fa-solid fa-house',
    },
    {
      id: 'my-team',
      label: 'My Team',
      path: '/my-team',
      icon: 'fa-solid fa-shield-halved',
    },
    {
      id: 'cooler',
      label: 'Cooler',
      path: '/cooler',
      icon: 'fa-solid fa-snowflake',
    },
    {
      id: 'qa',
      label: 'Q&A',
      path: '/qa',
      icon: 'fa-solid fa-circle-question',
    },
    {
      id: 'teams',
      label: 'Teams',
      path: '/teams',
      icon: 'fa-solid fa-users',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 border-t border-[#00FF66]/20 backdrop-blur-lg shadow-[0_-4px_25px_rgba(0,0,0,0.8)]">
      <div className="mx-auto max-w-lg flex items-center justify-around h-16 px-1 sm:px-3">
        {tabs.map((tab) => {
          const isActive = currentRoute === tab.path;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 transition-all cursor-pointer relative ${
                isActive ? 'text-[#00FF66]' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-[#00FF66] shadow-[0_0_8px_#00FF66] rounded-full"></span>
              )}
              <i className={`${tab.icon} text-base mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`}></i>
              <span className={`text-[10px] font-medium font-inter tracking-wider ${isActive ? 'font-bold text-[#00FF66]' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
