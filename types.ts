export type Role = 'client' | 'collector' | 'supervisor';
export type City = 'Brazzaville' | 'Pointe-Noire';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  city: City;
  phone?: string;
  avatar?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // FCFA
  frequency: string;
  features: string[];
}

export interface Mission {
  id: string;
  collectorId?: string;
  clientId: string;
  clientName: string;
  address: string;
  location: { lat: number; lng: number };
  status: 'pending' | 'collected' | 'missed' | 'incident';
  incidentReason?: string;
  date: string;
  collectionGroup?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  text: string;
  timestamp: Date;
}

export interface CollectionHistory {
    id: string;
    date: string;
    status: 'completed' | 'missed';
    weight?: string;
}

export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    image: string;
    description: string;
    rating: number;
}

export interface CartItem extends Product {
    quantity: number;
}

export enum CollectionStatus {
  PENDING = 'pending',
  COLLECTED = 'collected',
  MISSED = 'missed',
  INCIDENT = 'incident'
}