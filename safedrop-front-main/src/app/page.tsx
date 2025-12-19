"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Link as LinkIcon, CheckCircle2, XCircle, ChevronRight, Activity, Lock, Smartphone, Globe, Key, AlertTriangle, Info, Share2, Edit3, Save, Flame, Sun, Moon, Shield, Zap, ShieldAlert, LayoutDashboard, Wallet, TrendingUp, Gift, Coins } from 'lucide-react';

// Wallet imports
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import '@rainbow-me/rainbowkit/styles.css';
import { AnimatedBeam } from "@/components/ui/animated-beam";

// --- Data: Projects List ---
const PROJECTS = [
    { name: "Cedra Network", logo: "https://cedra.network/images/logo.svg", active: true },
    { name: "MetaMask", logo: "https://metamask.io/favicons/default/favicon.svg", active: false },
    { name: "OpenSea", logo: "https://storage.googleapis.com/opensea-static/Logos/OpenSea-Full-Logo%20(light).svg", active: false },
    { name: "Base", logo: "https://base.org/document/safari-pinned-tab.svg", active: false },
    { name: "Polymarket", logo: "https://polymarket.com/icons/apple-touch-icon.png", active: false },
    { name: "Aztec Network", logo: "https://cdn.prod.website-files.com/62085205a4b50b58e8594080/620eb31cbef2b124c3bc1ccc_aztec-logo.svg", active: false },
    { name: "Zerion", logo: "https://cdn.prod.website-files.com/625440d0613eaa2ace513f45/68e7e809aa6bd76e62f7b730_Zerion%20icon.png", active: false },
    { name: "Rabby Wallet", logo: "https://rabby.io/assets/images/logo-new.svg", active: false },
    { name: "Rainbow", logo: "https://framerusercontent.com/images/bgm16Z9pe9YGDU72vUuHTzyYYk.png", active: false },
    { name: "Infinex", logo: "https://infinex.xyz/_next/static/media/infinex-combination-mark.3101c606.svg", active: false },
    { name: "Tea Protocol", logo: "https://cdn.prod.website-files.com/650d0534262efafa72b3ccab/68bf27d3ad5260d85faedad9_Tea_logo_svg.svg", active: false },
    { name: "zkPass", logo: "https://zkpass.org/icon.svg", active: false },
    { name: "Immunefi", logo: "https://immunefi.com/images/logo-white.svg", active: false },
];

// --- Data: Security Checks ---
type SecurityStatus = 'safe' | 'warning' | 'blocked' | 'off';

interface SecurityCheck {
    id: string;
    title: string;
    points: number;
    icon: React.ComponentType<{ className?: string }>;
    description: {
        whatChecks: string;
        howPoints: string;
        scoreRules: string;
        action: string;
    };
}

const SECURITY_CHECKS: SecurityCheck[] = [
    {
        id: 'walletThreat',
        title: 'Wallet Threat Scan',
        points: 35,
        icon: Activity,
        description: {
            whatChecks: "SafeDrop checks your burner wallet for risk flags linked to scams, spam, bot activity, and risky on chain behavior. SafeDrop uses a 0 to 100 riskScore, grouped into Low, Medium, High. (Webacy)",
            howPoints: "Safe adds +35. Warning adds +18. Blocked adds +0 and sets SAFU Score to 0. Off adds +0.",
            scoreRules: "Safe (riskScore 0-23), Warning (23.1-50), Blocked (50.1-100).",
            action: "If Warning, switch to a fresh burner. If Blocked, stop and close the tab, then use a new burner."
        }
    },
    {
        id: 'transactionShield',
        title: 'Transaction Shield',
        points: 30,
        icon: Shield,
        description: {
            whatChecks: "SafeDrop scans what you are about to sign, looking for malicious contracts, suspicious addresses, risky domains, and phishing signals. (Webacy)",
            howPoints: "Safe adds +30. Warning adds +15. Blocked adds +0 and sets SAFU Score to 0. Off adds +0.",
            scoreRules: "Safe (no risk), Warning (suspicious), Blocked (malicious), Off (no request).",
            action: "If Blocked, do not sign. Close the tab. Re-open from official source."
        }
    },
    {
        id: 'approvalGuard',
        title: 'Approval Guard',
        points: 30,
        icon: Lock,
        description: {
            whatChecks: "SafeDrop lists your approvals and flags risky spenders. Approvals stay active until you revoke or change them. (Webacy)",
            howPoints: "Safe adds +30. Warning adds +15. Blocked adds +0 and sets SAFU Score to 0. Off adds +0.",
            scoreRules: "Safe (0 risky), Warning (1+ risky), Blocked (risky + unlimited allowance).",
            action: "Revoke risky approvals. Keep approvals minimal."
        }
    },
    {
        id: 'sanctionsCheck',
        title: 'Sanctions Check',
        points: 5,
        icon: ShieldAlert,
        description: {
            whatChecks: "SafeDrop checks if an address appears in sanctions address databases (OFAC).",
            howPoints: "Safe adds +5. Blocked adds +0. Off adds +0.",
            scoreRules: "Safe (no match), Blocked (match found).",
            action: "If Blocked, SafeDrop disables actions for compliance."
        }
    }
];

// --- Theme-aware UI Components ---

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    dark: boolean;
}

const GlassCard = ({ children, className = "", onClick, dark }: GlassCardProps) => (
    <div
        onClick={onClick}
        className={`relative overflow-visible backdrop-blur-xl rounded-3xl shadow-lg transition-all duration-300 hover:scale-[1.01] ${dark
            ? 'bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20'
            : 'bg-white/90 border border-gray-200 shadow-xl hover:bg-white hover:border-gray-300'
            } ${className}`}
    >
        {children}
    </div>
);
interface BadgeProps {
    children: React.ReactNode;
    color?: string;
    dark: boolean;
}

const Badge = ({ children, color = "blue", dark }: BadgeProps) => {
    const darkColors: Record<string, string> = {
        blue: "bg-blue-500/20 text-blue-200 border-blue-500/30",
        green: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
        purple: "bg-purple-500/20 text-purple-200 border-purple-500/30",
        red: "bg-red-500/20 text-red-200 border-red-500/30",
        orange: "bg-orange-500/20 text-orange-200 border-orange-500/30",
        gray: "bg-white/10 text-white/40 border-white/10",
    };
    const lightColors: Record<string, string> = {
        blue: "bg-blue-100 text-blue-700 border-blue-200",
        green: "bg-emerald-100 text-emerald-700 border-emerald-200",
        purple: "bg-purple-100 text-purple-700 border-purple-200",
        red: "bg-red-100 text-red-700 border-red-200",
        orange: "bg-orange-100 text-orange-700 border-orange-200",
        gray: "bg-gray-100 text-gray-500 border-gray-200",
    };
    const colors = dark ? darkColors : lightColors;
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[color]} backdrop-blur-md font-display tracking-wide`}>
            {children}
        </span>
    );
};

// --- Security Check Item ---
interface SecurityCheckItemProps {
    check: SecurityCheck;
    status: SecurityStatus;
    dark: boolean;
}

const SecurityCheckItem = ({ check, status, dark }: SecurityCheckItemProps) => {
    const Icon = check.icon;
    const [isHovered, setIsHovered] = useState(false);
    const [showAbove, setShowAbove] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    // Determine tooltip position based on available space
    useEffect(() => {
        if (isHovered && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceAbove = rect.top;
            const tooltipHeight = 350; // Tooltip height + extra margin
            // Show below if not enough space above
            setShowAbove(spaceAbove > tooltipHeight);
        }
    }, [isHovered]);

    // Status Styles
    const statusConfig = {
        safe: {
            color: "text-emerald-500",
            bg: dark ? "bg-emerald-500/10" : "bg-emerald-50",
            border: dark ? "border-emerald-500/20" : "border-emerald-200",
            label: "Safe"
        },
        warning: {
            color: "text-orange-500",
            bg: dark ? "bg-orange-500/10" : "bg-orange-50",
            border: dark ? "border-orange-500/20" : "border-orange-200",
            label: "Warning"
        },
        blocked: {
            color: "text-red-500",
            bg: dark ? "bg-red-500/10" : "bg-red-50",
            border: dark ? "border-red-500/20" : "border-red-200",
            label: "Blocked"
        },
        off: {
            color: dark ? "text-white/40" : "text-gray-400",
            bg: dark ? "bg-white/5" : "bg-gray-50",
            border: dark ? "border-white/5" : "border-gray-200",
            label: "Off"
        }
    };

    const currentStatus = statusConfig[status];

    return (
        <div
            ref={containerRef}
            className="relative w-full group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${currentStatus.bg} ${currentStatus.border} ${dark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${dark ? 'bg-black/20' : 'bg-white'}`}>
                        <Icon className={`w-4 h-4 ${currentStatus.color}`} />
                    </div>
                    <div className="text-left">
                        <div className={`text-sm font-medium font-display ${dark ? 'text-white' : 'text-gray-900'}`}>{check.title}</div>
                        <div className={`text-[10px] uppercase tracking-wider font-bold ${currentStatus.color}`}>
                            {currentStatus.label}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`font-bold font-display text-sm ${status === 'off' || status === 'blocked' ? (dark ? 'text-white/20' : 'text-gray-300') : currentStatus.color}`}>
                        {status === 'blocked' ? '+0' : `+${check.points}`}
                    </span>
                    <Info className={`w-4 h-4 ${dark ? 'text-white/20' : 'text-gray-300'}`} />
                </div>
            </div>

            {/* Smart Auto-positioning Tooltip */}
            {isHovered && (
                <div className={`absolute left-0 w-80 z-50 p-5 rounded-xl shadow-2xl backdrop-blur-xl animate-[fadeInScale_0.2s_ease-out] pointer-events-none border ${showAbove ? 'bottom-full mb-3' : 'top-full mt-3'
                    } ${dark ? 'bg-[#1a1b1f] border-white/10' : 'bg-white border-gray-200'}`}>
                    {/* Arrow - positioned based on showAbove */}
                    <div className={`absolute left-6 w-3 h-3 rotate-45 ${showAbove
                        ? 'bottom-[-6px] border-r border-b'
                        : 'top-[-6px] border-l border-t'
                        } ${dark ? 'bg-[#1a1b1f] border-white/10' : 'bg-white border-gray-200'}`}></div>

                    <div className="flex items-center justify-between mb-3 border-b pb-2 border-white/10">
                        <h4 className={`font-display font-bold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>{check.title}</h4>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${dark ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-500'}`}>{check.points} pts</span>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${dark ? 'text-teal-400' : 'text-teal-600'}`}>What this checks</p>
                            <p className={`text-xs leading-relaxed ${dark ? 'text-white/70' : 'text-gray-600'}`}>{check.description.whatChecks}</p>
                        </div>
                        <div>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${dark ? 'text-purple-400' : 'text-purple-600'}`}>Score Rules</p>
                            <p className={`text-xs leading-relaxed ${dark ? 'text-white/70' : 'text-gray-600'}`}>{check.description.scoreRules}</p>
                        </div>
                        <div>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${dark ? 'text-blue-400' : 'text-blue-600'}`}>Points</p>
                            <p className={`text-xs leading-relaxed ${dark ? 'text-white/70' : 'text-gray-600'}`}>{check.description.howPoints}</p>
                        </div>
                        <div>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${dark ? 'text-orange-400' : 'text-orange-600'}`}>Action</p>
                            <p className={`text-xs leading-relaxed ${dark ? 'text-white/70' : 'text-gray-600'}`}>{check.description.action}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Social Boost Item ---
interface SocialBoostItemProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    points: number;
    isCompleted: boolean;
    dark: boolean;
    onClick?: () => void;
}

const SocialBoostItem = ({ icon: Icon, title, points, isCompleted, dark, onClick }: SocialBoostItemProps) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 group ${isCompleted
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : dark
                ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}>
        <div className={`p-3 rounded-full mb-2 transition-transform group-hover:scale-110 ${isCompleted
            ? 'bg-emerald-500/20 text-emerald-500'
            : dark
                ? 'bg-white/5 text-white/40'
                : 'bg-gray-100 text-gray-400'
            }`}>
            <Icon className="w-5 h-5" />
        </div>
        <div className={`text-xs font-bold font-display mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</div>
    </button>
);


// --- Main Dashboard Component ---

export default function SafeDropDashboard() {
    const [score, setScore] = useState(0);
    const [coverage, setCoverage] = useState(0);
    const [isBurnerConnected, setIsBurnerConnected] = useState(false);
    const [isAntiDrainActive, setIsAntiDrainActive] = useState(false);
    const [connectStep, setConnectStep] = useState(0);
    const [networkType, setNetworkType] = useState<'evm' | 'sol' | null>(null);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [activeProject, setActiveProject] = useState(PROJECTS[0]);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);
    const vaultRef = useRef<HTMLDivElement>(null);
    const burnerRef = useRef<HTMLDivElement>(null);

    // Social Verification State
    const [socials, setSocials] = useState({
        exchange: false,
        twitter: false,
        discord: false,
        oauth: false
    });

    const toggleSocial = (key: keyof typeof socials) => {
        if (!isVaultConnected && !isBurnerConnected) return;
        setSocials(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Referral State
    const [referralLink, setReferralLink] = useState("safedrop.app/ref/user-8f4a");
    const [isEditingRef, setIsEditingRef] = useState(false);
    const [tempRefLink, setTempRefLink] = useState(referralLink);
    const [isCopied, setIsCopied] = useState(false);
    const [showPartnerDashboard, setShowPartnerDashboard] = useState(false);

    // Exchange Verification State
    const [showExchangeModal, setShowExchangeModal] = useState(false);
    const [selectedExchange, setSelectedExchange] = useState<string | null>(null);
    const [exchangeForm, setExchangeForm] = useState({ key: '', secret: '', passphrase: '' });
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);

    const EXCHANGES = [
        { id: 'binance', name: 'Binance', logo: '/assets/binance/logo.svg', needsPassphrase: false, screens: ['/assets/binance/screen1.png', '/assets/binance/screen2.png'] },
        { id: 'okx', name: 'OKX', logo: '/assets/okx/logo.svg', needsPassphrase: true, screens: ['/assets/okx/screen1.jpg'] },
        { id: 'bybit', name: 'Bybit', logo: '/assets/bybit/logo.svg', needsPassphrase: false, screens: ['/assets/bybit/screen1.jpg', '/assets/bybit/screen2.jpg'] },
        { id: 'kucoin', name: 'KuCoin', logo: '/assets/kucoin/logo.svg', needsPassphrase: true, screens: ['/assets/kucoin/screen1.jpg'] },
        { id: 'bitget', name: 'Bitget', logo: '/assets/bitget/logo.svg', needsPassphrase: true, screens: ['/assets/bitget/screen1.jpg', '/assets/bitget/screen2.jpg'] },
        { id: 'gate', name: 'Gate.io', logo: '/assets/gate/logo.svg', needsPassphrase: false, screens: ['/assets/gate/screen1.jpg'] },
        { id: 'mexc', name: 'MEXC', logo: '/assets/mexc/logo.svg', needsPassphrase: false, screens: ['/assets/mexc/screen1.jpg'] },
        { id: 'bingx', name: 'BingX', logo: '/assets/bingx/logo.svg', needsPassphrase: false, screens: ['/assets/bingx/screen1.jpg'] },
        { id: 'kraken', name: 'Kraken', logo: '/assets/kraken/logo.svg', needsPassphrase: false, screens: ['/assets/kraken/screen1.jpg'] },
    ];

    const [showApiHelp, setShowApiHelp] = useState(false);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    // Wallet Hooks - EVM (RainbowKit/Wagmi)
    const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
    const { disconnect: disconnectEvm } = useDisconnect();
    const { openConnectModal } = useConnectModal();

    // Wallet Hooks - Solana
    const { publicKey: solanaPublicKey, connected: isSolanaConnected, disconnect: disconnectSolana } = useWallet();
    const { setVisible: setSolanaModalVisible } = useWalletModal();

    // Hydration guard to avoid server/client mismatch on wallet state
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // Computed: is any wallet connected?
    const isVaultConnected = mounted ? (isEvmConnected || isSolanaConnected) : false;
    const isConnected = isVaultConnected || isBurnerConnected; // Overall app connected state
    const walletAddress = mounted ? (evmAddress || solanaPublicKey?.toBase58() || '') : '';
    const shortAddress = walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : '';

    // --- Logic: Security Status Simulation ---
    const [checkStatuses, setCheckStatuses] = useState<Record<string, SecurityStatus>>({
        walletThreat: 'off',
        transactionShield: 'off',
        approvalGuard: 'off',
        sanctionsCheck: 'off'
    });

    useEffect(() => {
        // 1. Coverage Logic
        let newCoverage = 0;
        if (isVaultConnected && isBurnerConnected) newCoverage = 100;
        else if (isVaultConnected) newCoverage = 35; // Approval (30) + Sanctions (5)
        else if (isBurnerConnected) newCoverage = 35; // Wallet Threat (35)

        setCoverage(newCoverage);

        // 2. Status Simulation
        // When connected, we simulate 'safe' for enabled checks
        // In a real app, this would come from an API response
        const newStatuses: Record<string, SecurityStatus> = {
            walletThreat: isBurnerConnected ? 'safe' : 'off',       // Active if burner linked
            transactionShield: (isVaultConnected || isBurnerConnected) ? 'safe' : 'off', // Active if any wallet linked (protects signatures)
            approvalGuard: isVaultConnected ? 'safe' : 'off',   // Active if vault connected
            sanctionsCheck: isVaultConnected ? 'safe' : 'off'   // Active if vault connected
        };

        setCheckStatuses(newStatuses);

        // 3. Score Calculation
        let newScore = 0;
        SECURITY_CHECKS.forEach(check => {
            const status = newStatuses[check.id];
            if (status === 'safe') newScore += check.points;
            else if (status === 'warning') newScore += Math.floor(check.points / 2);
            // 'blocked' would set score to 0 globally in real logic, usually
        });

        setScore(newScore);

    }, [isVaultConnected, isBurnerConnected]);


    // Gauge Logic
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const handleConnectClick = () => {
        if (isVaultConnected) {
            if (isEvmConnected) disconnectEvm();
            if (isSolanaConnected) disconnectSolana();
        } else {
            setConnectStep(1);
        }
    };

    const selectNetwork = (network: 'evm' | 'sol') => {
        setNetworkType(network);
        setConnectStep(0);

        if (network === 'evm' && openConnectModal) {
            openConnectModal();
        } else if (network === 'sol') {
            setSolanaModalVisible(true);
        }
    };

    const handleAddBurner = () => {
        setIsBurnerConnected(true);
    };

    const saveReferral = () => {
        setReferralLink(tempRefLink);
        setIsEditingRef(false);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleExchangeVerify = async () => {
        if (!selectedExchange || !walletAddress) return;

        setIsVerifying(true);
        setVerificationError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL || ''}/api/verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exchange: selectedExchange,
                    key: exchangeForm.key,
                    secret: exchangeForm.secret,
                    passphrase: exchangeForm.passphrase,
                    wallet: walletAddress
                })
            });

            const result = await response.json();

            if (result.found) {
                setSocials(prev => ({ ...prev, exchange: true }));
                setShowExchangeModal(false);
                setSelectedExchange(null);
                setExchangeForm({ key: '', secret: '', passphrase: '' });
            } else {
                setVerificationError('Wallet address not found in this exchange. Make sure you use the correct API keys.');
            }
        } catch {
            setVerificationError('Failed to verify. Please check your API credentials and try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const openExchangeModal = () => {
        if (!isConnected) return;
        setShowExchangeModal(true);
    };

    // Shorthand for dark mode
    const d = isDarkMode;

    return (
        <div className={`min-h-screen transition-colors duration-300 font-sans selection:bg-teal-500/30 overflow-x-hidden relative ${d ? 'bg-[#050505] text-white' : 'bg-gradient-to-br from-slate-50 via-white to-gray-100 text-gray-900'
            }`}>
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse ${d ? 'bg-purple-900/20' : 'bg-purple-200/40'
                    }`} />
                <div className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] ${d ? 'bg-teal-900/10' : 'bg-teal-200/30'
                    }`} />
                <div className={`absolute top-[20%] left-[50%] transform -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[100px] ${d ? 'bg-blue-900/10' : 'bg-blue-100/30'
                    }`} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12">

                {/* Header */}
                <header className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-3">
                        {/* Logo - different for dark/light theme */}
                        <img
                            src={d ? "/assets/logo.svg" : "/assets/logo-light.png"}
                            alt="SafeDrop"
                            className="h-12 md:h-16 w-auto cursor-pointer hover:scale-105 transition-transform"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`p-3 rounded-full transition-all duration-300 ${d
                                ? 'bg-white/10 hover:bg-white/20 text-yellow-400'
                                : 'bg-gray-100 hover:bg-gray-200 text-indigo-600'
                                }`}
                        >
                            {d ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* Connect Button */}
                        <button
                            onClick={handleConnectClick}
                            className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 backdrop-blur-md border font-display tracking-wide ${isConnected
                                ? d
                                    ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                                    : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                                : d
                                    ? "bg-white text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-105 border-transparent"
                                    : "bg-gray-900 text-white hover:bg-gray-800 hover:scale-105 border-transparent shadow-lg"
                                }`}
                        >
                            {isVaultConnected ? shortAddress : isBurnerConnected ? "Burner Only" : "Connect Wallet"}
                        </button>
                    </div>
                </header>

                {/* Main Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: SAFU Score */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <GlassCard dark={d} className="p-8 flex flex-col items-center justify-center min-h-[500px] relative">
                            <div className="absolute top-6 left-6 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-teal-500" />
                                <span className="text-[10px] font-bold font-display text-teal-500 tracking-wider uppercase">Anti-Drain Shield</span>
                            </div>

                            <h2 className={`text-2xl font-bold mb-6 mt-4 font-display uppercase tracking-widest ${d ? 'text-white' : 'text-gray-900'}`}>SAFU Score</h2>

                            {/* Gauge */}
                            <div className="relative w-56 h-56 flex items-center justify-center mb-4">
                                <svg className="absolute w-full h-full transform -rotate-90">
                                    <circle
                                        cx="112"
                                        cy="112"
                                        r={radius}
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        className={d ? "text-white/5" : "text-gray-200"}
                                    />
                                    <circle
                                        cx="112"
                                        cy="112"
                                        r={radius}
                                        stroke="url(#gradient)"
                                        strokeWidth="12"
                                        fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#2dd4bf" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                <div className="text-center">
                                    <span className="block text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-teal-400 to-purple-500 font-display">
                                        {score}
                                    </span>
                                    <span className={`text-xs font-medium font-display uppercase tracking-widest ${d ? 'text-white/40' : 'text-gray-400'}`}>Safety Score</span>
                                </div>

                                <div className="absolute inset-0 bg-teal-500/5 blur-3xl rounded-full pointer-events-none" />
                            </div>

                            {/* Coverage Label */}
                            <div className="mb-8 flex flex-col items-center">
                                <div className={`text-sm font-medium ${d ? 'text-white/70' : 'text-gray-600'}`}>
                                    Coverage: <span className="text-teal-500 font-bold">{coverage}/100</span>
                                </div>
                                <div className={`w-32 h-1 rounded-full mt-2 ${d ? 'bg-white/10' : 'bg-gray-200'}`}>
                                    <div className="h-full rounded-full bg-teal-500 transition-all duration-500" style={{ width: `${coverage}%` }}></div>
                                </div>
                            </div>

                            {/* Security Checks List */}
                            <div className="w-full space-y-3">
                                {SECURITY_CHECKS.map((check) => (
                                    <SecurityCheckItem
                                        key={check.id}
                                        check={check}
                                        status={checkStatuses[check.id]}
                                        dark={d}
                                    />
                                ))}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* 1. Wallet Management Container */}
                        <GlassCard dark={d} className="p-0">
                            <div className={`p-6 border-b flex justify-between items-center ${d ? 'border-white/5 bg-white/[0.01]' : 'border-gray-100 bg-gray-50/50'}`}>
                                <div>
                                    <h3 className={`text-xl font-semibold font-display ${d ? 'text-white' : 'text-gray-900'}`}>Wallet Management</h3>
                                    <p className={`text-sm mt-1 ${d ? 'text-white/40' : 'text-gray-500'}`}>Architecture &quot;Burner -&gt; Vault&quot;</p>
                                </div>
                                <Badge dark={d} color={isConnected ? "green" : "red"}>{isConnected ? "Active" : "Setup Required"}</Badge>
                            </div>

                            {/* Row 1: Wallets */}
                            <div ref={containerRef} className={`p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative border-b ${d ? 'border-white/5' : 'border-gray-100'}`}>
                                {/* Vault Wallet */}
                                <div ref={vaultRef} className={`z-20 flex-1 w-full p-6 rounded-2xl text-center relative group ${d
                                    ? 'bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/20'
                                    : 'bg-gradient-to-b from-blue-50 to-white border border-blue-200 shadow-sm'
                                    }`}>
                                    <div className="absolute top-4 right-4"><Lock className={`w-4 h-4 ${d ? 'text-blue-400/50' : 'text-blue-400'}`} /></div>
                                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${d ? 'bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-blue-100'
                                        }`}>
                                        <Shield className={`w-8 h-8 ${d ? 'text-blue-400' : 'text-blue-600'}`} />
                                    </div>
                                    <h4 className={`text-lg font-medium font-display ${d ? 'text-blue-100' : 'text-blue-900'}`}>Vault (Safe)</h4>
                                    <p className={`text-xs mt-1 mb-4 ${d ? 'text-blue-200/50' : 'text-blue-600/60'}`}>Main Assets & Rewards</p>
                                    <div className={`rounded-lg py-2 px-3 text-xs font-mono truncate border ${d ? 'bg-black/30 text-white/60 border-white/5' : 'bg-white text-gray-600 border-gray-200'
                                        }`}>
                                        {isVaultConnected ? shortAddress : "Not Connected"}
                                    </div>
                                </div>

                                {/* Connection Chain */}
                                <div className="flex flex-col items-center justify-center gap-2 z-20">
                                    <div className="h-0.5 w-16 md:w-24 opacity-0"></div>
                                    <div className={`p-2 rounded-full border ${isConnected && isBurnerConnected
                                        ? d ? "bg-white/10 border-white/50 text-white" : "bg-gray-100 border-gray-400 text-gray-700"
                                        : d ? "bg-black/40 border-white/10 text-white/20" : "bg-gray-50 border-gray-200 text-gray-300"
                                        }`}>
                                        <LinkIcon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-[10px] uppercase tracking-widest font-semibold ${d ? 'text-white/30' : 'text-gray-400'}`}>
                                        {isConnected && isBurnerConnected ? "SECURED" : "UNLINKED"}
                                    </span>
                                </div>

                                {/* Burner Wallet */}
                                <div ref={burnerRef} className={`z-20 flex-1 w-full p-6 rounded-2xl text-center relative group transition-colors ${d
                                    ? 'bg-gradient-to-b from-orange-500/10 to-transparent border border-orange-500/20 hover:bg-orange-500/5'
                                    : 'bg-gradient-to-b from-orange-50 to-white border border-orange-200 shadow-sm hover:border-orange-300'
                                    }`}>
                                    <div className="absolute top-4 right-4"><Activity className={`w-4 h-4 ${d ? 'text-orange-400/50' : 'text-orange-400'}`} /></div>
                                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${d ? 'bg-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'bg-orange-100'
                                        }`}>
                                        <Flame className={`w-8 h-8 ${d ? 'text-orange-400' : 'text-orange-600'}`} />
                                    </div>
                                    <h4 className={`text-lg font-medium font-display ${d ? 'text-orange-100' : 'text-orange-900'}`}>Burner</h4>
                                    <p className={`text-xs mt-1 mb-4 ${d ? 'text-orange-200/50' : 'text-orange-600/60'}`}>Interactions & Claims</p>
                                    {isConnected ? (
                                        <button
                                            onClick={handleAddBurner}
                                            className={`w-full rounded-lg py-2 px-3 text-xs font-mono truncate cursor-pointer transition-colors ${d
                                                ? 'bg-orange-500/20 border border-orange-500/30 text-orange-200 hover:bg-orange-500/30'
                                                : 'bg-orange-100 border border-orange-200 text-orange-700 hover:bg-orange-200'
                                                }`}
                                        >
                                            {isBurnerConnected ? "0x7a...4B2c" : "+ Add Wallet"}
                                        </button>
                                    ) : (
                                        <div className={`rounded-lg py-2 px-3 text-xs border ${d ? 'bg-black/30 text-white/20 border-white/5' : 'bg-gray-50 text-gray-300 border-gray-200'
                                            }`}>Waiting...</div>
                                    )}
                                </div>

                                <AnimatedBeam
                                    containerRef={containerRef}
                                    fromRef={burnerRef}
                                    toRef={vaultRef}
                                    curvature={0}
                                    startYOffset={0}
                                    endYOffset={0}
                                    pathWidth={2}
                                    gradientStartColor="#f97316" // Orange
                                    gradientStopColor="#3b82f6"  // Blue
                                    pathColor={d ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
                                />
                            </div>

                            {/* Row 2: Social Boosts (Previously Verifications) */}
                            <div className={`p-6 border-b ${d ? 'border-white/5' : 'border-gray-100'}`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Zap className={`w-4 h-4 ${d ? 'text-yellow-400' : 'text-yellow-600'}`} />
                                    <h4 className={`text-sm font-bold font-display uppercase tracking-wider ${d ? 'text-white/60' : 'text-gray-500'}`}>Proof-of-User</h4>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <SocialBoostItem
                                        icon={Activity}
                                        title="Exchange"
                                        points={40}
                                        isCompleted={socials.exchange}
                                        onClick={openExchangeModal}
                                        dark={d}
                                    />
                                    <SocialBoostItem
                                        icon={Smartphone}
                                        title="X (Twitter)"
                                        points={25}
                                        isCompleted={socials.twitter}
                                        onClick={() => toggleSocial('twitter')}
                                        dark={d}
                                    />
                                    <SocialBoostItem
                                        icon={Globe}
                                        title="Discord"
                                        points={15}
                                        isCompleted={socials.discord}
                                        onClick={() => toggleSocial('discord')}
                                        dark={d}
                                    />
                                    <SocialBoostItem
                                        icon={Key}
                                        title="OAuth"
                                        points={20}
                                        isCompleted={socials.oauth}
                                        onClick={() => toggleSocial('oauth')}
                                        dark={d}
                                    />
                                </div>
                            </div>

                            {/* Row 3: Project Selector */}
                            <div className="p-6">
                                <div className={`w-full border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors ${d
                                    ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-full p-1 flex items-center justify-center shadow-lg">
                                            <img src={activeProject.logo} alt={activeProject.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <h4 className={`text-lg font-medium font-display ${d ? 'text-white' : 'text-gray-900'}`}>Interactions and activity in Ecosystem</h4>
                                            <p className={`text-xs mt-1 ${d ? 'text-white/40' : 'text-gray-500'}`}>
                                                Active Project: <span className={d ? 'text-white/80' : 'text-gray-700'}>{activeProject.name}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowProjectModal(true)}
                                        className={`px-6 py-2.5 border rounded-xl text-sm font-display font-medium transition-all flex items-center gap-2 ${d
                                            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                                            }`}
                                    >
                                        Choose Project <ChevronRight className={`w-4 h-4 ${d ? 'text-white/40' : 'text-gray-400'}`} />
                                    </button>
                                </div>
                            </div>
                        </GlassCard>

                        {/* 2. Anti-Drain Protection */}
                        <GlassCard dark={d} className={`p-0 transition-all duration-300 ${isAntiDrainActive
                            ? 'border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-900/10 to-transparent'
                            : d
                                ? 'grayscale opacity-80 hover:opacity-100 hover:grayscale-0'
                                : 'opacity-70 hover:opacity-100'
                            }`}>
                            <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-start gap-5">
                                    <div className={`p-3 rounded-xl shrink-0 ${isAntiDrainActive
                                        ? 'bg-purple-500/20 text-purple-500'
                                        : d ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        <AlertTriangle className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                                            <h3 className={`text-lg font-bold font-display ${isAntiDrainActive
                                                ? d ? 'text-white' : 'text-gray-900'
                                                : d ? 'text-white/50' : 'text-gray-400'
                                                }`}>Anti-Drain Protection</h3>
                                            <Badge dark={d} color={isAntiDrainActive ? 'purple' : 'gray'}>{isAntiDrainActive ? 'Active' : 'Inactive'}</Badge>
                                        </div>
                                        <p className={`text-sm mb-2 max-w-lg ${d ? 'text-white/60' : 'text-gray-500'}`}>
                                            Has your wallet been compromised? Funds can be automatically withdrawn to your Vault.
                                        </p>
                                        <p className={`text-xs flex items-center gap-1.5 ${d ? 'text-white/40' : 'text-gray-400'}`}>
                                            <Info className="w-3 h-3" />
                                            15% success fee, only from what is actually saved from draining.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsAntiDrainActive(!isAntiDrainActive)}
                                    className={`px-6 py-3 rounded-xl font-display text-sm font-medium transition-all shrink-0 ${isAntiDrainActive
                                        ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30'
                                        : d
                                            ? 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                                            : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                        }`}
                                >
                                    {isAntiDrainActive ? 'Configure' : 'Enable'}
                                </button>
                            </div>
                        </GlassCard>

                        {/* 3. Active Campaigns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <GlassCard dark={d} className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center p-1 ${d ? 'bg-white/10' : 'bg-gray-100'}`}>
                                        <img src="https://jup.ag/_next/image?q=75&url=%2Fsvg%2Fjupiter-logo.png&w=96" alt="Jupiter" className="w-full h-full object-contain" />
                                    </div>
                                    <Badge dark={d} color="purple">Live</Badge>
                                </div>
                                <h4 className={`text-lg font-medium font-display ${d ? 'text-white' : 'text-gray-900'}`}>Jupiter Exchange</h4>
                                <p className={`text-sm mt-1 mb-4 ${d ? 'text-white/50' : 'text-gray-500'}`}>Requires SAFU Score &gt; 60</p>
                                <button className={`w-full py-2 rounded-lg border transition-colors text-sm font-display ${d
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                                    }`}>
                                    View Details
                                </button>
                            </GlassCard>

                            <GlassCard dark={d} className="p-6 relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center p-1 ${d ? 'bg-white/10' : 'bg-gray-100'}`}>
                                        <img src="https://lh3.googleusercontent.com/YQnjQjJ6NuY_rxRwy8JA177ONpmPiOdFpud8zK-ebcS8-r3mQzwrzmqlueLSvKw1SsaoeBYua7XePZ632xXM4aHUzw%3Ds60" alt="Backpack" className="w-full h-full object-contain rounded-md" />
                                    </div>
                                    <Badge dark={d} color="green">New</Badge>
                                </div>
                                <h4 className={`relative z-10 text-lg font-medium font-display ${d ? 'text-white' : 'text-gray-900'}`}>Backpack Drop</h4>
                                <p className={`relative z-10 text-sm mt-1 mb-4 ${d ? 'text-white/50' : 'text-gray-500'}`}>SafeDrop partners get x1.2 boost</p>
                                <button className="relative z-10 w-full py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/30 transition-colors text-sm font-display">
                                    Participate Safely
                                </button>
                            </GlassCard>
                        </div>

                    </div>
                </div>

                {/* 4. Referral System */}
                <div className="mt-12 animate-[fadeInScale_0.5s_ease-out]">
                    <GlassCard dark={d} className={`p-8 ${d
                        ? 'border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-purple-500/5'
                        : 'border-teal-200 bg-gradient-to-br from-teal-50/50 to-purple-50/50'
                        }`}>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className={`text-2xl font-bold font-display ${d ? 'text-white' : 'text-gray-900'}`}>Referral Program</h3>
                                    <div className="relative group/tier">
                                        <Info className={`w-4 h-4 cursor-help ${d ? 'text-white/40 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'}`} />
                                        <div className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-80 p-4 rounded-xl shadow-xl z-[100] opacity-0 pointer-events-none group-hover/tier:opacity-100 group-hover/tier:pointer-events-auto transition-opacity ${d ? 'bg-[#1a1b1f] border border-white/10' : 'bg-white border border-gray-200'}`}>
                                            <div className={`text-sm font-bold mb-3 ${d ? 'text-white' : 'text-gray-900'}`}>Lifetime Accumulation</div>
                                            <div className="space-y-2.5 text-sm">
                                                <div className={d ? 'text-white/70' : 'text-gray-600'}>
                                                    <span className="text-teal-400 font-semibold">Scout:</span> $0 - $10k Revenue
                                                    <div className={`text-xs mt-0.5 ${d ? 'text-white/50' : 'text-gray-500'}`}>Direct 5% / Sub-referral 2%</div>
                                                </div>
                                                <div className={d ? 'text-white/70' : 'text-gray-600'}>
                                                    <span className="text-blue-400 font-semibold">Hunter:</span> $10k - $50k Revenue
                                                    <div className={`text-xs mt-0.5 ${d ? 'text-white/50' : 'text-gray-500'}`}>Direct 7% / Sub-referral 3%</div>
                                                </div>
                                                <div className={d ? 'text-white/70' : 'text-gray-600'}>
                                                    <span className="text-purple-400 font-semibold">Guardian:</span> $50k+ Revenue
                                                    <div className={`text-xs mt-0.5 ${d ? 'text-white/50' : 'text-gray-500'}`}>Direct 10% / Sub-referral 5%</div>
                                                </div>
                                                <div className={`pt-2 border-t ${d ? 'border-white/10 text-white/70' : 'border-gray-200 text-gray-600'}`}>
                                                    <span className="text-yellow-400 font-semibold">Enterprise B2B:</span>
                                                    <div className={`text-xs mt-0.5 ${d ? 'text-white/50' : 'text-gray-500'}`}>Direct 14% / Sub-referral 1%</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className={d ? 'text-white/60' : 'text-gray-600'}>Invite friends to SafeDrop and earn rewards for every verified user.</p>
                            </div>

                            <div className="flex-1 w-full max-w-xl">
                                <div className={`flex items-center gap-3 border rounded-xl p-2 pl-4 ${d ? 'bg-black/40 border-white/10' : 'bg-white border-gray-200 shadow-sm'
                                    }`}>
                                    <div className={`flex-1 font-mono text-sm truncate ${d ? 'text-white/80' : 'text-gray-700'}`}>
                                        {isConnected ? (
                                            isEditingRef ? (
                                                <input
                                                    type="text"
                                                    value={tempRefLink}
                                                    onChange={(e) => setTempRefLink(e.target.value)}
                                                    className={`bg-transparent border-none outline-none w-full ${d ? 'text-white' : 'text-gray-900'}`}
                                                />
                                            ) : (
                                                referralLink
                                            )
                                        ) : (
                                            <span className={`italic ${d ? 'text-white/30' : 'text-gray-400'}`}>Connect wallet to generate link...</span>
                                        )}
                                    </div>

                                    {isConnected && (
                                        <>
                                            {isEditingRef ? (
                                                <button onClick={saveReferral} className={`p-2 rounded-lg text-emerald-500 transition-colors ${d ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                                                    <Save className="w-5 h-5" />
                                                </button>
                                            ) : (
                                                <button onClick={() => setIsEditingRef(true)} className={`p-2 rounded-lg transition-colors ${d ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                                                    }`}>
                                                    <Edit3 className="w-5 h-5" />
                                                </button>
                                            )}

                                            <button
                                                onClick={handleCopyLink}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all font-display text-sm hover:scale-105 ${isCopied
                                                    ? 'bg-emerald-500 text-white'
                                                    : d ? 'bg-white/10 text-white border border-white/20' : 'bg-gray-100 text-gray-700 border border-gray-200'
                                                    }`}
                                            >
                                                {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                                                {isCopied ? 'Copied!' : 'Share'}
                                            </button>

                                            <button
                                                onClick={() => setShowPartnerDashboard(true)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all font-display text-sm hover:scale-105 bg-gradient-to-r from-teal-500 to-purple-500 text-white shadow-lg ${d ? 'shadow-teal-500/20' : ''}`}
                                            >
                                                <LayoutDashboard className="w-4 h-4" />
                                                Dashboard
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

            </div>

            {/* --- Network Selection Modal --- */}
            {connectStep === 1 && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setConnectStep(0)}></div>
                    <div className={`relative w-full max-w-sm border rounded-3xl shadow-2xl overflow-hidden animate-[fadeInScale_0.2s_ease-out] ${d ? 'bg-[#1a1b1f] border-white/10' : 'bg-white border-gray-200'
                        }`}>
                        <div className={`p-5 border-b flex justify-between items-center ${d ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50'
                            }`}>
                            <h3 className={`text-lg font-bold font-display ${d ? 'text-white' : 'text-gray-900'}`}>Select Network</h3>
                            <button onClick={() => setConnectStep(0)} className={`transition-colors ${d ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}>
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            <button onClick={() => selectNetwork('sol')} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all group ${d
                                ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-teal-500/50'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-teal-400'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${d ? 'bg-black border-white/10' : 'bg-white border-gray-200'
                                        }`}>
                                        <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-purple-500 rounded-full"></div>
                                    </div>
                                    <div className="text-left">
                                        <div className={`font-bold font-display ${d ? 'text-white' : 'text-gray-900'}`}>Solana</div>
                                        <div className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>Phantom, Backpack, Solflare</div>
                                    </div>
                                </div>
                                <ChevronRight className={`w-5 h-5 transition-colors ${d ? 'text-white/20 group-hover:text-white' : 'text-gray-300 group-hover:text-gray-700'}`} />
                            </button>
                            <button onClick={() => selectNetwork('evm')} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all group ${d
                                ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-blue-500/50'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-blue-400'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${d ? 'bg-black border-white/10' : 'bg-white border-gray-200'
                                        }`}>
                                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full"></div>
                                    </div>
                                    <div className="text-left">
                                        <div className={`font-bold font-display ${d ? 'text-white' : 'text-gray-900'}`}>EVM Chains</div>
                                        <div className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>Ethereum, Base, Arbitrum</div>
                                    </div>
                                </div>
                                <ChevronRight className={`w-5 h-5 transition-colors ${d ? 'text-white/20 group-hover:text-white' : 'text-gray-300 group-hover:text-gray-700'}`} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Project Selection Modal --- */}
            {showProjectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowProjectModal(false)}></div>
                    <div className={`relative w-full max-w-lg border rounded-3xl shadow-2xl overflow-hidden animate-[fadeInScale_0.2s_ease-out] flex flex-col max-h-[80vh] ${d ? 'bg-[#121212] border-white/10' : 'bg-white border-gray-200'
                        }`}>
                        <div className={`p-6 border-b flex justify-between items-center ${d ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50'
                            }`}>
                            <h3 className={`text-xl font-bold font-display ${d ? 'text-white' : 'text-gray-900'}`}>Choose Ecosystem</h3>
                            <button onClick={() => setShowProjectModal(false)} className={`transition-colors ${d ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}>
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {PROJECTS.map((project, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (project.active) {
                                            setActiveProject(project);
                                            setShowProjectModal(false);
                                        }
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${project.active
                                        ? d
                                            ? 'bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-pointer'
                                        : 'bg-transparent border-transparent opacity-50 cursor-not-allowed'
                                        } ${activeProject.name === project.name ? 'border-teal-500/50 bg-teal-500/10' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-full p-1 flex items-center justify-center shadow-lg">
                                            <img src={project.logo} alt={project.name} className="w-full h-full object-contain" />
                                        </div>
                                        <span className={`font-display font-medium text-lg ${d ? 'text-white' : 'text-gray-900'}`}>{project.name}</span>
                                    </div>
                                    {!project.active && (
                                        <span className={`text-xs font-mono border px-2 py-1 rounded ${d ? 'text-white/30 border-white/10' : 'text-gray-400 border-gray-200'}`}>soon</span>
                                    )}
                                    {activeProject.name === project.name && project.active && (
                                        <CheckCircle2 className="w-5 h-5 text-teal-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- Exchange Verification Modal --- */}
            {showExchangeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => { setShowExchangeModal(false); setSelectedExchange(null); }}></div>
                    <div className={`relative w-full max-w-lg border rounded-3xl shadow-2xl overflow-hidden animate-[fadeInScale_0.2s_ease-out] flex flex-col max-h-[90vh] ${d ? 'bg-[#121212] border-white/10' : 'bg-white border-gray-200'}`}>
                        <div className={`p-6 border-b flex justify-between items-center ${d ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <h3 className={`text-xl font-bold font-display ${d ? 'text-white' : 'text-gray-900'}`}>Exchange Verification</h3>
                            </div>
                            <button onClick={() => { setShowExchangeModal(false); setSelectedExchange(null); }} className={`transition-colors ${d ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}>
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {!selectedExchange ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {EXCHANGES.map((ex) => (
                                        <button
                                            key={ex.id}
                                            onClick={() => setSelectedExchange(ex.id)}
                                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${d
                                                ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-yellow-500/50'
                                                : 'bg-white border-gray-200 hover:border-yellow-500 shadow-sm'}`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1.5 shadow-sm">
                                                <img src={ex.logo} alt={ex.name} className="w-full h-full object-contain" />
                                            </div>
                                            <span className={`text-xs font-medium ${d ? 'text-white' : 'text-gray-900'}`}>{ex.name}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <button
                                        onClick={() => { setSelectedExchange(null); setVerificationError(null); setShowApiHelp(false); }}
                                        className={`flex items-center gap-2 text-sm ${d ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        <ChevronRight className="w-4 h-4 rotate-180" /> Back
                                    </button>

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-2 shadow-sm">
                                            <img src={EXCHANGES.find(e => e.id === selectedExchange)?.logo} alt="" className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <h3 className={`text-lg font-bold ${d ? 'text-white' : 'text-gray-900'}`}>
                                                {EXCHANGES.find(e => e.id === selectedExchange)?.name}
                                            </h3>
                                            <button
                                                onClick={() => setShowApiHelp(!showApiHelp)}
                                                className={`text-xs flex items-center gap-1 mt-0.5 ${d ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-700'}`}
                                            >
                                                <Info className="w-3 h-3" />
                                                How to create API keys
                                                <ChevronRight className={`w-3 h-3 transition-transform ${showApiHelp ? 'rotate-90' : ''}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {showApiHelp && (
                                        <div className={`p-4 rounded-xl border mb-4 ${d ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                            <p className={`text-sm mb-3 ${d ? 'text-white/70' : 'text-gray-600'}`}>
                                                Go to the exchange settings and create API keys with the following permissions:
                                            </p>
                                            <div className="space-y-2">
                                                {EXCHANGES.find(e => e.id === selectedExchange)?.screens.map((screen, i) => (
                                                    <img
                                                        key={i}
                                                        src={screen}
                                                        alt={`Step ${i + 1}`}
                                                        className="w-full rounded-lg border border-white/10 cursor-zoom-in hover:opacity-80 transition-opacity"
                                                        onClick={() => setZoomedImage(screen)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${d ? 'text-white/40' : 'text-gray-500'}`}>API Key</label>
                                            <input
                                                type="text"
                                                value={exchangeForm.key}
                                                onChange={(e) => setExchangeForm({ ...exchangeForm, key: e.target.value })}
                                                className={`w-full p-3 rounded-xl outline-none border transition-all ${d ? 'bg-black/20 border-white/10 focus:border-yellow-500/50 text-white' : 'bg-gray-50 border-gray-200 focus:border-yellow-500 text-gray-900'}`}
                                                placeholder="Enter API Key"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${d ? 'text-white/40' : 'text-gray-500'}`}>API Secret</label>
                                            <input
                                                type="password"
                                                value={exchangeForm.secret}
                                                onChange={(e) => setExchangeForm({ ...exchangeForm, secret: e.target.value })}
                                                className={`w-full p-3 rounded-xl outline-none border transition-all ${d ? 'bg-black/20 border-white/10 focus:border-yellow-500/50 text-white' : 'bg-gray-50 border-gray-200 focus:border-yellow-500 text-gray-900'}`}
                                                placeholder="Enter API Secret"
                                            />
                                        </div>

                                        {EXCHANGES.find(e => e.id === selectedExchange)?.needsPassphrase && (
                                            <div>
                                                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${d ? 'text-white/40' : 'text-gray-500'}`}>Passphrase</label>
                                                <input
                                                    type="password"
                                                    value={exchangeForm.passphrase}
                                                    onChange={(e) => setExchangeForm({ ...exchangeForm, passphrase: e.target.value })}
                                                    className={`w-full p-3 rounded-xl outline-none border transition-all ${d ? 'bg-black/20 border-white/10 focus:border-yellow-500/50 text-white' : 'bg-gray-50 border-gray-200 focus:border-yellow-500 text-gray-900'}`}
                                                    placeholder="Enter Passphrase"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {verificationError && (
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 shrink-0" />
                                            {verificationError}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleExchangeVerify}
                                        disabled={isVerifying || !exchangeForm.key || !exchangeForm.secret}
                                        className={`w-full py-3 rounded-xl font-bold font-display transition-all ${isVerifying
                                            ? 'bg-white/5 text-white/20 cursor-wait'
                                            : !exchangeForm.key || !exchangeForm.secret
                                                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                                : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20'
                                            }`}
                                    >
                                        {isVerifying ? 'Verifying...' : 'Verify Connection'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- Partner Dashboard Modal --- */}
            {showPartnerDashboard && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPartnerDashboard(false)}></div>
                    <div className={`relative w-full max-w-2xl border rounded-3xl shadow-2xl overflow-hidden animate-[fadeInScale_0.2s_ease-out] flex flex-col max-h-[90vh] ${d ? 'bg-[#121212] border-white/10' : 'bg-white border-gray-200'}`}>

                        <div className={`p-6 border-b flex justify-between items-center ${d ? 'border-white/5 bg-gradient-to-r from-teal-500/10 to-purple-500/10' : 'border-gray-100 bg-gradient-to-r from-teal-50 to-purple-50'}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center">
                                    <LayoutDashboard className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className={`text-xl font-bold font-display ${d ? 'text-white' : 'text-gray-900'}`}>Partner Dashboard</h3>
                                    <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>Manage your referral earnings</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPartnerDashboard(false)} className={`transition-colors ${d ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}>
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar">

                            {/* Tier Status */}
                            <div className={`p-5 rounded-2xl border ${d ? 'bg-white/[0.02] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${isConnected ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/20' : 'bg-gray-500'}`}>
                                            <Shield className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <div className={`text-xs font-medium ${d ? 'text-white/40' : 'text-gray-500'}`}>Current Tier</div>
                                            <div className={`text-xl font-bold font-display ${d ? 'text-white' : 'text-gray-900'}`}>{isConnected ? 'Hunter' : '--'}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-medium ${d ? 'text-teal-400' : 'text-teal-600'}`}>Direct: {isConnected ? '7%' : '--'}</div>
                                        <div className={`text-sm font-medium ${d ? 'text-purple-400' : 'text-purple-600'}`}>Sub: {isConnected ? '3%' : '--'}</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className={d ? 'text-white/60' : 'text-gray-600'}>Progress to Guardian</span>
                                        <span className={`font-mono ${d ? 'text-white' : 'text-gray-900'}`}>{isConnected ? '$12,400 / $50,000' : '-- / --'}</span>
                                    </div>
                                    <div className={`h-2.5 rounded-full overflow-hidden ${d ? 'bg-white/10' : 'bg-gray-200'}`}>
                                        <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-purple-500 transition-all duration-500" style={{ width: isConnected ? '24.8%' : '0%' }}></div>
                                    </div>
                                    {isConnected && (
                                        <div className={`flex items-center gap-2 text-xs ${d ? 'text-purple-400' : 'text-purple-600'}`}>
                                            <TrendingUp className="w-3 h-3" />
                                            <span>Reach Guardian to unlock <strong>10% + 5%</strong></span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Token Balances */}
                            <div className={`p-5 rounded-2xl border ${d ? 'bg-white/[0.02] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Wallet className={`w-5 h-5 ${d ? 'text-teal-400' : 'text-teal-600'}`} />
                                        <h4 className={`font-bold font-display ${d ? 'text-white' : 'text-gray-900'}`}>Token Balances</h4>
                                    </div>
                                    <div className={`text-xl font-bold font-display ${d ? 'text-white' : 'text-gray-900'}`}>
                                        {isConnected ? '$120.00' : '--'} <span className={`text-xs font-normal ${d ? 'text-white/40' : 'text-gray-500'}`}>USDT</span>
                                    </div>
                                </div>

                                {isConnected ? (
                                    <>
                                        <div className="space-y-2 mb-4">
                                            {[
                                                { symbol: 'JUP', amount: '450', value: '$85.00', color: 'from-green-400 to-teal-500' },
                                                { symbol: 'WIF', amount: '12,000', value: '$24.00', color: 'from-amber-400 to-orange-500' },
                                                { symbol: 'BONK', amount: '5M', value: '$11.00', color: 'from-yellow-400 to-amber-500' },
                                            ].map((token) => (
                                                <div key={token.symbol} className={`flex items-center justify-between p-3 rounded-xl ${d ? 'bg-white/5' : 'bg-white border border-gray-200'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${token.color} flex items-center justify-center text-white text-xs font-bold`}>{token.symbol[0]}</div>
                                                        <div>
                                                            <div className={`font-medium text-sm ${d ? 'text-white' : 'text-gray-900'}`}>{token.symbol}</div>
                                                            <div className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>{token.amount} ≈ {token.value}</div>
                                                        </div>
                                                    </div>
                                                    <button className="px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-500 text-xs font-medium hover:bg-teal-500/30 transition-colors">
                                                        Claim
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-3">
                                            <button className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display font-medium transition-all ${d ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                                <Gift className="w-4 h-4" />
                                                Claim All
                                            </button>
                                            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display font-medium bg-gradient-to-r from-teal-500 to-purple-500 text-white hover:opacity-90 transition-all">
                                                <Coins className="w-4 h-4" />
                                                Convert Dust
                                            </button>
                                        </div>

                                        <div className={`mt-3 flex items-start gap-2 p-3 rounded-lg text-xs ${d ? 'bg-orange-500/10 text-orange-300' : 'bg-orange-50 text-orange-700'}`}>
                                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                            <span>Gas ~$0.50 SOL. Convert Dust includes 1.5% swap fee via Jupiter.</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className={`text-center py-8 ${d ? 'text-white/40' : 'text-gray-400'}`}>
                                        Connect wallet to view balances
                                    </div>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className={`p-4 rounded-xl text-center ${d ? 'bg-white/5' : 'bg-gray-50'}`}>
                                    <div className={`text-2xl font-bold font-display ${d ? 'text-white' : 'text-gray-900'}`}>{isConnected ? '24' : '--'}</div>
                                    <div className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>Referrals</div>
                                </div>
                                <div className={`p-4 rounded-xl text-center ${d ? 'bg-white/5' : 'bg-gray-50'}`}>
                                    <div className={`text-2xl font-bold font-display ${d ? 'text-teal-400' : 'text-teal-600'}`}>{isConnected ? '8' : '--'}</div>
                                    <div className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>Sub-Refs</div>
                                </div>
                                <div className={`p-4 rounded-xl text-center ${d ? 'bg-white/5' : 'bg-gray-50'}`}>
                                    <div className={`text-2xl font-bold font-display ${d ? 'text-purple-400' : 'text-purple-600'}`}>{isConnected ? '$12.4k' : '--'}</div>
                                    <div className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>Lifetime</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Image Lightbox/Zoom Modal --- */}
            {zoomedImage && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm cursor-zoom-out"
                    onClick={() => setZoomedImage(null)}
                >
                    <button
                        onClick={() => setZoomedImage(null)}
                        className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
                    >
                        <XCircle className="w-8 h-8" />
                    </button>
                    <img
                        src={zoomedImage}
                        alt="Zoomed screenshot"
                        className="max-w-[95vw] max-h-[90vh] object-contain rounded-xl shadow-2xl cursor-zoom-out"
                        onClick={() => setZoomedImage(null)}
                    />
                </div>
            )}
        </div>
    );
}
