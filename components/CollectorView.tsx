import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { 
  MapPin, Phone, Check, AlertCircle, X, TriangleAlert, 
  ChevronRight, Calendar, Scan, Flashlight, 
  CheckCircle2, LayoutDashboard, 
  ListFilter, Search, Clock, Truck, Battery, Signal, Navigation, Camera, RefreshCw,
  CloudSun, PhoneOutgoing, Coffee, ArrowUpRight, Droplets, Wind,
  CloudRain, Sun, Cloud, CloudLightning, CloudFog, Map, LogOut,
  Briefcase, UserCheck, BadgeCheck, Award, Star, Shield, CarFront, Mail, CreditCard, Activity
} from 'lucide-react';
import { Button } from './Button';
import { Mission, User as UserType } from '../types';

// Extension locale du type Mission pour inclure le téléphone (mock data)
interface MissionWithPhone extends Mission {
    phone?: string;
}

// --- MOCK DATA ÉTENDUE ---
const INITIAL_MISSIONS: MissionWithPhone[] = [
  { id: 'm1', clientId: 'c1', clientName: 'Famille Ngouabi', address: '12 Rue des Manguiers, Poto-Poto', location: { lat: -4.27, lng: 15.28 }, status: 'pending', date: '2023-10-24', collectionGroup: 'Standard', phone: '+242066000001' },
  { id: 'm2', clientId: 'c2', clientName: 'Restaurant Mami Wata', address: 'Av. de la Corniche', location: { lat: -4.28, lng: 15.29 }, status: 'pending', date: '2023-10-24', collectionGroup: 'Pro', phone: '+242066000002' },
  { id: 'm3', clientId: 'c3', clientName: 'Hôtel Saphir', address: 'Centre-ville', location: { lat: -4.26, lng: 15.27 }, status: 'collected', date: '2023-10-24', collectionGroup: 'VIP', phone: '+242066000003' },
  { id: 'm4', clientId: 'c4', clientName: 'Marché Total (Secteur B)', address: 'Bacongo', location: { lat: -4.29, lng: 15.26 }, status: 'pending', date: '2023-10-24', collectionGroup: 'Pro', phone: '+242066000004' },
  { id: 'm5', clientId: 'c5', clientName: 'Résidence Les Palmiers', address: 'Moungali', location: { lat: -4.27, lng: 15.27 }, status: 'pending', date: '2023-10-24', collectionGroup: 'Standard', phone: '+242066000005' },
  { id: 'm6', clientId: 'c6', clientName: 'Boulangerie Pat', address: 'Plateau des 15 ans', location: { lat: -4.26, lng: 15.25 }, status: 'missed', incidentReason: 'Portail fermé', date: '2023-10-24', collectionGroup: 'Pro', phone: '+242066000006' },
  { id: 'm7', clientId: 'c7', clientName: 'École Militaire', address: 'Centre-ville', location: { lat: -4.26, lng: 15.28 }, status: 'pending', date: '2023-10-24', collectionGroup: 'VIP', phone: '+242066000007' },
  { id: 'm8', clientId: 'c8', clientName: 'Mme. Okemba', address: 'Och', location: { lat: -4.25, lng: 15.24 }, status: 'pending', date: '2023-10-24', collectionGroup: 'Standard', phone: '+242066000008' },
];

interface CollectorViewProps {
    user: UserType;
    onLogout: () => void;
}

export const CollectorView: React.FC<CollectorViewProps> = ({ user, onLogout }) => {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tournee' | 'profil'>('dashboard');
  const [missions, setMissions] = useState<MissionWithPhone[]>(INITIAL_MISSIONS);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Weather State
  const [weather, setWeather] = useState({
      temp: 0,
      humidity: 0,
      wind: 0,
      code: 0,
      desc: "Chargement...",
      loading: true
  });

  // Scanner & Process Logic
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  
  const [scannedMission, setScannedMission] = useState<MissionWithPhone | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'done'>('all');

  // Camera Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  // --- STATS COMPUTED ---
  const total = missions.length;
  const done = missions.filter(m => m.status === 'collected').length;
  const pending = missions.filter(m => m.status === 'pending').length;
  const issues = missions.filter(m => m.status === 'incident' || m.status === 'missed').length;
  const progress = Math.round((done / total) * 100);
  
  const nextMission = missions.find(m => m.status === 'pending');

  // --- CLOCK EFFECT ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- REAL WEATHER API FETCH ---
  const getWeatherDescription = (code: number) => {
      // WMO Weather interpretation codes (WW)
      if (code === 0) return { label: "Ensoleillé", icon: Sun };
      if (code >= 1 && code <= 3) return { label: "Nuageux", icon: CloudSun };
      if (code === 45 || code === 48) return { label: "Brouillard", icon: CloudFog };
      if (code >= 51 && code <= 67) return { label: "Pluvieux", icon: CloudRain };
      if (code >= 80 && code <= 82) return { label: "Averses", icon: CloudRain };
      if (code >= 95) return { label: "Orageux", icon: CloudLightning };
      return { label: "Nuageux", icon: Cloud };
  };

  useEffect(() => {
    const fetchWeather = async (lat: number, lng: number) => {
        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`);
            const data = await response.json();
            
            const current = data.current;
            const info = getWeatherDescription(current.weather_code);
            
            setWeather({
                temp: Math.round(current.temperature_2m),
                humidity: current.relative_humidity_2m,
                wind: Math.round(current.wind_speed_10m),
                code: current.weather_code,
                desc: info.label,
                loading: false
            });
        } catch (error) {
            console.error("Weather Error:", error);
            // Fallback mock
            setWeather(prev => ({ ...prev, temp: 28, desc: "Indisponible", loading: false }));
        }
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeather(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.log("Geo denied, defaulting to Brazzaville");
                fetchWeather(-4.2634, 15.2429); // Brazzaville coords default
            }
        );
    } else {
        fetchWeather(-4.2634, 15.2429);
    }
  }, []);

  // --- ACTION HANDLERS (Call & GPS) ---

  const handleOpenGPS = (e: React.MouseEvent, lat: number, lng: number) => {
      e.stopPropagation(); // Empêche l'ouverture du détail
      // Format Universel Google Maps (déclenche l'app ou le site en mode itinéraire)
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
      window.open(url, '_blank');
  };

  const handleCallClient = (e: React.MouseEvent, phone?: string) => {
      e.stopPropagation();
      if (phone) {
          window.open(`tel:${phone}`);
      } else {
          alert("Numéro non disponible");
      }
  };

  // --- SCANNER FUNCTIONS ---
  
  const stopScanner = useCallback(() => {
    setIsScanning(false);
    setIsLoadingCamera(false);
    
    // Stop tracks
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    
    // Stop animation loop
    if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
    }
  }, []);

  const handleScanResult = useCallback((qrData: string) => {
      // 1. Feedback Haptique (Vibration)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(200);
      }
      
      // 2. Arrêt du scan
      stopScanner();
      
      // 3. Logique de Matching
      console.log("QR Data detected:", qrData);
      const foundMission = nextMission || missions[0]; // Fallback pour la démo
      
      if (foundMission) {
          setScannedMission(foundMission);
      } else {
          alert("Ce code ne correspond à aucune mission en cours.");
      }
  }, [missions, nextMission, stopScanner]);

  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // S'assurer que les dimensions sont valides
      if (video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              
              // Scan
              const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
              });

              if (code && code.data && code.data.length > 0) {
                handleScanResult(code.data);
                return; // Stop loop
              }
          }
      }
    }
    // Continue loop
    animationRef.current = requestAnimationFrame(tick);
  }, [handleScanResult]);

  const startScanner = useCallback(async () => {
    setIsScanning(true);
    setCameraError(null);
    setIsLoadingCamera(true);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: "environment",
                width: { ideal: 1280 }, // HD preference
                height: { ideal: 720 }
            } 
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Attendre que les métadonnées soient chargées pour éviter les dimensions à 0
            videoRef.current.onloadedmetadata = () => {
                setIsLoadingCamera(false);
                if(videoRef.current) {
                    videoRef.current.play().catch(e => console.error("Play error:", e));
                    animationRef.current = requestAnimationFrame(tick);
                }
            };
        }
    } catch (err) {
        console.error("Erreur caméra", err);
        setIsLoadingCamera(false);
        setCameraError("Accès caméra refusé ou indisponible.");
    }
  }, [tick]);


  // Cleanup effect
  useEffect(() => {
    return () => {
       stopScanner();
    };
  }, [stopScanner]);


  const validateCollection = () => {
      if (scannedMission) {
          setMissions(prev => prev.map(m => m.id === scannedMission.id ? { ...m, status: 'collected' } : m));
          setScannedMission(null);
          setShowSuccessModal(true);
          setTimeout(() => setShowSuccessModal(false), 2000);
      }
  };

  const reportProblem = () => {
      if (scannedMission) {
          const reason = prompt("Motif (ex: Bac absent, chien...)");
          if (reason) {
              setMissions(prev => prev.map(m => m.id === scannedMission.id ? { ...m, status: 'incident', incidentReason: reason } : m));
              setScannedMission(null);
          }
      }
  };

  // --- RENDER HELPERS ---
  const filteredMissions = missions.filter(m => {
      const matchesSearch = m.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || m.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = 
        filterStatus === 'all' ? true : 
        filterStatus === 'pending' ? m.status === 'pending' :
        (m.status === 'collected' || m.status === 'incident' || m.status === 'missed');
      return matchesSearch && matchesStatus;
  });

  const groupedMissions = filteredMissions.reduce((acc: Record<string, MissionWithPhone[]>, mission) => {
      const group = mission.collectionGroup || 'Autres';
      if (!acc[group]) acc[group] = [];
      acc[group].push(mission);
      return acc;
  }, {} as Record<string, MissionWithPhone[]>);

  const WeatherIcon = getWeatherDescription(weather.code).icon;

  return (
    <div className="flex flex-col h-screen bg-gray-50 relative overflow-hidden">
      
      {/* Main Content Render with Conditional Scroll */}
      <div className={`flex-1 ${activeTab === 'tournee' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto no-scrollbar overscroll-y-auto'}`}>
          
          {/* DASHBOARD VIEW INLINED */}
          {activeTab === 'dashboard' && (
             <div className="p-6 space-y-6 animate-in fade-in pb-24 font-sans">
                {/* Header Minimal */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Bonjour, {user.name.split(' ')[0]}</h1>
                        <p className="text-gray-400 font-medium text-sm">Bon courage pour la tournée.</p>
                    </div>
                    <button onClick={() => setActiveTab('profil')} className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm active:scale-95 transition-transform">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">{user.name[0]}</div>}
                    </button>
                </div>

                {/* NEW HERO WIDGET: Weather & Time */}
                <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-gray-100 border border-gray-100 relative overflow-hidden group">
                    {/* Decorative Background */}
                    <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -mr-16 -mt-16 transition-colors duration-1000 ${weather.temp > 25 ? 'bg-orange-50' : 'bg-blue-50'}`}></div>
                    <div className={`absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl -ml-10 -mb-10 transition-colors duration-1000 ${weather.temp > 25 ? 'bg-yellow-50' : 'bg-gray-100'}`}></div>

                    <div className="flex justify-between items-start relative z-10 mb-6">
                        <div>
                            <h2 className="text-5xl font-bold text-gray-900 tracking-tighter tabular-nums mb-1">
                                {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </h2>
                            <p className="text-gray-500 font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                                {currentTime.toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long'})}
                            </p>
                        </div>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transform group-hover:scale-105 transition-all duration-500 ${weather.temp > 25 ? 'bg-orange-500 shadow-orange-200' : 'bg-blue-500 shadow-blue-200'}`}>
                            {weather.loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <WeatherIcon size={36} strokeWidth={1.5} />
                            )}
                        </div>
                    </div>

                    {/* Detailed Weather Grid */}
                    <div className="grid grid-cols-3 gap-2 relative z-10 bg-gray-50/50 rounded-2xl p-3 border border-gray-100 backdrop-blur-sm">
                        <div className="flex flex-col items-center border-r border-gray-200">
                            <span className="text-xs text-gray-400 font-bold mb-1">Temp</span>
                            <span className="text-lg font-bold text-gray-900">
                                {weather.loading ? "--" : `${weather.temp}°C`}
                            </span>
                        </div>
                        <div className="flex flex-col items-center border-r border-gray-200">
                            <span className="text-xs text-gray-400 font-bold mb-1"><Droplets size={12} className="inline mr-1"/>Hum</span>
                            <span className="text-lg font-bold text-gray-900">
                                {weather.loading ? "--" : `${weather.humidity}%`}
                            </span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-gray-400 font-bold mb-1"><Wind size={12} className="inline mr-1"/>Vent</span>
                            <span className="text-lg font-bold text-gray-900">
                                {weather.loading ? "--" : `${weather.wind} km`}
                            </span>
                        </div>
                    </div>
                    
                    {/* Description text */}
                    {!weather.loading && (
                        <p className="absolute bottom-4 right-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md backdrop-blur-sm">
                            {weather.desc}
                        </p>
                    )}
                </div>

                {/* KPI Main Card (Mission Control) */}
                <div className="bg-gray-900 text-white p-6 rounded-[2.5rem] shadow-2xl shadow-gray-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Progression</span>
                            </div>
                            <span className="bg-white/10 px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-md">Fin estimée: 14:30</span>
                        </div>

                        <div className="flex items-end justify-between">
                            <div>
                                <h2 className="text-6xl font-bold tracking-tighter leading-none mb-2">{progress}<span className="text-3xl text-gray-500 font-normal">%</span></h2>
                                <p className="text-gray-400 font-medium text-sm">{done} collectés sur {total} clients</p>
                            </div>
                            
                            {/* Circular Progress Mini */}
                            <div className="w-16 h-16 relative">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                    <path className="text-green-500" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>
                        
                        {/* Progress Bar Visual */}
                        <div className="mt-6 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-4 gap-3">
                    <button 
                        onClick={() => alert("Appel superviseur lancé...")}
                        className="col-span-1 flex flex-col items-center justify-center p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 active:scale-95 transition-all aspect-square"
                    >
                        <PhoneOutgoing size={20} className="text-gray-900 mb-1" />
                        <span className="text-[10px] font-bold text-gray-500">Appel</span>
                    </button>
                    
                    <button 
                        onClick={() => alert("Pause enregistrée (15 min)")}
                        className="col-span-1 flex flex-col items-center justify-center p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 active:scale-95 transition-all aspect-square"
                    >
                        <Coffee size={20} className="text-blue-600 mb-1" />
                        <span className="text-[10px] font-bold text-gray-500">Pause</span>
                    </button>

                    <button className="col-span-2 flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-2xl active:scale-95 transition-all group">
                        <div className="flex flex-col items-start">
                            <span className="text-xs font-bold text-red-800 uppercase">Incidents</span>
                            <span className="text-2xl font-bold text-red-600 leading-none">{issues}</span>
                        </div>
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <TriangleAlert size={16} className="text-red-500" />
                        </div>
                    </button>
                </div>

                {/* Next Mission Ticket */}
                {nextMission ? (
                    <div onClick={() => setActiveTab('tournee')} className="relative group cursor-pointer active:scale-98 transition-transform">
                        {/* Ticket Notch Effect */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full z-10"></div>
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full z-10"></div>
                        
                        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-lg shadow-gray-200/50 flex flex-col gap-3">
                            <div className="flex justify-between items-start border-b border-dashed border-gray-200 pb-3">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prochain Arrêt</p>
                                    <h3 className="text-lg font-bold text-gray-900 mt-1">{nextMission.clientName}</h3>
                                </div>
                                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
                                    <ArrowUpRight size={20} />
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <p className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                                    <MapPin size={16} className="text-gray-400"/>
                                    {nextMission.address.split(',')[0]}
                                </p>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                                    nextMission.collectionGroup === 'VIP' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-gray-50 text-gray-600 border-gray-100'
                                }`}>
                                    {nextMission.collectionGroup || 'Standard'}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-green-50 p-6 rounded-[2rem] text-center border border-green-100">
                        <CheckCircle2 size={32} className="text-green-600 mx-auto mb-2" />
                        <h3 className="font-bold text-green-900">Tournée terminée !</h3>
                        <p className="text-green-700 text-sm">Rentrez au dépôt.</p>
                    </div>
                )}
             </div>
          )}

          {/* TOURNEE VIEW INLINED */}
          {activeTab === 'tournee' && (
            <div className="flex flex-col h-full bg-gray-50/50 animate-in slide-in-from-right duration-300">
                {/* Sticky Header with Blur */}
                <div className="px-6 pt-12 pb-4 bg-white/80 backdrop-blur-xl sticky top-0 z-20 border-b border-gray-200/50">
                    <div className="flex justify-between items-end mb-4">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tournée</h1>
                        <div className="text-right">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
                            <p className="text-xl font-bold text-gray-900 leading-none">{filteredMissions.length}</p>
                        </div>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative mb-4 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                        </div>
                        <input 
                        type="text" 
                        placeholder="Client, adresse, n° de bac..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-100 pl-11 pr-4 py-3.5 rounded-2xl text-sm font-semibold text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all shadow-sm border border-transparent focus:border-gray-100"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex p-1 bg-gray-100 rounded-xl">
                        {['all', 'pending', 'done'].map((status) => (
                            <button 
                                key={status}
                                onClick={() => setFilterStatus(status as any)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all duration-200 ${filterStatus === status ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {status === 'all' ? 'Tous' : status === 'pending' ? 'À Faire' : 'Terminé'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 pb-32 space-y-8 no-scrollbar">
                    {Object.entries(groupedMissions).map(([group, groupMissions]: [string, MissionWithPhone[]]) => (
                        <div key={group} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-center gap-2 mb-3 ml-1">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{group}</span>
                                <div className="h-px bg-gray-200 flex-1"></div>
                            </div>
                            
                            <div className="space-y-3">
                                {groupMissions.map((mission, idx) => {
                                    const isDone = mission.status === 'collected';
                                    const isIssue = mission.status === 'incident' || mission.status === 'missed';
                                    
                                    return (
                                        <div key={mission.id} className="bg-white p-4 rounded-3xl border border-gray-100/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-start gap-4 active:scale-[0.98] transition-all relative overflow-hidden group">
                                            {/* Status Stripe */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isDone ? 'bg-green-500' : isIssue ? 'bg-red-500' : 'bg-gray-200'}`}></div>

                                            {/* Index/Status Icon */}
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border mt-1 ${
                                                isDone ? 'bg-green-50 text-green-600 border-green-100' : 
                                                isIssue ? 'bg-red-50 text-red-600 border-red-100' : 
                                                'bg-gray-50 text-gray-900 font-bold text-lg border-gray-100'
                                            }`}>
                                                {isDone ? <Check size={20} strokeWidth={3} /> : 
                                                isIssue ? <AlertCircle size={20} strokeWidth={2.5} /> : 
                                                <span className="font-mono">{idx + 1}</span>}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h3 className={`font-bold text-gray-900 text-base truncate pr-2 ${isDone ? 'line-through text-gray-400' : ''}`}>
                                                        {mission.clientName}
                                                    </h3>
                                                    {/* Distance Mock */}
                                                    {!isDone && (
                                                        <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                                            <Navigation size={8} /> 2 min
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <p className="text-sm text-gray-500 font-medium leading-snug mt-0.5">{mission.address}</p>
                                                
                                                {/* Meta Actions Row - FIXED */}
                                                <div className="flex items-center gap-4 mt-3">
                                                    <button 
                                                        onClick={(e) => handleCallClient(e, mission.phone)}
                                                        className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-green-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-green-50 active:scale-95"
                                                    >
                                                        <Phone size={12} /> Appeler
                                                    </button>
                                                    <button 
                                                        onClick={(e) => handleOpenGPS(e, mission.location.lat, mission.location.lng)}
                                                        className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-blue-50 active:scale-95"
                                                    >
                                                        <MapPin size={12} /> GPS
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {filteredMissions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <ListFilter size={32} className="opacity-50" />
                            </div>
                            <p className="text-sm font-medium">Aucune mission trouvée.</p>
                        </div>
                    )}
                </div>
            </div>
          )}

          {activeTab === 'profil' && (
              <div className="flex flex-col h-full animate-in fade-in bg-gray-50">
                  <div className="px-6 pt-12 pb-4 flex justify-between items-center bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-20">
                       <h1 className="text-2xl font-bold text-gray-900">Mon Espace</h1>
                       <button onClick={onLogout} className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500 border border-red-100 hover:bg-red-100 transition-colors">
                          <LogOut size={20} />
                       </button>
                  </div>
                  
                  {/* Container with forced scroll for bounce effect */}
                  <div className="flex-1 overflow-y-auto p-6 pb-32 no-scrollbar overscroll-y-auto animate-in slide-in-from-bottom duration-700 fade-in">
                      
                      {/* Premium Profile Card */}
                      <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-gray-200/50 border border-gray-100 text-center mb-6 relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
                          
                          <div className="relative w-28 h-28 bg-white rounded-full mx-auto mb-4 p-1.5 shadow-2xl -mt-14 ring-4 ring-white/50">
                              <div className="w-full h-full bg-gray-100 rounded-full overflow-hidden">
                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">{user.name[0]}</div>}
                              </div>
                              <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white shadow-sm">
                                  <BadgeCheck size={16} fill="currentColor" className="text-white" />
                              </div>
                          </div>
                          
                          <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">{user.name}</h2>
                          <div className="flex items-center justify-center gap-2 mb-6">
                             <span className="text-gray-500 text-sm font-medium">{user.email}</span>
                             <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                             <span className="text-gray-500 text-sm font-medium">Collecteur #42</span>
                          </div>
                          
                          <div className="flex justify-center gap-3">
                              <span className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-gray-200">Standard</span>
                              <span className="bg-green-50 text-green-700 border border-green-200 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                  En service
                              </span>
                          </div>
                      </div>

                      {/* Performance Stats Grid - Neumorphic Style */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center justify-center hover:scale-[1.02] transition-transform">
                              <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-500 mb-3 shadow-sm">
                                  <Star size={24} fill="currentColor" className="drop-shadow-sm" />
                              </div>
                              <p className="text-3xl font-bold text-gray-900 tracking-tighter">4.9<span className="text-lg text-gray-400 font-medium">/5</span></p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Note Moyenne</p>
                          </div>
                          <div className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center justify-center hover:scale-[1.02] transition-transform">
                              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-3 shadow-sm">
                                  <Activity size={24} />
                              </div>
                              <p className="text-3xl font-bold text-gray-900 tracking-tighter">1,452</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Missions</p>
                          </div>
                      </div>

                      {/* Detailed Info Group - Apple Settings Style */}
                      <div className="space-y-6">
                          <div>
                            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider ml-4 mb-2">
                                Identité Professionnelle
                            </h3>
                            
                            <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-gray-100">
                                <div className="p-4 border-b border-gray-50 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-sm">
                                            <Shield size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Matricule</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500 font-medium">COL-BZ-2023-042</span>
                                </div>
                                <div className="p-4 border-b border-gray-50 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-sm">
                                            <Calendar size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Embauche</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500 font-medium">15 Mars 2022</span>
                                </div>
                                <div className="p-4 border-b border-gray-50 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center shadow-sm">
                                            <UserCheck size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Superviseur</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500 font-medium">J. Mokoko</span>
                                </div>
                                <div className="p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center shadow-sm">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Zone</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500 font-medium">Poto-Poto Sec. 3</span>
                                </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider ml-4 mb-2">
                                Matériel Assigné
                            </h3>
                            
                            <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-green-500"></div>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                                        <Truck size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">Camion Benne #42</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md border border-green-100">Opérationnel</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Km</p>
                                    <p className="font-mono font-bold text-gray-900 text-lg">45K</p>
                                </div>
                            </div>
                          </div>
                      </div>
                      
                      <div className="mt-12 mb-safe text-center">
                           <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                               <Shield size={20} className="text-gray-400" />
                           </div>
                          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Shekina Collector App v2.4.1</p>
                          <p className="text-[10px] text-gray-300 mt-1">ID: {user.id}</p>
                      </div>

                      {/* Spacer to force scroll on larger screens */}
                      <div className="h-10"></div>
                  </div>
              </div>
          )}
      </div>

      {/* SCANNER OVERLAY (FULL SCREEN) */}
      {isScanning && (
          <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-in fade-in duration-300">
              {/* Controls */}
              <div className="absolute top-0 left-0 right-0 p-6 pt-12 flex justify-between items-start z-30">
                  <button onClick={stopScanner} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                      <X size={20} />
                  </button>
                  <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                      <p className="text-white text-xs font-bold tracking-wide text-center">SCANNER QR CODE</p>
                  </div>
                   <button className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                      <Flashlight size={20} />
                  </button>
              </div>

              {/* Camera View */}
              <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gray-900">
                   {/* Feedback Error / Loading */}
                   {cameraError && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center z-50 p-6 text-center">
                           <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                               <TriangleAlert className="text-red-500" size={32} />
                           </div>
                           <p className="text-white font-bold mb-2">{cameraError}</p>
                           <Button onClick={startScanner} variant="outline" className="mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
                               <RefreshCw size={16} className="mr-2"/> Réessayer
                           </Button>
                       </div>
                   )}

                   {isLoadingCamera && !cameraError && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
                           <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                           <p className="text-white/70 text-sm font-medium">Démarrage caméra...</p>
                       </div>
                   )}

                   {/* Le Video Element */}
                   <video 
                     ref={videoRef} 
                     className="absolute inset-0 w-full h-full object-cover" 
                     playsInline 
                     muted 
                     autoPlay
                   />
                   <canvas ref={canvasRef} className="hidden" />
                   
                   {/* Dark Overlay with Transparent Hole (Scanner Window) */}
                   <div className="absolute inset-0 z-10 pointer-events-none">
                       {/* Overlay effect */}
                       <div 
                         className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-[2rem] border-2 border-white/30"
                         style={{ boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)' }}
                       >
                           {/* Coins décoratifs */}
                           <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-xl -mt-[2px] -ml-[2px]"></div>
                           <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-xl -mt-[2px] -mr-[2px]"></div>
                           <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-xl -mb-[2px] -ml-[2px]"></div>
                           <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-xl -mb-[2px] -mr-[2px]"></div>
                           
                           {/* Laser Scan Animation */}
                           <div className="absolute left-4 right-4 h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-[scan_2s_ease-in-out_infinite] top-0 opacity-80"></div>
                       </div>
                   </div>

                   {/* Simulation Button (Dev) */}
                   <button 
                      onClick={() => handleScanResult("MOCK_DATA")}
                      className="absolute bottom-32 bg-white/10 backdrop-blur-md border border-white/20 text-white/50 px-6 py-2 rounded-full text-[10px] font-bold z-20 hover:bg-white/20 hover:text-white transition-all"
                   >
                      Simuler détection
                   </button>
              </div>

              {/* Footer Instructions */}
              <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black via-black/80 to-transparent z-20 text-center">
                  <p className="text-white font-bold text-lg mb-1">Pointez vers le code</p>
                  <p className="text-gray-400 text-sm">Le scan démarrera automatiquement</p>
              </div>
          </div>
      )}

      {/* SCANNED CLIENT DETAILS (BOTTOM SHEET) */}
      {scannedMission && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 relative">
                  <button onClick={() => setScannedMission(null)} className="absolute top-4 right-4 p-2 bg-gray-50 rounded-full hover:bg-gray-100">
                      <X size={20} className="text-gray-500" />
                  </button>
                  
                  <div className="flex flex-col items-center -mt-12 mb-4">
                      <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">
                          {scannedMission.clientName[0]}
                      </div>
                  </div>

                  <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">{scannedMission.clientName}</h2>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                          {scannedMission.collectionGroup || 'Standard'}
                      </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Adresse</p>
                          <p className="text-sm font-bold text-gray-900 leading-tight">{scannedMission.address}</p>
                      </div>
                       <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Consignes</p>
                          <p className="text-sm font-bold text-gray-900 leading-tight">Bac vert</p>
                      </div>
                  </div>

                  <div className="flex gap-3">
                      <button 
                        onClick={reportProblem}
                        className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                      >
                          <TriangleAlert size={18} />
                          Signaler
                      </button>
                      <button 
                        onClick={validateCollection}
                        className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-200 hover:bg-green-700 transition-colors"
                      >
                          <Check size={24} />
                          Valider
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-green-500/90 backdrop-blur-md animate-in fade-in">
              <div className="text-center text-white scale-150">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl animate-bounce">
                      <Check size={48} className="text-green-600" strokeWidth={4} />
                  </div>
                  <h2 className="text-3xl font-bold">Collecté !</h2>
              </div>
          </div>
      )}

      {/* BOTTOM NAV BAR */}
      <div className="fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-200 pb-safe pt-2 px-6 z-40">
          <div className="flex justify-between items-end pb-4">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'dashboard' ? 'text-black' : 'text-gray-400'}`}
              >
                  <LayoutDashboard size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
                  <span className="text-[10px] font-bold">Dashboard</span>
              </button>

              {/* CENTER SCAN BUTTON */}
              <button 
                onClick={startScanner}
                className="w-16 h-16 bg-black text-white rounded-full shadow-2xl shadow-black/30 flex items-center justify-center mb-4 border-4 border-gray-50 transform hover:scale-105 active:scale-95 transition-all"
              >
                  <Scan size={28} strokeWidth={2.5} />
              </button>

               <button 
                onClick={() => setActiveTab('tournee')}
                className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'tournee' ? 'text-black' : 'text-gray-400'}`}
              >
                  <ListFilter size={24} strokeWidth={activeTab === 'tournee' ? 2.5 : 2} />
                  <span className="text-[10px] font-bold">Tournée</span>
              </button>
          </div>
      </div>
    </div>
  );
};