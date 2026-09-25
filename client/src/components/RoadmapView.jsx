import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Play, 
  Clock, 
  Zap, 
  Award, 
  Lock, 
  BookOpen, 
  ArrowRight,
  Sparkles,
  Layers,
  Code
} from 'lucide-react';

export default function RoadmapView({
  course,
  user,
  onSelectLesson,
  onSwitchToProjects
}) {
  if (!course) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        載入課程資料中...
      </div>
    );
  }

  const completedList = user?.completedLessons || [];
  const completedCount = course.levels.filter(l => completedList.includes(l.id)).length;
  const progressPercent = Math.round((completedCount / course.levels.length) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Course Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 mb-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <span>{course.language === 'python' ? '🐍 Python 學習軌道' : '⚡ C++ 學習軌道'}</span>
              <span>•</span>
              <span>共 {course.levels.length} 個系統化關卡</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {course.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/60 rounded-2xl p-5 min-w-[240px] shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
              <span className="font-medium">學習總進度</span>
              <span className="font-bold text-indigo-400">{completedCount} / {course.levels.length} 關</span>
            </div>
            <div className="w-full h-2.5 bg-slate-700/80 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 rounded-full transition-all duration-700" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>完成率 {progressPercent}%</span>
              </span>
              <span className="flex items-center gap-1 font-mono text-cyan-400">
                <Zap className="w-3.5 h-3.5" />
                <span>{course.totalXp} 總 XP</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Stages Timeline */}
      <div className="relative">
        {/* Continuous central connecting line */}
        <div className="absolute left-6 sm:left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-indigo-500 via-indigo-500/50 to-slate-800" />

        <div className="space-y-6">
          {course.levels.map((level, idx) => {
            const isCompleted = completedList.includes(level.id);
            const isCurrent = !isCompleted && (idx === 0 || completedList.includes(course.levels[idx - 1].id));
            const isLocked = !isCompleted && !isCurrent;

            return (
              <div 
                key={level.id}
                className="relative pl-14 sm:pl-20 group"
              >
                {/* Node Milestone Icon */}
                <div 
                  className={`absolute left-2.5 sm:left-4.5 top-5 -translate-x-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all shadow-md z-10 ${
                    isCompleted
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 shadow-emerald-500/30'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/30 animate-pulse shadow-indigo-500/50'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isCurrent ? (
                    <Play className="w-4 h-4 ml-0.5" />
                  ) : (
                    <span className="text-xs font-bold font-mono">{idx + 1}</span>
                  )}
                </div>

                {/* Level Card */}
                <div 
                  onClick={() => onSelectLesson(course.id, level.id)}
                  className={`cursor-pointer rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
                    isCurrent
                      ? 'bg-slate-900/90 border-indigo-500/60 shadow-xl shadow-indigo-500/10 hover:border-indigo-400'
                      : isCompleted
                      ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-850'
                      : 'bg-slate-900/40 border-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                          Stage {String(level.stage).padStart(2, '0')}
                        </span>
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
                            <CheckCircle2 className="w-3 h-3" />
                            已掌握
                          </span>
                        )}
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/40 animate-pulse">
                            <Sparkles className="w-3 h-3" />
                            當前進度推薦
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {level.title}
                      </h3>

                      <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                        {level.summary}
                      </p>
                    </div>

                    {/* Metadata & Action */}
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>~{level.estimatedMinutes} 分鐘</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono font-semibold text-amber-400">
                          <Zap className="w-3.5 h-3.5 fill-amber-400" />
                          <span>+{level.xp} XP</span>
                        </span>
                      </div>

                      <button
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow ${
                          isCompleted
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                            : isCurrent
                            ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 hover:opacity-95 shadow-indigo-500/25'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span>{isCompleted ? '複習關卡' : isCurrent ? '立即挑戰' : '進入關卡'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Practical Projects Callout */}
      <div className="mt-14 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wide">
            <Award className="w-4 h-4" />
            <span>從觀念邁向真實世界</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            準備好親手做出真實專案了嗎？
          </h2>
          <p className="text-sm text-slate-300 max-w-xl">
            學程式不是死背語法，而是手刻實踐！走進專案工坊，嘗試開發猜數字、記帳工具、計算機與 RPG 冒險遊戲。
          </p>
        </div>
        <button
          onClick={onSwitchToProjects}
          className="whitespace-nowrap px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-extrabold text-sm hover:scale-105 transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2"
        >
          <span>瀏覽實戰專案工坊</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
