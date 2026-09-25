const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Friendly AI-style error explanations in Traditional Chinese for Python beginners
 */
function explainPythonError(stderr, code) {
  if (!stderr) return null;

  const explanations = [];

  if (stderr.includes('IndentationError')) {
    explanations.push({
      type: '縮排錯誤 (IndentationError)',
      tip: 'Python 非常重視縮排！程式區塊（如 if, for, while, def 內部）必須靠空格或 Tab 對齊。請檢查報錯那行的前導空白是否不一致。'
    });
  } else if (stderr.includes('SyntaxError: invalid syntax')) {
    explanations.push({
      type: '語法錯誤 (SyntaxError)',
      tip: '這行程式碼的寫法電腦看不懂。常見原因：1. if/for/while/def 結尾漏掉了冒號 `:`；2. 括號 `()` 或引號 `""` 沒有成對閉合；3. 等於比較寫成單個 `=` 而非雙等號 `==`。'
    });
  } else if (stderr.includes('NameError')) {
    const match = stderr.match(/name '(\w+)' is not defined/);
    const varName = match ? match[1] : '該名稱';
    explanations.push({
      type: '名稱未定義 (NameError)',
      tip: `電腦找不到叫做「${varName}」的變數或函式。請檢查：1. 是否打錯字（大小寫有差！）；2. 是否還沒宣告就先拿來用？3. 是否忘記用引號把它包成字串？`
    });
  } else if (stderr.includes('TypeError')) {
    if (stderr.includes('can only concatenate str')) {
      explanations.push({
        type: '型別不相容 (TypeError)',
        tip: '你嘗試把「字串」和「數字」直接用 `+` 串接在一起！請用 `str(數字)` 將數字轉為字串，或使用 f-string：`f"結果是: {變數}"`。'
      });
    } else {
      explanations.push({
        type: '型別錯誤 (TypeError)',
        tip: '你傳入了不支援的操作型別或錯誤數量的函式參數。請檢查參與運算或呼叫的變數型態。'
      });
    }
  } else if (stderr.includes('IndexError: list index out of range')) {
    explanations.push({
      type: '索引超出範圍 (IndexError)',
      tip: '你嘗試讀取串列 (List) 中不存在的號碼！請記住：Python 索引從 0 開始，如果長度為 3，合法的索引只有 0, 1, 2。'
    });
  } else if (stderr.includes('ZeroDivisionError')) {
    explanations.push({
      type: '除以零錯誤 (ZeroDivisionError)',
      tip: '在數學和程式中，任何數除以 0 都是未定義的！請確認除數變數是否剛好為 0。'
    });
  } else if (stderr.includes('RecursionError')) {
    explanations.push({
      type: '遞迴過深 (RecursionError)',
      tip: '函式自我呼叫次數過多導致記憶體堆疊溢位，通常是忘記寫「終止條件 (Base Case)」，形成無限遞迴。'
    });
  }

  return explanations.length > 0 ? explanations : null;
}

function runPython(code, stdinInput = '', timeoutMs = 5000) {
  return new Promise((resolve) => {
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `codecraft_py_${Date.now()}_${Math.random().toString(36).substring(7)}.py`);

    try {
      fs.writeFileSync(tempFile, code, 'utf-8');
    } catch (err) {
      return resolve({
        success: false,
        stdout: '',
        stderr: '無法建立臨時執行檔案: ' + err.message,
        executionTime: 0,
        tips: null
      });
    }

    const startTime = Date.now();
    let stdoutData = '';
    let stderrData = '';
    let isTimedOut = false;

    // Use system python executable
    const proc = spawn('python', [tempFile], {
      windowsHide: true
    });

    const timer = setTimeout(() => {
      isTimedOut = true;
      try {
        proc.kill('SIGKILL');
      } catch (e) {}
    }, timeoutMs);

    if (stdinInput && proc.stdin) {
      proc.stdin.write(stdinInput);
      proc.stdin.end();
    } else if (proc.stdin) {
      proc.stdin.end();
    }

    proc.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    proc.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    proc.on('close', (exitCode) => {
      clearTimeout(timer);
      const executionTime = Date.now() - startTime;

      try {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      } catch (e) {}

      if (isTimedOut) {
        return resolve({
          success: false,
          stdout: stdoutData,
          stderr: `執行超時（超過 ${timeoutMs / 1000} 秒）！通常是因為進入了無限迴圈 (Infinite Loop)，例如 while 條件永遠為 True。`,
          executionTime,
          tips: [{
            type: '執行超時警告',
            tip: '請檢查 while 或 for 迴圈中的變數是否有正常遞增或滿足終止條件，避免造成程式卡死。'
          }]
        });
      }

      // Filter out absolute path in stderr for cleaner beginner output
      const cleanStderr = stderrData.replace(new RegExp(tempFile.replace(/\\/g, '\\\\'), 'g'), 'main.py');
      const tips = explainPythonError(cleanStderr, code);

      resolve({
        success: exitCode === 0,
        stdout: stdoutData,
        stderr: cleanStderr,
        executionTime,
        tips
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      try {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      } catch (e) {}

      resolve({
        success: false,
        stdout: '',
        stderr: 'Python 執行行程啟動失敗: ' + err.message,
        executionTime: Date.now() - startTime,
        tips: null
      });
    });
  });
}

module.exports = {
  runPython,
  explainPythonError
};
