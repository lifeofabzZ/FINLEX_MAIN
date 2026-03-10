// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Loader2, AlertCircle } from "lucide-react";
import { BrowserProvider } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [error, setError] = useState("");

  const handleWalletLogin = async () => {
    if (isWalletConnecting) return;
    setIsWalletConnecting(true);
    setError("");

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        setError("MetaMask is not installed. Please install it to continue.");
        window.open("https://metamask.io/download/", "_blank");
        setIsWalletConnecting(false);
        return;
      }

      // Force MetaMask to prompt account selection every time
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }]
      });

      // Create provider and request accounts
      const provider = new BrowserProvider(window.ethereum);
      const accounts: string[] = await provider.send("eth_requestAccounts", []);

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please create a wallet in MetaMask.");
      }

      const address = accounts[0];

      // Send login request to backend - stores wallet address in MongoDB
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();

      // Store JWT token in sessionStorage (cleared when tab closes - more secure than localStorage)
      sessionStorage.setItem("authToken", data.token);
      localStorage.setItem("walletAddress", address);

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err: any) {
      const errorCode = err?.code || err?.error?.code || err?.info?.error?.code;

      if (errorCode === 4001 || err?.message?.includes("rejected")) {
        setError("Connection rejected. Please approve the request in MetaMask.");
      } else if (errorCode === -32002 || err?.message?.includes("already pending")) {
        setError("Connection request pending. Please open your MetaMask extension and approve the request.");
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to connect wallet."
        );
      }
    } finally {
      setIsWalletConnecting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 px-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/50 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
              <Wallet className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-400">
              Connect your MetaMask wallet to login
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <button
              onClick={handleWalletLogin}
              disabled={isWalletConnecting}
              className="w-full flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-lg font-medium transition-colors"
            >
              {isWalletConnecting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Wallet className="h-5 w-5" />
                  {typeof window.ethereum === "undefined"
                    ? "Install MetaMask"
                    : "Connect Ethereum Wallet"}
                </>
              )}
            </button>

            {!isWalletConnecting && typeof window.ethereum !== "undefined" && (
              <p className="text-xs text-center text-gray-400">
                💡 Click above to connect your MetaMask wallet. You'll be prompted to enter your password if the wallet is locked.
              </p>
            )}
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            Don't have a wallet?{" "}
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Create one now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
