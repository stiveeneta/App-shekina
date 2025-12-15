import React, { useState } from 'react';
import { AuthView } from './components/AuthView';
import { ClientView } from './components/ClientView';
import { CollectorView } from './components/CollectorView';
import { SupervisorView } from './components/SupervisorView';
import { User } from './types';
import { LogOut } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const handleLogin = (user: User, isNewAccount: boolean) => {
      setUser(user);
      setIsNewUser(isNewAccount);
  };

  const handleLogout = () => {
    // Animation de sortie pourrait être ajoutée ici
    setUser(null);
    setIsNewUser(false);
  };

  if (!user) {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl overflow-hidden relative border-x border-gray-100">
        
        {/* Render View Based on Role */}
        {user.role === 'client' && <ClientView user={user} isNewUser={isNewUser} onLogout={handleLogout} />}
        {user.role === 'collector' && <CollectorView user={user} onLogout={handleLogout} />}
        {user.role === 'supervisor' && <SupervisorView user={user} onLogout={handleLogout} />}

      </div>
    </div>
  );
}