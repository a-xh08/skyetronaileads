import React, { useState } from 'react';
import { UserProfile } from '../types/pipeline';
import { Building2, ArrowRight, ShieldCheck, Eye, Briefcase, Mail } from 'lucide-react';

interface AuthScreenProps {
  users: UserProfile[];
  onLogin: (user: UserProfile) => void;
  onAddUser: (user: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ users, onLogin, onAddUser }) => {
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'sales' | 'observer'>('sales');
  const [showManualForm, setShowManualForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuickLogin = (user: UserProfile) => {
    onLogin(user);
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) {
      setErrorMsg('Please enter a valid work email address');
      return;
    }

    // Check if user already exists
    const existing = users.find(u => u.email.toLowerCase() === trimmed);
    if (existing) {
      onLogin(existing);
      return;
    }

    // If new user, create their profile
    const derivedName = nameInput.trim() || trimmed.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: derivedName,
      email: trimmed,
      role: selectedRole,
      title: selectedRole === 'admin' ? 'Operations Director' : selectedRole === 'observer' ? 'Executive Observer' : 'Account Executive',
      assignedSheets: ['all'],
    };

    onAddUser(newUser);
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative w-full max-w-lg z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mb-3 shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Pipeline Tracker
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise Customer & Lead Management
          </p>
          <div className="inline-flex items-center gap-2 mt-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Microsoft 365 / Corporate Direct Login</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Fast Work Account Access
            </h2>

            {/* Quick Login Accounts */}
            <div className="space-y-2.5">
              {users.map((user) => {
                const isAdmin = user.role === 'admin';
                const isObserver = user.role === 'observer';

                return (
                  <button
                    key={user.id}
                    onClick={() => handleQuickLogin(user)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-700 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-semibold ${
                        isAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        isObserver ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                            {user.name}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                            isAdmin ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            isObserver ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 font-medium">Or enter company email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label htmlFor="workEmail" className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="workEmail"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. m.abdullah@skytron.ai"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            {showManualForm && (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Tariq Mansoor"
                    className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Assign Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('sales')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition ${
                        selectedRole === 'sales'
                          ? 'border-blue-500 bg-blue-500/15 text-blue-300'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Briefcase className="w-4 h-4 mb-1" />
                      Sales Rep
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('admin')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition ${
                        selectedRole === 'admin'
                          ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 mb-1" />
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('observer')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition ${
                        selectedRole === 'observer'
                          ? 'border-purple-500 bg-purple-500/15 text-purple-300'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Eye className="w-4 h-4 mb-1" />
                      Observer
                    </button>
                  </div>
                </div>
              </>
            )}

            {errorMsg && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5">
                {errorMsg}
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue with Work Email</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowManualForm(!showManualForm)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showManualForm ? 'Hide custom profile fields' : 'Joining with a new email? Configure profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-500">
          <p>Syncs directly with your Pipeline Tracker sheets & activities</p>
        </div>
      </div>
    </div>
  );
};
