import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle2, 
  Circle, 
  Play, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Save, 
  ArrowLeft, 
  Sparkles, 
  Terminal as TerminalIcon, 
  FileCode, 
  Check,
  Zap,
  Code
} from 'lucide-react';
import { api } from '../services/api';

export default function ProjectsView({
  user,
  onProgressUpdate,
  onOpenAiTutor
}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLang, setFilterLang] = useState('all'); // 'all' | 'python' | 'cpp'
  const [activeProject, setActiveProject] = useState(null);

  // Workbench state
  const [code, setCode] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [checkedObjectives, setCheckedObjectives] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await api.getProjects();
      setProjects(res.projects || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWorkbench = (project) => {
    setActiveProject(project);
    // Load draft if exists, else starter code
    const draft = user?.projectDrafts?.[project.id];
    setCode(draft || project.starterCode);
    setRunResult(null);
    setShowSolution(false);
    setCheckedObjectives({});
  };

  const handleRunCode = async () => {
    if (!activeProject) return;
    setRunning(true);
    setRunResult(null);
    try {
      const res = await api.runCode(activeProject.language, code);
      setRunResult(res);
    } catch (err) {
      setRunResult({
        success: false,
        stdout: '',
        stderr: '執行發生錯誤: ' + err.message,
        executionTime: 0,
        tips: null
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!activeProject) return;
    try {
      await api.saveProjectDraft(activeProject.id, code);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteProject = async () => {
    if (!activeProject) return;
    try {
      const res = await api.completeProject(activeProject.id, activeProject.xpReward);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
      if (onProgressUpdate && res.user) {
        onProgressUpdate(res.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleObjective = (index) => {
    setCheckedObjectives(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const filteredProjects = projects.filter(p => {
    if (filterLang === 'all') return true;
    return p.language === filterLang;
  });

  const completedProjects = user?.completedProjects || [];

  // If in workbench mode
  if (activeProject) {
    const isCompleted = completedProjects.includes(activeProject.id);

    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden">
        {/* Workbench Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveProject(null)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>所有專案</span>
            </button>
            <div className="h-4 w-px bg-slate-700" />
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  activeProject.language === 'python' ? 'bg-amber-950/60 text-amber-400' : 'bg-blue-950/60 text-blue-400'
                }`}>
                  {activeProject.language === 'python' ? '🐍 Python 專案' : '⚡ C++ 專案'}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-sm sm:max-w-md">
                  {activeProject.title}
                </h2>
              </div>
            </div>
          </div>

          {/* Workbench Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saveSuccess ? '已儲存草稿 ✓' : '儲存草稿'}</span>
            </button>

            <button
              onClick={() => onOpenAiTutor(activeProject.language, code, runResult?.stderr)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI 專案顧問</span>
            </button>

            <button
              onClick={handleCompleteProject}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow ${
                isCompleted
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:opacity-95 text-slate-950 shadow-amber-500/20'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{isCompleted ? '專案已榮譽結案' : `結案領取 +${activeProject.xpReward} XP`}</span>
            </button>
          </div>
        </div>

        {/* Workbench Split Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left Guide Panel */}
          <div className="lg:col-span-5 border-r border-slate-800 bg-slate-900/60 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                  專案架構目標
                </span>
                <span className="text-xs text-amber-400 font-bold font-mono">
                  +{activeProject.xpReward} XP
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeProject.summary}
              </p>
            </div>

            {/* Milestone Checklist */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                開發里程碑檢核表 (Checklist)
              </span>
              <div className="space-y-2">
                {activeProject.objectives?.map((obj, i) => {
                  const isChecked = !!checkedObjectives[i];
                  return (
                    <div
                      key={i}
                      onClick={() => toggleObjective(i)}
                      className={`p-3 rounded-xl border cursor-pointer text-xs transition-all flex items-start gap-2.5 ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                      <span className={`flex-1 ${isChecked ? 'line-through text-slate-400' : ''}`}>
                        {obj}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Solution Drawer */}
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {showSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showSolution ? '隱藏參考解答' : '卡關需要靈感？點我查看完整參考解答'}</span>
              </button>

              {showSolution && (
                <div className="mt-3 rounded-xl border border-cyan-800/40 bg-slate-950 overflow-hidden">
                  <div className="px-3 py-1.5 bg-cyan-950/60 border-b border-cyan-800/40 text-[11px] font-mono text-cyan-300 flex items-center justify-between">
                    <span>參考範例程式碼 (Reference Solution)</span>
                    <button
                      onClick={() => setCode(activeProject.solutionCode)}
                      className="text-xs font-bold text-indigo-400 hover:underline"
                    >
                      套用至編輯器
                    </button>
                  </div>
                  <pre className="p-3 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-64">
                    {activeProject.solutionCode}
                  </pre>
                </div>
              )}
            </div>

          </div>

          {/* Right Editor & Runner Panel */}
          <div className="lg:col-span-7 flex flex-col h-full bg-slate-950 overflow-hidden">
            
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
              <span className="text-xs font-mono text-slate-400">
                {activeProject.language === 'python' ? 'project.py' : 'project.cpp'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCode(activeProject.starterCode)}
                  title="重設為原始範本"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleRunCode}
                  disabled={running}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 hover:opacity-95 text-slate-950 text-xs font-extrabold transition-all shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{running ? '執行中...' : '執行專案程式'}</span>
                </button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 min-h-[300px] border-b border-slate-800">
              <Editor
                height="100%"
                theme="vs-dark"
                language={activeProject.language === 'python' ? 'python' : 'cpp'}
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  fontSize: 14,
                  fontFamily: 'Consolas, "Fira Code", monospace',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  automaticLayout: true
                }}
              />
            </div>

            {/* Terminal Console */}
            <div className="h-56 flex flex-col bg-slate-950 text-slate-200">
              <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-mono font-bold text-slate-300">專案執行輸出 (Project Console)</span>
                </div>
                {runResult && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    耗時: {runResult.executionTime}ms
                  </span>
                )}
              </div>

              <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-2 select-text">
                {running ? (
                  <div className="flex items-center gap-2 text-indigo-400 animate-pulse">
                    <span>● 正在編譯執行專案...</span>
                  </div>
                ) : runResult ? (
                  <>
                    {runResult.stdout && (
                      <div className="text-slate-100 whitespace-pre-wrap">
                        {runResult.stdout}
                      </div>
                    )}
                    {runResult.stderr && (
                      <div className="text-rose-400 bg-rose-950/30 p-2.5 rounded border border-rose-900/50 whitespace-pre-wrap">
                        {runResult.stderr}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-slate-600 italic">
                    點擊右上角「執行專案程式」來啟動你的實戰專案！
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // Projects Catalog View
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Catalog Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Award className="w-4 h-4" />
          <span>獨立開發實戰工坊</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          動手寫出你自己的真實軟體專案
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          不再只是做無趣的語法練習！透過遊戲、工具、資料分析與系統設計，真正體會親手寫出軟體的成就感。
        </p>

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setFilterLang('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterLang === 'all'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            全部語言 ({projects.length})
          </button>
          <button
            onClick={() => setFilterLang('python')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterLang === 'python'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            🐍 Python 專案
          </button>
          <button
            onClick={() => setFilterLang('cpp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterLang === 'cpp'
                ? 'bg-blue-500 text-slate-950 font-bold shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ C++ 專案
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => {
          const isCompleted = completedProjects.includes(project.id);

          return (
            <div
              key={project.id}
              className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-indigo-500/5 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      project.language === 'python'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {project.language === 'python' ? '🐍 Python' : '⚡ C++'}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
                      {project.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400">
                    <Zap className="w-3.5 h-3.5 fill-amber-400" />
                    <span>+{project.xpReward} XP</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {project.summary}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    核心實踐重點：
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {project.objectives?.slice(0, 3).map((obj, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-indigo-400">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>已榮譽結案</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">
                      {user?.projectDrafts?.[project.id] ? '有草稿進度' : '未開始'}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleOpenWorkbench(project)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 font-bold text-xs hover:opacity-95 transition-all shadow"
                >
                  進入專案工坊
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
