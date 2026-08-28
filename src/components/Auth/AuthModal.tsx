import React, { useState, useEffect } from 'react';
import { useTrading } from '../../context/TradingContext';
import {
  X,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Crown,
  ShieldCheck,
  CheckCircle2,
  Gift,
  ArrowRight,
  Zap,
  Loader2,
  AlertCircle,
  KeyRound,
  Check,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { getInitialReferralCode } from '../../utils/referral';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    login,
    signUp
  } = useTrading();

  // Sign In State
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPass, setShowSignInPass] = useState(false);

  // Sign Up State
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpRefCode, setSignUpRefCode] = useState(() => getInitialReferralCode());
  const [showSignUpPass, setShowSignUpPass] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  useEffect(() => {
    if (isAuthModalOpen) {
      const code = getInitialReferralCode();
      if (code) {
        setSignUpRefCode(code);
      }
    }
  }, [isAuthModalOpen]);

  // OTP Verification Step
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState(['8', '9', '4', '2', '0', '1']);
  const [otpResendTimer, setOtpResendTimer] = useState(30);

  // Forgot Password
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Async State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password Strength
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

  if (!isAuthModalOpen) return null;

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signInIdentifier || !signInPassword) {
      setErrorMessage('Please enter email/username and password.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStep('Encrypting security token...');

    setTimeout(() => {
      setSubmitStep('Authenticating session...');
      setTimeout(() => {
        const success = login(signInIdentifier, signInPassword);
        setIsSubmitting(false);
        setSubmitStep('');
        if (!success) {
          setErrorMessage('Account not found or password incorrect. Please sign up first if you do not have an account.');
        } else {
          closeAuthModal();
        }
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
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStep('Dispatching 6-Digit Email Code...');

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStep('');
      setIsOtpStep(true);
      setOtpResendTimer(30);
    }, 600);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStep('Verifying 6-Digit Code...');

    setTimeout(() => {
      setSubmitStep('Creating Staking Vault...');
      setTimeout(() => {
        const success = signUp(signUpUsername, signUpEmail, signUpPassword, signUpRefCode);
        setIsSubmitting(false);
        setSubmitStep('');
        if (success) {
          closeAuthModal();
        } else {
          setIsOtpStep(false);
          setErrorMessage('Account creation failed. User or email may already exist.');
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          {/* Header Banner */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-400 text-slate-950 shadow-md font-black">
                <Crown className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-1.5">
                  <span>APEX VIP</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                    PORTAL
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {authModalMode === 'signin'
                    ? 'Access your VIP staking portfolio and yield'
                    : 'Create your account and start earning daily yield'}
                </p>
              </div>
            </div>
            <button
              onClick={closeAuthModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          {!isOtpStep && !isForgotPasswordOpen && (
            <div className="p-2 bg-slate-950/40 border-b border-slate-800/60 grid grid-cols-2 gap-2 px-6">
              <button
                type="button"
                onClick={() => {
                  openAuthModal('signin');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  authModalMode === 'signin'
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  openAuthModal('signup');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  authModalMode === 'signup'
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Async Loader */}
          {isSubmitting && (
            <div className="p-8 text-center space-y-3 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs text-amber-400 font-mono font-bold">{submitStep}</p>
            </div>
          )}

          {!isSubmitting && (
            <div>
              {/* Forgot Password Drawer inside Modal */}
              {isForgotPasswordOpen ? (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <KeyRound className="w-4 h-4" />
                      <span>Password Recovery</span>
                    </div>
                    <button
                      onClick={() => {
                        setIsForgotPasswordOpen(false);
                        setResetSent(false);
                      }}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Back
                    </button>
                  </div>

                  {resetSent ? (
                    <div className="text-center space-y-3 py-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-100">Reset Email Dispatched</h4>
                      <p className="text-[11px] text-slate-400">
                        Instructions sent to <span className="text-slate-200 font-bold">{resetEmail}</span>.
                      </p>
                      <button
                        onClick={() => {
                          setIsForgotPasswordOpen(false);
                          setResetSent(false);
                        }}
                        className="w-full py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-200"
                      >
                        Return to Sign In
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                      <p className="text-xs text-slate-400">
                        Enter your account email to receive reset instructions.
                      </p>
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={e => setResetEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase"
                      >
                        Send Reset Link
                      </button>
                    </form>
                  )}
                </div>
              ) : isOtpStep ? (
                /* OTP Verification Step */
                <form onSubmit={handleOtpVerify} className="p-6 space-y-4">
                  <div className="text-center space-y-1.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-100">Verify Email Address</h4>
                    <p className="text-xs text-slate-400">
                      Enter 6-digit verification code sent to <span className="text-emerald-400 font-bold">{signUpEmail}</span>.
                    </p>
                  </div>

                  <div className="flex justify-center items-center gap-1.5">
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
                        className="w-9 h-10 text-center font-mono font-bold bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 focus:border-emerald-500 focus:outline-none"
                      />
                    ))}
                  </div>

                  <div className="text-center text-[11px] text-slate-400">
                    {otpResendTimer > 0 ? (
                      <span>Resend code in <span className="text-amber-400 font-mono font-bold">{otpResendTimer}s</span></span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setOtpResendTimer(30)}
                        className="text-emerald-400 font-bold hover:underline"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOtpStep(false)}
                      className="w-1/3 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase"
                    >
                      Verify Code
                    </button>
                  </div>
                </form>
              ) : authModalMode === 'signin' ? (
                /* Sign In Form */
                <form onSubmit={handleSignInSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                      Email or Username
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={signInIdentifier}
                        onChange={e => setSignInIdentifier(e.target.value)}
                        placeholder="Enter your email or username"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">
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
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type={showSignInPass ? 'text' : 'password'}
                        required
                        value={signInPassword}
                        onChange={e => setSignInPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-medium"
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

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Sign In To APEX VIP</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-slate-400">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => openAuthModal('signup')}
                        className="text-emerald-400 font-bold hover:underline"
                      >
                        Create Account
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                /* Sign Up Form */
                <form onSubmit={handleSignUpSubmit} className="p-6 space-y-3.5">
                  {signUpRefCode && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                        <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Referral Code Active: <strong className="font-mono text-amber-200">{signUpRefCode}</strong></span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shrink-0">
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
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={signUpUsername}
                        onChange={e => setSignUpUsername(e.target.value)}
                        placeholder="Choose username (e.g. CryptoKing)"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={signUpEmail}
                        onChange={e => setSignUpEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                        <input
                          type={showSignUpPass ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={signUpPassword}
                          onChange={e => setSignUpPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full pl-8 pr-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {signUpPassword.length > 0 && (
                        <div className="mt-1 flex gap-0.5">
                          {[1, 2, 3, 4].map(s => (
                            <div
                              key={s}
                              className={`h-1 flex-1 rounded-full ${
                                s <= passStrength ? (passStrength <= 2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                        <input
                          type={showSignUpPass ? 'text' : 'password'}
                          required
                          value={signUpConfirmPassword}
                          onChange={e => setSignUpConfirmPassword(e.target.value)}
                          placeholder="Re-type password"
                          className="w-full pl-8 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpPass(!showSignUpPass)}
                          className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                        >
                          {showSignUpPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center justify-between">
                      <span>Referral Code (Optional)</span>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Gift className="w-3 h-3" /> +10% Bonus
                      </span>
                    </label>
                    <input
                      type="text"
                      value={signUpRefCode}
                      onChange={e => setSignUpRefCode(e.target.value.toUpperCase())}
                      placeholder="e.g. APEX-8821"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500 uppercase"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedTerms}
                      onChange={e => setAgreedTerms(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/20"
                    />
                    <label htmlFor="terms" className="text-[11px] text-slate-400">
                      I agree to APEX VIP <span className="text-slate-200 underline font-semibold">Terms & Security Policy</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={!agreedTerms}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Proceed to Verification</span>
                  </button>

                  <div className="text-center pt-1">
                    <p className="text-xs text-slate-400">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => openAuthModal('signin')}
                        className="text-amber-400 font-bold hover:underline"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Footer Security Note */}
          <div className="px-6 py-3 bg-slate-950 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>256-Bit Encrypted Portal</span>
            </div>
            <span className="font-mono text-slate-500">APEX SECURE AUTH</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
