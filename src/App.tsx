import { useState, useEffect } from 'react';
import { Plus, Wrench, Car, Receipt } from 'lucide-react';
import { supabase, Vehicle, ItemRepuesto, ItemManoObra, Pago, Gasto } from './lib/supabase';
import { VehicleForm } from './components/VehicleForm';
import { VehicleList } from './components/VehicleList';
import { VehicleDetail } from './components/VehicleDetail';
import { DashboardSummary } from './components/DashboardSummary';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseForm } from './components/ExpenseForm';

function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [repuestos, setRepuestos] = useState<ItemRepuesto[]>([]);
  const [manoObra, setManoObra] = useState<ItemManoObra[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [activeTab, setActiveTab] = useState<'vehiculos' | 'gastos'>('vehiculos');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, repuestosRes, manoObraRes, pagosRes, gastosRes] = await Promise.all([
        supabase.from('vehicles').select('*').order('fecha_ingreso', { ascending: false }),
        supabase.from('items_repuestos').select('*'),
        supabase.from('items_mano_obra').select('*'),
        supabase.from('pagos').select('*'),
        supabase.from('gastos').select('*').order('fecha', { ascending: false }),
      ]);

      if (vehiclesRes.error) throw vehiclesRes.error;
      if (repuestosRes.error) throw repuestosRes.error;
      if (manoObraRes.error) throw manoObraRes.error;
      if (pagosRes.error) throw pagosRes.error;
      if (gastosRes.error) throw gastosRes.error;

      if (vehiclesRes.data) setVehicles(vehiclesRes.data);
      if (repuestosRes.data) setRepuestos(repuestosRes.data);
      if (manoObraRes.data) setManoObra(manoObraRes.data);
      if (pagosRes.data) setPagos(pagosRes.data);
      if (gastosRes.data) setGastos(gastosRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    loadData();
    setShowForm(false);
  };

  const handleExpenseFormSuccess = () => {
    loadData();
    setShowExpenseForm(false);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2.5 sm:p-3 rounded-lg">
                <Wrench className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold">Taller Mecánico</h1>
                <p className="text-blue-100 text-xs sm:text-sm">
                  Sistema de Gestión Profesional
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-semibold shadow-md text-sm sm:text-base"
              >
                <Plus className="w-5 h-5" />
                <span>Nuevo Ingreso</span>
              </button>
            </div>
          </div>

          <div className="mt-6 flex gap-1 bg-white/10 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('vehiculos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === 'vehiculos'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Car className="w-4 h-4" />
              <span className="font-medium">Vehículos</span>
            </button>
            <button
              onClick={() => setActiveTab('gastos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === 'gastos'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span className="font-medium">Gastos</span>
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
            gastos={gastos}
          />
        )}
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500">Cargando datos...</div>
          </div>
        ) : activeTab === 'vehiculos' ? (
          <VehicleList
            vehicles={vehicles}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSelectVehicle={setSelectedVehicle}
          />
        ) : (
          <ExpenseList
            expenses={gastos}
            searchTerm={expenseSearchTerm}
            onSearchChange={setExpenseSearchTerm}
            onAddExpense={() => setShowExpenseForm(true)}
            onUpdate={loadData}
          />
        )}
      </div>

      {showForm && (
        <VehicleForm onClose={() => setShowForm(false)} onSuccess={handleFormSuccess} />
      )}
      
      {showExpenseForm && (
        <ExpenseForm onClose={() => setShowExpenseForm(false)} onSuccess={handleExpenseFormSuccess} />
      )}
    </div>
  );
}

export default App;
