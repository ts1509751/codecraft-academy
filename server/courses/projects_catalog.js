module.exports = [
  // --- PYTHON PROJECTS ---
  {
    id: 'proj-py-guess-number',
    language: 'python',
    title: 'Python 實戰專案 1：智慧猜數字對戰遊戲',
    difficulty: '入門初階',
    xpReward: 150,
    summary: '結合 random 模組、while 迴圈與 if 判斷，親手寫出經典的電腦猜數字小遊戲，並加入提示與次數統計！',
    objectives: [
      '使用 random.randint(1, 100) 產生神秘數字',
      '使用 while 迴圈持續讓玩家猜測，直到猜中為止',
      '根據玩家輸入提示「太大了！」或「太小了！」',
      '統計玩家共猜了幾次，猜中時頒發榮譽評價'
    ],
    starterCode: `import random

def play_game():
    print("=== 歡迎來到 1~100 猜數字挑戰賽 ===")
    secret = random.randint(1, 100)
    attempts = 0
    
    # 模擬測試用預設猜測序列 (正式遊玩時可改為 input)
    test_guesses = [50, 75, secret] 
    
    for guess in test_guesses:
        attempts += 1
        print(f"玩家猜測: {guess}")
        
        # TODO: 請在此加入 if-elif-else 判斷太大了、太小了或猜中了！
        if guess > secret:
            print("太大了！往小一點猜～")
        elif guess < secret:
            print("太小了！往大一點猜～")
        else:
            print(f"恭喜猜中！答案就是 {secret}！")
            print(f"總共花費了 {attempts} 次猜測！")
            break

play_game()
`,
    solutionCode: `import random

def play_game():
    print("=== 歡迎來到 1~100 猜數字挑戰賽 ===")
    secret = 68
    attempts = 0
    guesses = [50, 80, 68]
    
    for guess in guesses:
        attempts += 1
        print(f"玩家猜測: {guess}")
        if guess > secret:
            print("太大了！往小一點猜～")
        elif guess < secret:
            print("太小了！往大一點猜～")
        else:
            print(f"恭喜猜中！答案就是 {secret}！")
            print(f"總共花費了 {attempts} 次猜測！")
            break

play_game()
`
  },
  {
    id: 'proj-py-expense-tracker',
    language: 'python',
    title: 'Python 實戰專案 2：個人收支記帳與財務統計工具',
    difficulty: '實戰進階',
    xpReward: 200,
    summary: '利用 List 與 Dict 資料結構，打造一個可記錄收支、分類統計（飲食、交通、娛樂）並產出報表的財務小幫手。',
    objectives: [
      '用串列存放每筆記帳字典 { "item": 名稱, "amount": 金額, "category": 分類 }',
      '實作 add_expense() 函式新增開銷',
      '計算總支出金額與各分類的佔比',
      '印出整齊的統計報表'
    ],
    starterCode: `def create_tracker():
    expenses = []
    
    def add_expense(item, amount, category):
        # TODO: 將字典新增至 expenses 串列中
        pass

    def generate_report():
        # TODO: 統計總支出並按類別加總
        pass

    return add_expense, generate_report

# 測試用流程
# add_expense("午餐牛肉麵", 160, "飲食")
# add_expense("悠遊卡加值", 500, "交通")
# add_expense("電影票", 320, "娛樂")
`,
    solutionCode: `expenses = []

def add_expense(item, amount, category):
    expenses.append({"item": item, "amount": amount, "category": category})
    print(f"已記錄開銷: {item} - {amount} 元 [{category}]")

def generate_report():
    total = sum(e["amount"] for e in expenses)
    print("\\n=== 個人財務支出報表 ===")
    print(f"總筆數: {len(expenses)} 筆")
    print(f"總支出金額: {total} 元")
    
    by_category = {}
    for e in expenses:
        cat = e["category"]
        by_category[cat] = by_category.get(cat, 0) + e["amount"]
        
    print("--- 各類別花費明細 ---")
    for cat, amt in by_category.items():
        percent = (amt / total) * 100 if total > 0 else 0
        print(f"- {cat}: {amt} 元 ({percent:.1f}%)")

add_expense("午餐牛肉麵", 160, "飲食")
add_expense("悠遊卡加值", 500, "交通")
add_expense("電影票", 320, "娛樂")
add_expense("晚餐火鍋", 450, "飲食")
generate_report()
`
  },
  {
    id: 'proj-py-password-generator',
    language: 'python',
    title: 'Python 實戰專案 3：密碼安全產生器與強度評估儀',
    difficulty: '實戰進階',
    xpReward: 200,
    summary: '整合 string 與 random 模組，自訂長度、大寫字母、數字與特殊符號產生隨機密碼，並檢測其防護強度。',
    objectives: [
      '使用 string.ascii_letters, string.digits, string.punctuation 組合字符池',
      '隨機抽取指定長度的字元組成安全密碼',
      '撰寫 evaluate_strength() 函式依長度與字元多樣性評分 (弱 / 中 / 強)'
    ],
    starterCode: `import random
import string

def generate_password(length=12, include_special=True):
    # TODO: 組合可用字元池並隨機抽樣產生密碼
    return ""

def evaluate_strength(pwd):
    # TODO: 判斷長度、是否含數字、大寫與符號
    return "尚未評估"

# 測試產生
pwd = generate_password(12)
print(f"產生密碼: {pwd}")
`,
    solutionCode: `import random
import string

def generate_password(length=12, include_special=True):
    chars = string.ascii_letters + string.digits
    if include_special:
        chars += "!@#$%^&*()_+"
    
    # 確保隨機挑選
    pwd = "".join(random.choice(chars) for _ in range(length))
    return pwd

def evaluate_strength(pwd):
    score = 0
    if len(pwd) >= 10: score += 1
    if any(c.isupper() for c in pwd): score += 1
    if any(c.isdigit() for c in pwd): score += 1
    if any(c in "!@#$%^&*()_+" for c in pwd): score += 1
    
    if score >= 4: return "極高 (Strong) 🛡️"
    elif score >= 2: return "中等 (Medium) ⚠️"
    else: return "脆弱 (Weak) ❌"

sample = generate_password(14, True)
print(f"已生成密碼: {sample}")
print(f"安全等級: {evaluate_strength(sample)}")
`
  },
  {
    id: 'proj-py-text-rpg',
    language: 'python',
    title: 'Python 實戰專案 4：文字 RPG 地城冒險 (OOP 物件導向)',
    difficulty: '進階挑戰',
    xpReward: 250,
    summary: '運用物件導向 Class，設計英雄角色 Hero 與怪物 Monster，實現回合制戰鬥、技能攻擊與經驗升級系統！',
    objectives: [
      '定義 Character 基礎類別，並衍生出 Hero 與 Monster',
      '實作 attack() 攻擊計算與 take_damage() 扣血邏輯',
      '編寫回合制戰鬥迴圈，直到一方生命值歸零'
    ],
    starterCode: `class Hero:
    def __init__(self, name, hp, attack_power):
        self.name = name
        self.hp = hp
        self.attack_power = attack_power

    # TODO: 實作 attack 與 take_damage 方法
    pass

class Monster:
    def __init__(self, name, hp, attack_power):
        self.name = name
        self.hp = hp
        self.attack_power = attack_power

# 模擬戰鬥
`,
    solutionCode: `class Entity:
    def __init__(self, name, hp, atk):
        self.name = name
        self.hp = hp
        self.atk = atk

    def is_alive(self):
        return self.hp > 0

    def take_damage(self, dmg):
        self.hp = max(0, self.hp - dmg)
        print(f"💥 {self.name} 受到 {dmg} 點傷害，剩餘 HP: {self.hp}")

class Hero(Entity):
    def attack(self, target):
        print(f"🗡️ 勇者 {self.name} 揮舞聖劍發動猛攻！")
        target.take_damage(self.atk)

class Monster(Entity):
    def attack(self, target):
        print(f"🔥 怪物 {self.name} 噴出烈焰！")
        target.take_damage(self.atk)

hero = Hero("雷恩", 120, 35)
boss = Monster("暗黑飛龍", 90, 20)

round_num = 1
print("=== 地城決戰開始 ===")
while hero.is_alive() and boss.is_alive():
    print(f"\\n--- 第 {round_num} 回合 ---")
    hero.attack(boss)
    if boss.is_alive():
        boss.attack(hero)
    round_num += 1

if hero.is_alive():
    print("\\n🏆 勇者贏得了勝利，守護了王國和平！")
else:
    print("\\n💀 勇者倒下了，請重新挑戰！")
`
  },

  // --- C++ PROJECTS ---
  {
    id: 'proj-cpp-calculator',
    language: 'cpp',
    title: 'C++ 實戰專案 1：多功能指令列計算機',
    difficulty: '入門初階',
    xpReward: 150,
    summary: '設計一個具備四則運算、除以零防呆檢查與連續運算能力的 C++ 計算機程式。',
    objectives: [
      '運用 switch-case 判斷 +, -, *, / 運算子',
      '實作防呆機制：當除數為 0 時提出警告，避免程式崩潰',
      '使用函式封裝運算邏輯'
    ],
    starterCode: `#include <iostream>
using namespace std;

// TODO: 實作 calculate 函式
double calculate(double a, char op, double b) {
    return 0.0;
}

int main() {
    double n1 = 20, n2 = 4;
    char op = '*';
    
    cout << "=== C++ 終端計算機 ===" << endl;
    cout << n1 << " " << op << " " << n2 << " = " << calculate(n1, op, n2) << endl;
    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

double calculate(double a, char op, double b) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/':
            if (b == 0) {
                cout << "[錯誤] 不可除以零！" << endl;
                return 0;
            }
            return a / b;
        default:
            cout << "[錯誤] 未知運算子！" << endl;
            return 0;
    }
}

int main() {
    cout << "=== C++ 計算機運算展示 ===" << endl;
    cout << "15 + 27 = " << calculate(15, '+', 27) << endl;
    cout << "100 - 45 = " << calculate(100, '-', 45) << endl;
    cout << "8 * 9 = " << calculate(8, '*', 9) << endl;
    cout << "45 / 5 = " << calculate(45, '/', 5) << endl;
    cout << "10 / 0 = " << calculate(10, '/', 0) << endl;
    return 0;
}
`
  },
  {
    id: 'proj-cpp-student-system',
    language: 'cpp',
    title: 'C++ 實戰專案 2：學生成績統計與排名系統',
    difficulty: '實戰進階',
    xpReward: 200,
    summary: '利用 struct 結構體結合 std::vector 容器，實作學生資料登錄、總分與平均計算、最高分查找。',
    objectives: [
      '定義 struct Student { string name; int math; int english; };',
      '使用 std::vector<Student> 動態存儲學生清單',
      '計算全班平均成績與找出總分第一名的榜首'
    ],
    starterCode: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

struct Student {
    string name;
    int math;
    int english;
};

int main() {
    vector<Student> students = {
        {"小華", 92, 88},
        {"大寶", 75, 82},
        {"阿明", 98, 95}
    };
    
    // TODO: 遍歷計算每人總分與平均分
    
    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
using namespace std;

struct Student {
    string name;
    int math;
    int english;
    
    int getTotal() const { return math + english; }
    double getAvg() const { return getTotal() / 2.0; }
};

int main() {
    vector<Student> students = {
        {"王小華", 92, 88},
        {"陳大寶", 75, 82},
        {"林阿明", 98, 95},
        {"張美美", 85, 90}
    };
    
    cout << "=== 學生成績名冊與統計 ===" << endl;
    cout << "姓名\\t數學\\t英文\\t總分\\t平均" << endl;
    cout << "------------------------------------" << endl;
    
    Student topStudent = students[0];
    double totalClassSum = 0;
    
    for (const auto &s : students) {
        cout << s.name << "\\t" << s.math << "\\t" << s.english 
             << "\\t" << s.getTotal() << "\\t" << fixed << setprecision(1) << s.getAvg() << endl;
             
        totalClassSum += s.getAvg();
        if (s.getTotal() > topStudent.getTotal()) {
            topStudent = s;
        }
    }
    
    cout << "------------------------------------" << endl;
    cout << "全班平均分: " << (totalClassSum / students.size()) << endl;
    cout << "榮獲第一名: " << topStudent.name << " (總分 " << topStudent.getTotal() << " 分) 🏆" << endl;
    
    return 0;
}
`
  },
  {
    id: 'proj-cpp-tic-tac-toe',
    language: 'cpp',
    title: 'C++ 實戰專案 3：終端機 3x3 井字棋對戰 (Tic-Tac-Toe)',
    difficulty: '進階挑戰',
    xpReward: 250,
    summary: '透過二維陣列、二維迴圈繪製盤面，並撰寫水平、垂直與對角線勝利判定邏輯。',
    objectives: [
      '建立 char board[3][3] 棋盤陣列',
      '實作 drawBoard() 繪製棋盤分隔線與座標',
      '實作 checkWin(char player) 檢查 8 種連線勝利情況'
    ],
    starterCode: `#include <iostream>
using namespace std;

char board[3][3] = {
    {'1', '2', '3'},
    {'4', '5', '6'},
    {'7', '8', '9'}
};

void drawBoard() {
    // TODO: 輸出 3x3 棋盤
}

bool checkWin(char player) {
    // TODO: 檢查 3 橫、3 直、2 斜線
    return false;
}

int main() {
    drawBoard();
    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

char board[3][3] = {
    {'1', '2', '3'},
    {'4', '5', '6'},
    {'7', '8', '9'}
};

void drawBoard() {
    cout << "\\n  " << board[0][0] << " | " << board[0][1] << " | " << board[0][2] << endl;
    cout << " ---+---+---" << endl;
    cout << "  " << board[1][0] << " | " << board[1][1] << " | " << board[1][2] << endl;
    cout << " ---+---+---" << endl;
    cout << "  " << board[2][0] << " | " << board[2][1] << " | " << board[2][2] << endl;
}

bool checkWin(char p) {
    // 檢查橫行與直行
    for (int i = 0; i < 3; i++) {
        if (board[i][0] == p && board[i][1] == p && board[i][2] == p) return true;
        if (board[0][i] == p && board[1][i] == p && board[2][i] == p) return true;
    }
    // 檢查兩條對角線
    if (board[0][0] == p && board[1][1] == p && board[2][2] == p) return true;
    if (board[0][2] == p && board[1][1] == p && board[2][0] == p) return true;
    return false;
}

int main() {
    cout << "=== 井字棋模擬對戰展示 ===" << endl;
    board[0][0] = 'X';
    board[1][1] = 'O';
    board[0][1] = 'X';
    board[2][2] = 'O';
    board[0][2] = 'X'; // X 連成第一橫行獲勝！
    
    drawBoard();
    
    if (checkWin('X')) {
        cout << "\\n🎉 玩家 X 達成了三連線勝利！" << endl;
    } else {
        cout << "\\n比賽仍在繼續中..." << endl;
    }
    return 0;
}
`
  },
  {
    id: 'proj-cpp-bank-oop',
    language: 'cpp',
    title: 'C++ 實戰專案 4：銀行帳戶物件導向類別系統 (OOP)',
    difficulty: '進階挑戰',
    xpReward: 250,
    summary: '設計一個符合現代物件導向原則的 BankAccount 類別，具備資料封裝 (Encapsulation)、提款餘額檢查與交易紀錄。',
    objectives: [
      '私有成員變數 private: balance 與 accountHolder',
      '公有成員函式 public: deposit(金額), withdraw(金額), printStatement()',
      '建構子 (Constructor) 初始化帳戶'
    ],
    starterCode: `#include <iostream>
#include <string>
using namespace std;

class BankAccount {
private:
    string owner;
    double balance;

public:
    // TODO: 宣告建構子與存提款函式
};

int main() {
    // 測試帳戶運作
    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

class BankAccount {
private:
    string owner;
    string accountNumber;
    double balance;
    vector<string> history;

public:
    BankAccount(string name, string accNum, double initialDeposit)
        : owner(name), accountNumber(accNum), balance(initialDeposit) {
        history.push_back("開戶存入初始金額: $" + to_string((int)initialDeposit));
    }

    void deposit(double amount) {
        if (amount <= 0) {
            cout << "❌ 存款金額必須大於 0！" << endl;
            return;
        }
        balance += amount;
        history.push_back("存款: +$" + to_string((int)amount));
        cout << "✅ 成功存入 $" << amount << "，目前餘額: $" << balance << endl;
    }

    bool withdraw(double amount) {
        if (amount > balance) {
            cout << "❌ 提款失敗：餘額不足！(現有餘額 $" << balance << ")" << endl;
            return false;
        }
        balance -= amount;
        history.push_back("提款: -$" + to_string((int)amount));
        cout << "✅ 成功提領 $" << amount << "，剩餘餘額: $" << balance << endl;
        return true;
    }

    void printStatement() const {
        cout << "\\n===============================" << endl;
        cout << " 銀行對帳單 (Bank Statement)" << endl;
        cout << " 戶名: " << owner << " | 帳號: " << accountNumber << endl;
        cout << " 當前結餘: $" << balance << endl;
        cout << " 歷史交易紀錄:" << endl;
        for (const auto &record : history) {
            cout << "  - " << record << endl;
        }
        cout << "===============================\\n" << endl;
    }
};

int main() {
    BankAccount myAcc("林小宏", "ACC-888666", 5000);
    myAcc.deposit(2500);
    myAcc.withdraw(1200);
    myAcc.withdraw(99999); // 測試超額防呆
    myAcc.deposit(800);
    myAcc.printStatement();
    return 0;
}
`
  }
];
