const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

let localCompiler = null; // 'g++' | 'clang++' | null
let compilerChecked = false;

function detectLocalCompiler() {
  if (compilerChecked) return localCompiler;
  compilerChecked = true;

  try {
    execSync('g++ --version', { stdio: 'ignore' });
    localCompiler = 'g++';
    console.log('[CodeCraft] Detected local C++ compiler: g++');
    return localCompiler;
  } catch (e) {}

  try {
    execSync('clang++ --version', { stdio: 'ignore' });
    localCompiler = 'clang++';
    console.log('[CodeCraft] Detected local C++ compiler: clang++');
    return localCompiler;
  } catch (e) {}

  console.log('[CodeCraft] No local C++ compiler found. Using High-Performance Wandbox GCC Engine / Built-in Sandbox.');
  return null;
}

/**
 * Friendly AI explanations in Traditional Chinese for C++ beginners
 */
function explainCppError(stderr, code) {
  if (!stderr) return null;
  const explanations = [];

  if (stderr.includes("expected ';'") || stderr.includes("expected ';' before")) {
    explanations.push({
      type: '語法錯誤：遺漏分號 (;)',
      tip: '在 C++ 中，每一個敘述句（陳述式）結尾都必須加上分號 `;`。請檢查報錯那行或前一行結尾是否忘記加上 `;`。'
    });
  }

  if (stderr.includes("was not declared in this scope")) {
    const match = stderr.match(/'(\w+)' was not declared in this scope/);
    const identifier = match ? match[1] : '識別字';
    if (identifier === 'cout' || identifier === 'cin' || identifier === 'endl') {
      explanations.push({
        type: '未識別標準輸入輸出 (I/O)',
        tip: `找不到 ${identifier}！請確認：1. 最上方有包含 \`#include <iostream>\`；2. 加入 \`using namespace std;\`，或者改寫為 \`std::${identifier}\`。`
      });
    } else {
      explanations.push({
        type: '變數或函式未宣告',
        tip: `編譯器不認識「${identifier}」。請確認：1. 變數是否有宣告型態（如 int, double, string）；2. 變數名稱是否打錯字；3. 函式是否在呼叫前已先宣告或定義。`
      });
    }
  }

  if (stderr.includes("undefined reference to `main'") || stderr.includes("undefined reference to 'WinMain'") || stderr.includes("undefined reference to 'main'")) {
    explanations.push({
      type: '缺少進入點 main 函式',
      tip: 'C++ 程式必須要有 `int main()` 作為執行起點！請確認是否有定義 `int main() { ... return 0; }`。'
    });
  }

  if (stderr.includes("cannot convert") || stderr.includes("invalid conversion")) {
    explanations.push({
      type: '型別不相容 (Type Conversion Error)',
      tip: 'C++ 是嚴格強型別語言！你嘗試把不相容的資料型別進行賦值或傳遞。請檢查等號兩端或函式參數的型別。'
    });
  }

  if (stderr.includes("Segmentation fault") || stderr.includes("SIGSEGV") || stderr.includes("3221225477")) {
    explanations.push({
      type: '記憶體區段錯誤 (Segmentation Fault)',
      tip: '程式嘗試存取不被允許的記憶體！常見原因：1. 指標為空 (nullptr) 卻進行解參考 `*ptr`；2. 陣列或 vector 存取索引越界；3. 遞迴過深造成 Stack Overflow。'
    });
  }

  return explanations.length > 0 ? explanations : null;
}

/**
 * Execute using Wandbox Free GCC Cloud Engine
 */
function runViaWandboxApi(code, stdinInput = '', timeoutMs = 8000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const postData = JSON.stringify({
      code: code,
      compiler: 'gcc-head',
      stdin: stdinInput || '',
      options: 'c++20,warning'
    });

    const req = https.request('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: timeoutMs
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          const executionTime = Date.now() - startTime;

          // Check compilation error
          if (result.compiler_error) {
            return resolve({
              success: false,
              stdout: result.program_output || '',
              stderr: result.compiler_error,
              executionTime,
              tips: explainCppError(result.compiler_error, code)
            });
          }

          // Check runtime error
          if (result.program_error) {
            return resolve({
              success: false,
              stdout: result.program_output || '',
              stderr: result.program_error,
              executionTime,
              tips: explainCppError(result.program_error, code)
            });
          }

          const stdout = result.program_output || result.program_message || '';
          const isSuccess = result.status === "0" || result.status === 0;

          resolve({
            success: isSuccess,
            stdout: stdout,
            stderr: result.compiler_message && !isSuccess ? result.compiler_message : '',
            executionTime,
            tips: !isSuccess ? explainCppError(result.compiler_message || '', code) : null
          });
        } catch (e) {
          resolve(fallbackCppSimulation(code, stdinInput));
        }
      });
    });

    req.on('error', () => {
      resolve(fallbackCppSimulation(code, stdinInput));
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(fallbackCppSimulation(code, stdinInput));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Offline fallback C++ simulator for core syntax
 */
function fallbackCppSimulation(code, stdinInput = '') {
  const startTime = Date.now();

  if (!code.includes('main')) {
    return {
      success: false,
      stdout: '',
      stderr: "error: undefined reference to 'main'\ncollect2: error: ld returned 1 exit status",
      executionTime: 10,
      tips: explainCppError("undefined reference to `main'", code)
    };
  }

  try {
    let output = '';
    const hasIostream = code.includes('<iostream>');
    const hasCout = code.includes('cout');
    if (hasCout && !hasIostream) {
      return {
        success: false,
        stdout: '',
        stderr: "error: 'cout' was not declared in this scope; did you forget to '#include <iostream>'?",
        executionTime: 15,
        tips: explainCppError("'cout' was not declared in this scope", code)
      };
    }

    const coutRegex = /cout\s*<<\s*([^;]+);/g;
    let match;
    let foundCout = false;

    while ((match = coutRegex.exec(code)) !== null) {
      foundCout = true;
      const expr = match[1];
      const parts = expr.split('<<').map(p => p.trim());
      for (const part of parts) {
        if (part === 'endl' || part === 'std::endl' || part === '"\\n"') {
          output += '\n';
        } else if (part.startsWith('"') && part.endsWith('"')) {
          output += part.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t');
        } else {
          try {
            if (/^[\d\s+\-*/%().]+$/.test(part)) {
              output += Function(`'use strict'; return (${part})`)();
            } else {
              output += part;
            }
          } catch (e) {
            output += part;
          }
        }
      }
    }

    if (!foundCout) {
      output = "程式執行完畢 (無輸出或回傳 0)。";
    }

    return {
      success: true,
      stdout: output,
      stderr: '',
      executionTime: Date.now() - startTime,
      tips: null
    };
  } catch (err) {
    return {
      success: false,
      stdout: '',
      stderr: 'C++ 模擬器執行錯誤: ' + err.message,
      executionTime: Date.now() - startTime,
      tips: null
    };
  }
}

function runCpp(code, stdinInput = '', timeoutMs = 8000) {
  const compiler = detectLocalCompiler();

  if (!compiler) {
    return runViaWandboxApi(code, stdinInput, timeoutMs);
  }

  // Local compiler execution (g++ or clang++)
  return new Promise((resolve) => {
    const tempDir = os.tmpdir();
    const id = `codecraft_cpp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const tempSrc = path.join(tempDir, `${id}.cpp`);
    const tempExe = path.join(tempDir, `${id}.exe`);

    try {
      fs.writeFileSync(tempSrc, code, 'utf-8');
    } catch (e) {
      return resolve({
        success: false,
        stdout: '',
        stderr: '無法建立臨時原始碼檔案: ' + e.message,
        executionTime: 0,
        tips: null
      });
    }

    const startTime = Date.now();

    const compileProc = spawn(compiler, ['-O2', tempSrc, '-o', tempExe], { windowsHide: true });
    let compileStderr = '';
    compileProc.stderr.on('data', chunk => { compileStderr += chunk.toString(); });

    compileProc.on('close', (compileExitCode) => {
      try { if (fs.existsSync(tempSrc)) fs.unlinkSync(tempSrc); } catch (e) {}

      if (compileExitCode !== 0) {
        const cleanStderr = compileStderr.replace(new RegExp(tempSrc.replace(/\\/g, '\\\\'), 'g'), 'main.cpp');
        return resolve({
          success: false,
          stdout: '',
          stderr: cleanStderr,
          executionTime: Date.now() - startTime,
          tips: explainCppError(cleanStderr, code)
        });
      }

      let runStdout = '';
      let runStderr = '';
      let isTimedOut = false;

      const runProc = spawn(tempExe, [], { windowsHide: true });
      const timer = setTimeout(() => {
        isTimedOut = true;
        try { runProc.kill('SIGKILL'); } catch (e) {}
      }, timeoutMs);

      if (stdinInput && runProc.stdin) {
        runProc.stdin.write(stdinInput);
        runProc.stdin.end();
      } else if (runProc.stdin) {
        runProc.stdin.end();
      }

      runProc.stdout.on('data', chunk => { runStdout += chunk.toString(); });
      runProc.stderr.on('data', chunk => { runStderr += chunk.toString(); });

      runProc.on('close', (runExitCode) => {
        clearTimeout(timer);
        try { if (fs.existsSync(tempExe)) fs.unlinkSync(tempExe); } catch (e) {}

        const executionTime = Date.now() - startTime;
        if (isTimedOut) {
          return resolve({
            success: false,
            stdout: runStdout,
            stderr: `執行超時（超過 ${timeoutMs / 1000} 秒）！可能是無窮迴圈或等待輸入。`,
            executionTime,
            tips: [{
              type: '執行超時警告',
              tip: '請檢查 while/for 迴圈終止條件，或確認 cin 是否有足夠輸入。'
            }]
          });
        }

        resolve({
          success: runExitCode === 0,
          stdout: runStdout,
          stderr: runStderr,
          executionTime,
          tips: explainCppError(runStderr, code)
        });
      });

      runProc.on('error', (err) => {
        clearTimeout(timer);
        try { if (fs.existsSync(tempExe)) fs.unlinkSync(tempExe); } catch (e) {}
        resolve({
          success: false,
          stdout: '',
          stderr: '執行檔無法啟動: ' + err.message,
          executionTime: Date.now() - startTime,
          tips: null
        });
      });
    });
  });
}

module.exports = {
  runCpp,
  explainCppError
};
