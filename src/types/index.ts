export interface Planning {
  id: string;
  slug: string;
  title: string;
  residentName: string;
  residentFirstName?: string;
  residentType: 'home' | 'hospital' | 'nursing_home' | 'other';
  locationName?: string;
  address?: string;
  room?: string;
  publicNotes?: string;
  privateNotes?: string;
  adminMessage?: string;
  defaultVisitDuration: number; // in minutes
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  isActive: boolean;
  adminPassword: string;
  adminName?: string;
  adminEmail?: string;
  adminToken?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TimeSlot {
  id: string;
  planningId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  capacity: number; // 0 = unlimited
  status: 'available' | 'closed' | 'cancelled';
  publicNote?: string;
  privateNote?: string;
  createdAt: number;
}

export interface Booking {
  id: string;
  planningId: string;
  timeSlotId: string;
  visitorFirstName: string;
  visitorLastName: string;
  visitorPhone?: string;
  visitorEmail?: string;
  visitorCount: number;
  visitorRelation?: string;
  comment?: string;
  createdAt: number;
}

export interface Message {
  id: string;
  planningId: string;
  authorName: string;
  content: string;
  createdAt: number;
}

export type MessageFormData = Omit<Message, 'id' | 'createdAt'>;
export type PlanningFormData = Omit<Planning, 'id' | 'createdAt' | 'updatedAt'>;
export type TimeSlotFormData = Omit<TimeSlot, 'id' | 'createdAt'>;
export type BookingFormData = Omit<Booking, 'id' | 'createdAt'>;
