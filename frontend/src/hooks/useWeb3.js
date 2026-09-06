import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, FOOTBALL_CARD_ABI, MARKETPLACE_ABI } from '../contracts/contractConfig';

export function useWeb3() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const switchToHardhatNetwork = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a69' }], // 31337 in hex is 0x7a69
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x7a69',
                chainName: 'Hardhat Localhost',
                rpcUrls: ['http://127.0.0.1:8545'],
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          console.warn("Failed to add Hardhat network to MetaMask:", addError);
        }
      }
    }
  }, []);

  const updateBalance = useCallback(async (currAccount, currProvider) => {
    const targetAccount = currAccount || account;
    if (!targetAccount) return;
    try {
      // Query local Hardhat node first for 10,000 ETH test balance
      try {
        const localProv = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const rawBal = await localProv.getBalance(targetAccount);
        const formatted = parseFloat(ethers.formatEther(rawBal)).toFixed(2);
        setBalance(formatted);
        return;
      } catch (localErr) {
        const prov = currProvider || provider;
        if (prov) {
          const rawBal = await prov.getBalance(targetAccount);
          const formatted = parseFloat(ethers.formatEther(rawBal)).toFixed(2);
          setBalance(formatted);
        }
      }
    } catch (err) {
      console.warn("Could not query balance:", err);
    }
  }, [account, provider]);

  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError("MetaMask browser extension is not installed! Please install MetaMask extension in Chrome/Brave/Edge to connect your Web3 wallet.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prompt network switch to Hardhat Localhost if needed
      await switchToHardhatNetwork();

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      
      // If already connected, trigger wallet_requestPermissions to force MetaMask account picker modal to open
      let accounts;
      try {
        if (account) {
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          });
        }
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (firstErr) {
        if (firstErr.code === 4001) throw firstErr;
        accounts = await window.ethereum.request({ method: 'eth_accounts' });
      }

      if (!accounts || accounts.length === 0) return;

      const network = await browserProvider.getNetwork();
      const userSigner = await browserProvider.getSigner();

      setAccount(accounts[0]);
      setProvider(browserProvider);
      setSigner(userSigner);
      setChainId(network.chainId.toString());
      updateBalance(accounts[0], browserProvider);
    } catch (err) {
      console.error("Wallet connection error:", err);
      if (err.code === 4001) {
        setError("Wallet connection request was rejected in MetaMask.");
      } else {
        setError(err.message || "Failed to connect wallet.");
      }
    } finally {
      setLoading(false);
    }
  }, [account, updateBalance, switchToHardhatNetwork]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      // Check existing accounts
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts && accounts.length > 0) {
            connectWallet();
          }
        })
        .catch(err => console.warn("Failed to query eth_accounts:", err));

      const handleAccountsChanged = async (accounts) => {
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            const userSigner = await browserProvider.getSigner();
            setProvider(browserProvider);
            setSigner(userSigner);
            updateBalance(accounts[0], browserProvider);
          } catch (e) {
            console.warn("Error updating signer on account change:", e);
          }
        } else {
          setAccount(null);
          setSigner(null);
          setBalance('0');
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [connectWallet]);

  const getFootballCardContract = useCallback((useSigner = false) => {
    let runner = useSigner ? signer : provider;
    if (!runner && !useSigner) {
      try {
        runner = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      } catch (e) {
        console.warn("Local RPC fallback notice:", e);
      }
    }
    if (!runner) return null;
    return new ethers.Contract(CONTRACT_ADDRESSES.FootballCard, FOOTBALL_CARD_ABI, runner);
  }, [provider, signer]);

  const getMarketplaceContract = useCallback((useSigner = false) => {
    let runner = useSigner ? signer : provider;
    if (!runner && !useSigner) {
      try {
        runner = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      } catch (e) {
        console.warn("Local RPC fallback notice:", e);
      }
    }
    if (!runner) return null;
    return new ethers.Contract(CONTRACT_ADDRESSES.Marketplace, MARKETPLACE_ABI, runner);
  }, [provider, signer]);

  return {
    account,
    provider,
    signer,
    chainId,
    balance,
    updateBalance,
    loading,
    error,
    connectWallet,
    getFootballCardContract,
    getMarketplaceContract,
    isSepolia: chainId === '11155111',
    isLocalhost: chainId === '31337'
  };
}

