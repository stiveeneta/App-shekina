import React, { useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Users, Truck, Map, Plus, Search, MapPin, MoreHorizontal, UserPlus, X, LogOut } from 'lucide-react';
import { User } from '../types';
import { Button } from './Button';

const DATA = [
  { name: 'Lun', collected: 40, target: 50 },
  { name: 'Mar', collected: 30, target: 50 },
  { name: 'Mer', collected: 55, target: 55 },
  { name: 'Jeu', collected: 20, target: 50 },
  { name: 'Ven', collected: 48, target: 60 },
  { name: 'Sam', collected: 65, target: 70 },
  { name: 'Dim', collected: 10, target: 20 },
];

interface SupervisorViewProps {
    user: User;
    onLogout: () => void;
}

export const SupervisorView: React.FC<SupervisorViewProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'missions' | 'map'>('dashboard');
  const [showAddCollectorModal, setShowAddCollectorModal] = useState(false);
  const [collectorName, setCollectorName] = useState('');
  const [collectorEmail, setCollectorEmail] = useState('');

  const handleCreateCollector = (e: React.FormEvent) => {
      e.preventDefault();
      // Simulation API call
      setTimeout(() => {
          alert(`Compte collecteur créé pour ${collectorName} ! Des identifiants temporaires ont été envoyés à ${collectorEmail}.`);
          setShowAddCollectorModal(false);
          setCollectorName('');
          setCollectorEmail('');
      }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Header Card */}
      <header className="bg-gray-900 text-white p-8 pb-16 rounded-b-[3rem] shadow-2xl shadow-gray-300 z-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
        
        <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{user.city}</p>
                <h1 className="text-3xl font-bold tracking-tight">Superviseur</h1>
            </div>
            <div className="flex gap-2">
                <button 
                  onClick={onLogout}
                  className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors"
                  title="Déconnexion"
                >
                    <LogOut size={20} className="text-white" />
                </button>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10">
                    <span className="font-bold">{user.name.slice(0,2).toUpperCase()}</span>
                </div>
            </div>
        </div>
        
        {/* KPI Grid */}
        <div className="grid grid-cols-3 gap-4 relative z-10">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition">
                <p className="text-[10px] text-gray-300 mb-1 uppercase tracking-wider">Taux Collecte</p>
                <p className="text-2xl font-bold">87<span className="text-sm text-gray-400">%</span></p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition">
                <p className="text-[10px] text-gray-300 mb-1 uppercase tracking-wider">Incidents</p>
                <p className="text-2xl font-bold text-red-400">2</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition cursor-pointer" onClick={() => setShowAddCollectorModal(true)}>
                <p className="text-[10px] text-gray-300 mb-1 uppercase tracking-wider">Équipes</p>
                <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-green-400">12</p>
                    <Plus size={16} className="text-green-400/50" />
                </div>
            </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex px-6 -mt-8 z-20 space-x-3 overflow-x-auto no-scrollbar pb-2">
         <button 
           onClick={() => setActiveTab('dashboard')}
           className={`px-6 py-3.5 rounded-2xl font-bold text-sm whitespace-nowrap shadow-lg transition-all ${activeTab === 'dashboard' ? 'bg-white text-gray-900 scale-100' : 'bg-gray-800 text-white/70 scale-95 border border-gray-700'}`}
         >
           Tableau de bord
         </button>
         <button 
           onClick={() => setActiveTab('missions')}
           className={`px-6 py-3.5 rounded-2xl font-bold text-sm whitespace-nowrap shadow-lg transition-all ${activeTab === 'missions' ? 'bg-white text-gray-900 scale-100' : 'bg-gray-800 text-white/70 scale-95 border border-gray-700'}`}
         >
           Missions
         </button>
         <button 
           onClick={() => setActiveTab('map')}
           className={`px-6 py-3.5 rounded-2xl font-bold text-sm whitespace-nowrap shadow-lg transition-all ${activeTab === 'map' ? 'bg-white text-gray-900 scale-100' : 'bg-gray-800 text-white/70 scale-95 border border-gray-700'}`}
         >
           Suivi GPS
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pt-4">
        
        {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                {/* Chart */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 h-80">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 text-lg">Performance</h3>
                        <select className="bg-gray-50 text-xs font-bold rounded-lg px-2 py-1 border-none outline-none text-gray-500">
                            <option>Hebdomadaire</option>
                            <option>Mensuel</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={DATA}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF', dy: 10}} />
                            <Tooltip 
                                cursor={{fill: '#F3F4F6', radius: 8}} 
                                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}} 
                            />
                            <Bar dataKey="collected" radius={[6, 6, 6, 6]} barSize={32}>
                                {DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.collected >= entry.target ? '#16A34A' : '#1F2937'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Database Shortcuts */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:scale-[1.02] transition-transform cursor-pointer group">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-100 transition-colors">
                            <Users size={24} />
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg">Clients</h4>
                        <p className="text-xs text-gray-400 font-medium mt-1">1,240 abonnés</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:scale-[1.02] transition-transform cursor-pointer group" onClick={() => setShowAddCollectorModal(true)}>
                         <div className="absolute top-4 right-4 bg-orange-100 text-orange-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                             <Plus size={14} />
                         </div>
                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-4 group-hover:bg-orange-100 transition-colors">
                            <Truck size={24} />
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg">Flotte</h4>
                        <p className="text-xs text-gray-400 font-medium mt-1">Gérer les collecteurs</p>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'missions' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl text-gray-900">Zones Actives</h3>
                    <button className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-black transition-colors">
                        <Plus size={20} />
                    </button>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Rechercher une zone, un collecteur..." 
                        className="w-full bg-white pl-12 pr-4 py-3.5 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm text-sm font-medium"
                    />
                </div>

                <div className="space-y-4">
                    {/* Mission Item */}
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                A
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Zone Poto-Poto A</h4>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">Jean K. • 15 Rue Mbochi</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="radial-progress text-green-500 text-xs font-bold" style={{"--value":80, "--size": "2rem"} as any}>80%</div>
                        </div>
                    </div>
                     {/* Mission Item */}
                     <div className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold">
                                B
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Zone Bacongo Sud</h4>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">Michel O. • Av. Matsoua</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <span className="text-xs font-bold bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full">En cours</span>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'map' && (
            <div className="bg-white rounded-[2rem] p-2 h-[500px] border border-gray-200 shadow-sm relative animate-in fade-in zoom-in-95">
                <div className="w-full h-full bg-gray-100 rounded-[1.5rem] bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Brazzaville_OpenStreetMap.png/640px-Brazzaville_OpenStreetMap.png')] bg-cover bg-center grayscale opacity-60 relative overflow-hidden">
                    {/* Simulated Pins */}
                    <div className="absolute top-1/4 left-1/3 group">
                        <div className="w-8 h-8 bg-green-500 border-4 border-white rounded-full shadow-xl flex items-center justify-center text-white transform transition-transform hover:scale-110">
                            <Truck size={12} fill="currentColor" />
                        </div>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Jean K.
                        </div>
                    </div>

                    <div className="absolute bottom-1/3 right-1/4 group">
                        <div className="w-8 h-8 bg-green-500 border-4 border-white rounded-full shadow-xl flex items-center justify-center text-white">
                             <Truck size={12} fill="currentColor" />
                        </div>
                    </div>

                    <div className="absolute top-1/2 left-1/2 group">
                        <div className="w-8 h-8 bg-red-500 border-4 border-white rounded-full shadow-xl flex items-center justify-center text-white animate-pulse">
                            <MapPin size={12} fill="currentColor" />
                        </div>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm whitespace-nowrap">
                            Arrêt prolongé
                        </div>
                    </div>
                </div>
                
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-gray-100 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                            <span className="text-xs font-bold text-gray-700">En mouvement (5)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                            <span className="text-xs font-bold text-gray-700">À l'arrêt (2)</span>
                        </div>
                    </div>
                    <button className="bg-gray-100 p-2 rounded-xl hover:bg-gray-200 transition-colors">
                        <MoreHorizontal size={20} className="text-gray-600" />
                    </button>
                </div>
            </div>
        )}

        {/* Add Collector Modal */}
        {showAddCollectorModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl animate-in fade-in zoom-in-95">
                     <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                <UserPlus size={20} />
                            </div>
                            <h3 className="text-xl font-bold">Nouveau Collecteur</h3>
                        </div>
                        <button onClick={() => setShowAddCollectorModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleCreateCollector} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 ml-1">Nom du collecteur</label>
                            <input 
                                required
                                type="text" 
                                value={collectorName}
                                onChange={e => setCollectorName(e.target.value)}
                                className="w-full bg-gray-50 border-0 text-gray-900 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none placeholder:text-gray-400"
                                placeholder="ex: Michel Oba"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 ml-1">Email professionnel</label>
                            <input 
                                required
                                type="email" 
                                value={collectorEmail}
                                onChange={e => setCollectorEmail(e.target.value)}
                                className="w-full bg-gray-50 border-0 text-gray-900 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none placeholder:text-gray-400"
                                placeholder="ex: m.oba@shekina.cg"
                            />
                        </div>
                         <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 ml-1">Zone d'affectation</label>
                             <select className="w-full bg-gray-50 border-0 text-gray-900 rounded-2xl px-4 py-3.5 appearance-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none">
                                <option>Poto-Poto A</option>
                                <option>Bacongo Sud</option>
                                <option>Moungali</option>
                            </select>
                        </div>
                        <div className="pt-4">
                            <Button type="submit" className="w-full py-3.5 rounded-xl">
                                Créer le compte
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};