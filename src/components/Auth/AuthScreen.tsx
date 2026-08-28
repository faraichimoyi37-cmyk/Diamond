import React, { useState, useEffect } from 'react';
import { useTrading } from '../../context/TradingContext';
import {
  Crown,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Gift,
  ArrowRight,
  Zap,
  TrendingUp,
  Award,
  Sparkles,
  Loader2,
  AlertCircle,
  KeyRound,
  FileText,
  X,
  Check,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { getInitialReferralCode } from '../../utils/referral';

export const AuthScreen: React.FC = () => {
  const { login, signUp } = useTrading();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');

  // Sign In State
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPass, setShowSignInPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up State
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpRefCode, setSignUpRefCode] = useState(() => getInitialReferralCode());
  const [showSignUpPass, setShowSignUpPass] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  useEffect(() => {
    const code = getInitialReferralCode();
    if (code) {
      setSignUpRefCode(code);
    }
  }, []);

  // OTP Verification Step State
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState(['8', '9', '4', '2', '0', '1']);
  const [otpResendTimer, setOtpResendTimer] = useState(30);

  // Forgot Password State
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Terms Modal State
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Async Processing State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password Strength Calculator
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passStrength = calculatePasswordStrength(signUpPassword);

  useEffect(() => {
    let timer: any;
    if (isOtpStep && otpResendTimer > 0) {
      timer = setInterval(() => setOtpResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpStep, otpResendTimer]);

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signInIdentifier || !signInPassword) {
      setErrorMessage('Please enter both username/email and password.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStep('Encrypting security tokens...');

    setTimeout(() => {
      setSubmitStep('Authenticating against APEX Vault...');

      setTimeout(() => {
        setSubmitStep('Verifying account credentials...');

        setTimeout(() => {
          const success = login(signInIdentifier, signInPassword);
          setIsSubmitting(false);
          setSubmitStep('');
          if (!success) {
            setErrorMessage('Account not found or password incorrect. Please sign up first if you do not have an account.');
          }
        }, 500);
      }, 500);
    }, 500);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signUpUsername || !signUpEmail || !signUpPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage('Passwords do not match. Please check again.');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    // Trigger realistic 2-step OTP confirmation
    setIsSubmitting(true);
    setSubmitStep('Generating 256-Bit Security OTP...');

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStep('');
      setIsOtpStep(true);
      setOtpResendTimer(30);
    }, 800);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStep('Verifying 6-Digit Email Code...');

    setTimeout(() => {
      setSubmitStep('Creating Staking Vault & Address...');

      setTimeout(() => {
        const success = signUp(signUpUsername, signUpEmail, signUpPassword, signUpRefCode);
        setIsSubmitting(false);
        setSubmitStep('');
        if (!success) {
          setIsOtpStep(false);
          setErrorMessage('Account creation failed. An account with this email/username may already exist.');
        }
      }, 600);
    }, 600);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Ambient Radial Backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-amber-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-3xl pointer-events-none -z-10" />

      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-400 text-slate-950 shadow-lg shadow-amber-500/20 font-black">
            <Crown className="w-5 h-5 fill-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-100 tracking-tight flex items-center gap-1.5">
              <span>APEX VIP</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                INSTITUTIONAL
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">High-Yield Staking & Quantitative Execution</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Form Body */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto z-10">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Hero & Platform Value Proposition (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen VIP Yield Vaults</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-100 leading-tight">
                Institutional <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-amber-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  APEX VIP Portal
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Create a new account or sign in to access automated daily yields up to 3.5%, instant BEP20/TRC20 crypto deposits, and real-time portfolio management.
              </p>
            </motion.div>

            {/* Platform Feature Cards */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-left">
                Key Member Benefits:
              </span>
              <div className="grid grid-cols-1 gap-2 text-left">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-300">Instant Crypto Deposits</div>
                    <div className="text-[10px] text-emerald-400/80">Fund your account directly with USDT (TRC20, BEP20)</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">High-Yield Staking</div>
                    <div className="text-[10px] text-slate-400">Automated daily yield payouts calculated every 24 hours</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Institutional Security</div>
                    <div className="text-[10px] text-slate-400">Multi-factor encryption and secure cold wallet storage</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Form Container (7 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-slate-950"
          >
            {/* Mode Switcher Tabs */}
            {!isOtpStep && (
              <div className="p-2 bg-slate-950/80 border-b border-slate-800 grid grid-cols-2 gap-2 px-6 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    mode === 'signup'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Create Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    mode === 'signin'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              </div>
            )}

            {/* Error Message Box */}
            {errorMessage && (
              <div className="mx-6 mt-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Async Processing Overlay Indicator */}
            {isSubmitting && (
              <div className="p-8 text-center space-y-4 flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Loader2 className="w-7 h-7 animate-spin" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100">Authenticating...</h4>
                  <p className="text-xs text-amber-400 font-mono mt-1 font-semibold">{submitStep}</p>
                </div>
              </div>
            )}

            {/* Content Area */}
            {!isSubmitting && (
              <div className="p-6 sm:p-8">
                {/* 2-Step OTP Verification Step */}
                {isOtpStep ? (
                  <form onSubmit={handleOtpVerify} className="space-y-5">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-black text-slate-100">2-Step Email Verification</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        We sent a 6-digit confirmation code to <span className="text-emerald-400 font-bold">{signUpEmail}</span>. Enter it below to activate your account.
                      </p>
                    </div>

                    {/* Code Input Box */}
                    <div className="flex justify-center items-center gap-2">
                      {otpCode.map((digit, idx) => (
                        <input
                          key={idx}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={e => {
                            const newOtp = [...otpCode];
                            newOtp[idx] = e.target.value;
                            setOtpCode(newOtp);
                          }}
                          className="w-10 h-12 text-center text-lg font-mono font-black bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 focus:border-emerald-500 focus:outline-none"
                        />
                      ))}
                    </div>

                    <div className="text-center text-xs text-slate-400">
                      {otpResendTimer > 0 ? (
                        <span>Resend security code in <span className="text-amber-400 font-mono font-bold">{otpResendTimer}s</span></span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setOtpResendTimer(30)}
                          className="text-emerald-400 font-bold hover:underline"
                        >
                          Resend Verification Code
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsOtpStep(false)}
                        className="w-1/3 py-3 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:bg-slate-800 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Verify & Enter</span>
                      </button>
                    </div>
                  </form>
                ) : mode === 'signup' ? (
                  /* Sign Up Form */
                  <form onSubmit={handleSignUpSubmit} className="space-y-4">
                    {signUpRefCode && (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                          <Gift className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Referral Invitation Code Applied: <strong className="font-mono text-amber-200">{signUpRefCode}</strong></span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shrink-0">
                          +10% Bonus
                        </span>
                      </div>
                    )}

                    <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 border border-emerald-500/30 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                          <span>$5.00 Welcome Bonus</span>
                          <span className="px-1.5 py-0.2 bg-emerald-500 text-slate-950 text-[9px] font-extrabold rounded">INSTANT</span>
                        </div>
                        <div className="text-[11px] text-slate-300 font-medium">
                          New registered accounts receive a free $5.00 USDT welcome bonus credited instantly.
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                        Username
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={signUpUsername}
                          onChange={e => setSignUpUsername(e.target.value)}
                          placeholder="e.g. CryptoTrader99"
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={signUpEmail}
                          onChange={e => setSignUpEmail(e.target.value)}
                          placeholder="you@domain.com"
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                          <input
                            type={showSignUpPass ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={signUpPassword}
                            onChange={e => setSignUpPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium"
                          />
                        </div>

                        {/* Password Strength Meter */}
                        {signUpPassword.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4].map(step => (
                                <div
                                  key={step}
                                  className={`h-1 flex-1 rounded-full transition-all ${
                                    step <= passStrength
                                      ? passStrength <= 2
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500'
                                      : 'bg-slate-800'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-slate-400 block font-medium">
                              Strength: {passStrength <= 1 ? 'Weak' : passStrength === 2 ? 'Fair' : passStrength === 3 ? 'Good' : 'Strong Security'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                          <input
                            type={showSignUpPass ? 'text' : 'password'}
                            required
                            value={signUpConfirmPassword}
                            onChange={e => setSignUpConfirmPassword(e.target.value)}
                            placeholder="Re-type password"
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignUpPass(!showSignUpPass)}
                            className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                          >
                            {showSignUpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5 flex items-center justify-between">
                        <span>Referral Code (Optional)</span>
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <Gift className="w-3 h-3" /> +10% Yield Bonus
                        </span>
                      </label>
                      <input
                        type="text"
                        value={signUpRefCode}
                        onChange={e => setSignUpRefCode(e.target.value.toUpperCase())}
                        placeholder="e.g. APEX-8821"
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500 uppercase"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="terms-screen"
                        checked={agreedTerms}
                        onChange={e => setAgreedTerms(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/20 w-4 h-4"
                      />
                      <label htmlFor="terms-screen" className="text-xs text-slate-400">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => setIsTermsOpen(true)}
                          className="text-slate-200 font-semibold underline hover:text-emerald-400"
                        >
                          Terms of Service
                        </button>{' '}
                        & Privacy Policy
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={!agreedTerms}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Proceed to Verification</span>
                    </button>

                    <div className="text-center pt-2">
                      <p className="text-xs text-slate-400">
                        Already registered?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setMode('signin');
                            setErrorMessage(null);
                          }}
                          className="text-amber-400 font-bold hover:underline"
                        >
                          Sign In here
                        </button>
                      </p>
                    </div>
                  </form>
                ) : (
                  /* Sign In Form */
                  <form onSubmit={handleSignInSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                        Email Address or Username
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={signInIdentifier}
                          onChange={e => setSignInIdentifier(e.target.value)}
                          placeholder="Enter your email or username"
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-300 uppercase">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsForgotPasswordOpen(true)}
                          className="text-[11px] text-amber-400 hover:underline font-medium"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type={showSignInPass ? 'text' : 'password'}
                          required
                          value={signInPassword}
                          onChange={e => setSignInPassword(e.target.value)}
                          placeholder="Enter password"
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignInPass(!showSignInPass)}
                          className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                        >
                          {showSignInPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/20"
                        />
                        <span>Remember me for 30 days</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      <span>Sign In To APEX VIP</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="text-center pt-2">
                      <p className="text-xs text-slate-400">
                        New to APEX VIP?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setMode('signup');
                            setErrorMessage(null);
                          }}
                          className="text-emerald-400 font-bold hover:underline"
                        >
                          Create an account
                        </button>
                      </p>
                    </div>
                  </form>
                )}
              </div>
            )}
          </motion.div>

        </div>
      </div>

      {/* Forgot Password Dialog Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 text-slate-100 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <KeyRound className="w-4 h-4" />
                <span>Password Reset</span>
              </div>
              <button
                onClick={() => {
                  setIsForgotPasswordOpen(false);
                  setResetSent(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetSent ? (
              <div className="text-center space-y-3 py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-sm font-bold text-slate-100">Reset Link Dispatched!</h4>
                <p className="text-xs text-slate-400">
                  We sent password recovery instructions to <span className="text-slate-200 font-bold">{resetEmail}</span>.
                </p>
                <button
                  onClick={() => {
                    setIsForgotPasswordOpen(false);
                    setResetSent(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-xs text-slate-400">
                  Enter your registered account email address. We will send you an official reset link.
                </p>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider"
                >
                  Send Reset Instructions
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Terms & Privacy Reader Modal */}
      {isTermsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-slate-100 shadow-2xl max-h-[80vh] flex flex-col"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <FileText className="w-4 h-4" />
                <span>APEX VIP Terms of Service & Privacy Policy</span>
              </div>
              <button onClick={() => setIsTermsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 text-xs text-slate-300 pr-2 leading-relaxed flex-1">
              <h5 className="font-bold text-slate-100">1. Institutional Staking Protocols</h5>
              <p>By registering on the APEX VIP platform, users agree to participate in verified crypto staking yield pools. Yield rates vary between 1.5% and 3.5% daily according to VIP tier subscriptions.</p>

              <h5 className="font-bold text-slate-100">2. Capital Security & Cold Vault Storage</h5>
              <p>All deposited BEP20/TRC20 assets are secured via multi-signature smart contract vaults with 256-bit encryption and cold storage redundancy.</p>

              <h5 className="font-bold text-slate-100">3. Deposit & Withdrawal Verification</h5>
              <p>Withdrawals require positive available account balance and cleared block confirmations. System monitors transaction hashes (TxID) to prevent double-spending.</p>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setAgreedTerms(true);
                  setIsTermsOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase"
              >
                Accept Terms & Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-3 px-6 text-center text-xs text-slate-500 z-10">
        &copy; {new Date().getFullYear()} APEX VIP Institutional Platform. All rights reserved. 256-Bit SSL Encrypted.
      </footer>
    </div>
  );
};
