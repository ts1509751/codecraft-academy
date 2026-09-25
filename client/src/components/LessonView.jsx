import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Terminal as TerminalIcon, 
  AlertTriangle, 
  BookOpen, 
  FileCode, 
  Zap, 
  Send,
  Lightbulb,
  Check
} from 'lucide-react';
import { api } from '../services/api';

export default function LessonView({
  courseId,
  lessonId,
  user,
  onBack,
  onProgressUpdate,
  onOpenAiTutor
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('concept'); // 'concept' | 'quiz' | 'challenge'
  
  // Quiz state
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Editor & Runner state
  const [code, setCode] = useState('');
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [challengePassed, setChallengePassed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    loadLesson();
  }, [courseId, lessonId]);

  const loadLesson = async () => {
    setLoading(true);
    try {
      const res = await api.getLesson(courseId, lessonId);
      setData(res);
      if (res.lesson?.challenge?.starterCode) {
        setCode(res.lesson.challenge.starterCode);
      }
      // Check if user already passed quiz
      if (user?.quizResults?.[lessonId]?.passed) {
        setQuizSubmitted(true);
        setQuizResult({
          passed: true,
          score: 100,
          earnedXp: 0
        });
        setSelectedOption(res.lesson.quiz.correctIndex);
      } else {
        setSelectedOption(null);
        setQuizSubmitted(false);
        setQuizResult(null);
      }

      if (user?.completedChallenges?.includes(lessonId)) {
        setChallengePassed(true);
      } else {
        setChallengePassed(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCode = async () => {
    if (!data?.lesson) return;
    setRunning(true);
    setRunResult(null);
    try {
      const res = await api.runCode(data.language, code, stdin);
      setRunResult(res);
    } catch (err) {
      setRunResult({
        success: false,
        stdout: '',
        stderr: '網路或伺服器連線異常: ' + err.message,
        executionTime: 0,
        tips: null
      });
    } finally {
      setRunning(false);
    }
  };

  const handleVerifyChallenge = async () => {
    if (!data?.lesson?.challenge) return;
    setRunning(true);
    try {
      const res = await api.runCode(data.language, code, stdin);
      setRunResult(res);

      if (res.success) {
        // Check expected outputs
        const output = res.stdout.trim();
        const expected = data.lesson.challenge.expectedOutputs || [];
        const isMatch = expected.every(exp => output.includes(exp.trim()));

        if (isMatch) {
          setChallengePassed(true);
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
          const updateRes = await api.completeChallenge(lessonId, data.lesson.xp);
          if (onProgressUpdate) onProgressUpdate(updateRes.user);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (selectedOption === null || !data?.lesson?.quiz) return;
    setSubmittingQuiz(true);
    try {
      const res = await api.submitQuiz(
        lessonId,
        selectedOption,
        data.lesson.quiz.correctIndex,
        30
      );
      setQuizSubmitted(true);
      setQuizResult(res);
      if (res.passed) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5 }
        });
      }
      if (onProgressUpdate && res.user) {
        onProgressUpdate(res.user);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleResetCode = () => {
    if (data?.lesson?.challenge?.starterCode) {
      setCode(data.lesson.challenge.starterCode);
    }
  };

  if (loading || !data?.lesson) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        正在載入關卡內容與智慧編譯器...
      </div>
    );
  }

  const { lesson, language } = data;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden">
      {/* Lesson Header Navigation */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回地圖</span>
          </button>
          <div className="h-4 w-px bg-slate-700 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded">
                Stage {String(lesson.stage).padStart(2, '0')}
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {lesson.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Step Tabs Indicator */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('concept')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'concept'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. 觀念導讀</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>2. 隨堂測驗</span>
            {quizResult?.passed && <Check className="w-3 h-3 text-emerald-400" />}
          </button>

          <button
            onClick={() => setActiveTab('challenge')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'challenge'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>3. 上機挑戰</span>
            {challengePassed && <Check className="w-3 h-3 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Split Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Side: Learning Content & Quiz */}
        <div className="lg:col-span-5 border-r border-slate-800 bg-slate-900/60 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* TAB 1: CONCEPT */}
          {activeTab === 'concept' && (
            <div className="space-y-6">
              <div className="prose prose-invert prose-indigo max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {lesson.content.intro}
              </div>

              {/* Beginner Tips Alert */}
              {lesson.content.tips && (
                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>新手避坑指南 (Common Pitfalls)</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-amber-200/90 space-y-1">
                    {lesson.content.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setActiveTab('quiz')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow flex items-center gap-2"
                >
                  <span>觀念弄懂了，前往隨堂測驗</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: QUIZ */}
          {activeTab === 'quiz' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wide">
                <HelpCircle className="w-4 h-4" />
                <span>觀念隨堂測驗 (+30 XP)</span>
              </div>

              <h3 className="text-base font-bold text-white leading-snug">
                {lesson.quiz.question}
              </h3>

              <div className="space-y-3">
                {lesson.quiz.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === lesson.quiz.correctIndex;

                  let borderClass = 'border-slate-800 bg-slate-900 hover:border-slate-700';
                  if (isSelected && !quizSubmitted) {
                    borderClass = 'border-indigo-500 bg-indigo-950/40 text-white shadow-md';
                  } else if (quizSubmitted) {
                    if (isCorrect) {
                      borderClass = 'border-emerald-500 bg-emerald-950/30 text-emerald-200';
                    } else if (isSelected && !isCorrect) {
                      borderClass = 'border-rose-500 bg-rose-950/30 text-rose-200';
                    }
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => !quizSubmitted && setSelectedOption(idx)}
                      className={`p-3.5 rounded-xl border cursor-pointer text-xs sm:text-sm font-medium transition-all flex items-start gap-3 ${borderClass}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="flex-1 whitespace-pre-line">{opt}</span>
                    </div>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <button
                  disabled={selectedOption === null || submittingQuiz}
                  onClick={handleSubmitQuiz}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all shadow"
                >
                  {submittingQuiz ? '驗證中...' : '送出答案'}
                </button>
              ) : (
                <div className={`p-4 rounded-xl border space-y-2 ${
                  quizResult?.passed
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {quizResult?.passed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>恭喜答對！+30 XP 獲得</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>差一點點！再思考看看</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300">
                    {lesson.quiz.explanation}
                  </p>
                  {!quizResult?.passed && (
                    <button
                      onClick={() => {
                        setQuizSubmitted(false);
                        setSelectedOption(null);
                      }}
                      className="mt-2 text-xs font-bold text-indigo-400 underline hover:text-indigo-300"
                    >
                      重新作答 ↺
                    </button>
                  )}
                </div>
              )}

              {quizSubmitted && quizResult?.passed && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveTab('challenge')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow flex items-center gap-2"
                  >
                    <span>挑戰下一階段：上機寫 code</span>
                    <span>→</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CHALLENGE SPEC */}
          {activeTab === 'challenge' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wide">
                <FileCode className="w-4 h-4" />
                <span>上機挑戰題目規範 (+{lesson.xp} XP)</span>
              </div>

              <h3 className="text-lg font-bold text-white">
                {lesson.challenge.title}
              </h3>

              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                {lesson.challenge.instruction}
              </div>

              {/* Expected Output */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400">預期輸出結果包含：</span>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 space-y-1">
                  {lesson.challenge.expectedOutputs.map((exp, i) => (
                    <div key={i}>✓ {exp}</div>
                  ))}
                </div>
              </div>

              {/* Hint Accordion */}
              <div>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{showHint ? '隱藏提示' : '卡關了嗎？點我查看助教提示'}</span>
                </button>
                {showHint && (
                  <div className="mt-2 p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-xs text-cyan-200">
                    💡 {lesson.challenge.hint}
                  </div>
                )}
              </div>

              {challengePassed && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 space-y-2 animate-bounce">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>挑戰成功通過！🎉</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    太棒了！你已經徹底掌握了本關的核心語法並成功上機寫出正確程式！
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side: Monaco Code Editor & Terminal */}
        <div className="lg:col-span-7 flex flex-col h-full bg-slate-950 overflow-hidden">
          
          {/* Editor Header Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs font-mono text-slate-400">
                {language === 'python' ? 'main.py' : 'main.cpp'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetCode}
                title="重設為題目預設程式碼"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onOpenAiTutor(language, code, runResult?.stderr)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI 助教</span>
              </button>

              <button
                onClick={handleRunCode}
                disabled={running}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
              >
                <Play className="w-3.5 h-3.5 fill-current text-cyan-400" />
                <span>試跑</span>
              </button>

              <button
                onClick={handleVerifyChallenge}
                disabled={running}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{running ? '執行驗證中...' : '提交驗證'}</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-[300px] border-b border-slate-800">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language === 'python' ? 'python' : 'cpp'}
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: 14,
                fontFamily: 'Consolas, "Fira Code", monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                automaticLayout: true,
                tabSize: 4
              }}
            />
          </div>

          {/* Terminal Console */}
          <div className="h-56 flex flex-col bg-slate-950 text-slate-200">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <TerminalIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-mono font-bold text-slate-300">執行終端機 (Console)</span>
              </div>
              
              <div className="flex items-center gap-3">
                {runResult && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    耗時: {runResult.executionTime}ms
                  </span>
                )}
                <button
                  onClick={() => setShowStdin(!showStdin)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium"
                >
                  {showStdin ? '收起鍵盤輸入' : '傳入鍵盤輸入 (stdin)'}
                </button>
              </div>
            </div>

            {/* Stdin Drawer */}
            {showStdin && (
              <div className="p-2 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">鍵盤輸入:</span>
                <input
                  type="text"
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="例如: 25 或 字串 (供 input() / cin 讀取)"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* Output Display */}
            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-2 select-text">
              {running ? (
                <div className="flex items-center gap-2 text-indigo-400 animate-pulse">
                  <span>● 程式編譯並執行中...</span>
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

                  {/* AI Chinese Diagnostic Tips */}
                  {runResult.tips && runResult.tips.length > 0 && (
                    <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-lg p-3 space-y-2 mt-2">
                      <div className="flex items-center gap-2 text-indigo-300 font-bold">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span>AI 助教智能除錯建議</span>
                      </div>
                      {runResult.tips.map((tip, idx) => (
                        <div key={idx} className="text-[11px] text-slate-200">
                          <span className="font-bold text-amber-400">[{tip.type}]</span> {tip.tip}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-slate-600 italic">
                  尚未執行程式碼。點擊右上角「試跑」或「提交驗證」查看輸出！
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
