import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Vehicle {
  id: string;
  cliente_nombre: string;
  cliente_apellido: string;
  telefono: string;
  fecha_ingreso: string;
  marca: string;
  modelo: string;
  patente: string;
  kilometros: number;
  reparado_por?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ItemRepuesto {
  id: string;
  vehicle_id: string;
  nombre: string;
  precio: number;
  created_at?: string;
}

export interface ItemManoObra {
  id: string;
  vehicle_id: string;
  descripcion: string;
  precio: number;
  created_at?: string;
}

export interface Pago {
  id: string;
  vehicle_id: string;
  monto: number;
  fecha: string;
  created_at?: string;
}
