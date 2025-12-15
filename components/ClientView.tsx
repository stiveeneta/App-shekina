import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, MessageCircle, Phone, CreditCard, Truck, AlertTriangle, Clock, X, 
  Sparkles, ChevronRight, Leaf, CheckCircle, Wallet, Smartphone, History, 
  ShoppingBag, User as UserIcon, Settings, Lock, LogOut, Trash2, Plus, Minus, 
  Star, ShieldCheck, MapPin, Eye, EyeOff, Bell, ToggleLeft, ToggleRight, Save, 
  Store, CalendarDays, TrendingUp, PackagePlus, Zap, Camera, FileText, Frown, 
  AlertCircle, Check 
} from 'lucide-react';
import { Button } from './Button';
import { getGeminiChatResponse } from '../services/geminiService';
import { ChatMessage, SubscriptionPlan, User, CollectionHistory, Product, CartItem } from '../types';

// Nouveaux Packs d'abonnement
const PLANS: SubscriptionPlan[] = [
  { 
      id: 'std', 
      name: 'Standard', 
      price: 3000, 
      frequency: 'Mois', 
      features: ['1 collecte / semaine', 'Déchets ménagers standards', 'Support par chat'] 
  },
  { 
      id: 'jun', 
      name: 'Junior', 
      price: 7000, 
      frequency: 'Mois', 
      features: ['2 collectes / semaine', 'Notification SMS veille', 'Support prioritaire'] 
  },
  { 
      id: 'perso', 
      name: 'Personnalisé', 
      price: 20000, 
      frequency: 'Mois', 
      features: ['Collecte à la demande', 'Gros volumes acceptés', 'Tri sélectif inclus', 'Agent dédié'] 
  },
  { 
      id: 'res', 
      name: 'Résidence Privée', 
      price: 40000, 
      frequency: 'Mois', 
      features: ['Collecte quotidienne (Lun-Sam)', 'Nettoyage des bacs', 'Service VIP', 'Accès portail sécurisé'] 
  },
];

const PRODUCTS: Product[] = [
    {
        id: 'p1',
        name: 'Sac Poubelle Renforcé 100L',
        category: 'Sacs',
        price: 2500,
        image: 'https://images.unsplash.com/photo-1622649363595-c26685810237?auto=format&fit=crop&q=80&w=300',
        description: 'Lot de 10 sacs poubelle haute résistance, anti-fuite avec liens coulissants. Idéal pour les déchets ménagers lourds.',
        rating: 4.8
    },
    {
        id: 'p2',
        name: 'Javel Ultra Puissante',
        category: 'Entretien',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1585670149967-b4f4da66cc47?auto=format&fit=crop&q=80&w=300',
        description: 'Bidon de 1L. Désinfecte, blanchit et désodorise. Parfait pour nettoyer vos bacs à ordures.',
        rating: 4.5
    },
    {
        id: 'p3',
        name: 'Bac Roulant 120L',
        category: 'Equipement',
        price: 35000,
        image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=300',
        description: 'Poubelle extérieure verte normalisée Shekina. Roues robustes et couvercle hermétique.',
        rating: 4.9
    },
    {
        id: 'p4',
        name: 'Gants de Protection',
        category: 'Accessoires',
        price: 1500,
        image: 'https://images.unsplash.com/photo-1596627749654-2c9394fca2d3?auto=format&fit=crop&q=80&w=300',
        description: 'Paire de gants en latex réutilisables pour manipuler vos déchets en toute sécurité.',
        rating: 4.2
    },
    {
        id: 'p5',
        name: 'Désodorisant Bac',
        category: 'Entretien',
        price: 3000,
        image: 'https://images.unsplash.com/photo-1632514686488-816782296d66?auto=format&fit=crop&q=80&w=300',
        description: 'Spray neutralisateur d\'odeurs spécial poubelle. Parfum citronnelle longue durée.',
        rating: 4.6
    }
];

const ECO_TIPS = [
    "Aplatissez vos bouteilles en plastique pour gagner de la place dans le bac.",
    "Séparez le verre des autres déchets, il est 100% recyclable.",
    "Ne jetez pas les piles à la poubelle, rapportez-les en magasin.",
    "Compostez vos épluchures pour réduire le poids de vos déchets de 30%."
];

const CANCEL_REASONS = [
    "Déménagement hors zone",
    "Tarif trop élevé",
    "Passages irréguliers / Retards",
    "Je ne produis plus assez de déchets",
    "Service client insatisfaisant",
    "Autre raison"
];

interface ClientViewProps {
    user: User;
    isNewUser?: boolean;
    onLogout: () => void;
}

const ONBOARDING_SLIDES = [
    {
        title: "Bienvenue sur Shekina",
        desc: "L'excellence de la propreté à votre service. Gérez vos déchets en toute sérénité.",
        icon: Sparkles,
        color: "bg-green-500"
    },
    {
        title: "Zando Market",
        desc: "Commandez vos sacs, bacs et produits d'entretien directement depuis l'application.",
        icon: ShoppingBag,
        color: "bg-orange-500"
    },
    {
        title: "Paiement Mobile",
        desc: "Renouvelez votre abonnement en un clic avec Airtel Money ou MTN Mobile Money.",
        icon: Smartphone,
        color: "bg-purple-500"
    },
];

// Calendar Helper
const generateCalendarDays = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    // Adjust for Monday start (0 = Mon, 6 = Sun)
    const startDay = firstDay === 0 ? 6 : firstDay - 1; 
    
    const days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }
    return days;
};

export const ClientView: React.FC<ClientViewProps> = ({ user, isNewUser = false, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'zando' | 'wallet' | 'account' | 'chat'>('home');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'bot', text: `Bonjour ${user.name} ! Je suis l'assistant Shekina. Une question sur le tri ou votre facture ?`, timestamp: new Date() }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBulkyModal, setShowBulkyModal] = useState(false); // Modal Encombrants
  
  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [paymentProvider, setPaymentProvider] = useState<'mtn' | 'airtel'>('mtn');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  // Zando State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tout');

  // Account State - Profil
  const [localUser, setLocalUser] = useState(user);
  const [address, setAddress] = useState('12 Rue des Manguiers');
  const [editProfile, setEditProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState({ name: user.name, phone: user.phone || '', address: '12 Rue des Manguiers', city: user.city });

  // Account State - Sub & Payment Methods
  const [isSubActive, setIsSubActive] = useState(true);
  const [showMethodsModal, setShowMethodsModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([
      { id: '1', type: 'MTN', number: '06 999 99 99' },
      { id: '2', type: 'Airtel', number: '05 888 88 88' }
  ]);
  const [newMethodPhone, setNewMethodPhone] = useState('');
  const [newMethodType, setNewMethodType] = useState<'MTN' | 'Airtel'>('MTN');

  // Account State - Security & Privacy
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({ notifs: true, marketing: false, location: true });

  // Account State - Cancellation
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState<string | null>(null);
  const [cancelComment, setCancelComment] = useState('');

  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(isNewUser);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Tips State
  const [currentTip, setCurrentTip] = useState(0);

  // Calendar State
  const [currentDate] = useState(new Date());
  const calendarDays = generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth());
  // Sort collection days to ensure logic works correctly
  const collectionDays = [3, 6, 10, 13, 17, 20, 24, 27].sort((a,b) => a-b); 
  const today = currentDate.getDate();

  const scrollRef = useRef<HTMLDivElement>(null);

  // --- LOGIC: NEXT COLLECTION CALCULATION ---
  let nextCollectionDay = collectionDays.find(d => d >= today);
  // Fallback to first day of list (simulating next month) if no days left
  if (!nextCollectionDay) nextCollectionDay = collectionDays[0];

  let heroTitle = '--';
  let heroSubtitle = 'Veuillez réactiver votre abonnement';
  let badgeText = 'Abonnement inactif';

  if (isSubActive) {
      if (nextCollectionDay === today) {
          heroTitle = "Aujourd'hui";
          heroSubtitle = "Passage entre 08:00 et 14:00";
          badgeText = "Collecte en cours";
      } else if (nextCollectionDay === today + 1) {
          heroTitle = "Demain";
          heroSubtitle = "Sortez vos poubelles ce soir";
          badgeText = "Prochaine Collecte";
      } else {
          // Construct date object for proper display
          const d = new Date();
          if (nextCollectionDay) {
            d.setDate(nextCollectionDay);
            const dayName = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' });
            heroTitle = dayName.charAt(0).toUpperCase() + dayName.slice(1);
            heroSubtitle = "Prévu entre 08:00 et 14:00";
            badgeText = "À venir";
          }
      }
  }
  // ------------------------------------------

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  useEffect(() => {
      const interval = setInterval(() => {
          setCurrentTip(prev => (prev + 1) % ECO_TIPS.length);
      }, 5000);
      return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!inputMsg.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: inputMsg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputMsg('');
    setIsTyping(true);

    const history = messages.map(m => `${m.sender}: ${m.text}`);
    const botResponseText = await getGeminiChatResponse(history, userMsg.text);

    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'bot', text: botResponseText, timestamp: new Date() };
    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handlePayment = (e: React.FormEvent) => {
      e.preventDefault();
      setPaymentStatus('processing');
      // Simulation paiement
      setTimeout(() => {
          setPaymentStatus('success');
          setTimeout(() => {
              setShowPaymentModal(false);
              setPaymentStatus('idle');
              alert("Paiement effectué avec succès !");
              if (showCart) {
                  setCart([]); // Vide le panier après achat Zando
                  setShowCart(false);
              } else if (selectedPlanId) {
                  setIsSubActive(true); // Réactiver si abonnement payé
              }
          }, 2000);
      }, 2000);
  };

  const openPayment = (planId: string) => {
      setSelectedPlanId(planId);
      setShowPaymentModal(true);
  };

  const nextSlide = () => {
      if (currentSlide < ONBOARDING_SLIDES.length - 1) {
          setCurrentSlide(currentSlide + 1);
      } else {
          setShowOnboarding(false);
      }
  };

  // Quick Actions Logic
  const handleQuickAction = (action: string) => {
      if (action === 'encombrants') {
          setShowBulkyModal(true);
      } else if (action === 'sacs') {
          setActiveTab('zando');
      } else if (action === 'urgence') {
          setShowReportModal(true);
      }
  };

  // Zando Logic
  const addToCart = (product: Product) => {
      setCart(prev => {
          const existing = prev.find(item => item.id === product.id);
          if (existing) {
              return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
          }
          return [...prev, { ...product, quantity: 1 }];
      });
      setSelectedProduct(null); // Ferme la modale produit si ouverte
  };

  const removeFromCart = (id: string) => {
      setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
      setCart(prev => prev.map(item => {
          if (item.id === id) {
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : item;
          }
          return item;
      }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Account Logic Implementation
  const handleSaveProfile = () => {
      setLocalUser({ ...localUser, name: tempProfile.name, phone: tempProfile.phone, city: tempProfile.city as any });
      setAddress(tempProfile.address);
      setEditProfile(false);
      // Simulation Toast
      alert("Profil mis à jour avec succès !");
  };

  const handleToggleSub = () => {
      if (isSubActive) {
        setShowCancelModal(true);
      } else {
          alert("Abonnement réactivé !");
          setIsSubActive(true);
      }
  };

  const handleCancelSubmit = () => {
      if (!cancelReason) {
          alert("Veuillez sélectionner une raison.");
          return;
      }
      setIsSubActive(false);
      setShowCancelModal(false);
      setCancelReason(null);
      setCancelComment('');
      // Simulation de feedback
      setTimeout(() => alert("Votre abonnement a été résilié. Vous bénéficierez du service jusqu'à la fin du mois."), 300);
  };

  const handleAddMethod = (e: React.FormEvent) => {
      e.preventDefault();
      const newMethod = {
          id: Date.now().toString(),
          type: newMethodType,
          number: newMethodPhone
      };
      setPaymentMethods([...paymentMethods, newMethod]);
      setNewMethodPhone('');
  };

  const removeMethod = (id: string) => {
      setPaymentMethods(prev => prev.filter(m => m.id !== id));
  };

  const handlePasswordChange = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwords.new !== passwords.confirm) {
          alert("Les nouveaux mots de passe ne correspondent pas.");
          return;
      }
      setShowSecurityModal(false);
      setPasswords({ current: '', new: '', confirm: '' });
      alert("Mot de passe modifié avec succès !");
  };

  const selectedPlanDetails = PLANS.find(p => p.id === selectedPlanId);

  return (
    <div className="flex flex-col h-[100dvh] bg-[#F2F2F7] pb-24 relative font-sans overflow-hidden">
      {/* Header Styled */}
      <header className={`px-6 pt-12 pb-4 sticky top-0 z-30 transition-colors duration-500 ${activeTab === 'account' ? 'bg-[#F2F2F7] border-b border-transparent' : 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50'}`}>
        <div className="flex justify-between items-center">
            <div>
                {activeTab !== 'account' && (
                    <p className="text-gray-500 text-xs font-semibold tracking-wider uppercase mb-0.5 animate-in fade-in">
                        {activeTab === 'home' ? new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 
                        activeTab === 'zando' ? 'Boutique' : 
                        activeTab === 'wallet' ? 'Abonnement' : 'Assistant'}
                    </p>
                )}
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {activeTab === 'home' ? `Bonjour, ${localUser.name.split(' ')[0]}` : 
                     activeTab === 'zando' ? 'Zando Market' : 
                     activeTab === 'account' ? 'Compte' : 
                     activeTab === 'wallet' ? 'Portefeuille' : 'Shekina IA'}
                </h1>
            </div>
            {activeTab === 'zando' ? (
                <button onClick={() => setShowCart(true)} className="relative w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 border border-orange-100">
                    <ShoppingBag size={20} />
                    {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white">
                            {cart.reduce((a,b) => a + b.quantity, 0)}
                        </span>
                    )}
                </button>
            ) : activeTab === 'account' ? (
                // No button on account header, kept clean
                null
            ) : (
                <button 
                  onClick={() => setActiveTab('account')}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold border border-gray-200 shadow-sm overflow-hidden active:scale-95 transition-transform"
                >
                    {localUser.avatar ? <img src={localUser.avatar} alt="avatar" className="w-full h-full object-cover" /> : localUser.name.charAt(0)}
                </button>
            )}
        </div>
      </header>

      {activeTab === 'home' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 no-scrollbar pb-40">
          
          {/* Hero Card */}
          <div className="bg-white rounded-[2rem] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden group border border-white">
            <div className={`absolute inset-0 bg-gradient-to-br ${isSubActive ? 'from-green-500 to-emerald-600' : 'from-gray-500 to-gray-600'} opacity-90 transition-all duration-500`}></div>
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-[length:20px_20px]"></div>
            
            <div className="relative z-10 text-white">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-2 border border-white/10">
                            {badgeText}
                        </span>
                        <h2 className="text-4xl font-bold tracking-tighter">{heroTitle}</h2>
                        <p className="text-white/80 font-medium mt-1">{heroSubtitle}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                        <Truck className="text-white" size={24} />
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowReportModal(true)}
                        className="flex-1 bg-white text-green-700 py-3.5 rounded-xl font-bold text-sm hover:bg-green-50 transition-colors shadow-lg active:scale-95 duration-200 flex items-center justify-center gap-2"
                        disabled={!isSubActive}
                    >
                        <AlertTriangle size={16} />
                        Signaler
                    </button>
                    <button 
                        onClick={() => setActiveTab('wallet')}
                        className="flex-1 bg-white/20 backdrop-blur-md text-white py-3.5 rounded-xl font-bold text-sm hover:bg-white/30 transition-colors border border-white/20 active:scale-95 duration-200 flex items-center justify-center gap-2"
                    >
                        <History size={16} />
                        Historique
                    </button>
                </div>
            </div>
          </div>

          {/* Interactive Monthly Calendar */}
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                     <CalendarDays size={20} className="text-black" />
                     {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                 </h3>
                 <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">{collectionDays.length} collectes</span>
             </div>
             
             {/* Calendar Grid */}
             <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center mb-2">
                 {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                     <div key={day} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{day}</div>
                 ))}
                 {calendarDays.map((day, idx) => (
                     <div key={idx} className="flex flex-col items-center justify-start h-8 relative">
                         {day ? (
                             <button 
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                                    day === today 
                                        ? 'bg-black text-white shadow-md font-bold' 
                                        : collectionDays.includes(day as number)
                                            ? 'bg-green-100 text-green-700 font-bold ring-1 ring-green-200 hover:bg-green-200' 
                                            : 'text-gray-700 hover:bg-gray-100'
                                }`}
                             >
                                 {day}
                             </button>
                         ) : <span></span>}
                         {/* Dot for collection type */}
                         {day && collectionDays.includes(day as number) && (
                            <span className="absolute -bottom-1 w-1 h-1 bg-green-500 rounded-full"></span>
                         )}
                     </div>
                 ))}
             </div>
             <div className="mt-4 flex gap-4 justify-center text-xs text-gray-500">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div>Collecte</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-black"></div>Aujourd'hui</div>
             </div>
          </div>

          {/* Impact & Stats Section */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10"></div>
                 <div className="relative z-10">
                     <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-3">
                        <TrendingUp size={20} />
                     </div>
                     <p className="text-3xl font-bold text-gray-900 mb-0.5">84 <span className="text-sm font-normal text-gray-400">kg</span></p>
                     <p className="text-xs font-bold text-gray-400">Total Collecté</p>
                 </div>
             </div>
             <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-full blur-2xl -mr-10 -mt-10"></div>
                 <div className="relative z-10">
                     <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-3">
                        <Leaf size={20} />
                     </div>
                     <p className="text-3xl font-bold text-gray-900 mb-0.5">-12 <span className="text-sm font-normal text-gray-400">kg</span></p>
                     <p className="text-xs font-bold text-gray-400">CO2 Évité</p>
                 </div>
             </div>
          </div>

          {/* Quick Services Grid - Improved Apple Home Style */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 px-1">Actions Rapides</h3>
            <div className="grid grid-cols-3 gap-3">
                {/* Button 1: Encombrants */}
                <button 
                    onClick={() => handleQuickAction('encombrants')}
                    className="flex flex-col items-center gap-3 p-4 bg-white rounded-3xl shadow-sm border border-gray-100 active:scale-95 transition-all hover:bg-gray-50 aspect-square justify-center"
                >
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
                        <PackagePlus size={24} />
                    </div>
                    <span className="text-xs font-bold text-gray-700 tracking-tight">Encombrants</span>
                </button>

                {/* Button 2: Zando/Sacs */}
                <button 
                    onClick={() => handleQuickAction('sacs')}
                    className="flex flex-col items-center gap-3 p-4 bg-white rounded-3xl shadow-sm border border-gray-100 active:scale-95 transition-all hover:bg-gray-50 aspect-square justify-center"
                >
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner">
                        <ShoppingBag size={24} />
                    </div>
                    <span className="text-xs font-bold text-gray-700 tracking-tight">Boutique</span>
                </button>

                 {/* Button 3: Urgence */}
                 <button 
                    onClick={() => handleQuickAction('urgence')}
                    className="flex flex-col items-center gap-3 p-4 bg-white rounded-3xl shadow-sm border border-gray-100 active:scale-95 transition-all hover:bg-gray-50 aspect-square justify-center"
                >
                    <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-inner">
                        <Zap size={24} />
                    </div>
                    <span className="text-xs font-bold text-gray-700 tracking-tight">Urgence</span>
                </button>
            </div>
          </div>

          {/* Subscription Plans (Apple Finance Style) */}
          <div className="py-2">
              <div className="flex justify-between items-end mb-5 px-1">
                  <div>
                      <h3 className="text-xl font-bold text-gray-900 tracking-tight">Nos Offres</h3>
                      <p className="text-gray-400 text-xs font-medium">Choisissez le plan adapté à vos besoins</p>
                  </div>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar px-1">
                  {PLANS.map((plan, idx) => {
                      // Dynamic Styling based on plan
                      const isDark = plan.id === 'perso' || plan.id === 'res';
                      const isPremium = plan.id === 'res';
                      
                      return (
                          <div 
                              key={plan.id} 
                              className={`min-w-[300px] snap-center p-6 rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden transition-transform duration-300 active:scale-95 border ${
                                  plan.id === 'std' ? 'bg-white border-gray-100 text-gray-900 shadow-lg shadow-gray-100' :
                                  plan.id === 'jun' ? 'bg-[#E3F2FD] border-blue-100 text-blue-900 shadow-lg shadow-blue-100' :
                                  plan.id === 'perso' ? 'bg-[#1C1C1E] border-gray-800 text-white shadow-xl shadow-gray-400/50' :
                                  'bg-black border-gray-800 text-white shadow-2xl shadow-black/50'
                              }`}
                          >
                              {/* Background decoration for premium cards */}
                              {isPremium && (
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-purple-500/20 blur-3xl rounded-full pointer-events-none"></div>
                              )}
                              
                              <div className="relative z-10">
                                  <div className="flex justify-between items-start mb-6">
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                          isDark ? 'bg-white/10 text-white' : 'bg-white text-black shadow-sm'
                                      }`}>
                                          {plan.id === 'std' ? <Leaf size={24} /> :
                                           plan.id === 'jun' ? <Sparkles size={24} /> :
                                           plan.id === 'perso' ? <Settings size={24} /> :
                                           <Star size={24} fill="currentColor" className="text-yellow-400" />}
                                      </div>
                                      {plan.id === 'res' && (
                                          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                                              Premium
                                          </span>
                                      )}
                                  </div>

                                  <h3 className="text-2xl font-bold tracking-tight mb-1">{plan.name}</h3>
                                  <div className="flex items-baseline gap-1 mb-6">
                                      <span className="text-3xl font-bold tracking-tighter">{plan.price.toLocaleString()}</span>
                                      <span className={`text-xs font-medium ${isDark ? 'text-white/60' : 'text-gray-500'}`}>FCFA / {plan.frequency}</span>
                                  </div>

                                  <ul className="space-y-3 mb-8">
                                      {plan.features.slice(0, 4).map((feature, i) => (
                                          <li key={i} className="flex items-start gap-3">
                                              <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                                                  isDark ? 'bg-green-500 text-black' : 'bg-green-100 text-green-700'
                                              }`}>
                                                  <Check size={10} strokeWidth={4} />
                                              </div>
                                              <span className={`text-xs font-medium ${isDark ? 'text-white/80' : 'text-gray-600'}`}>
                                                  {feature}
                                              </span>
                                          </li>
                                      ))}
                                  </ul>
                              </div>

                              <button 
                                  onClick={() => openPayment(plan.id)}
                                  className={`w-full py-4 rounded-2xl font-bold text-sm transition-all relative z-10 ${
                                      isDark 
                                      ? 'bg-white text-black hover:bg-gray-100' 
                                      : 'bg-black text-white hover:bg-gray-800'
                                  }`}
                              >
                                  Choisir ce plan
                              </button>
                          </div>
                      )
                  })}
              </div>
          </div>

          {/* Eco Tips */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
             <div className="flex items-start gap-4">
                 <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                     <Leaf className="text-green-600" size={20} />
                 </div>
                 <div className="flex-1">
                     <h3 className="font-bold text-gray-900 text-sm mb-1">Le saviez-vous ?</h3>
                     <p className="text-gray-500 text-xs leading-relaxed animate-in fade-in duration-500 key={currentTip}">
                         {ECO_TIPS[currentTip]}
                     </p>
                 </div>
             </div>
             <div className="flex justify-center gap-1 mt-4">
                 {ECO_TIPS.map((_, idx) => (
                     <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === currentTip ? 'w-4 bg-green-500' : 'w-1 bg-gray-200'}`}></div>
                 ))}
             </div>
          </div>

          {/* Quick Zando Preview */}
          <div>
            <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-xl font-bold text-gray-900">Populaire sur Zando</h3>
                <button onClick={() => setActiveTab('zando')} className="text-green-600 text-xs font-bold">Tout voir</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {PRODUCTS.slice(0, 3).map(product => (
                    <div key={product.id} className="min-w-[160px] bg-white p-3 rounded-2xl shadow-sm border border-gray-100" onClick={() => setSelectedProduct(product)}>
                        <div className="h-24 bg-gray-100 rounded-xl mb-3 overflow-hidden">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs font-bold text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.price.toLocaleString()} FCFA</p>
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'zando' && (
          <div className="flex-1 overflow-y-auto p-6 animate-in fade-in no-scrollbar pb-32">
              {/* Categories - Now Dynamic */}
              <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
                  {['Tout', 'Sacs', 'Entretien', 'Equipement', 'Accessoires'].map((cat) => (
                      <button 
                        key={cat} 
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                      >
                          {cat}
                      </button>
                  ))}
              </div>

              {/* Grid - Filtered */}
              <div className="grid grid-cols-2 gap-4">
                  {PRODUCTS.filter(p => selectedCategory === 'Tout' || p.category === selectedCategory).map(product => (
                      <div key={product.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between group" onClick={() => setSelectedProduct(product)}>
                          <div>
                              <div className="relative h-32 bg-gray-100 rounded-2xl mb-4 overflow-hidden">
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                  <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-bold">
                                      <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                      {product.rating}
                                  </div>
                              </div>
                              <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1">{product.name}</h4>
                              <p className="text-gray-500 text-xs mb-3">{product.category}</p>
                          </div>
                          <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-900">{product.price.toLocaleString()} <span className="text-[10px] text-gray-400">FCFA</span></span>
                              <button 
                                onClick={(e) => {e.stopPropagation(); addToCart(product);}}
                                className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                              >
                                  <Plus size={16} />
                              </button>
                          </div>
                      </div>
                  ))}
                  {PRODUCTS.filter(p => selectedCategory === 'Tout' || p.category === selectedCategory).length === 0 && (
                      <div className="col-span-2 text-center py-10 text-gray-400 text-sm font-medium">
                          Aucun produit trouvé dans cette catégorie.
                      </div>
                  )}
              </div>
          </div>
      )}

      {activeTab === 'wallet' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-in fade-in no-scrollbar pb-32">
              {/* Active Plan Card */}
              <div className="bg-black text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <div className="relative z-10">
                      <div className="flex justify-between items-start mb-8">
                          <span className="text-white/60 text-sm font-medium">Abonnement Actuel</span>
                          <span className={`${isSubActive ? 'bg-green-500' : 'bg-red-500'} text-white text-[10px] font-bold px-2 py-1 rounded-md`}>
                              {isSubActive ? 'ACTIF' : 'INACTIF'}
                          </span>
                      </div>
                      <p className="text-3xl font-bold mb-1">Standard</p>
                      <p className="text-white/60 text-sm mb-6">3,000 FCFA / Mois</p>
                      <div className="flex justify-between items-end">
                          <div>
                              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Expiration</p>
                              <p className="font-mono">24 NOV 2024</p>
                          </div>
                          <Wallet className="text-white/20" size={32} />
                      </div>
                  </div>
              </div>

              {/* Plans Grid for Upgrade */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Changer d'offre</h3>
                <div className="grid grid-cols-1 gap-4">
                  {PLANS.map(plan => (
                    <div key={plan.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-300">
                       <div className="flex justify-between items-start mb-3">
                           <div>
                               <h4 className="font-bold text-gray-900 text-lg">{plan.name}</h4>
                               <div className="text-2xl font-bold text-gray-900">{plan.price.toLocaleString()} <span className="text-sm text-gray-400 font-normal">FCFA</span></div>
                           </div>
                           {plan.id === 'perso' && <span className="bg-black text-white text-[10px] px-2 py-1 rounded-lg font-bold">POPULAIRE</span>}
                       </div>
                       <Button 
                        onClick={() => openPayment(plan.id)}
                        className="w-full py-3 text-sm rounded-xl bg-gray-50 text-gray-900 border-0 hover:bg-black hover:text-white transition-colors"
                       >
                         Choisir
                       </Button>
                    </div>
                  ))}
                </div>
              </div>
          </div>
      )}

      {activeTab === 'account' && (
          <div className="flex-1 overflow-y-auto bg-[#F2F2F7] animate-in fade-in no-scrollbar pb-32">
              <div className="p-6">
                  
                  {/* Minimalist Profile Header */}
                  <div className="flex flex-col items-center mb-8 animate-in slide-in-from-bottom-2 duration-500">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white mb-3 overflow-hidden">
                          {localUser.avatar ? <img src={localUser.avatar} alt="avatar" className="w-full h-full object-cover" /> : <span className="text-3xl font-bold text-gray-300">{localUser.name[0]}</span>}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">{localUser.name}</h2>
                      <p className="text-gray-400 font-medium text-sm">{localUser.email}</p>
                  </div>

                  {/* Wallet Style Card for Subscription */}
                  <div className="mb-8 transform transition-transform hover:scale-[1.02] duration-300 cursor-pointer" onClick={() => setActiveTab('wallet')}>
                     <div className="bg-black text-white rounded-[20px] p-5 shadow-2xl shadow-gray-400/50 relative overflow-hidden h-40 flex flex-col justify-between">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mt-10 -mr-10"></div>
                        
                        <div className="relative z-10 flex justify-between items-start">
                             <div className="flex items-center gap-2">
                                 <Wallet size={16} className="text-gray-400" />
                                 <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">Shekina Pass</span>
                             </div>
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded border border-white/20 ${isSubActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                 {isSubActive ? 'ACTIF' : 'INACTIF'}
                             </span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs text-gray-500 mb-1">Plan actuel</p>
                            <p className="text-xl font-bold tracking-tight">Standard</p>
                        </div>
                     </div>
                  </div>

                  {/* Apple Settings Style Lists */}
                  <div className="space-y-6">
                      
                      {/* Section 1 */}
                      <div>
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-4 mb-2">Personnel</h3>
                          <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                              
                              {editProfile ? (
                                  <div className="p-4 bg-gray-50/50 animate-in fade-in">
                                      <div className="space-y-3">
                                          <input value={tempProfile.name} onChange={e => setTempProfile({...tempProfile, name: e.target.value})} className="w-full bg-white border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-black transition-colors" placeholder="Nom" />
                                          <input value={tempProfile.phone} onChange={e => setTempProfile({...tempProfile, phone: e.target.value})} className="w-full bg-white border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-black transition-colors" placeholder="Téléphone" />
                                          <input value={tempProfile.address} onChange={e => setTempProfile({...tempProfile, address: e.target.value})} className="w-full bg-white border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-black transition-colors" placeholder="Adresse" />
                                          <div className="flex gap-2 pt-2">
                                              <Button onClick={() => setEditProfile(false)} variant="outline" className="flex-1 py-2 text-xs h-10 rounded-xl bg-white border-gray-200">Annuler</Button>
                                              <Button onClick={handleSaveProfile} className="flex-1 py-2 text-xs h-10 rounded-xl bg-black text-white hover:bg-gray-800">Enregistrer</Button>
                                          </div>
                                      </div>
                                  </div>
                              ) : (
                                <>
                                    <div className="flex justify-between items-center p-4 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer" onClick={() => setEditProfile(true)}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-900"><UserIcon size={14} strokeWidth={2.5}/></div>
                                            <span className="text-sm font-semibold text-gray-900">Modifier le profil</span>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-300" />
                                    </div>
                                    <div className="flex justify-between items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-900"><MapPin size={14} strokeWidth={2.5}/></div>
                                            <span className="text-sm font-semibold text-gray-900">Mes Adresses</span>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-300" />
                                    </div>
                                </>
                              )}
                          </div>
                      </div>

                      {/* Section 2 */}
                      <div>
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-4 mb-2">Finance & Sécurité</h3>
                          <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                              <div className="flex justify-between items-center p-4 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer" onClick={() => setShowMethodsModal(true)}>
                                  <div className="flex items-center gap-3">
                                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-900"><CreditCard size={14} strokeWidth={2.5}/></div>
                                      <span className="text-sm font-semibold text-gray-900">Moyens de paiement</span>
                                  </div>
                                  <ChevronRight size={16} className="text-gray-300" />
                              </div>
                               <div className="flex justify-between items-center p-4 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer" onClick={() => setShowSecurityModal(true)}>
                                  <div className="flex items-center gap-3">
                                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-900"><Lock size={14} strokeWidth={2.5}/></div>
                                      <span className="text-sm font-semibold text-gray-900">Mot de passe</span>
                                  </div>
                                  <ChevronRight size={16} className="text-gray-300" />
                              </div>
                              <div className="flex justify-between items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer" onClick={() => setShowPrivacyModal(true)}>
                                  <div className="flex items-center gap-3">
                                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-900"><ShieldCheck size={14} strokeWidth={2.5}/></div>
                                      <span className="text-sm font-semibold text-gray-900">Confidentialité</span>
                                  </div>
                                  <ChevronRight size={16} className="text-gray-300" />
                              </div>
                          </div>
                      </div>

                      {/* Section 3 */}
                      <div>
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-4 mb-2">Support</h3>
                          <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                              <div className="flex justify-between items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer">
                                  <div className="flex items-center gap-3">
                                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-900"><FileText size={14} strokeWidth={2.5}/></div>
                                      <span className="text-sm font-semibold text-gray-900">Conditions générales</span>
                                  </div>
                                  <ChevronRight size={16} className="text-gray-300" />
                              </div>
                          </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 pb-10 space-y-3">
                         <button 
                            onClick={handleToggleSub}
                            className={`w-full bg-white rounded-[16px] py-3.5 text-sm font-semibold shadow-sm border active:scale-[0.98] transition-transform ${isSubActive ? 'text-red-500 border-red-100 hover:bg-red-50' : 'text-green-600 border-green-100 hover:bg-green-50'}`}
                         >
                             {isSubActive ? "Résilier l'abonnement" : "Réactiver l'abonnement"}
                         </button>
                         <button 
                            onClick={onLogout}
                            className="w-full text-gray-400 text-sm font-medium py-3 hover:text-red-500 transition-colors"
                         >
                             Déconnexion
                         </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'chat' && (
        <div className="flex flex-col h-full animate-in fade-in no-scrollbar">
           <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar" ref={scrollRef}>
             {messages.map(msg => (
               <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                   msg.sender === 'user' 
                     ? 'bg-black text-white rounded-br-none' 
                     : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                 }`}>
                   {msg.text}
                 </div>
               </div>
             ))}
             {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
             )}
           </div>
           <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 sticky bottom-[80px]">
             <div className="flex gap-2">
               <input 
                 type="text" 
                 value={inputMsg}
                 onChange={(e) => setInputMsg(e.target.value)}
                 placeholder="Écrivez votre message..."
                 className="flex-1 bg-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5 text-sm transition-all"
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               />
               <Button onClick={handleSend} className="rounded-xl px-4 !py-0 shadow-none bg-black hover:bg-gray-800">
                 <ChevronRight size={20} />
               </Button>
             </div>
           </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 relative overflow-hidden">
                  <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 z-10">
                      <X size={20} />
                  </button>
                  <div className="h-64 bg-gray-100 rounded-2xl mb-6 overflow-hidden">
                      <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h3>
                          <div className="flex items-center gap-1 text-xs font-bold bg-yellow-50 text-yellow-600 px-2 py-1 rounded-lg">
                              <Star size={12} className="fill-yellow-600" />
                              {selectedProduct.rating}
                          </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-4">{selectedProduct.price.toLocaleString()} FCFA</p>
                      <p className="text-gray-500 text-sm leading-relaxed mb-6">
                          {selectedProduct.description}
                      </p>
                      <Button onClick={() => addToCart(selectedProduct)} className="w-full py-4 rounded-xl text-lg font-bold">
                          Ajouter au panier
                      </Button>
                  </div>
              </div>
          </div>
      )}

      {/* Cart Modal */}
      {showCart && (
          <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-right duration-300">
              <div className="px-6 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-xl z-10">
                  <h2 className="text-xl font-bold">Mon Panier ({cart.reduce((a,b)=>a+b.quantity,0)})</h2>
                  <button onClick={() => setShowCart(false)} className="p-2 bg-gray-100 rounded-full">
                      <X size={20} />
                  </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                  {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                          <ShoppingBag size={48} className="mb-4" />
                          <p>Votre panier est vide</p>
                      </div>
                  ) : (
                      cart.map(item => (
                          <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                              <div className="w-20 h-20 bg-white rounded-xl overflow-hidden shrink-0">
                                  <img src={item.image} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 flex flex-col justify-between">
                                  <div>
                                      <h4 className="font-bold text-sm text-gray-900">{item.name}</h4>
                                      <p className="text-xs text-gray-500">{item.price.toLocaleString()} FCFA</p>
                                  </div>
                                  <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-gray-200">
                                          <button onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity <= 1} className="disabled:opacity-30"><Minus size={14} /></button>
                                          <span className="text-xs font-bold">{item.quantity}</span>
                                          <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                                      </div>
                                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 bg-red-50 p-1.5 rounded-lg"><Trash2 size={14} /></button>
                                  </div>
                              </div>
                          </div>
                      ))
                  )}
              </div>
              <div className="p-6 border-t border-gray-100 safe-pb bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-500">Total</span>
                      <span className="text-2xl font-bold text-gray-900">{cartTotal.toLocaleString()} FCFA</span>
                  </div>
                  <Button 
                    onClick={() => { setShowCart(false); openPayment('cart'); }} 
                    disabled={cart.length === 0}
                    className="w-full py-4 rounded-xl text-lg font-bold"
                  >
                      Payer maintenant
                  </Button>
              </div>
          </div>
      )}

      {/* Payment Methods Modal */}
      {showMethodsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold">Moyens de paiement</h3>
                      <button onClick={() => setShowMethodsModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="space-y-3 mb-6">
                      {paymentMethods.map(method => (
                          <div key={method.id} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center border border-gray-100">
                              <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method.type === 'MTN' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                                      <div className={`w-4 h-4 rounded-full ${method.type === 'MTN' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                  </div>
                                  <div>
                                      <p className="font-bold text-sm text-gray-900">{method.type} Money</p>
                                      <p className="text-xs text-gray-500">{method.number}</p>
                                  </div>
                              </div>
                              <button onClick={() => removeMethod(method.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                          </div>
                      ))}
                      {paymentMethods.length === 0 && <p className="text-center text-gray-400 text-sm">Aucun moyen de paiement.</p>}
                  </div>

                  <form onSubmit={handleAddMethod} className="border-t border-gray-100 pt-4">
                      <h4 className="text-sm font-bold mb-3">Ajouter un compte</h4>
                      <div className="flex gap-2 mb-3">
                          <button type="button" onClick={() => setNewMethodType('MTN')} className={`flex-1 py-2 rounded-xl text-xs font-bold border ${newMethodType === 'MTN' ? 'bg-yellow-50 border-yellow-400 text-yellow-800' : 'border-gray-200 text-gray-500'}`}>MTN</button>
                          <button type="button" onClick={() => setNewMethodType('Airtel')} className={`flex-1 py-2 rounded-xl text-xs font-bold border ${newMethodType === 'Airtel' ? 'bg-red-50 border-red-400 text-red-800' : 'border-gray-200 text-gray-500'}`}>Airtel</button>
                      </div>
                      <input 
                        type="tel"
                        required
                        value={newMethodPhone}
                        onChange={(e) => setNewMethodPhone(e.target.value)}
                        placeholder="Numéro (ex: 06 123...)"
                        className="w-full bg-gray-50 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black/5 mb-3"
                      />
                      <Button type="submit" className="w-full py-3 rounded-xl text-sm" disabled={!newMethodPhone}>Ajouter</Button>
                  </form>
              </div>
          </div>
      )}

      {/* Security Modal */}
      {showSecurityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold">Changer mot de passe</h3>
                      <button onClick={() => setShowSecurityModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                          <X size={20} />
                      </button>
                  </div>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                       <div className="space-y-1">
                          <label className="text-xs text-gray-500 font-medium">Mot de passe actuel</label>
                          <div className="relative">
                            <input type={showPass ? "text" : "password"} required value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5" />
                          </div>
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs text-gray-500 font-medium">Nouveau mot de passe</label>
                          <div className="relative">
                             <input type={showPass ? "text" : "password"} required value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5" />
                          </div>
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs text-gray-500 font-medium">Confirmer</label>
                          <div className="relative">
                             <input type={showPass ? "text" : "password"} required value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5" />
                             <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-gray-400">{showPass ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                          </div>
                      </div>
                      <Button type="submit" className="w-full py-3.5 rounded-xl">Mettre à jour</Button>
                  </form>
              </div>
          </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold">Confidentialité</h3>
                      <button onClick={() => setShowPrivacyModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                          <div className="flex gap-3 items-center">
                              <Bell size={20} className="text-gray-600"/>
                              <div className="text-sm">
                                  <p className="font-bold text-gray-900">Notifications</p>
                                  <p className="text-xs text-gray-500">Alertes passage</p>
                              </div>
                          </div>
                          <button onClick={() => setPrivacySettings({...privacySettings, notifs: !privacySettings.notifs})} className={privacySettings.notifs ? 'text-green-500' : 'text-gray-300'}>
                              {privacySettings.notifs ? <ToggleRight size={32} fill="currentColor" /> : <ToggleLeft size={32} />}
                          </button>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                          <div className="flex gap-3 items-center">
                              <Sparkles size={20} className="text-gray-600"/>
                              <div className="text-sm">
                                  <p className="font-bold text-gray-900">Marketing</p>
                                  <p className="text-xs text-gray-500">Offres Zando</p>
                              </div>
                          </div>
                          <button onClick={() => setPrivacySettings({...privacySettings, marketing: !privacySettings.marketing})} className={privacySettings.marketing ? 'text-green-500' : 'text-gray-300'}>
                              {privacySettings.marketing ? <ToggleRight size={32} fill="currentColor" /> : <ToggleLeft size={32} />}
                          </button>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                          <div className="flex gap-3 items-center">
                              <MapPin size={20} className="text-gray-600"/>
                              <div className="text-sm">
                                  <p className="font-bold text-gray-900">Localisation</p>
                                  <p className="text-xs text-gray-500">Suivi camion</p>
                              </div>
                          </div>
                           <button onClick={() => setPrivacySettings({...privacySettings, location: !privacySettings.location})} className={privacySettings.location ? 'text-green-500' : 'text-gray-300'}>
                              {privacySettings.location ? <ToggleRight size={32} fill="currentColor" /> : <ToggleLeft size={32} />}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Bulky Waste Modal */}
      {showBulkyModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold">Retrait Encombrants</h3>
                      <button onClick={() => setShowBulkyModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  <p className="text-gray-500 text-sm mb-6">Décrivez vos objets volumineux (vieux meubles, électroménager, gravats) pour recevoir un devis.</p>
                  
                  <div className="space-y-4">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 ml-1">Type d'objets</label>
                          <input type="text" placeholder="ex: Canapé 3 places, Frigo..." className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                      </div>
                      
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 ml-1">Photo (Optionnel)</label>
                          <button className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                              <Camera size={24} className="mb-2" />
                              <span className="text-xs font-medium">Ajouter une photo</span>
                          </button>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-xl flex gap-3 items-start">
                          <AlertTriangle size={16} className="text-orange-600 mt-0.5 shrink-0" />
                          <p className="text-xs text-orange-800 font-medium">Le tarif de base est de 5,000 FCFA. Le prix final dépendra du volume constaté.</p>
                      </div>

                      <Button className="w-full py-4 rounded-xl font-bold" onClick={() => {alert("Demande envoyée ! Un agent vous contactera."); setShowBulkyModal(false);}}>
                          Demander un devis
                      </Button>
                  </div>
              </div>
          </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold">Signalement</h3>
                      <button onClick={() => setShowReportModal(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="space-y-3">
                      <button className="w-full text-left p-4 bg-red-50 hover:bg-red-100 rounded-2xl text-red-900 font-medium transition-colors flex items-center gap-3">
                          <Truck size={20} className="opacity-50"/>
                          Camion non passé
                      </button>
                      <button className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-900 font-medium transition-colors flex items-center gap-3">
                          <AlertTriangle size={20} className="opacity-50"/>
                          Déchets non ramassés
                      </button>
                      <button className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-900 font-medium transition-colors flex items-center gap-3">
                          <CreditCard size={20} className="opacity-50"/>
                          Problème facturation
                      </button>
                  </div>
                  <div className="mt-6">
                      <textarea 
                        className="w-full bg-gray-50 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none transition-all"
                        rows={3}
                        placeholder="Précisez votre problème..."
                      ></textarea>
                      <Button className="w-full mt-4 py-3.5 rounded-xl bg-black hover:bg-gray-800" onClick={() => {alert("Signalement envoyé !"); setShowReportModal(false);}}>
                          Envoyer
                      </Button>
                  </div>
              </div>
          </div>
      )}

      {/* Payment Modal (General) */}
      {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 relative overflow-hidden">
                  
                  {paymentStatus === 'success' ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in">
                          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                              <CheckCircle size={40} className="text-green-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">Paiement Réussi !</h3>
                          <p className="text-gray-500">
                              {selectedPlanId === 'cart' ? 'Votre commande Zando est validée.' : `Votre abonnement ${selectedPlanDetails?.name} est activé.`}
                          </p>
                      </div>
                  ) : (
                      <>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold">Paiement</h3>
                                <p className="text-sm text-gray-500">
                                    {selectedPlanId === 'cart' ? 'Commande Zando' : selectedPlanDetails?.name} • {(selectedPlanId === 'cart' ? cartTotal : selectedPlanDetails?.price || 0).toLocaleString()} FCFA
                                </p>
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handlePayment} className="space-y-6">
                            {/* Provider Selection */}
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setPaymentProvider('mtn')}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentProvider === 'mtn' ? 'border-yellow-400 bg-yellow-50' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-yellow-400"></div>
                                    <span className="text-xs font-bold text-gray-900">MTN MoMo</span>
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setPaymentProvider('airtel')}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentProvider === 'airtel' ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-red-500"></div>
                                    <span className="text-xs font-bold text-gray-900">Airtel Money</span>
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-1">Numéro de téléphone</label>
                                <input 
                                    type="tel" 
                                    required
                                    value={paymentPhone}
                                    onChange={(e) => setPaymentPhone(e.target.value)}
                                    placeholder="06 123 45 67"
                                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 font-medium text-gray-900 focus:ring-2 focus:ring-black/5 outline-none transition-all"
                                />
                            </div>

                            <Button 
                                type="submit" 
                                className={`w-full py-4 rounded-xl text-white font-bold transition-all ${paymentProvider === 'mtn' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-red-600 hover:bg-red-700'}`}
                                isLoading={paymentStatus === 'processing'}
                            >
                                Payer {(selectedPlanId === 'cart' ? cartTotal : selectedPlanDetails?.price || 0).toLocaleString()} FCFA
                            </Button>
                        </form>
                      </>
                  )}
              </div>
          </div>
      )}

      {/* Onboarding Overlay */}
      {showOnboarding && (
          <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in fade-in duration-300">
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                {/* Background Blobs */}
                <div className={`absolute top-0 left-0 w-64 h-64 ${ONBOARDING_SLIDES[currentSlide].color} opacity-20 rounded-full blur-3xl -ml-16 -mt-16 transition-colors duration-500`}></div>
                <div className={`absolute bottom-0 right-0 w-64 h-64 ${ONBOARDING_SLIDES[currentSlide].color} opacity-20 rounded-full blur-3xl -mr-16 -mb-16 transition-colors duration-500`}></div>

                {/* Content */}
                <div className="relative z-10 max-w-sm mx-auto">
                    <div className={`w-24 h-24 mx-auto mb-10 rounded-3xl ${ONBOARDING_SLIDES[currentSlide].color} flex items-center justify-center text-white shadow-xl shadow-gray-200 transition-colors duration-500`}>
                        {React.createElement(ONBOARDING_SLIDES[currentSlide].icon, { size: 48 })}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                        {ONBOARDING_SLIDES[currentSlide].title}
                    </h2>
                    <p className="text-gray-500 text-lg leading-relaxed font-medium">
                        {ONBOARDING_SLIDES[currentSlide].desc}
                    </p>
                </div>
             </div>
             
             <div className="p-8 pb-12">
                 <div className="flex justify-center gap-2 mb-8">
                     {ONBOARDING_SLIDES.map((_, idx) => (
                         <div key={idx} className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 ' + ONBOARDING_SLIDES[currentSlide].color : 'w-2 bg-gray-100'}`}></div>
                     ))}
                 </div>
                 <Button 
                    onClick={nextSlide}
                    className={`w-full py-4 text-lg rounded-2xl shadow-xl transition-all duration-300 ${currentSlide === ONBOARDING_SLIDES.length - 1 ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 border border-gray-100 hover:bg-gray-50 shadow-sm'}`}
                 >
                    {currentSlide === ONBOARDING_SLIDES.length - 1 ? "C'est parti" : "Suivant"}
                    {currentSlide !== ONBOARDING_SLIDES.length - 1 && <ChevronRight size={20} className="ml-2" />}
                 </Button>
             </div>
          </div>
      )}

      {/* CANCELLATION MODAL (IOS ACTION SHEET STYLE) */}
      {showCancelModal && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-[#F2F2F7] w-full max-w-md rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Résilier l'abonnement</h3>
                      <button onClick={() => setShowCancelModal(false)} className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm">
                          <X size={20} className="text-gray-500" />
                      </button>
                  </div>

                  {/* Retention Warning */}
                  <div className="bg-orange-50 p-4 rounded-2xl flex items-start gap-3 mb-6 border border-orange-100">
                      <Frown className="text-orange-500 shrink-0 mt-0.5" size={20} />
                      <div>
                          <p className="font-bold text-orange-800 text-sm">Nous sommes tristes de vous voir partir.</p>
                          <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                              En résiliant, vous perdrez l'accès à la collecte prioritaire et aux tarifs préférentiels Zando dès la fin de ce mois.
                          </p>
                      </div>
                  </div>

                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-4 mb-2">Pourquoi partez-vous ?</p>
                  
                  {/* Reasons List - iOS Settings Style */}
                  <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm mb-6">
                      {CANCEL_REASONS.map((reason, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setCancelReason(reason)}
                            className={`p-4 flex justify-between items-center cursor-pointer transition-colors active:bg-gray-50 ${idx !== CANCEL_REASONS.length - 1 ? 'border-b border-gray-100' : ''}`}
                          >
                              <span className="text-sm font-medium text-gray-900">{reason}</span>
                              {cancelReason === reason && <Check size={18} className="text-blue-500" strokeWidth={3} />}
                          </div>
                      ))}
                  </div>

                  {/* Optional Comment */}
                  <div className="mb-6">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-4 mb-2">Détails (Optionnel)</p>
                      <textarea 
                        value={cancelComment}
                        onChange={(e) => setCancelComment(e.target.value)}
                        className="w-full bg-white rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none shadow-sm"
                        rows={3}
                        placeholder="Dites-nous en plus..."
                      ></textarea>
                  </div>

                  <div className="space-y-3">
                      <Button 
                        onClick={handleCancelSubmit}
                        disabled={!cancelReason}
                        variant="danger"
                        className="w-full py-4 rounded-xl font-bold"
                      >
                          Confirmer la résiliation
                      </Button>
                      <button 
                        onClick={() => setShowCancelModal(false)}
                        className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                      >
                          Annuler
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Floating Menu Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-white/20 p-2 flex justify-between items-center z-50">
        <button 
          onClick={() => setActiveTab('home')}
          className={`relative w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${activeTab === 'home' ? 'bg-black text-white shadow-lg shadow-black/20 scale-105' : 'text-gray-400 hover:bg-gray-100'}`}
        >
          <Home size={20} strokeWidth={2.5} className={activeTab === 'home' ? 'fill-white' : ''} />
        </button>
        <button 
          onClick={() => setActiveTab('zando')}
          className={`relative w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${activeTab === 'zando' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-105' : 'text-gray-400 hover:bg-gray-100'}`}
        >
          <Store size={20} strokeWidth={2.5} className={activeTab === 'zando' ? 'fill-white' : ''} />
        </button>
        <button 
          onClick={() => setActiveTab('wallet')}
          className={`relative w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${activeTab === 'wallet' ? 'bg-black text-white shadow-lg shadow-black/20 scale-105' : 'text-gray-400 hover:bg-gray-100'}`}
        >
          <Wallet size={20} strokeWidth={2.5} className={activeTab === 'wallet' ? 'fill-white' : ''} />
        </button>
        <button 
          onClick={() => setActiveTab('account')}
          className={`relative w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${activeTab === 'account' ? 'bg-black text-white shadow-lg shadow-black/20 scale-105' : 'text-gray-400 hover:bg-gray-100'}`}
        >
          <UserIcon size={20} strokeWidth={2.5} className={activeTab === 'account' ? 'fill-white' : ''} />
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`relative w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${activeTab === 'chat' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20 scale-105' : 'text-gray-400 hover:bg-gray-100'}`}
        >
          <MessageCircle size={20} strokeWidth={2.5} className={activeTab === 'chat' ? 'fill-white' : ''} />
        </button>
      </nav>
    </div>
  );
};