import React from 'react';
import {
  Home,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Settings,
  LayoutDashboard,
  Users,
  FileQuestion,
  BarChart3,
  FileCheck
} from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  role: Role;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onRoleChange: (newRole: Role) => void;
  pendingSubmissionsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  currentRoute,
  onNavigate,
  onRoleChange,
  pendingSubmissionsCount = 0
}) => {
  const studentNavItems = [
    { id: 'student-dashboard', label: 'Dashboard', icon: Home },
    { id: 'student-lessons', label: 'My Lessons', icon: BookOpen },
    { id: 'multimodal-submission', label: 'Submit Work', icon: FileCheck },
    { id: 'adaptive-quiz', label: 'Quizzes', icon: HelpCircle },
    { id: 'student-progress', label: 'Progress', icon: TrendingUp },
    { id: 'create-profile', label: 'Settings', icon: Settings },
  ];

  const teacherNavItems = [
    { id: 'teacher-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'teacher-submissions', label: 'Submissions', icon: FileCheck },
    { id: 'teacher-students', label: 'Students', icon: Users },
    { id: 'teacher-lessons', label: 'Lessons', icon: BookOpen },
    { id: 'teacher-quiz-bank', label: 'Quiz Bank', icon: FileQuestion },
    { id: 'teacher-analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'teacher-settings', label: 'Settings', icon: Settings },
  ];

  const items = role === 'student' ? studentNavItems : teacherNavItems;

  return (
    <aside
      id="main-sidebar"
      className="w-64 bg-white border-r border-[#FF8A00]/10 flex flex-col shrink-0 h-full shadow-[4px_0_24px_rgba(255,138,0,0.03)]"
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-[#FF8A00]/10 flex items-center justify-between">
        <button
          onClick={() => onNavigate(role === 'student' ? 'student-dashboard' : 'teacher-dashboard')}
          className="flex items-center gap-3 text-left group"
        >
          {/* Logo badge with mint and coral accents from design */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00C896] to-[#00A87E] flex items-center justify-center text-white font-extrabold shadow-sm shadow-[#00C896]/30 group-hover:scale-105 transition-transform">
            <span className="text-lg">N</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-[#1E293B]">
                NeuroLearn
              </span>
              <span className="w-2 h-2 rounded-full bg-[#FF8A00]" />
            </div>
            <span className="text-[10px] font-semibold text-[#FF8A00] tracking-wider uppercase block">
              Adaptive AI
            </span>
          </div>
        </button>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto" aria-label="Sidebar navigation">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentRoute === item.id ||
            (item.id === 'student-lessons' && currentRoute === 'lesson-view') ||
            (item.id === 'teacher-students' && currentRoute === 'create-profile');

          return (
            <button
              key={item.id}
              id={`sidebar-link-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold transition-all text-sm text-left ${
                isActive
                  ? 'bg-[#00C896]/10 text-[#00C896] shadow-xs'
                  : 'text-[#1E293B]/70 hover:bg-[#FFF7F3] hover:text-[#1E293B]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[#00C896] text-white shadow-xs'
                    : 'bg-[#FFF7F3] text-[#1E293B]/60 group-hover:bg-white'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="tracking-tight">{item.label}</span>
              {item.id === 'teacher-submissions' && pendingSubmissionsCount > 0 && (
                <span className="ml-auto text-[10px] font-extrabold bg-[#FF8A00] text-white px-2 py-0.5 rounded-full shadow-2xs">
                  {pendingSubmissionsCount}
                </span>
              )}
              {isActive && item.id !== 'teacher-submissions' && (
                <span className="ml-auto w-1.5 h-5 rounded-full bg-[#00C896]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Role Toggle Switcher in Sidebar Footer */}
      <div className="p-4 border-t border-[#FF8A00]/10 bg-[#FFF7F3]/40">
        <div className="bg-white p-1 rounded-2xl border border-[#FF8A00]/15 flex items-center shadow-xs">
          <button
            id="sidebar-role-student"
            onClick={() => onRoleChange('student')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              role === 'student'
                ? 'bg-[#4D84FE] text-white shadow-sm'
                : 'text-[#1E293B]/60 hover:text-[#1E293B]'
            }`}
          >
            Student
          </button>
          <button
            id="sidebar-role-teacher"
            onClick={() => onRoleChange('teacher')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              role === 'teacher'
                ? 'bg-[#FF8A00] text-white shadow-sm'
                : 'text-[#1E293B]/60 hover:text-[#1E293B]'
            }`}
          >
            Teacher
          </button>
        </div>
      </div>
    </aside>
  );
};
