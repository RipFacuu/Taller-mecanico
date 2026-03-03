-- Tabla de gastos
CREATE TABLE IF NOT EXISTS gastos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  descripcion text NOT NULL,
  monto decimal(10,2) NOT NULL DEFAULT 0,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  esta_pago boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

-- Políticas para acceso público (sin autenticación, siguiendo el patrón del taller)
CREATE POLICY "Allow public read access on gastos"
  ON gastos FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert on gastos"
  ON gastos FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update on gastos"
  ON gastos FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on gastos"
  ON gastos FOR DELETE
  TO anon
  USING (true);

-- Índice para mejorar búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha);
