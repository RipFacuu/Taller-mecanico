/*
  # Sistema de Gestión de Taller Mecánico

  1. Nuevas Tablas
    - `vehicles` (vehículos)
      - `id` (uuid, primary key)
      - `cliente_nombre` (text, nombre del cliente)
      - `cliente_apellido` (text, apellido del cliente)
      - `telefono` (text, teléfono del cliente)
      - `fecha_ingreso` (date, fecha de ingreso del vehículo)
      - `marca` (text, marca del vehículo)
      - `modelo` (text, modelo del vehículo)
      - `patente` (text, patente del vehículo - unique)
      - `kilometros` (integer, kilometraje del vehículo)
      - `reparado_por` (text, nombre de quien reparó el vehículo)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `items_repuestos` (repuestos/partes)
      - `id` (uuid, primary key)
      - `vehicle_id` (uuid, foreign key)
      - `nombre` (text, nombre del repuesto)
      - `precio` (decimal, precio del repuesto)
      - `created_at` (timestamp)
    
    - `items_mano_obra` (mano de obra/labor)
      - `id` (uuid, primary key)
      - `vehicle_id` (uuid, foreign key)
      - `descripcion` (text, descripción del trabajo)
      - `precio` (decimal, precio del trabajo)
      - `created_at` (timestamp)
    
    - `pagos` (pagos/payments)
      - `id` (uuid, primary key)
      - `vehicle_id` (uuid, foreign key)
      - `monto` (decimal, monto del pago)
      - `metodo_pago` (text, método de pago usado)
      - `fecha` (timestamp, fecha del pago)
      - `created_at` (timestamp)

  2. Seguridad
    - Enable RLS en todas las tablas
    - Políticas para acceso público (ya que no hay auth por ahora)
    
  3. Notas Importantes
    - La patente es única para evitar duplicados
    - Todos los precios son decimales con 2 decimales
    - Las relaciones foreign key tienen ON DELETE CASCADE para mantener integridad
*/

-- Tabla de vehículos
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_nombre text NOT NULL,
  cliente_apellido text NOT NULL,
  telefono text NOT NULL,
  fecha_ingreso date NOT NULL DEFAULT CURRENT_DATE,
  marca text NOT NULL,
  modelo text NOT NULL,
  patente text NOT NULL UNIQUE,
  kilometros integer NOT NULL DEFAULT 0,
  reparado_por text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de repuestos
CREATE TABLE IF NOT EXISTS items_repuestos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  precio decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Tabla de mano de obra
CREATE TABLE IF NOT EXISTS items_mano_obra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  descripcion text NOT NULL,
  precio decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  monto decimal(10,2) NOT NULL DEFAULT 0,
  metodo_pago text NOT NULL DEFAULT 'Efectivo',
  fecha timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_repuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_mano_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- Políticas para acceso público (sin autenticación)
CREATE POLICY "Allow public read access on vehicles"
  ON vehicles FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert on vehicles"
  ON vehicles FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update on vehicles"
  ON vehicles FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on vehicles"
  ON vehicles FOR DELETE
  TO anon
  USING (true);

-- Políticas para repuestos
CREATE POLICY "Allow public read access on items_repuestos"
  ON items_repuestos FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert on items_repuestos"
  ON items_repuestos FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update on items_repuestos"
  ON items_repuestos FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on items_repuestos"
  ON items_repuestos FOR DELETE
  TO anon
  USING (true);

-- Políticas para mano de obra
CREATE POLICY "Allow public read access on items_mano_obra"
  ON items_mano_obra FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert on items_mano_obra"
  ON items_mano_obra FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update on items_mano_obra"
  ON items_mano_obra FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on items_mano_obra"
  ON items_mano_obra FOR DELETE
  TO anon
  USING (true);

-- Políticas para pagos
CREATE POLICY "Allow public read access on pagos"
  ON pagos FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert on pagos"
  ON pagos FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update on pagos"
  ON pagos FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on pagos"
  ON pagos FOR DELETE
  TO anon
  USING (true);

-- Índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_vehicles_patente ON vehicles(patente);
CREATE INDEX IF NOT EXISTS idx_vehicles_modelo ON vehicles(modelo);
CREATE INDEX IF NOT EXISTS idx_vehicles_cliente ON vehicles(cliente_nombre, cliente_apellido);
CREATE INDEX IF NOT EXISTS idx_items_repuestos_vehicle ON items_repuestos(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_items_mano_obra_vehicle ON items_mano_obra(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_pagos_vehicle ON pagos(vehicle_id);