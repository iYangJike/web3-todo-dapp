# Web3 Todo DApp 实施计划

> **智能体工作指引：** 必须使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务执行此计划。步骤使用 checkbox（`- [ ]`）语法追踪进度。

**目标：** 在以太坊 Sepolia 测试网上构建一个去中心化 Todo DApp，覆盖完整 Web3 技术栈：智能合约 → 测试 → 部署 → 前端钱包交互。

**架构：** Solidity 智能合约在链上存储待办事项。Hardhat 用于开发、测试和部署。React + TailwindCSS 前端通过 ethers.js 与合约交互。用户连接 MetaMask 钱包后，可创建、切换完成状态、删除所有 Todo——所有操作均在链上完成。

**技术栈：** Solidity、Hardhat、ethers.js v6、OpenZeppelin Contracts、MetaMask、React 18、Vite、TailwindCSS v4、Sepolia 测试网

---

## 文件结构

```
web3-todo-dapp/
├── contracts/
│   └── Todo.sol                  # 智能合约：链上 Todo 存储
├── test/
│   └── Todo.test.js              # 合约单元测试（TDD）
├── scripts/
│   └── deploy.js                 # 部署脚本
├── frontend/
│   ├── index.html                # Vite 入口 HTML
│   ├── vite.config.js            # Vite 配置
│   ├── tailwind.config.js        # TailwindCSS 配置
│   ├── postcss.config.js         # PostCSS 配置
│   ├── src/
│   │   ├── main.jsx              # React 入口
│   │   ├── App.jsx               # 主应用组件
│   │   ├── App.css               # TailwindCSS 入口样式
│   │   ├── components/
│   │   │   ├── WalletConnect.jsx # 钱包连接组件
│   │   │   ├── TodoInput.jsx     # 创建 Todo 输入组件
│   │   │   ├── TodoList.jsx      # Todo 列表组件
│   │   │   └── TodoItem.jsx      # 单个 Todo 项组件
│   │   └── hooks/
│   │       └── useContract.js    # 合约交互 Hook
│   └── package.json              # 前端依赖
├── hardhat.config.js              # Hardhat 配置
├── package.json                   # 合约端依赖
└── .env                           # 私钥和 RPC 地址（已 gitignore）
```

---

## 前置准备：环境配置（手动步骤）

这些是编码前需要在浏览器/钱包中完成的步骤。

### 获取 MetaMask 钱包
1. 访问 https://metamask.io 安装浏览器插件
2. 创建新钱包，**安全保存助记词**
3. 默认网络是以太坊主网，后续我们会添加 Sepolia 测试网

### 获取 Sepolia 测试 ETH
1. 访问 https://sepoliafaucet.com（或 https://faucets.chain.link/sepolia）
2. 粘贴你的 MetaMask 钱包地址
3. 申请测试 ETH（通常每次 0.1-0.5 ETH）
4. 等待 1-2 分钟到账
5. 在 MetaMask 中：网络下拉 → "显示测试网络" → 选择 "Sepolia"

---

## 任务 1：项目初始化

**涉及文件：**
- 创建：`package.json`（根目录）
- 创建：`hardhat.config.js`
- 创建：`.env`
- 创建：`.gitignore`

- [ ] **步骤 1：创建项目目录并初始化**

```bash
mkdir -p /Users/a1/web3-todo-dapp && cd /Users/a1/web3-todo-dapp
npm init -y
```

- [ ] **步骤 2：安装 Hardhat 及依赖**

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
npm install @openzeppelin/contracts ethers@^6
```

预期结果：无报错，node_modules 目录生成。

- [ ] **步骤 3：初始化 Hardhat 项目**

```bash
npx hardhat init
```

选择 "Create a JavaScript project"，会自动生成默认目录结构。

- [ ] **步骤 4：替换 hardhat.config.js**

```bash
cat > hardhat.config.js << 'EOF'
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};
EOF
```

- [ ] **步骤 5：创建 .env 文件**

```bash
cat > .env << 'EOF'
# 替换为你的 MetaMask 私钥（MetaMask → 账户详情 → 导出私钥）
PRIVATE_KEY=your_private_key_here

# Sepolia RPC 地址（以下为免费选项）
# Alchemy: https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
# Infura: https://sepolia.infura.io/v3/YOUR_KEY
# 或使用公共节点：https://rpc.sepolia.org
SEPOLIA_RPC_URL=https://rpc.sepolia.org
EOF
```

- [ ] **步骤 6：创建 .gitignore**

```bash
cat > .gitignore << 'EOF'
node_modules
.env
cache
artifacts
typechain-types
coverage
coverage.json
dist
EOF
```

- [ ] **步骤 7：验证 Hardhat 能正常编译**

运行：`npx hardhat compile`
预期：输出 "Compiled N Solidity files successfully"

- [ ] **步骤 8：提交代码**

```bash
git init && git add -A && git commit -m "feat: 初始化 hardhat 项目及依赖"
```

---

## 任务 2：编写智能合约（TDD）

**涉及文件：**
- 创建：`contracts/Todo.sol`
- 创建：`test/Todo.test.js`

- [ ] **步骤 1：编写失败的测试用例**

```bash
mkdir -p test contracts
cat > test/Todo.test.js << 'TESTEOF'
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Todo", function () {
  let todo;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const Todo = await ethers.getContractFactory("Todo");
    todo = await Todo.deploy();
    await todo.waitForDeployment();
  });

  describe("创建 Todo", function () {
    it("应该能创建一个新的 todo", async function () {
      await todo.createTodo("学习 Web3");
      const todos = await todo.getTodos();
      expect(todos.length).to.equal(1);
      expect(todos[0].text).to.equal("学习 Web3");
      expect(todos[0].completed).to.equal(false);
    });

    it("应该能创建多个 todo", async function () {
      await todo.createTodo("学习 Solidity");
      await todo.createTodo("部署合约");
      const todos = await todo.getTodos();
      expect(todos.length).to.equal(2);
    });

    it("创建空文本的 todo 应该失败", async function () {
      await expect(todo.createTodo("")).to.be.revertedWith("Todo text cannot be empty");
    });
  });

  describe("完成 Todo", function () {
    it("应该能把 todo 标记为完成", async function () {
      await todo.createTodo("学习 Hardhat");
      await todo.toggleTodo(0);
      const todos = await todo.getTodos();
      expect(todos[0].completed).to.equal(true);
    });

    it("再次调用应该取消完成状态", async function () {
      await todo.createTodo("写测试");
      await todo.toggleTodo(0);
      await todo.toggleTodo(0);
      const todos = await todo.getTodos();
      expect(todos[0].completed).to.equal(false);
    });
  });

  describe("删除 Todo", function () {
    it("应该能删除 todo", async function () {
      await todo.createTodo("要删除的任务");
      await todo.deleteTodo(0);
      const todos = await todo.getTodos();
      expect(todos.length).to.equal(0);
    });
  });

  describe("事件", function () {
    it("创建 todo 时应该触发 TodoCreated 事件", async function () {
      await expect(todo.createTodo("新任务"))
        .to.emit(todo, "TodoCreated")
        .withArgs(0, "新任务");
    });

    it("切换 todo 时应该触发 TodoToggled 事件", async function () {
      await todo.createTodo("事件测试");
      await expect(todo.toggleTodo(0))
        .to.emit(todo, "TodoToggled")
        .withArgs(0, true);
    });
  });
});
TESTEOF
```

- [ ] **步骤 2：运行测试，确认测试失败**

运行：`npx hardhat test test/Todo.test.js`
预期：失败，报错 "Todo contract does not exist" 或编译错误。

- [ ] **步骤 3：编写最小可用的 Todo.sol 合约**

```bash
cat > contracts/Todo.sol << 'SOLEOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Todo {
    struct TodoItem {
        string text;
        bool completed;
    }

    TodoItem[] private todos;

    event TodoCreated(uint256 indexed id, string text);
    event TodoToggled(uint256 indexed id, bool completed);
    event TodoDeleted(uint256 indexed id);

    function createTodo(string memory _text) public {
        require(bytes(_text).length > 0, "Todo text cannot be empty");
        todos.push(TodoItem(_text, false));
        emit TodoCreated(todos.length - 1, _text);
    }

    function toggleTodo(uint256 _index) public {
        require(_index < todos.length, "Index out of bounds");
        todos[_index].completed = !todos[_index].completed;
        emit TodoToggled(_index, todos[_index].completed);
    }

    function deleteTodo(uint256 _index) public {
        require(_index < todos.length, "Index out of bounds");
        emit TodoDeleted(_index);
        todos[_index] = todos[todos.length - 1];
        todos.pop();
    }

    function getTodos() public view returns (TodoItem[] memory) {
        return todos;
    }

    function getTodoCount() public view returns (uint256) {
        return todos.length;
    }
}
SOLEOF
```

- [ ] **步骤 4：运行测试，确认全部通过**

运行：`npx hardhat test test/Todo.test.js`
预期：全部 7 个测试通过。

- [ ] **步骤 5：提交代码**

```bash
git add contracts/Todo.sol test/Todo.test.js
git commit -m "feat: 添加 Todo 智能合约及完整测试用例"
```

---

## 任务 3：编写部署脚本

**涉及文件：**
- 创建：`scripts/deploy.js`

- [ ] **步骤 1：编写部署脚本**

```bash
mkdir -p scripts
cat > scripts/deploy.js << 'DEPLOYEOF'
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("使用账户部署:", deployer.address);
  console.log("账户余额:", (await ethers.provider.getBalance(deployer.address)).toString());

  const Todo = await ethers.getContractFactory("Todo");
  const todo = await Todo.deploy();
  await todo.waitForDeployment();

  const address = await todo.getAddress();
  console.log("Todo 合约已部署到:", address);
  console.log("\n请将以下地址更新到 frontend/src/hooks/useContract.js 中：");
  console.log(`const CONTRACT_ADDRESS = "${address}";`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
DEPLOYEOF
```

- [ ] **步骤 2：在本地 Hardhat 网络测试部署**

运行：`npx hardhat run scripts/deploy.js`
预期：在本地网络部署成功，输出合约地址。

- [ ] **步骤 3：提交代码**

```bash
git add scripts/deploy.js
git commit -m "feat: 添加部署脚本"
```

---

## 任务 4：初始化 React + TailwindCSS 前端项目

**涉及文件：**
- 创建：`frontend/` 目录及 Vite + React 项目结构

- [ ] **步骤 1：使用 Vite 创建 React 项目**

```bash
cd /Users/a1/web3-todo-dapp
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

- [ ] **步骤 2：安装 TailwindCSS v4 及依赖**

```bash
npm install tailwindcss @tailwindcss/vite
```

- [ ] **步骤 3：配置 Vite 支持 TailwindCSS**

```bash
cat > vite.config.js << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
EOF
```

- [ ] **步骤 4：配置 TailwindCSS 入口样式**

```bash
cat > src/App.css << 'EOF'
@import "tailwindcss";
EOF
```

- [ ] **步骤 5：清理 Vite 默认文件**

```bash
rm -f src/index.css
rm -f src/assets/react.svg
rm -f public/vite.svg
```

- [ ] **步骤 6：更新 index.html 标题**

```bash
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Web3 Todo DApp</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF
```

- [ ] **步骤 7：验证前端能启动**

```bash
npm run dev
```

预期：浏览器打开 http://localhost:5173 显示 Vite 默认页面。Ctrl+C 停止。

- [ ] **步骤 8：提交代码**

```bash
cd /Users/a1/web3-todo-dapp
git add frontend/
git commit -m "feat: 初始化 React + Vite + TailwindCSS 前端项目"
```

---

## 任务 5：编写合约交互 Hook

**涉及文件：**
- 创建：`frontend/src/hooks/useContract.js`

- [ ] **步骤 1：安装 ethers.js**

```bash
cd /Users/a1/web3-todo-dapp/frontend
npm install ethers@^6
```

- [ ] **步骤 2：编写 useContract Hook**

```bash
mkdir -p src/hooks
cat > src/hooks/useContract.js << 'JSEOF'
import { useState, useCallback } from "react";
import { ethers } from "ethers";

// 部署合约后，将这里的地址替换为你实际的合约地址
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";

const CONTRACT_ABI = [
  "function createTodo(string memory _text) public",
  "function toggleTodo(uint256 _index) public",
  "function deleteTodo(uint256 _index) public",
  "function getTodos() public view returns (tuple(string text, bool completed)[])",
  "function getTodoCount() public view returns (uint256)",
  "event TodoCreated(uint256 indexed id, string text)",
  "event TodoToggled(uint256 indexed id, bool completed)",
  "event TodoDeleted(uint256 indexed id)",
];

const NETWORK_NAMES = { 11155111: "Sepolia", 1: "Mainnet", 31337: "本地" };
const SEPOLIA_CHAIN_ID = 11155111;
const LOCAL_CHAIN_ID = 31337;

export function useContract() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [networkName, setNetworkName] = useState("");
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTodos = useCallback(async (contractInstance) => {
    try {
      const result = await contractInstance.getTodos();
      setTodos(result.map((t, i) => ({ index: i, text: t.text, completed: t.completed })));
    } catch (err) {
      setError("加载失败: " + err.message);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("请安装 MetaMask！");
      return;
    }

    try {
      setError(null);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const acc = accounts[0];

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      if (chainId !== SEPOLIA_CHAIN_ID && chainId !== LOCAL_CHAIN_ID) {
        alert("请切换到 Sepolia 测试网！");
      }

      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setAccount(acc);
      setContract(contractInstance);
      setNetworkName(NETWORK_NAMES[chainId] || `Chain ${chainId}`);

      await loadTodos(contractInstance);

      window.ethereum.on("accountsChanged", () => location.reload());
      window.ethereum.on("chainChanged", () => location.reload());
    } catch (err) {
      setError("连接失败: " + err.message);
    }
  }, [loadTodos]);

  const createTodo = useCallback(async (text) => {
    if (!contract || !text.trim()) return;
    setLoading(true);
    try {
      const tx = await contract.createTodo(text);
      await tx.wait();
      await loadTodos(contract);
    } catch (err) {
      setError("创建失败: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [contract, loadTodos]);

  const toggleTodo = useCallback(async (index) => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.toggleTodo(index);
      await tx.wait();
      await loadTodos(contract);
    } catch (err) {
      setError("操作失败: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [contract, loadTodos]);

  const deleteTodo = useCallback(async (index) => {
    if (!contract) return;
    if (!confirm("确定要删除这个任务吗？")) return;
    setLoading(true);
    try {
      const tx = await contract.deleteTodo(index);
      await tx.wait();
      await loadTodos(contract);
    } catch (err) {
      setError("删除失败: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [contract, loadTodos]);

  return {
    account,
    networkName,
    todos,
    loading,
    error,
    connectWallet,
    createTodo,
    toggleTodo,
    deleteTodo,
  };
}
JSEOF
```

- [ ] **步骤 3：提交代码**

```bash
cd /Users/a1/web3-todo-dapp
git add frontend/src/hooks/useContract.js
git commit -m "feat: 添加合约交互 Hook（钱包连接 + CRUD 操作）"
```

---

## 任务 6：编写 React 组件

**涉及文件：**
- 创建：`frontend/src/components/WalletConnect.jsx`
- 创建：`frontend/src/components/TodoInput.jsx`
- 创建：`frontend/src/components/TodoList.jsx`
- 创建：`frontend/src/components/TodoItem.jsx`
- 修改：`frontend/src/App.jsx`
- 修改：`frontend/src/main.jsx`

- [ ] **步骤 1：编写 WalletConnect 组件**

```bash
mkdir -p src/components
cat > src/components/WalletConnect.jsx << 'JSXEOF'
export default function WalletConnect({ account, networkName, onConnect }) {
  if (account) {
    return (
      <div className="text-center mb-8">
        <div className="flex justify-center gap-4 mt-3">
          <span className="bg-white/10 px-3 py-1.5 rounded-md text-sm text-gray-300">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
          <span className="bg-white/10 px-3 py-1.5 rounded-md text-sm text-emerald-400">
            {networkName}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center mb-8">
      <button
        onClick={onConnect}
        className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-lg text-base cursor-pointer transition-colors"
      >
        连接 MetaMask
      </button>
    </div>
  );
}
JSXEOF
```

- [ ] **步骤 2：编写 TodoInput 组件**

```bash
cat > src/components/TodoInput.jsx << 'JSXEOF'
import { useState } from "react";

export default function TodoInput({ onSubmit, loading }) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text);
    setText("");
  };

  return (
    <div className="flex gap-2 mb-5">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="输入新任务..."
        disabled={loading}
        className="flex-1 px-4 py-3 border border-gray-600 rounded-lg bg-white/5 text-white text-base outline-none focus:border-violet-500 disabled:opacity-50"
      />
      <button
        onClick={handleSubmit}
        disabled={loading || !text.trim()}
        className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-6 py-3 rounded-lg text-base cursor-pointer transition-colors"
      >
        添加
      </button>
    </div>
  );
}
JSXEOF
```

- [ ] **步骤 3：编写 TodoItem 组件**

```bash
cat > src/components/TodoItem.jsx << 'JSXEOF'
export default function TodoItem({ todo, onToggle, onDelete, loading }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3.5 mb-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
      <span
        className={`flex-1 ${todo.completed ? "line-through text-gray-500" : "text-gray-200"}`}
      >
        {todo.text}
      </span>
      <button
        onClick={() => onToggle(todo.index)}
        disabled={loading}
        className="px-3 py-1.5 text-sm rounded-md bg-white/10 hover:bg-white/20 text-gray-300 cursor-pointer transition-colors disabled:opacity-50"
      >
        {todo.completed ? "撤销" : "完成"}
      </button>
      <button
        onClick={() => onDelete(todo.index)}
        disabled={loading}
        className="px-3 py-1.5 text-sm rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-400 cursor-pointer transition-colors disabled:opacity-50"
      >
        删除
      </button>
    </li>
  );
}
JSXEOF
```

- [ ] **步骤 4：编写 TodoList 组件**

```bash
cat > src/components/TodoList.jsx << 'JSXEOF'
import TodoItem from "./TodoItem";

export default function TodoList({ todos, onToggle, onDelete, loading }) {
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div>
      {todos.length > 0 && (
        <p className="text-center text-sm text-gray-500 mb-4">
          共 {todos.length} 项，已完成 {completedCount} 项
        </p>
      )}

      <ul className="list-none p-0 m-0">
        {todos.length === 0 ? (
          <li className="text-center text-gray-600 py-5">暂无任务，添加一个吧！</li>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo.index}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              loading={loading}
            />
          ))
        )}
      </ul>
    </div>
  );
}
JSXEOF
```

- [ ] **步骤 5：编写 App.jsx 主组件**

```bash
cat > src/App.jsx << 'JSXEOF'
import { useContract } from "./hooks/useContract";
import WalletConnect from "./components/WalletConnect";
import TodoInput from "./components/TodoInput";
import TodoList from "./components/TodoList";

export default function App() {
  const {
    account,
    networkName,
    todos,
    loading,
    error,
    connectWallet,
    createTodo,
    toggleTodo,
    deleteTodo,
  } = useContract();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-gray-200">
      <div className="max-w-xl mx-auto px-5 py-10">
        <h1 className="text-center text-4xl font-bold mb-2">Web3 Todo</h1>
        <p className="text-center text-gray-500 mb-8">链上去中心化待办事项</p>

        <WalletConnect account={account} networkName={networkName} onConnect={connectWallet} />

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4 text-center text-sm">
            {error}
          </div>
        )}

        {account && (
          <div>
            <TodoInput onSubmit={createTodo} loading={loading} />
            {loading && (
              <p className="text-center text-gray-500 py-4">交易处理中...</p>
            )}
            <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} loading={loading} />
          </div>
        )}
      </div>
    </div>
  );
}
JSXEOF
```

- [ ] **步骤 6：更新 main.jsx**

```bash
cat > src/main.jsx << 'JSXEOF'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
JSXEOF
```

- [ ] **步骤 7：验证前端能正常启动并显示**

```bash
cd /Users/a1/web3-todo-dapp/frontend
npm run dev
```

预期：浏览器打开 http://localhost:5173 显示 "Web3 Todo" 页面，有"连接 MetaMask"按钮。Ctrl+C 停止。

- [ ] **步骤 8：提交代码**

```bash
cd /Users/a1/web3-todo-dapp
git add frontend/src/
git commit -m "feat: 添加 React 组件（钱包连接、Todo 输入/列表/项）"
```

---

## 任务 7：部署到 Sepolia 测试网并端到端测试

**涉及文件：**
- 修改：`frontend/src/hooks/useContract.js`（替换合约地址）

- [ ] **步骤 1：导出 MetaMask 私钥**

打开 MetaMask → 点击账户菜单 → 账户详情 → 导出私钥 → 复制。

- [ ] **步骤 2：更新 .env 文件**

编辑 `.env`，将 `PRIVATE_KEY` 替换为你的实际私钥。
**警告：不要提交此文件，不要泄露私钥！**

- [ ] **步骤 3：获取 Sepolia 测试 ETH**

访问 https://sepoliafaucet.com → 粘贴钱包地址 → 申请 ETH。

- [ ] **步骤 4：部署到 Sepolia**

运行：`npx hardhat run scripts/deploy.js --network sepolia`

预期输出：
```
使用账户部署: 0x...
账户余额: 100000000000000000（或类似数值）
Todo 合约已部署到: 0x...
```

复制输出中的合约地址。

- [ ] **步骤 5：更新前端合约地址**

```bash
# 将 YOUR_CONTRACT_ADDRESS_HERE 替换为你的实际合约地址
sed -i '' 's/YOUR_CONTRACT_ADDRESS_HERE/0x_你的实际地址/' frontend/src/hooks/useContract.js
```

- [ ] **步骤 6：启动前端开发服务器**

```bash
cd /Users/a1/web3-todo-dapp/frontend
npm run dev
```

打开 http://localhost:5173。

- [ ] **步骤 7：完整流程测试**

1. 点击"连接 MetaMask" → 在 MetaMask 弹窗中确认
2. 添加一个 Todo → 在 MetaMask 中确认交易
3. 切换完成状态 → 确认交易
4. 删除一个 Todo → 确认交易
5. 刷新页面 → Todo 应该仍然存在（数据在链上！）

- [ ] **步骤 8：最终提交**

```bash
cd /Users/a1/web3-todo-dapp
git add -A
git commit -m "feat: 完成 web3 todo dapp，部署到 sepolia 测试网"
```

---

## 任务 8：（可选）本地网络开发部署

本地开发无需消耗测试 ETH，交易即时确认。

- [ ] **步骤 1：启动 Hardhat 本地节点**

```bash
npx hardhat node
```

保持此终端运行，节点地址为 http://127.0.0.1:8545。

- [ ] **步骤 2：部署到本地网络**

在新终端中：
```bash
npx hardhat run scripts/deploy.js --network localhost
```

- [ ] **步骤 3：配置 MetaMask 连接本地网络**

1. MetaMask → 添加网络 → 手动添加网络
2. 网络名称：Hardhat Local
3. RPC URL：http://127.0.0.1:8545
4. 链 ID：31337
5. 货币符号：ETH

- [ ] **步骤 4：导入 Hardhat 测试账户**

Hardhat 节点会输出 20 个各有 10,000 ETH 的测试账户。使用其中一个的私钥导入 MetaMask。

- [ ] **步骤 5：更新合约地址并测试**

流程与任务 7 相同，但在本地网络上运行，无需 gas 费用。
