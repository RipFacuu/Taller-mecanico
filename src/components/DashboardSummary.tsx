import { DollarSign, TrendingUp, Calendar, ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react';
import { Vehicle, ItemRepuesto, ItemManoObra, Pago, Gasto } from '../lib/supabase';

interface DashboardSummaryProps {
  vehicles: Vehicle[];
  repuestos: ItemRepuesto[];
  manoObra: ItemManoObra[];
  pagos: Pago[];
  gastos: Gasto[];
}

interface VehicleFinancial {
  vehicle: Vehicle;
  presupuesto: number;
  pagado: number;
  saldo: number;
}

interface MonthlyStat {
  key: string;
  label: string;
  ingresos: number;
  trabajos: number;
}

function buildVehicleFinancials(
  vehicles: Vehicle[],
  repuestos: ItemRepuesto[],
  manoObra: ItemManoObra[],
  pagos: Pago[],
): VehicleFinancial[] {
  const repuestosByVehicle = new Map<string, number>();
  const manoObraByVehicle = new Map<string, number>();
  const pagosByVehicle = new Map<string, number>();

  repuestos.forEach((r) => {
    repuestosByVehicle.set(r.vehicle_id, (repuestosByVehicle.get(r.vehicle_id) ?? 0) + Number(r.precio));
  });

  manoObra.forEach((m) => {
    manoObraByVehicle.set(m.vehicle_id, (manoObraByVehicle.get(m.vehicle_id) ?? 0) + Number(m.precio));
  });

  pagos.forEach((p) => {
    pagosByVehicle.set(p.vehicle_id, (pagosByVehicle.get(p.vehicle_id) ?? 0) + Number(p.monto));
  });

  return vehicles.map((v) => {
    const totalRepuestos = repuestosByVehicle.get(v.id) ?? 0;
    const totalManoObra = manoObraByVehicle.get(v.id) ?? 0;
    const totalPagos = pagosByVehicle.get(v.id) ?? 0;
    const presupuesto = totalRepuestos + totalManoObra;
    const saldo = presupuesto - totalPagos;

    return {
      vehicle: v,
      presupuesto,
      pagado: totalPagos,
      saldo,
    };
  });
}

function buildMonthlyStats(vehicles: Vehicle[], pagos: Pago[]): MonthlyStat[] {
  const ingresosPorMes = new Map<string, number>();
  const trabajosPorMes = new Map<string, number>();

  pagos.forEach((p) => {
    const date = new Date(p.fecha);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    ingresosPorMes.set(key, (ingresosPorMes.get(key) ?? 0) + Number(p.monto));
  });

  vehicles.forEach((v) => {
    const date = new Date(v.fecha_ingreso);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    trabajosPorMes.set(key, (trabajosPorMes.get(key) ?? 0) + 1);
  });

  const allKeys = Array.from(
    new Set<string>([...Array.from(ingresosPorMes.keys()), ...Array.from(trabajosPorMes.keys())]),
  );

  const stats: MonthlyStat[] = allKeys.map((key) => {
    const [yearStr, monthStr] = key.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const date = new Date(year, month, 1);

    const label = date.toLocaleDateString('es-AR', {
      month: 'short',
      year: 'numeric',
    });

    return {
      key,
      label,
      ingresos: ingresosPorMes.get(key) ?? 0,
      trabajos: trabajosPorMes.get(key) ?? 0,
    };
  });

  // Ordenar por fecha descendente y mostrar solo los últimos 6 meses
  return stats
    .sort((a, b) => (a.key < b.key ? 1 : -1))
    .slice(0, 6);
}

export function DashboardSummary({
  vehicles,
  repuestos,
  manoObra,
  pagos,
  gastos,
}: DashboardSummaryProps) {
  const financials = buildVehicleFinancials(vehicles, repuestos, manoObra, pagos);

  const totalPagado = financials.reduce((sum, f) => sum + f.pagado, 0);
  const saldoPendiente = financials.reduce((sum, f) => sum + f.saldo, 0);

  const totalGastos = gastos.reduce((sum, g) => sum + Number(g.monto), 0);
  const balanceNeto = totalPagado - totalGastos;

  const monthlyStats = buildMonthlyStats(vehicles, pagos);

  return (
    <div className="space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold text-slate-900 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
        Resumen General del Taller
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Ingresos (Cobrado)</p>
              <p className="mt-1 text-2xl font-bold text-green-600">
                ${totalPagado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <ArrowUpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 opacity-70" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Gastos Totales</p>
              <p className="mt-1 text-2xl font-bold text-red-600">
                ${totalGastos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <ArrowDownCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 opacity-70" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Balance (Ganancia)</p>
              <p className={`mt-1 text-2xl font-bold ${balanceNeto >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                ${balanceNeto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 opacity-70" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Saldo pendiente total</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">
                ${saldoPendiente.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 opacity-70" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Rendimiento por mes</h3>
        </div>

        {monthlyStats.length === 0 ? (
          <p className="text-sm text-slate-500">Todavía no hay datos suficientes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">Mes</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">
                    Ingresos cobrados
                  </th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">
                    Trabajos ingresados
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyStats.map((m) => (
                  <tr key={m.key} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 px-2 text-slate-800">{m.label}</td>
                    <td className="py-2 px-2 text-right text-slate-900 font-semibold">
                      ${m.ingresos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-2 text-right text-slate-800">
                      {m.trabajos}{' '}
                      <span className="text-slate-400 text-xs">vehículos</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

