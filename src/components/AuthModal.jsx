import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  UserCheck, 
  Lock, 
  User, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  Eye, 
  EyeOff,
  GraduationCap,
  KeyRound,
  Settings,
  Check
} from 'lucide-react';
import { 
  loginUser, 
  registerUser, 
  registerOrLoginGoogleUser, 
  getGoogleClientId, 
  saveGoogleClientId, 
  parseJwt 
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
  const [signupClass, setSignupClass] = useState('Class 1-D');
  
  // Google sign-in fields
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [showClientIdConfig, setShowClientIdConfig] = useState(false);
  const [customClientId, setCustomClientId] = useState(() => getGoogleClientId());
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await loginUser(loginIdentifier, loginPassword);
      if (res.success) {
        onAuthSuccess(res.user);
        onClose();
      } else {
        setError(res.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An unexpected error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
        onAuthSuccess(res.user);
        onClose();
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred during registration');
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
    // If no client ID configured, open quick Google sign-in panel
    setShowGooglePrompt(true);
  };

  const handleQuickGoogleSubmit = (e) => {
    e.preventDefault();
    if (!googleEmail.trim()) {
      setError('Please enter a valid Google email');
      return;
    }

    const res = registerOrLoginGoogleUser({
      googleId: `gid_${Date.now()}`,
      email: googleEmail.trim(),
      name: googleName.trim() || googleEmail.split('@')[0],
      picture: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80'
    });

    if (res.success) {
      onAuthSuccess(res.user);
      onClose();
    } else {
      setError('Failed to authenticate Google user');
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
      onAuthSuccess(res.user);
      onClose();
    } else {
      setError(res.error || 'Demo login failed');
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
              <h3 className="font-bold text-base text-white">White Room Authentication</h3>
              <p className="text-[11px] text-slate-400">Sign in with Google or your Student Credentials</p>
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
          {/* Native Google Button Mount (if Client ID present) */}
          <div ref={googleButtonRef} className="w-full flex justify-center empty:hidden" />

          {/* Universal Google Sign-In Trigger */}
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

          {/* Quick Google Prompt Drawer if no client ID set */}
          {showGooglePrompt && (
            <form onSubmit={handleQuickGoogleSubmit} className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 animate-in fade-in text-xs font-sans">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center space-x-1.5">
                  <span>Sign In with your Google Details</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowGooglePrompt(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Google Account Email</label>
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
                <label className="text-[10px] text-slate-400 block mb-0.5">Full Name (for Student Dossier)</label>
                <input
                  type="text"
                  placeholder="e.g. Vikram / Ayanokoji"
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
                  <span>Configure Google OAuth Client ID</span>
                </button>

                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-all"
                >
                  Sign In via Google
                </button>
              </div>

              {/* Optional Client ID configuration */}
              {showClientIdConfig && (
                <div className="pt-2 border-t border-white/10 space-y-1.5">
                  <label className="text-[10px] text-slate-400 block">Google Cloud OAuth Client ID (for production)</label>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      placeholder="e.g. 123456...apps.googleusercontent.com"
                      value={customClientId}
                      onChange={(e) => setCustomClientId(e.target.value)}
                      className="flex-1 px-2.5 py-1 rounded-lg bg-black border border-white/15 text-white text-[11px] font-mono focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleSaveClientId}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs"
                    >
                      Save ID
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

          <div className="flex items-center space-x-2 text-[10px] text-slate-500 uppercase tracking-wider my-2">
            <div className="flex-1 h-px bg-white/10" />
            <span>or use student credentials</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-black/50 border border-white/10 text-xs font-sans">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl transition-all ${
              mode === 'login' ? 'bg-white text-black font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl transition-all ${
              mode === 'signup' ? 'bg-white text-black font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Dossier</span>
          </button>
        </div>

        {/* Error Banner with Smart Registration Suggestion */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center space-x-1.5 font-semibold text-rose-300">
              <span>Notice:</span>
              <span>{error}</span>
            </div>
            {error.includes('No account found') && (
              <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between">
                <span className="text-[11px] text-slate-300">Haven't registered this account yet?</span>
                <button
                  type="button"
                  onClick={() => {
                    const raw = loginIdentifier.trim();
                    if (raw.includes('@')) {
                      setSignupEmail(raw);
                      setSignupUsername(raw.split('@')[0]);
                    } else {
                      setSignupUsername(raw);
                    }
                    setSignupPassword(loginPassword);
                    setMode('signup');
                    setError('');
                  }}
                  className="px-2.5 py-1 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors shadow"
                >
                  Register It Now →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Form: LOGIN */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs font-sans">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">Username or Email</label>
              <div className="relative">
                <input
                  type="text"
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

            {/* Helper link to switch to Register */}
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
              <span className="text-slate-400">Quick Demo Account:</span>
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
          /* Form: SIGNUP */
          <form onSubmit={handleSignupSubmit} className="space-y-2.5 text-xs font-sans">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">Username</label>
                <div className="relative">
                  <input
                    type="text"
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
                <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="student@whiteroom.edu"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Min. 5 characters"
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
                  placeholder="e.g. Ayanokoji Kiyotaka"
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
                <option value="Class 1-A">Class 1-A (Elite Standard)</option>
                <option value="Class 1-B">Class 1-B (High Cooperatives)</option>
                <option value="Class 1-C">Class 1-C (Aggressive Strategy)</option>
                <option value="Class 1-D">Class 1-D (Defective Potential)</option>
                <option value="White Room 4th Gen">White Room 4th Generation</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-white text-black font-bold font-sans text-xs hover:bg-neutral-200 transition-all shadow-lg mt-2 flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? 'Creating Dossier...' : 'Register Student Dossier'}</span>
            </button>

            {/* Helper link to switch to Login */}
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
