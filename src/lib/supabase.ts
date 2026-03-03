import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://rlbvejortdlexqnktewf.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_XgN53PjFAySk2Q_-Pqwd7w_IOS3qwBc';

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
  metodo_pago?: string;
  created_at?: string;
}

export interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  fecha: string;
  esta_pago: boolean;
  created_at?: string;
}
