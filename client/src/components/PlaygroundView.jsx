import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  RotateCcw, 
  Download, 
  Copy, 
  Check, 
  Terminal as TerminalIcon, 
  Sparkles, 
  Code2,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';

const SAMPLE_SNIPPETS = {
  python: [
    {
      name: '九九乘法表 (巢狀迴圈)',
      code: `# 巢狀迴圈：九九乘法表\nfor i in range(1, 10):\n    line = ""\n    for j in range(1, 10):\n        line += f"{j}x{i}={i*j:2d}  "\n    print(line)\n`
    },
    {
      name: '字串倒轉與迴文檢測',
      code: `def is_palindrome(text):\n    clean = text.lower().replace(" ", "")\n    return clean == clean[::-1]\n\nwords = ["radar", "Python", "level", "algorithm"]\nfor w in words:\n    status = "是迴文" if is_palindrome(w) else "不是迴文"\n    print(f"'{w}': {status}")\n`
    },
    {
      name: '簡易個人記帳字典',
      code: `ledger = [\n    {"desc": "早餐三明治", "amount": 65},\n    {"desc": "午餐便當", "amount": 110},\n    {"desc": "文具筆記本", "amount": 50}\n]\n\ntotal = sum(item["amount"] for item in ledger)\nprint(f"本日總花費: {total} 元")\nfor item in ledger:\n    print(f"- {item['desc']}: \${item['amount']}")\n`
    }
  ],
  cpp: [
    {
      name: 'C++ 向量 std::vector 範例',
      code: `#include <iostream>\n#include <vector>\n#include <numeric>\nusing namespace std;\n\nint main() {\n    vector<int> numbers = {10, 20, 30, 40, 50};\n    numbers.push_back(60);\n    \n    int sum = 0;\n    cout << "容器元素: ";\n    for (int n : numbers) {\n        cout << n << " ";\n        sum += n;\n    }\n    cout << endl;\n    cout << "總和: " << sum << "，平均: " << (double)sum / numbers.size() << endl;\n    return 0;\n}\n`
    },
    {
      name: '指標與記憶體位址展示',
      code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int original = 42;\n    int *ptr = &original;\n    \n    cout << "變數數值: " << original << endl;\n    cout << "記憶體門牌位址: " << ptr << endl;\n    \n    *ptr = 99; // 透過指標解參考修改數值\n    cout << "透過指標修改後的新數值: " << original << endl;\n    return 0;\n}\n`
    },
    {
      name: '雙維度矩陣乘法運算',
      code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    for (int i = 1; i <= 9; i++) {\n        for (int j = 1; j <= 9; j++) {\n            cout << j << "x" << i << "=" << (i * j) << "\\t";\n        }\n        cout << endl;\n    }\n    return 0;\n}\n`
    }
  ]
};

export default function PlaygroundView({ onOpenAiTutor }) {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(SAMPLE_SNIPPETS.python[0].code);
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSelectSnippet = (snippet) => {
    setCode(snippet.code);
    setRunResult(null);
  };

  const handleSwitchLanguage = (lang) => {
    setLanguage(lang);
    setCode(SAMPLE_SNIPPETS[lang][0].code);
    setRunResult(null);
  };

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await api.runCode(language, code, stdin);
      setRunResult(res);
    } catch (e) {
      setRunResult({
        success: false,
        stdout: '',
        stderr: '執行發生錯誤: ' + e.message,
        executionTime: 0,
        tips: null
      });
    } finally {
      setRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = language === 'python' ? 'py' : 'cpp';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codecraft_playground.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden">
      {/* Playground Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <span className="font-extrabold text-sm text-white">自由代碼實驗室</span>
          </div>

          {/* Lang Selector */}
          <div className="flex items-center p-0.5 bg-slate-800 rounded-lg border border-slate-700">
            <button
              onClick={() => handleSwitchLanguage('python')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                language === 'python'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🐍 Python
            </button>
            <button
              onClick={() => handleSwitchLanguage('cpp')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                language === 'cpp'
                  ? 'bg-blue-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚡ C++
            </button>
          </div>

          {/* Preset Samples Selector */}
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">載入經典範本:</span>
            {SAMPLE_SNIPPETS[language].map((snippet, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSnippet(snippet)}
                className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
              >
                {snippet.name}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            title="複製程式碼"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? '已複製' : '複製'}</span>
          </button>

          <button
            onClick={handleDownload}
            title="下載程式檔案"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">下載檔案</span>
          </button>

          <button
            onClick={() => onOpenAiTutor(language, code, runResult?.stderr)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI 諮詢</span>
          </button>

          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 hover:opacity-95 text-slate-950 font-bold text-xs transition-all shadow"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{running ? '執行中...' : '執行代碼'}</span>
          </button>
        </div>
      </div>

      {/* Editor & Console Split */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Monaco Editor */}
        <div className="flex-1 min-h-[300px]">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language === 'python' ? 'python' : 'cpp'}
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              fontSize: 14,
              fontFamily: 'Consolas, "Fira Code", monospace',
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              automaticLayout: true
            }}
          />
        </div>

        {/* Terminal Output */}
        <div className="h-64 flex flex-col bg-slate-950 border-t border-slate-800 text-slate-200">
          <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono font-bold text-slate-300">沙盒執行終端機</span>
            </div>

            <div className="flex items-center gap-3">
              {runResult && (
                <span className="text-[11px] text-slate-400 font-mono">
                  耗時: {runResult.executionTime}ms
                </span>
              )}
              <button
                onClick={() => setShowStdin(!showStdin)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-medium"
              >
                {showStdin ? '收起 stdin' : '設定鍵盤輸入 stdin'}
              </button>
            </div>
          </div>

          {showStdin && (
            <div className="p-2 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">鍵盤輸入 stdin:</span>
              <input
                type="text"
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="傳入 input() 或 cin 欲讀取的文字"
                className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-2 select-text">
            {running ? (
              <div className="flex items-center gap-2 text-indigo-400 animate-pulse">
                <span>● 正在執行您的程式碼...</span>
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
                {runResult.tips && runResult.tips.length > 0 && (
                  <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-lg p-3 space-y-2 mt-2">
                    <div className="flex items-center gap-2 text-indigo-300 font-bold">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>AI 智能除錯分析</span>
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
                在上方編輯器撰寫任意程式碼，點擊「執行代碼」查看成果！
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
