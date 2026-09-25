import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, Lightbulb, Code } from 'lucide-react';
import { api } from '../services/api';

export default function AiTutorModal({
  isOpen,
  onClose,
  language,
  code,
  currentError
}) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `嗨！我是你的 AI 程式助教 🤖\n\n有遇到任何看不懂的語法、想不通的邏輯，或是被紅色報錯訊息卡住了嗎？\n請隨時告訴我，我會用淺顯易懂的生活比喻引導你，陪伴你從完全初學成為獨立程式設計師！`
    }
  ]);

  if (!isOpen) return null;

  const handleSend = async (customPrompt) => {
    const q = customPrompt || question;
    if (!q.trim() || loading) return;

    const userMsg = { sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setQuestion('');
    setLoading(true);

    try {
      const res = await api.askAiTutor(language, q, code, currentError);
      const aiMsg = { sender: 'ai', text: res.advice || '助教正在思考中，請嘗試重新提出問題！' };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: '助教連線稍微忙碌中，但請記住：檢查語法標點與變數宣告是解決八成問題的法寶！' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[580px]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border-b border-indigo-500/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">CodeCraft AI 學習助教</h3>
              <p className="text-xs text-indigo-300">專為程式初學者設計的友善解惑夥伴</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-6 py-2.5 bg-slate-950/50 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-500 shrink-0">常見提問:</span>
          {currentError ? (
            <button
              onClick={() => handleSend(`請用初學者能懂的語言幫我解釋這個報錯：${currentError}`)}
              className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 whitespace-nowrap transition-colors"
            >
              ⚠️ 解釋目前的報錯原因
            </button>
          ) : null}
          <button
            onClick={() => handleSend('請給我這道題目的思考方向，不要直接給我最終答案，引導我思考。')}
            className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 whitespace-nowrap transition-colors"
          >
            💡 給我思考方向提示
          </button>
          <button
            onClick={() => handleSend(`在 ${language === 'python' ? 'Python' : 'C++'} 中，初學者最容易踩的語法地雷有哪些？`)}
            className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 whitespace-nowrap transition-colors"
          >
            🧭 避坑重點提醒
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-indigo-400 animate-pulse">
              <Bot className="w-5 h-5 text-indigo-400" />
              <span>助教正在組織淺顯易懂的解釋中...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="請輸入你想詢問的程式觀念或遇到的困難..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Send className="w-4 h-4" />
              <span>提問</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
