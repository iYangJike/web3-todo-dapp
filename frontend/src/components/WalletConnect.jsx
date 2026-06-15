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
