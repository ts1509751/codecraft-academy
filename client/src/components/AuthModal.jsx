import React, { useState } from 'react';
import { 
  X, 
  Award, 
  Flame, 
  Zap, 
  BookOpen, 
  CheckCircle2, 
  User, 
  Lock, 
  LogOut, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { api, setUserId } from '../services/api';

const BADGES = [
  { id: 'b-start', title: '啟程冒險者', desc: '踏入程式世界，完成第一個 Hello World', icon: '🚀', reqXp: 50 },
  { id: 'b-logic', title: '邏輯分析師', desc: '掌握條件判斷與迴圈重複魔法', icon: '🧠', reqXp: 150 },
  { id: 'b-builder', title: '專案實踐家', desc: '成功親手完成第一個獨立軟體專案', icon: '🛠️', reqXp: 300 },
  { id: 'b-polyglot', title: '雙刀流工程師', desc: '跨足 Python 與 C++ 雙語世界', icon: '⚔️', reqXp: 500 },
  { id: 'b-master', title: '程式大師', desc: '累積超過 800 XP，邁向獨立開發者之路', icon: '👑', reqXp: 800 }
];

export default function AuthModal({
  isOpen,
  onClose,
  user,
  onUserUpdate
}) {
  const [tab, setTab] = useState('profile'); // 'profile' | 'switch'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginOrRegister = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.login(username.trim(), password);
      if (res.user) {
        setUserId(res.user.id);
        if (onUserUpdate) onUserUpdate(res.user);
        setTab('profile');
      } else {
        setErrorMsg(res.error || '登入失敗');
      }
    } catch (err) {
      setErrorMsg('連線錯誤: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const xp = user?.xp || 0;
  const completedLessons = user?.completedLessons?.length || 0;
  const completedProjects = user?.completedProjects?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-white text-base">學習成就與個人帳號</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setTab('profile')}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              tab === 'profile'
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🏆 學習成就與勳章
          </button>
          <button
            onClick={() => setTab('switch')}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              tab === 'switch'
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            👤 登入 / 切換多帳號
          </button>
        </div>

        {/* TAB 1: PROFILE & BADGES */}
        {tab === 'profile' && (
          <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
            {/* User Overview Card */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-black text-xl text-slate-950 shadow-md">
                  {user?.username?.charAt(0) || '學'}
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base">{user?.username || '探索學徒'}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-indigo-300">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                      <span>{user?.streak || 1} 天連續學習</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xl font-black font-mono text-amber-400">{xp}</span>
                <span className="text-xs text-slate-400 block font-medium">累積 XP 點數</span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-lg font-black text-cyan-400 block">{completedLessons}</span>
                <span className="text-[11px] text-slate-400">通過關卡</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-lg font-black text-amber-400 block">{completedProjects}</span>
                <span className="text-[11px] text-slate-400">完成專案</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-lg font-black text-purple-400 block">
                  {Object.keys(user?.quizResults || {}).length}
                </span>
                <span className="text-[11px] text-slate-400">通過隨堂測驗</span>
              </div>
            </div>

            {/* Badges Collection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  成長里程碑勳章
                </span>
                <span className="text-[11px] text-slate-500">
                  {BADGES.filter(b => xp >= b.reqXp).length} / {BADGES.length} 已解鎖
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {BADGES.map((badge) => {
                  const unlocked = xp >= badge.reqXp;
                  return (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                        unlocked
                          ? 'bg-indigo-950/30 border-indigo-500/30'
                          : 'bg-slate-950/40 border-slate-800/40 opacity-50'
                      }`}
                    >
                      <div className="text-2xl">{badge.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${unlocked ? 'text-white' : 'text-slate-400'}`}>
                            {badge.title}
                          </span>
                          {unlocked && (
                            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
                              已解鎖
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{badge.desc}</p>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {badge.reqXp} XP
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SWITCH / REGISTER ACCOUNT */}
        {tab === 'switch' && (
          <div className="p-6 space-y-5">
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm">自訂學習帳號 / 雲端進度同步</h4>
              <p className="text-xs text-slate-400">
                輸入您的使用者名稱，若尚未註冊將會自動為您建立個人專屬檔案與存檔！
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLoginOrRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">使用者暱稱 / ID</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="例如: CodeNinja, 小明"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">密碼 (可隨意填寫或預設 123456)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="留空將使用預設密碼"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 font-bold text-xs hover:opacity-95 transition-all shadow"
              >
                {loading ? '同步登入中...' : '確認切換 / 建立帳號'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
