import { useState, useCallback } from "react";
import { ethers } from "ethers";

// 部署合约后，将这里的地址替换为你实际的合约地址
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

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
const LOCAL_CHAIN_ID_HEX = "0x7a69";

async function ensureLocalNetwork() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: LOCAL_CHAIN_ID_HEX }],
    });
    return true;
  } catch (switchError) {
    const code = switchError?.code;
    if (code !== 4902) {
      throw switchError;
    }

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: LOCAL_CHAIN_ID_HEX,
          chainName: "Hardhat Local",
          nativeCurrency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18,
          },
          rpcUrls: ["http://127.0.0.1:8545"],
        },
      ],
    });

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: LOCAL_CHAIN_ID_HEX }],
    });
    return true;
  }
}

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
      if (err?.code === "BAD_DATA") {
        setError("加载失败：当前地址不是有效 Todo 合约，请检查网络和合约地址是否匹配。");
        return;
      }
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
      await ensureLocalNetwork();

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const acc = accounts[0];

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      if (chainId !== LOCAL_CHAIN_ID) {
        const current = NETWORK_NAMES[chainId] || `Chain ${chainId}`;
        setError(`当前网络为 ${current}，请切换到本地 Hardhat (31337)`);
        return;
      }

      const deployedCode = await provider.getCode(CONTRACT_ADDRESS);
      if (!deployedCode || deployedCode === "0x") {
        setError("当前网络下未找到合约。请确认已部署并更新 CONTRACT_ADDRESS。若使用本地链，请先启动 hardhat node 并重新部署。");
        return;
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
