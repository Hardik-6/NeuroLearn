import React from 'react';
import { Role, StudentProfile } from '../types';

interface HeaderProps {
  role: Role;
  onRoleChange: (newRole: Role) => void;
  activeStudent: StudentProfile;
  onOpenInspector?: () => void;
  onSimulateFocusChange?: (delta: number) => void;
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  activeStudent,
}) => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#FF8A00]/10 px-6 sm:px-8 flex items-center justify-between shrink-0 z-20">
      {/* Title / Greeting with soft warm visual badge */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#FFF7F3] border border-[#FF8A00]/20 flex items-center justify-center text-[#FF8A00] font-bold shadow-2xs">
          ✦
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#1E293B] tracking-tight">
            {role === 'student'
              ? `Good day, ${activeStudent.name.split(' ')[0]}`
              : 'Educator Dashboard'}
          </h1>
          <p className="text-xs text-[#1E293B]/60 hidden sm:block">
            {role === 'student'
              ? `Your ${activeStudent.attentionSpanMinutes}-minute personalized session is ready`
              : 'Real-time soft computing telemetry & inclusive classroom analytics'}
          </p>
        </div>
      </div>

      {/* Right utilities: Clean Profile and Pill Badge */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Soft state badge */}
        <div className="hidden md:flex items-center gap-2 bg-[#FFF7F3] border border-[#FF8A00]/15 px-3 py-1.5 rounded-full text-xs font-semibold text-[#1E293B]">
          <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse" />
          <span>Neuro-Sensory Mode Active</span>
        </div>

        {/* Current profile avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#FF8A00]/15">
          <div className="relative">
            <img
              src={
                role === 'student'
                  ? activeStudent.avatarUrl
                  : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
              }
              alt={role === 'student' ? activeStudent.name : 'Teacher Ms. Priya'}
              className="w-10 h-10 rounded-2xl border-2 border-white shadow-sm ring-2 ring-[#FF8A00]/20 object-cover"
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#00C896] ring-2 ring-white" />
          </div>
          <div className="hidden lg:block text-left leading-tight">
            <span className="text-xs font-bold text-[#1E293B] block">
              {role === 'student' ? activeStudent.name : 'Ms. Priya'}
            </span>
            <span className="text-[10px] font-semibold text-[#FF8A00] uppercase tracking-wider">
              {role === 'student' ? `${activeStudent.diagnoses[0]} Profile` : 'Special Educator'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
