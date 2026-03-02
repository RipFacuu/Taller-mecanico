import { useState, useEffect } from 'react';
import { Plus, Wrench } from 'lucide-react';
import { supabase, Vehicle, ItemRepuesto, ItemManoObra, Pago } from './lib/supabase';
import { VehicleForm } from './components/VehicleForm';
import { VehicleList } from './components/VehicleList';
import { VehicleDetail } from './components/VehicleDetail';
import { DashboardSummary } from './components/DashboardSummary';

function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [repuestos, setRepuestos] = useState<ItemRepuesto[]>([]);
  const [manoObra, setManoObra] = useState<ItemManoObra[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, repuestosRes, manoObraRes, pagosRes] = await Promise.all([
        supabase.from('vehicles').select('*').order('fecha_ingreso', { ascending: false }),
        supabase.from('items_repuestos').select('*'),
        supabase.from('items_mano_obra').select('*'),
        supabase.from('pagos').select('*'),
      ]);

      if (vehiclesRes.error) throw vehiclesRes.error;
      if (repuestosRes.error) throw repuestosRes.error;
      if (manoObraRes.error) throw manoObraRes.error;
      if (pagosRes.error) throw pagosRes.error;

      if (vehiclesRes.data) setVehicles(vehiclesRes.data);
      if (repuestosRes.data) setRepuestos(repuestosRes.data);
      if (manoObraRes.data) setManoObra(manoObraRes.data);
      if (pagosRes.data) setPagos(pagosRes.data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    loadData();
    setShowForm(false);
  };

  if (selectedVehicle) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <VehicleDetail
            vehicle={selectedVehicle}
            onBack={() => {
              setSelectedVehicle(null);
              loadData();
            }}
            onUpdate={loadData}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-3 rounded-lg">
                <Wrench className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Taller Mecánico</h1>
                <p className="text-blue-100 text-sm">Sistema de Gestión Profesional</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-semibold shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Nuevo Ingreso</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {!loading && (
          <DashboardSummary
            vehicles={vehicles}
            repuestos={repuestos}
            manoObra={manoObra}
            pagos={pagos}
          />
        )}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500">Cargando vehículos...</div>
          </div>
        ) : (
          <VehicleList
            vehicles={vehicles}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSelectVehicle={setSelectedVehicle}
          />
        )}
      </div>

      {showForm && (
        <VehicleForm onClose={() => setShowForm(false)} onSuccess={handleFormSuccess} />
      )}
    </div>
  );
}

export default App;
