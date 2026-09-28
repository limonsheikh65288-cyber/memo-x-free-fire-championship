import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { DynamicInvitedTeam } from '../types/tournament';
import {
  subscribeDynamicInvitedTeams,
  getDynamicInvitedTeams,
} from '../services/firebase';

export const TeamsPage: React.FC = () => {
  const { navigate, shareProgress } = useNavigation();
  const [teams, setTeams] = useState<DynamicInvitedTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDynamicInvitedTeams().then((data) => {
      setTeams(data);
      setLoading(false);
    });

    const unsub = subscribeDynamicInvitedTeams((dynamicTeams) => {
      setTeams(dynamicTeams);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 pb-24">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#00FF66]">
          Direct Invitations
        </span>
        <h1 className="font-orbitron text-2xl sm:text-3xl font-black text-white mt-1">
          Invited Esports Teams
        </h1>
        <p className="mt-1 text-xs text-neutral-400">
          Premier seeded squads invited directly to the Group Stage. Managed dynamically in real-time.
        </p>
      </div>

      {/* Grid of Dynamic Invited Teams */}
      {loading ? (
        <div className="p-8 text-center text-xs text-neutral-400">
          <i className="fa-solid fa-spinner fa-spin text-sm text-[#00FF66] mr-2"></i>
          Loading invited teams...
        </div>
      ) : teams.length === 0 ? (
        <div className="p-10 rounded-xl bg-[#0A0A0A] border border-neutral-800 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#0D130E] border border-[#00FF66]/30 flex items-center justify-center mx-auto text-[#00FF66] text-sm">
            <i className="fa-solid fa-shield"></i>
          </div>
          <h3 className="font-orbitron text-sm font-bold text-white">
            Invited Rosters Coming Soon
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Official invitations are being finalized by tournament directors. Seeded squads will appear here dynamically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {teams.map((team, index) => (
            <div
              key={team.id || index}
              className="rounded-xl bg-[#0A0A0A] border border-[#00FF66]/20 overflow-hidden flex flex-col justify-between group hover:border-[#00FF66]/50 transition-all shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
            >
              {/* Team Banner */}
              {team.bannerUrl ? (
                <div className="h-24 w-full relative overflow-hidden bg-neutral-900">
                  <img
                    src={team.bannerUrl}
                    alt={team.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent"></div>
                </div>
              ) : null}

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Seed Badge */}
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <span className="font-mono-nums text-[10px] font-bold text-[#00FF66]">
                      INVITED SEED #{String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono-nums font-bold bg-[#0D130E] text-[#00FF66] border border-[#00FF66]/30">
                      VIP
                    </span>
                  </div>

                  {/* Team Info: strictly Team Name and Team Logo */}
                  <div className="flex items-center gap-3 mt-3">
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt={team.name}
                        className="w-10 h-10 rounded-lg object-cover border border-[#00FF66]/40 shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#0D130E] border border-[#00FF66]/40 flex items-center justify-center font-orbitron font-bold text-white text-base">
                        {team.name.charAt(0)}
                      </div>
                    )}

                    <div className="truncate">
                      <h2 className="font-orbitron text-sm font-bold text-white truncate">
                        {team.name}
                      </h2>
                      <span className="text-[10px] text-neutral-400 font-medium">
                        Direct Group Stage Roster
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status bar */}
                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono-nums">
                  <span className="text-neutral-500">Status</span>
                  <span className="text-[#00FF66] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse"></span>
                    <span>Seeded & Confirmed</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Challenger Registration CTA */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#0A0A0A] border border-[#00FF66]/25 text-center space-y-2">
        <h3 className="font-orbitron text-base sm:text-lg font-bold text-white">
          Want to Challenge the Invited VIPs?
        </h3>
        <p className="text-xs text-neutral-400 max-w-md mx-auto">
          Open qualifiers are currently open. Complete the community share gate and reserve your squad slot.
        </p>
        <div className="pt-2">
          <button
            onClick={() => {
              if (shareProgress.isComplete) navigate('/register');
              else navigate('/share-gate');
            }}
            className="px-6 py-2.5 rounded-lg bg-[#00FF66] hover:bg-[#00e65c] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,255,102,0.25)] cursor-pointer"
          >
            Register Your Challenger Squad
          </button>
        </div>
      </div>
    </div>
  );
};
