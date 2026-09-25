import React from 'react';
import { Terminal, Flame, Award, BookOpen, Code2, Sparkles, User, ChevronDown } from 'lucide-react';

export default function Navbar({
  currentTrack,
  setCurrentTrack,
  currentTab,
  setCurrentTab,
  user,
  onOpenAuth,
  onOpenProfile
}) {
  const getLevel = (xp = 0) => {
    if (xp < 100) return { level: 1, title: '初學學徒', nextXp: 100 };
    if (xp < 250) return { level: 2, title: '初階程式員', nextXp: 250 };
    if (xp < 500) return { level: 3, title: '程式探索家', nextXp: 500 };
    if (xp < 900) return { level: 4, title: '專案實踐家', nextXp: 900 };
    return { level: 5, title: '程式工匠大師', nextXp: 1500 };
  };

  const levelInfo = getLevel(user?.xp || 0);
  const progressPercent = Math.min(100, Math.round(((user?.xp || 0) / levelInfo.nextXp) * 100));

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Track Switcher */}
        <div className="flex items-center gap-6">
          <div 
            onClick={() => setCurrentTab('roadmap')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-300 bg-clip-text text-transparent">
                CodeCraft Academy
              </span>
              <span className="block text-[11px] text-slate-400 font-medium">程式匠人學習學院</span>
            </div>
          </div>

          {/* Track Switcher */}
          <div className="hidden sm:flex items-center p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setCurrentTrack('python')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTrack === 'python'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🐍</span>
              <span>Python 零基礎</span>
            </button>
            <button
              onClick={() => setCurrentTrack('cpp')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTrack === 'cpp'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>⚡</span>
              <span>C++ 高效實戰</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentTab('roadmap')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'roadmap'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>學習關卡</span>
          </button>

          <button
            onClick={() => setCurrentTab('projects')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'projects'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>實戰專案</span>
          </button>

          <button
            onClick={() => setCurrentTab('playground')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'playground'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>自由沙盒</span>
          </button>
        </nav>

        {/* User Stats & Profile */}
        <div className="flex items-center gap-3">
          {/* Streak */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
            <span>{user?.streak || 1} 天連續</span>
          </div>

          {/* XP & Level Badge */}
          <div 
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl cursor-pointer transition-all hover:border-slate-600"
            title="點擊查看詳細學習成就"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white shadow">
              Lv.{levelInfo.level}
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-200">{user?.username || '探索者'}</span>
                <span className="text-[10px] text-indigo-400 bg-indigo-950/60 px-1.5 py-0.2 rounded font-medium">
                  {levelInfo.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{user?.xp || 0} XP</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

      </div>
    </header>
  );
}
