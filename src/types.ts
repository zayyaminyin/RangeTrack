export interface User {
  id: string;
  name: string;
  location: string;
  profileImage?: string;
}
export type ResourceType = 'animal' | 'field' | 'equipment' | 'feed';
export interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  quantity?: number;
  status?: string;
  health?: number; // 0-100 health score
  lastChecked?: number; // timestamp
  notes?: string;
  image?: string;
}
export type TaskType = 'feeding' | 'watering' | 'herd_move' | 'repair' | 'harvest' | 'health_check' | 'vaccination' | 'maintenance' | 'other';
export interface Task {
  id: string;
  type: TaskType;
  resource_id?: string;
  qty?: number;
  notes?: string;
  ts: number;
  completed?: boolean;
  image?: string;
  priority?: 'low' | 'medium' | 'high';
}
export interface Award {
  id: string;
  label: string;
  reason: string;
  earned_ts: number;
}
export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  humidity?: number;
  wind?: number;
  precipitation?: number;
}
export interface AnimalHealthRecord {
  id: string;
  animal_id: string;
  date: number;
  weight?: number;
  temperature?: number;
  symptoms?: string[];
  treatment?: string;
  vet_visit?: boolean;
}
export interface VaccinationRecord {
  id: string;
  animal_id: string;
  date: number;
  vaccine_name: string;
  dose?: number;
  next_due?: number;
  administered_by?: string;
}
export interface MaintenanceRecord {
  id: string;
  equipment_id: string;
  date: number;
  service_type: string;
  hours_at_service?: number;
  parts_replaced?: string[];
  cost?: number;
  next_service_due?: number;
}
export interface SoilTestRecord {
  id: string;
  field_id: string;
  date: number;
  ph_level?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  notes?: string;
}
export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  last_completed?: number;
  next_due?: number;
  category?: string;
}