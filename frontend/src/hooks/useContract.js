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
