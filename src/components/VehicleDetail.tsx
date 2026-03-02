import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  DollarSign,
  FileDown,
  Wrench,
  Package,
  CreditCard,
} from 'lucide-react';
import { supabase, Vehicle, ItemRepuesto, ItemManoObra, Pago } from '../lib/supabase';

interface VehicleDetailProps {
  vehicle: Vehicle;
  onBack: () => void;
  onUpdate: () => void;
}

export function VehicleDetail({ vehicle, onBack, onUpdate }: VehicleDetailProps) {
  const [repuestos, setRepuestos] = useState<ItemRepuesto[]>([]);
  const [manoObra, setManoObra] = useState<ItemManoObra[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);

  const [newRepuesto, setNewRepuesto] = useState({ nombre: '', precio: '' });
  const [newManoObra, setNewManoObra] = useState({ descripcion: '', precio: '' });
  const [newPago, setNewPago] = useState({ monto: '', metodo_pago: 'Efectivo' });

  useEffect(() => {
    loadData();
  }, [vehicle.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [repuestosData, manoObraData, pagosData] = await Promise.all([
        supabase
          .from('items_repuestos')
          .select('*')
          .eq('vehicle_id', vehicle.id)
          .order('created_at', { ascending: true }),
        supabase
          .from('items_mano_obra')
          .select('*')
          .eq('vehicle_id', vehicle.id)
          .order('created_at', { ascending: true }),
        supabase
          .from('pagos')
          .select('*')
          .eq('vehicle_id', vehicle.id)
          .order('fecha', { ascending: true }),
      ]);

      if (repuestosData.data) setRepuestos(repuestosData.data);
      if (manoObraData.data) setManoObra(manoObraData.data);
      if (pagosData.data) setPagos(pagosData.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRepuesto = async () => {
    if (!newRepuesto.nombre || !newRepuesto.precio) return;

    try {
      const { error } = await supabase.from('items_repuestos').insert([
        {
          vehicle_id: vehicle.id,
          nombre: newRepuesto.nombre,
          precio: parseFloat(newRepuesto.precio),
        },
      ]);

      if (error) throw error;

      setNewRepuesto({ nombre: '', precio: '' });
      loadData();
    } catch (error) {
      console.error('Error adding repuesto:', error);
    }
  };

  const deleteRepuesto = async (id: string) => {
    try {
      const { error } = await supabase.from('items_repuestos').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting repuesto:', error);
    }
  };

  const addManoObra = async () => {
    if (!newManoObra.descripcion || !newManoObra.precio) return;

    try {
      const { error } = await supabase.from('items_mano_obra').insert([
        {
          vehicle_id: vehicle.id,
          descripcion: newManoObra.descripcion,
          precio: parseFloat(newManoObra.precio),
        },
      ]);

      if (error) throw error;

      setNewManoObra({ descripcion: '', precio: '' });
      loadData();
    } catch (error) {
      console.error('Error adding mano de obra:', error);
    }
  };

  const deleteManoObra = async (id: string) => {
    try {
      const { error } = await supabase.from('items_mano_obra').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting mano de obra:', error);
    }
  };

  const addPago = async () => {
    if (!newPago.monto || !newPago.metodo_pago) return;

    try {
      const { error } = await supabase.from('pagos').insert([
        {
          vehicle_id: vehicle.id,
          monto: parseFloat(newPago.monto),
          metodo_pago: newPago.metodo_pago,
          fecha: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setNewPago({ monto: '', metodo_pago: 'Efectivo' });
      loadData();
    } catch (error) {
      console.error('Error adding pago:', error);
    }
  };

  const deletePago = async (id: string) => {
    try {
      const { error } = await supabase.from('pagos').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting pago:', error);
    }
  };

  const totalRepuestos = repuestos.reduce((sum, item) => sum + Number(item.precio), 0);
  const totalManoObra = manoObra.reduce((sum, item) => sum + Number(item.precio), 0);
  const totalPresupuesto = totalRepuestos + totalManoObra;
  const totalPagado = pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);
  const saldoPendiente = totalPresupuesto - totalPagado;

  const deleteVehicle = async () => {
    const confirmed = window.confirm(
      '¿Seguro que querés eliminar este vehículo? Se borrarán también sus repuestos, mano de obra y pagos.',
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('vehicles').delete().eq('id', vehicle.id);
      if (error) throw error;
      onUpdate();
      onBack();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Hubo un problema al eliminar el vehículo.');
    }
  };

  const generatePDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Presupuesto - ${vehicle.patente}</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 12px;
              color: #333;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 16px;
              border-bottom: 2px solid #1e40af;
              padding-bottom: 10px;
            }
            .header h1 {
              color: #1e40af;
              margin: 0;
              font-size: 18px;
            }
            .header p {
              margin: 2px 0;
              font-size: 10px;
            }
            .info-section {
              margin-bottom: 14px;
            }
            .info-section h2 {
              color: #1e40af;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 3px;
              margin-bottom: 8px;
              font-size: 13px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 6px;
            }
            .info-item {
              padding: 2px 0;
            }
            .info-label {
              font-weight: bold;
              color: #64748b;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
              font-size: 11px;
            }
            th {
              background-color: #1e40af;
              color: white;
              padding: 6px;
              text-align: left;
            }
            td {
              padding: 4px 6px;
              border-bottom: 1px solid #e2e8f0;
            }
            .total-row {
              font-weight: bold;
              background-color: #f1f5f9;
            }
            .summary {
              margin-top: 12px;
              padding: 10px;
              background-color: #f8fafc;
              border-radius: 6px;
              font-size: 11px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .summary-row:last-child {
              border-bottom: none;
              font-size: 13px;
              font-weight: bold;
              color: #1e40af;
            }
            .saldo-positivo {
              color: #16a34a;
            }
            .saldo-negativo {
              color: #dc2626;
            }
            @media print {
              body {
                padding: 4mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TALLER MECÁNICO PENCAR</h1>
            <p>Misiones 1354 - Tel: (+54) 3515578214</p>
            <p>/p>
          </div>

          <div class="info-section">
            <h2>Datos del Cliente</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Nombre:</span> ${vehicle.cliente_nombre} ${vehicle.cliente_apellido}
              </div>
              <div class="info-item">
                <span class="info-label">Teléfono:</span> ${vehicle.telefono}
              </div>
            </div>
          </div>

          <div class="info-section">
            <h2>Datos del Vehículo</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Patente:</span> ${vehicle.patente}
              </div>
              <div class="info-item">
                <span class="info-label">Marca/Modelo:</span> ${vehicle.marca} ${vehicle.modelo}
              </div>
              <div class="info-item">
                <span class="info-label">Kilómetros:</span> ${vehicle.kilometros.toLocaleString('es-AR')} km
              </div>
              <div class="info-item">
                <span class="info-label">Fecha Ingreso:</span> ${new Date(vehicle.fecha_ingreso).toLocaleDateString('es-AR')}
              </div>
              ${
                vehicle.reparado_por
                  ? `
              <div class="info-item">
                <span class="info-label">Reparado por:</span> ${vehicle.reparado_por}
              </div>
              `
                  : ''
              }
            </div>
          </div>

          ${repuestos.length > 0 ? `
          <div class="info-section">
            <h2>Repuestos</h2>
            <table>
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th style="text-align: right;">Precio</th>
                </tr>
              </thead>
              <tbody>
                ${repuestos.map(r => `
                  <tr>
                    <td>${r.nombre}</td>
                    <td style="text-align: right;">$${Number(r.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td>Subtotal Repuestos</td>
                  <td style="text-align: right;">$${totalRepuestos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>
          ` : ''}

          ${manoObra.length > 0 ? `
          <div class="info-section">
            <h2>Mano de Obra</h2>
            <table>
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th style="text-align: right;">Precio</th>
                </tr>
              </thead>
              <tbody>
                ${manoObra.map(m => `
                  <tr>
                    <td>${m.descripcion}</td>
                    <td style="text-align: right;">$${Number(m.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td>Subtotal Mano de Obra</td>
                  <td style="text-align: right;">$${totalManoObra.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>
          ` : ''}

          <div class="summary">
            <div class="summary-row">
              <span>Total Presupuestado:</span>
              <span>$${totalPresupuesto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="summary-row">
              <span>Total Pagado:</span>
              <span class="saldo-positivo">$${totalPagado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="summary-row">
              <span>Saldo Pendiente:</span>
              <span class="${saldoPendiente > 0 ? 'saldo-negativo' : 'saldo-positivo'}">
                $${saldoPendiente.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <button
            onClick={deleteVehicle}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Eliminar vehículo</span>
          </button>
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileDown className="w-5 h-5" />
            <span className="hidden sm:inline">Descargar Presupuesto</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Cliente</h3>
            <p className="text-lg font-semibold text-slate-900">
              {vehicle.cliente_nombre} {vehicle.cliente_apellido}
            </p>
            <p className="text-sm text-slate-600">{vehicle.telefono}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Vehículo</h3>
            <p className="text-lg font-semibold text-slate-900">{vehicle.patente}</p>
            <p className="text-sm text-slate-600">
              {vehicle.marca} {vehicle.modelo} - {vehicle.kilometros.toLocaleString('es-AR')} km
            </p>
            {vehicle.reparado_por && (
              <p className="text-sm text-slate-600 mt-1">
                Reparado por: <span className="font-medium">{vehicle.reparado_por}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Repuestos</h3>
        </div>

        <div className="space-y-3">
          {repuestos.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium text-slate-900">{item.nombre}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-900">
                  ${Number(item.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
                <button
                  onClick={() => deleteRepuesto(item.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Nombre del repuesto"
              value={newRepuesto.nombre}
              onChange={(e) => setNewRepuesto({ ...newRepuesto, nombre: e.target.value })}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <input
              type="number"
              placeholder="Precio"
              value={newRepuesto.precio}
              onChange={(e) => setNewRepuesto({ ...newRepuesto, precio: e.target.value })}
              className="w-32 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button
              onClick={addRepuesto}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-200">
            <span className="text-lg font-semibold text-slate-900">
              Subtotal: ${totalRepuestos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Mano de Obra</h3>
        </div>

        <div className="space-y-3">
          {manoObra.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium text-slate-900">{item.descripcion}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-900">
                  ${Number(item.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
                <button
                  onClick={() => deleteManoObra(item.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Descripción del trabajo"
              value={newManoObra.descripcion}
              onChange={(e) =>
                setNewManoObra({ ...newManoObra, descripcion: e.target.value })
              }
              className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <input
              type="number"
              placeholder="Precio"
              value={newManoObra.precio}
              onChange={(e) => setNewManoObra({ ...newManoObra, precio: e.target.value })}
              className="w-32 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button
              onClick={addManoObra}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-200">
            <span className="text-lg font-semibold text-slate-900">
              Subtotal: ${totalManoObra.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-slate-900">Pagos / Cuenta Corriente</h3>
        </div>

        <div className="space-y-3">
          {pagos.map((pago) => (
            <div
              key={pago.id}
              className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
            >
              <div className="flex-1">
                <p className="text-sm text-slate-600">
                  {new Date(pago.fecha).toLocaleDateString('es-AR')} -{' '}
                  {new Date(pago.fecha).toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {pago.metodo_pago && (
                  <p className="text-xs text-slate-500 mt-1">
                    Método de pago: <span className="font-medium">{pago.metodo_pago}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-green-700">
                  ${Number(pago.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
                <button
                  onClick={() => deletePago(pago.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="number"
              placeholder="Monto del pago"
              value={newPago.monto}
              onChange={(e) => setNewPago({ ...newPago, monto: e.target.value })}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <select
              value={newPago.metodo_pago}
              onChange={(e) => setNewPago({ ...newPago, metodo_pago: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta de débito">Tarjeta de débito</option>
              <option value="Tarjeta de crédito">Tarjeta de crédito</option>
              <option value="Otro">Otro</option>
            </select>
            <button
              onClick={addPago}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Registrar Pago</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-slate-900">Resumen Financiero</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-700 font-medium">Total Presupuestado:</span>
            <span className="text-2xl font-bold text-slate-900">
              ${totalPresupuesto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-700 font-medium">Total Pagado:</span>
            <span className="text-2xl font-bold text-green-600">
              ${totalPagado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="h-px bg-blue-300 my-2"></div>
          <div className="flex justify-between items-center">
            <span className="text-slate-900 font-bold text-lg">Saldo Pendiente:</span>
            <span
              className={`text-3xl font-bold ${
                saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'
              }`}
            >
              ${saldoPendiente.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
