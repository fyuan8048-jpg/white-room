import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Lock, 
  User, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  Eye, 
  EyeOff,
  CheckCircle2,
  Settings,
  ArrowRight
} from 'lucide-react';
import { 
  loginUser, 
  registerUser, 
  smartAuth, 
  registerOrLoginGoogleUser, 
  getGoogleClientId, 
  saveGoogleClientId, 
  parseJwt,
  getStoredAccounts
} from '../utils/auth';

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  currentUser
}) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  
  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup fields
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupDisplayName, setSignupDisplayName] = useState('');
  const [signupStudentId, setSignupStudentId] = useState('');
  const [signupClass, setSignupClass] = useState('Class 1-D / Rank A');
  
  // Google sign-in fields
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [showClientIdConfig, setShowClientIdConfig] = useState(false);
  const [customClientId, setCustomClientId] = useState(() => getGoogleClientId());
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const storedAccounts = isOpen ? getStoredAccounts() : [];
  const googleButtonRef = useRef(null);

  // Initialize native Google Identity Services if client ID is configured
  useEffect(() => {
    if (!isOpen) return;

    const clientId = getGoogleClientId();
    if (clientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              const payload = parseJwt(response.credential);
              if (payload) {
                const res = registerOrLoginGoogleUser({
                  googleId: payload.sub,
                  email: payload.email,
                  name: payload.name,
                  picture: payload.picture
                });
                if (res.success) {
                  onAuthSuccess(res.user);
                  onClose();
                }
              }
            }
          }
        });

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'filled_black',
            size: 'large',
            width: '100%',
            shape: 'pill'
          });
        }
      } catch (err) {
        console.warn('Google Identity initialization notice:', err);
      }
    }
  }, [isOpen, customClientId]);

  if (!isOpen) return null;

  // Sign In Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await loginUser(loginIdentifier, loginPassword);
      if (res.success) {
        setSuccessMsg(`Welcome back, ${res.user.displayName}!`);
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 400);
      } else {
        setError(res.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Failed to authenticate. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Instant 1-Click Auto Registration if user tried to sign in with non-existent account
  const handleAutoCreateFromLogin = async () => {
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const raw = (loginIdentifier || '').trim();
      const isEmail = raw.includes('@');
      const username = isEmail ? raw.split('@')[0] : raw;
      const res = await registerUser({
        username: username,
        email: isEmail ? raw : `${username}@whiteroom.local`,
        password: loginPassword,
        displayName: isEmail ? raw.split('@')[0] : raw,
        classRank: 'Class 1-D / Rank A'
      });

      if (res.success) {
        setSuccessMsg(`Account created! Welcome, ${res.user.displayName}!`);
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 400);
      } else {
        setError(res.error || 'Failed to auto-create account');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up / Register Handler
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await registerUser({
        username: signupUsername,
        email: signupEmail,
        password: signupPassword,
        displayName: signupDisplayName,
        studentId: signupStudentId,
        classRank: signupClass
      });

      if (res.success) {
        setSuccessMsg(`Dossier created for ${res.user.displayName}!`);
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 400);
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err) {
      setError('Failed to register student dossier. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google sign in click
  const handleGoogleSignInClick = () => {
    setError('');
    const clientId = getGoogleClientId();
    if (clientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
        return;
      } catch (err) {}
    }
    // Open clean 1-click Google prompt
    setShowGooglePrompt(true);
  };

  const handleQuickGoogleSubmit = (e) => {
    e.preventDefault();
    const email = googleEmail.trim();
    if (!email) {
      setError('Please enter a valid Google email');
      return;
    }

    const res = registerOrLoginGoogleUser({
      googleId: `gid_${Date.now()}`,
      email: email,
      name: googleName.trim() || email.split('@')[0],
      picture: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80'
    });

    if (res.success) {
      setSuccessMsg(`Signed in as ${res.user.displayName}!`);
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 400);
    } else {
      setError('Failed to link Google account');
    }
  };

  const handleSaveClientId = (e) => {
    e.preventDefault();
    saveGoogleClientId(customClientId);
    setShowClientIdConfig(false);
  };

  const handleQuickDemoLogin = async () => {
    setError('');
    setIsLoading(true);
    const res = await loginUser('ayanokoji', 'whiteroom');
    if (res.success) {
      setSuccessMsg('Signed in as Ayanokoji Kiyotaka!');
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 300);
    } else {
      setError('Demo login notice: ' + res.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-neutral-950/95 border border-white/15 p-6 shadow-2xl text-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 font-sans">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">White Room Student Authentication</h3>
              <p className="text-[11px] text-slate-400">Access your isolated student dossier and focus stats</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Continue with Google Button */}
        <div className="space-y-2">
          <div ref={googleButtonRef} className="w-full flex justify-center empty:hidden" />

          <button
            type="button"
            onClick={handleGoogleSignInClick}
            className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs flex items-center justify-center space-x-2.5 shadow-md transition-all active:scale-[0.99]"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google Account</span>
          </button>

          {/* Clean Google Account Linking Drawer */}
          {showGooglePrompt && (
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 animate-in fade-in text-xs font-sans">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-white font-bold">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google Student Link</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGooglePrompt(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-300">
                Link your Google identity to create or resume your isolated White Room dossier with auto-saved local state.
              </p>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Your Google Email *</label>
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Full Name (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Vikram"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowClientIdConfig(!showClientIdConfig)}
                  className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center space-x-1"
                >
                  <Settings className="w-3 h-3" />
                  <span>Google Cloud Client ID</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickGoogleSubmit}
                  className="px-4 py-1.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-900 font-bold text-xs transition-all shadow flex items-center space-x-1.5"
                >
                  <span>Continue as Google User</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {showClientIdConfig && (
                <div className="pt-2 border-t border-white/10 space-y-1.5">
                  <label className="text-[10px] text-slate-400 block">OAuth Client ID (Optional for custom domain)</label>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      placeholder="123456...apps.googleusercontent.com"
                      value={customClientId}
                      onChange={(e) => setCustomClientId(e.target.value)}
                      className="flex-1 px-2.5 py-1 rounded-lg bg-black border border-white/15 text-white text-[11px] font-mono focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleSaveClientId}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2 text-[10px] text-slate-500 uppercase tracking-wider my-2">
            <div className="flex-1 h-px bg-white/10" />
            <span>or sign in with password</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-black/50 border border-white/10 text-xs font-sans">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl transition-all ${
              mode === 'login' ? 'bg-white text-black font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl transition-all ${
              mode === 'signup' ? 'bg-white text-black font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Dossier</span>
          </button>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Error Banner with Smart 1-Click Registration */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center space-x-1.5 font-semibold text-rose-300">
              <span>Notice:</span>
              <span>{error}</span>
            </div>
            {error.includes('No account found') && (
              <div className="pt-2 border-t border-rose-500/25 space-y-2">
                <span className="text-[11px] text-slate-200 block">
                  Account doesn't exist yet on this device. Would you like to create it with this password right now?
                </span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoCreateFromLogin}
                    disabled={isLoading}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-all shadow flex items-center justify-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Create & Sign In Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const raw = loginIdentifier.trim();
                      if (raw.includes('@')) {
                        setSignupEmail(raw);
                        setSignupUsername(raw.split('@')[0]);
                      } else {
                        setSignupUsername(raw);
                        setSignupEmail('');
                      }
                      setSignupPassword(loginPassword);
                      setMode('signup');
                      setError('');
                    }}
                    className="py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>Open Full Register Form</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form: SIGN IN */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs font-sans">
            {/* Quick account switch pills if accounts exist */}
            {storedAccounts.length > 0 && (
              <div className="space-y-1.5 pb-1">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                  Saved Dossiers on this Device:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {storedAccounts.map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        setLoginIdentifier(acc.username);
                        setError('');
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[11px] flex items-center space-x-1.5 transition-all border ${
                        loginIdentifier.toLowerCase() === acc.username.toLowerCase()
                          ? 'bg-amber-400/25 border-amber-400/60 text-amber-300 font-bold shadow'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                      }`}
                    >
                      <User className="w-3 h-3 text-amber-300" />
                      <span>{acc.displayName || acc.username}</span>
                      <span className="text-[9px] text-slate-500 font-mono">({acc.studentId || acc.username})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">Username or Email</label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  id="login-username"
                  autoComplete="username"
                  required
                  placeholder="e.g. ayanokoji or student@gmail.com"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="login-password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-neutral-900 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-white text-black font-bold font-sans text-xs hover:bg-neutral-200 transition-all shadow-lg mt-2 flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Authenticating...' : 'Sign In to White Room'}</span>
            </button>

            <p className="text-[11px] text-slate-400 text-center pt-1">
              New here?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); }}
                className="text-amber-300 font-semibold hover:underline"
              >
                Register a new student dossier
              </button>
            </p>

            {/* Quick Demo Access */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Quick Test Account:</span>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 font-medium transition-colors"
              >
                Sign in as Ayanokoji
              </button>
            </div>
          </form>
        ) : (
          /* Form: SIGN UP / REGISTER */
          <form onSubmit={handleSignupSubmit} className="space-y-2.5 text-xs font-sans">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">Username *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    id="signup-username"
                    autoComplete="username"
                    required
                    placeholder="e.g. kiyotaka"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">Email (optional)</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    id="signup-email"
                    autoComplete="email"
                    placeholder="student@gmail.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">Password * (min. 4 chars)</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="signup-password"
                  autoComplete="new-password"
                  required
                  placeholder="Choose password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">Student Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Singh"
                  value={signupDisplayName}
                  onChange={(e) => setSignupDisplayName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">Student ID Code</label>
                <input
                  type="text"
                  placeholder="e.g. WR-GEN4-401"
                  value={signupStudentId}
                  onChange={(e) => setSignupStudentId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">Assigned Class</label>
              <select
                value={signupClass}
                onChange={(e) => setSignupClass(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="Class 1-A / Rank S">Class 1-A (Elite Standard / Rank S)</option>
                <option value="Class 1-B / Rank A">Class 1-B (High Cooperatives / Rank A)</option>
                <option value="Class 1-C / Rank B">Class 1-C (Aggressive Strategy / Rank B)</option>
                <option value="Class 1-D / Rank A">Class 1-D (Defective Potential)</option>
                <option value="White Room 4th Gen">White Room 4th Generation Demonic</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-amber-400 text-black font-bold font-sans text-xs hover:bg-amber-300 transition-all shadow-lg mt-2 flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? 'Creating Dossier...' : 'Complete Registration & Sign In'}</span>
            </button>

            <p className="text-[11px] text-slate-400 text-center pt-1">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className="text-amber-300 font-semibold hover:underline"
              >
                Sign In here
              </button>
            </p>
          </form>
        )}

      </div>
    </div>
  );
}
