export default function Hero() {
  return (
    <div className="text-center space-y-6 my-12">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
        Agent Permissions Portal
      </h1>
      <div className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        Grant your AI agent scoped permissions via ERC-7715
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
        Connect your MetaMask Smart Account, grant USDC spending permissions, and your agent can redeem them via gator-cli.
      </p>
    </div>
  );
}
