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
  console.log('测试代码提交')
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
