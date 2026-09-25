# CodeCraft Academy (程式匠人學院)
> 專為程式初學者打造的現代化全端互動式教學平台，引導學習者從「完全初學 (Day 0)」循序漸進到「具備獨立編寫 Python 與 C++ 實戰專案」的能力。

---

## 🌟 核心特色與架構亮點

### 1. 雙軌化完整學習地圖 (Curriculum Roadmaps)
- 🐍 **Python 學習軌道 (8 大關卡)**：
  1. 初探程式世界與 `print()` 輸出、字串與註解
  2. 變數與資料的百寶箱 (`int`, `float`, `str`, `bool`, `f-string`)
  3. 運算子與數學魔術 (四則運算、整除 `//`、取餘數 `%`、次方 `**`)
  4. 程式的分岔路口 (`if-elif-else`、條件判斷、縮排重要性)
  5. 讓電腦重複打工 (for 迴圈、`range()`、while 迴圈、`break`/`continue`)
  6. 函式封裝與積木化思考 (`def`、參數傳遞、`return` 成果回傳)
  7. 資料容器管理 (List 串列、Dictionary 字典、Key-Value 查閱)
  8. 物件導向初探 (Class 類別、`__init__`、物件狀態與方法)

- ⚡ **C++ 高效能學習軌道 (8 大關卡)**：
  1. 踏入 C++ 殿堂 (`#include <iostream>`, `main()` 進入點, `std::cout`)
  2. 強型別變數與記憶體概念 (`int`, `double`, `char`, `bool`, `string`)
  3. 鍵盤輸入與人機互動 (`std::cin >>`, 串流方向)
  4. 條件控制與邏輯判斷 (`if-else`, 邏輯運算子 `&&`, `||`, `!`)
  5. 重複運算與迴圈控制 (`for (init; cond; step)`, `while`)
  6. 模組化函式與記憶體傳遞 (Pass by Value 傳值 vs **Pass by Reference 傳參考 `&`**)
  7. 現代容器 `std::vector` (動態陣列、`.push_back()`, `.size()`)
  8. 指標與記憶體位址 (位址運算子 `&`、解參考 `*`、記憶體門牌號碼概念)

---

### 2. 三階段漸進學習閉環
每一關皆包含：
1. **觀念圖解導讀**：生活化通俗比喻 + 語法拆解 + 範例。
2. **新手避坑指南**：點出初學者最常犯的語法地雷（如分號遺漏、縮排錯誤、型態不相容）。
3. **觀念隨堂測驗 (Quiz)**：互動式 4 選 1 測驗，答題即時反饋、解析與獲取 XP 獎勵。
4. **上機實作挑戰 (Challenge)**：內嵌 Monaco Editor，提供骨架程式碼、提示與預期輸出自動驗證。

---

### 3. 八大真實實戰專案工坊 (Project Workbench)
- **Python 專案**：
  1. 智慧猜數字對戰遊戲 (Guess the Number)
  2. 個人收支記帳與財務統計工具 (Personal Expense Tracker)
  3. 強固密碼產生器與安全性評估儀 (Password Master)
  4. 文字 RPG 地城冒險遊戲 (OOP 物件導向對戰)
- **C++ 專案**：
  1. 多功能指令列計算機 (CLI Calculator with Error Handling)
  2. 學生成績統計與排名系統 (Student Grade System)
  3. 終端機 3x3 井字棋對戰 (Tic-Tac-Toe Game)
  4. 銀行帳戶物件導向類別系統 (Bank Account OOP Class Design)

每個專案配備：
- 規格說明與架構目標
- 互動式「開發里程碑檢核表 (Checklist)」
- 骨架程式碼 (Starter Code with TODOs)
- 完整參考解答抽屜 (可隨時觀摩學習專業寫法)
- 草稿自動儲存與結案頒獎

---

### 4. 內建即時執行引擎與 AI 智能除錯提示
- **Python 引擎**：本機安全隔離執行，支援 `stdin` 鍵盤輸入與逾時防護。
- **C++ 引擎**：本機編譯器自動偵測 + 高效能雲端編譯沙盒備援，零安裝門檻隨開即用！
- **AI 智能報錯轉譯**：將冷冰冰的編譯錯誤或例外訊息，自動轉化為初學者看得懂的繁體中文引導建議！
- **AI 學習助教 (AiTutorModal)**：卡關時提供啟發式思考提示與除錯諮詢。

---

### 5. 遊戲化激勵機制與多使用者帳號
- ⚡ **經驗值 (XP) 與等級晉升** (初學學徒 ➔ 初階程式員 ➔ 程式探索家 ➔ 專案實踐家 ➔ 程式工匠大師)
- 🔥 **連續學習日數 (Streak)**
- 🏆 **里程碑勳章庫** (啟程冒險者、邏輯分析師、專案實踐家、雙刀流工程師、程式大師)
- 👤 **多使用者存檔與雲端進度同步**

---

## 🚀 快速啟動方式

本平台伺服器已內建前端整合打包服務，只需單一指令即可啟動：

```bash
# 啟動整合伺服器 (包含後端 API 與前端 UI)
npm start
```

開啟瀏覽器造訪：
👉 **http://localhost:5000**

---

## 🛠️ 開發模式指令

```bash
# 同時開發後端與前端 (熱重載模式)
npm run server       # 啟動後端 API (port 5000)
npm run client       # 啟動 Vite 前端熱更新 (port 5173，已配置 API Proxy)

# 重新建置前端靜態資源
npm run build
```
