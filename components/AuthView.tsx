import React, { useState } from 'react';
import { User, Role, City } from '../types';
import { Button } from './Button';
import { Eye, EyeOff, ArrowRight, MapPin, User as UserIcon, ShieldAlert } from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User, isNewAccount: boolean) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  // Pour le login simulation, on garde le selecteur. Pour l'inscription, c'est forcé à 'client'
  const [loginRole, setLoginRole] = useState<Role>('client'); 
  const [city, setCity] = useState<City>('Brazzaville');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulation d'un appel API
    setTimeout(() => {
      const isSignup = mode === 'signup';
      const finalRole = isSignup ? 'client' : loginRole;

      const mockUser: User = {
        id: 'u_' + Date.now(),
        name: isSignup ? name : (finalRole === 'supervisor' ? 'Superviseur Zone A' : finalRole === 'collector' ? 'Collecteur 01' : 'Utilisateur Démo'),
        email,
        role: finalRole,
        city: city,
        phone: phone
      };
      setLoading(false);
      onLogin(mockUser, isSignup);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-green-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-gray-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

      <div className="flex-1 flex flex-col justify-center px-8 py-12 z-10">
        <div className="mb-10">
            <h1 className="text-4xl font-bold tracking-tighter text-gray-900 mb-2">Shekina</h1>
            <p className="text-gray-500 text-lg">Votre partenaire propreté.</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-1">
            <div className="flex p-1 bg-gray-100/50 rounded-2xl mb-6">
                <button 
                    onClick={() => setMode('login')}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Connexion
                </button>
                <button 
                    onClick={() => setMode('signup')}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Inscription
                </button>
            </div>

            <form onSubmit={handleSubmit} className="px-5 pb-8 space-y-5">
                {mode === 'signup' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 ml-1">Nom complet</label>
                            <input 
                                required
                                type="text" 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-gray-50 border-0 text-gray-900 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none placeholder:text-gray-400"
                                placeholder="Jean Dupont"
                            />
                        </div>
                         <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 ml-1">Téléphone</label>
                            <input 
                                required
                                type="tel" 
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="w-full bg-gray-50 border-0 text-gray-900 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none placeholder:text-gray-400"
                                placeholder="+242 06..."
                            />
                        </div>
                        
                         <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 ml-1">Ville</label>
                            <div className="relative">
                                <select 
                                    value={city} 
                                    onChange={(e) => setCity(e.target.value as City)}
                                    className="w-full bg-gray-50 border-0 text-gray-900 rounded-2xl px-4 py-3.5 appearance-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none"
                                >
                                    <option value="Brazzaville">Brazzaville</option>
                                    <option value="Pointe-Noire">Pointe-Noire</option>
                                </select>
                                <MapPin className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={18} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Login Role Selector - Simulation Only */}
                {mode === 'login' && (
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 ml-1">Type de compte (Simulé)</label>
                        <div className="relative">
                            <select 
                                value={loginRole} 
                                onChange={(e) => setLoginRole(e.target.value as Role)}
                                className="w-full bg-gray-50 border-0 text-gray-900 rounded-2xl px-4 py-3.5 appearance-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none"
                            >
                                <option value="client">Client</option>
                                <option value="collector">Collecteur</option>
                                <option value="supervisor">Superviseur</option>
                            </select>
                            <UserIcon className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={18} />
                        </div>
                        {loginRole !== 'client' && (
                            <div className="flex gap-2 items-center mt-2 p-2 bg-yellow-50 text-yellow-800 rounded-lg text-xs">
                                <ShieldAlert size={14} />
                                Accès réservé aux employés.
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Email</label>
                    <input 
                        required
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-gray-50 border-0 text-gray-900 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none placeholder:text-gray-400"
                        placeholder="exemple@email.com"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Mot de passe</label>
                    <div className="relative">
                        <input 
                            required
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-gray-50 border-0 text-gray-900 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none placeholder:text-gray-400"
                            placeholder="••••••••"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div className="pt-4">
                    <Button 
                        type="submit" 
                        className="w-full py-4 text-lg rounded-2xl shadow-green-200 shadow-xl"
                        isLoading={loading}
                    >
                        {mode === 'login' ? 'Se connecter' : 'Créer mon compte Client'}
                        {!loading && <ArrowRight size={20} className="ml-2" />}
                    </Button>
                </div>
            </form>
        </div>
        
        {mode === 'login' && (
            <p className="text-center text-gray-400 text-sm mt-8">
                Mot de passe oublié ? <button className="text-gray-900 font-medium hover:underline">Réinitialiser</button>
            </p>
        )}
      </div>

      <div className="p-6 text-center z-10">
        <p className="text-xs text-gray-300">© 2024 Shekina Waste Management</p>
      </div>
    </div>
  );
};