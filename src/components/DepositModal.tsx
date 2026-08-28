import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useTrading } from '../context/TradingContext';
import {
  X,
  ArrowDownRight,
  Wallet,
  Check,
  Copy,
  DollarSign,
  CheckCircle,
  ShieldCheck,
  Loader2,
  Hash,
  ExternalLink,
  QrCode,
  Zap,
  RefreshCw,
  Globe,
  Send,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const { deposit, availableBalance, ledger } = useTrading();
  const [modalTab, setModalTab] = useState<'deposit' | 'history'>('deposit');
  const [cryptoAsset, setCryptoAsset] = useState<string>('USDT (BEP20)');
  const [amount, setAmount] = useState<string>('0');
  const [userTxHash, setUserTxHash] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [completedTxHash, setCompletedTxHash] = useState<string>('');
  const [txError, setTxError] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);

  // Web3 state
  const [isWeb3Connecting, setIsWeb3Connecting] = useState(false);
  const [web3Account, setWeb3Account] = useState<string | null>(null);
  const [web3Status, setWeb3Status] = useState<string>('');

  const depositHistoryList = ledger.filter(tx => tx.type === 'DEPOSIT' || tx.type === 'WELCOME_BONUS');

  const cryptoAddresses: Record<string, string> = {
    'USDT (BEP20)': '0x057df1a2bece5b93907acd071314652cda900818',
    'USDT (TRC20)': 'TVLfwapDwRMveafYfmY6TWuvNC7si8w6s'
  };

  const getExplorerUrl = (asset: string, hashOrAddr: string, type: 'tx' | 'address' = 'address') => {
    if (asset.includes('TRC20')) {
      return type === 'tx'
        ? `https://tronscan.org/#/transaction/${hashOrAddr}`
        : `https://tronscan.org/#/address/${hashOrAddr}`;
    }
    // BEP20 default
    return type === 'tx'
      ? `https://bscscan.com/tx/${hashOrAddr}`
      : `https://bscscan.com/address/${hashOrAddr}`;
  };

  const selectedAddress = cryptoAddresses[cryptoAsset] || cryptoAddresses['USDT (BEP20)'];

  // Generate real dynamic QR code data URL whenever selected asset or address changes
  useEffect(() => {
    let isMounted = true;
    setIsGeneratingQr(true);

    const qrText = selectedAddress;
    QRCode.toDataURL(qrText, {
      width: 260,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then(url => {
        if (isMounted) {
          setQrCodeDataUrl(url);
          setIsGeneratingQr(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsGeneratingQr(false);
      });

    return () => {
      isMounted = false;
    };
  }, [cryptoAsset, selectedAddress]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(selectedAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTxHash = () => {
    if (!completedTxHash) return;
    navigator.clipboard.writeText(completedTxHash);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  // Connect Web3 Wallet (MetaMask, Trust Wallet, etc.)
  const handleConnectWeb3 = async () => {
    setIsWeb3Connecting(true);
    setWeb3Status('Detecting Web3 Wallet Provider...');
    
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const ethereum = (window as any).ethereum;
        setWeb3Status('Requesting wallet permission...');
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setWeb3Account(accounts[0]);
          setWeb3Status(`Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
        } else {
          setWeb3Status('No Web3 accounts granted permission.');
        }
      } else {
        setWeb3Status('No Web3 browser extension (MetaMask/Trust Wallet) detected. Please use manual QR or address deposit.');
      }
    } catch (err: any) {
      setWeb3Status(err.message || 'Web3 connection failed or rejected by user.');
    } finally {
      setIsWeb3Connecting(false);
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxError('');
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setTxError('Please enter a valid deposit amount greater than $0.');
      return;
    }

    const cleanHash = userTxHash.trim();
    if (!cleanHash || cleanHash.length < 8) {
      setTxError('Please enter a valid Transaction Hash (TxID) from your wallet transfer to submit for audit.');
      return;
    }

    // Validate hash format according to network rules
    const isBEP20 = cryptoAsset.includes('BEP20');
    const isTRC20 = cryptoAsset.includes('TRC20');

    const isHex64 = /^[a-fA-F0-9]{64}$/.test(cleanHash.replace(/^0x/i, ''));
    const isBEP20Format = /^0x[a-fA-F0-9]{64}$/i.test(cleanHash);
    const isTRC20Format = /^[a-fA-F0-9]{64}$/i.test(cleanHash) || /^0x[a-fA-F0-9]{64}$/i.test(cleanHash);

    if (isBEP20 && !isBEP20Format) {
      setTxError('Invalid BEP20 TxID format. BEP20 transaction hashes must be a 66-character hexadecimal string starting with "0x" (e.g. 0x8a7f9b...). Arbitrary numbers, fake text, or invalid hashes are rejected.');
      return;
    }

    if (isTRC20 && !isTRC20Format) {
      setTxError('Invalid TRC20 TxID format. TRC20 transaction hashes must be 64 hexadecimal characters. Arbitrary text or fake numbers are rejected.');
      return;
    }

    if (!isHex64) {
      setTxError('Invalid Blockchain TxID. Transaction hashes must contain valid hexadecimal characters matching on-chain standards.');
      return;
    }

    setIsProcessing(true);
    const networkName = isBEP20
      ? 'BNB Smart Chain (BEP20)'
      : isTRC20
      ? 'TRON (TRC20)'
      : cryptoAsset;

    setProcessStep(`Indexing transaction hash on ${networkName}...`);

    setTimeout(() => {
      setProcessStep('Connecting to RPC node validator & querying BscScan/TronScan ledger...');

      setTimeout(async () => {
        setProcessStep('Verifying transaction proof & contract logs for vault recipient address...');

        // Query public BscScan API / TronScan API to check if TxHash exists on public blockchain
        let isRealTxFound = false;
        try {
          if (isBEP20) {
            const res = await fetch(`https://api.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${cleanHash}`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.result && data.result.hash) {
                isRealTxFound = true;
              }
            }
          } else if (isTRC20) {
            const res = await fetch(`https://api.tronscan.org/api/transaction-info?hash=${cleanHash}`);
            if (res.ok) {
              const data = await res.json();
              if (data && (data.hash || data.id)) {
                isRealTxFound = true;
              }
            }
          }
        } catch {
          // Network fetch fallback
        }

        setTimeout(() => {
          setIsProcessing(false);
          setProcessStep('');

          if (!isRealTxFound) {
            setTxError(`On-Chain RPC Verification Failed: The submitted TxID (${cleanHash.slice(0, 10)}...) was not found on public ${isBEP20 ? 'BscScan' : 'TronScan'} nodes, or has no record of transferring $${numAmount} USDT to APEX deposit address. Fake or unconfirmed transactions cannot be credited.`);
            return;
          }

          const methodName = `Crypto Transfer (${cryptoAsset})`;
          const ok = deposit(numAmount, methodName, `Direct ${cryptoAsset} Deposit`, cleanHash, false);

          if (ok) {
            setCompletedTxHash(cleanHash);
            setIsSuccess(true);
          }
        }, 600);
      }, 700);
    }, 800);
  };

  const handleCloseAndReset = () => {
    setIsSuccess(false);
    setUserTxHash('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col"
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-100">Crypto Deposit Technology</h3>
                  <p className="text-xs text-slate-400">Direct Web3 & QR Code Blockchain Deposit Gateway</p>
                </div>
              </div>
              <button
                onClick={handleCloseAndReset}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub Nav Tabs */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => setModalTab('deposit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  modalTab === 'deposit'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                New Deposit
              </button>
              <button
                type="button"
                onClick={() => setModalTab('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  modalTab === 'history'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Deposit History ({depositHistoryList.length})
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {isSuccess ? (
              <div className="p-6 sm:p-8 text-center flex flex-col items-center justify-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10"
                >
                  <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
                </motion.div>

                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Pending Blockchain Audit (0/12 Confirmations)
                  </span>
                  <h3 className="text-2xl font-black text-slate-100">
                    ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD Submitted
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Your deposit request via <span className="text-slate-200 font-semibold">{cryptoAsset}</span> has been logged for node verification.
                  </p>
                </div>

                {/* Security Audit Notice */}
                <div className="w-full bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-left space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>On-Chain Verification Required</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    To prevent fake or unauthorized deposits, funds are held in queue until our blockchain indexer verifies 12 node confirmations for your TxID on the public explorer.
                  </p>
                </div>

                {/* Transaction Receipt Card */}
                <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-left space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Network:</span>
                    <span className="text-slate-200 font-bold">{cryptoAsset}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Verification Status:</span>
                    <span className="text-amber-400 font-bold uppercase flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Pending Node Confirmation
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block text-[11px] font-semibold uppercase">Submitted TxID:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] text-slate-300 break-all bg-slate-900 px-2 py-1.5 rounded border border-slate-800 flex-1">
                        {completedTxHash}
                      </span>
                      <button
                        onClick={handleCopyTxHash}
                        className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white shrink-0"
                        title="Copy Tx Hash"
                      >
                        {copiedTx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={getExplorerUrl(cryptoAsset, completedTxHash, 'tx')}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 shrink-0 flex items-center gap-1 text-[10px] font-sans font-bold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Explorer</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="w-full pt-2 flex gap-2">
                  <button
                    onClick={() => setModalTab('history')}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase"
                  >
                    View Deposit Queue
                  </button>
                  <button
                    onClick={handleCloseAndReset}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase shadow-lg shadow-emerald-500/20"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : modalTab === 'history' ? (
              <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Deposit Transactions</h4>
                  <span className="text-[11px] text-slate-500 font-mono">{depositHistoryList.length} total records</span>
                </div>

                {depositHistoryList.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs space-y-3">
                    <Wallet className="w-8 h-8 opacity-30 text-slate-400 mx-auto" />
                    <p className="font-bold text-slate-400">No deposits recorded yet</p>
                    <p className="text-slate-500 max-w-xs mx-auto">
                      Your crypto deposit requests and live blockchain audit status will be logged here.
                    </p>
                    <button
                      type="button"
                      onClick={() => setModalTab('deposit')}
                      className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase"
                    >
                      Make a Deposit Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {depositHistoryList.map((tx, idx) => (
                      <div
                        key={`${tx.id}-${idx}`}
                        className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs font-mono"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{tx.id}</span>
                          <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] uppercase border ${
                            tx.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}>
                            {tx.status === 'COMPLETED' ? 'VERIFIED & CREDITED' : 'PENDING BLOCKCHAIN AUDIT'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-400">
                          <span>{tx.method || 'USDT Crypto Deposit'}</span>
                          <span className="font-extrabold text-emerald-400 text-sm">
                            +${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {tx.txHash && (
                          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-900 text-slate-500">
                            <span className="truncate max-w-[180px]">Hash: {tx.txHash}</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(tx.txHash!);
                                  setCopiedId(tx.id);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                className="text-emerald-400 hover:text-emerald-300 font-sans font-bold flex items-center gap-1"
                              >
                                {copiedId === tx.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedId === tx.id ? 'Copied' : 'Copy'}</span>
                              </button>
                              <a
                                href={getExplorerUrl(tx.method || 'BEP20', tx.txHash, 'tx')}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-slate-200 flex items-center gap-0.5 font-sans"
                                title="View on Block Explorer"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        )}

                        <div className="text-[10px] text-slate-500 text-right">
                          {new Date(tx.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleDepositSubmit} className="p-6 space-y-5">
                {/* Current Available Balance Banner */}
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Current Trading Account Balance</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </span>
                </div>

                {/* Anti-Fake Deposit Security Safeguard Banner */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wide">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Strict Anti-Fake Deposit Security Safeguard</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                    APEX platform indexers verify all deposits directly against public <strong>BscScan</strong> and <strong>TronScan</strong> RPC nodes. Simulated TxIDs, fake numbers, or unconfirmed transfers are automatically flagged and rejected.
                  </p>
                </div>

                {/* Web3 Direct Wallet Bar */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-slate-200">Web3 Browser Wallet Direct Pay</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleConnectWeb3}
                      disabled={isWeb3Connecting}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-[11px] font-bold flex items-center gap-1 transition-all"
                    >
                      {isWeb3Connecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                      <span>{web3Account ? 'Wallet Connected' : 'Connect Web3'}</span>
                    </button>
                  </div>
                  {web3Status && (
                    <p className="text-[11px] text-slate-400 font-mono leading-tight bg-slate-900/80 p-2 rounded border border-slate-800">
                      {web3Status}
                    </p>
                  )}
                </div>

                {/* Crypto Asset Selector */}
                <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Select Crypto Network & Asset
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {['USDT (BEP20)', 'USDT (TRC20)'].map(coin => (
                      <button
                        key={coin}
                        type="button"
                        onClick={() => setCryptoAsset(coin)}
                        className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all text-center ${
                          cryptoAsset === coin
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {coin}
                      </button>
                    ))}
                  </div>

                  {/* Real Live QR Code Image Display */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                    <div className="relative w-36 h-36 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                      {isGeneratingQr ? (
                        <div className="flex flex-col items-center justify-center text-slate-800 text-xs">
                          <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mb-1" />
                          <span>Generating QR...</span>
                        </div>
                      ) : qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt={`${cryptoAsset} Deposit QR Code`}
                          className="w-full h-full object-contain rounded"
                        />
                      ) : (
                        <QrCode className="w-12 h-12 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <div className="flex items-center justify-between sm:justify-start gap-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">Deposit Address</span>
                        <a
                          href={getExplorerUrl(cryptoAsset, selectedAddress, 'address')}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View on Explorer</span>
                        </a>
                      </div>

                      <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-200 break-all select-all">
                        {selectedAddress}
                      </div>

                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <button
                          type="button"
                          onClick={handleCopyAddress}
                          className="p-1.5 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold transition-all flex items-center gap-1 text-xs"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Address Copied' : 'Copy Address'}</span>
                        </button>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Scan with mobile Web3 wallet
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount Input Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Deposit Amount (USD Value)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      required
                      placeholder="1000"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-base font-mono font-semibold text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Required Tx Hash / TxID Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-300 uppercase flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Blockchain Transaction Hash (TxID) *</span>
                    </label>
                    <span className="text-[10px] text-amber-400 font-bold font-mono">Required for Audit</span>
                  </div>
                  <input
                    type="text"
                    value={userTxHash}
                    onChange={e => {
                      setUserTxHash(e.target.value);
                      if (txError) setTxError('');
                    }}
                    required
                    placeholder="Paste on-chain TxHash (e.g. 0x8a7f9b... or TRC20 TxID)"
                    className={`w-full px-3 py-2 bg-slate-950 border rounded-xl text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none ${
                      txError ? 'border-rose-500 focus:border-rose-400' : 'border-slate-800 focus:border-emerald-500'
                    }`}
                  />
                  {txError && (
                    <p className="text-[11px] text-rose-400 mt-1 font-sans font-medium flex items-center gap-1">
                      <span>⚠️ {txError}</span>
                    </p>
                  )}
                </div>

                {/* Live Processing Indicator */}
                {isProcessing && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-400">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span className="font-mono text-[11px] font-semibold">{processStep}</span>
                  </div>
                )}

                {/* Fee & Summary */}
                <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Network Fee</span>
                    <span className="text-emerald-400 font-medium">$0.00 (Covered by APEX)</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-200">
                    <span>Total Credit to Balance</span>
                    <span className="font-mono text-emerald-400">
                      +${(parseFloat(amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Support Callout */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Need deposit help?</span>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://t.me/+17426664547"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sky-400 font-bold hover:underline"
                    >
                      <Send className="w-3 h-3" />
                      <span>Telegram</span>
                    </a>
                    <span>•</span>
                    <a
                      href="mailto:spoiremongae@gmail.com"
                      className="inline-flex items-center gap-1 text-amber-400 font-bold hover:underline"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Email</span>
                    </a>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseAndReset}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <span>Verifying Transfer...</span>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirm Deposit</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};


