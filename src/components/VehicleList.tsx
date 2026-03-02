import { Search, Calendar, Phone, Car } from 'lucide-react';
import { Vehicle } from '../lib/supabase';

interface VehicleListProps {
  vehicles: Vehicle[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export function VehicleList({
  vehicles,
  searchTerm,
  onSearchChange,
  onSelectVehicle,
}: VehicleListProps) {
  const filteredVehicles = vehicles.filter((vehicle) => {
    const search = searchTerm.toLowerCase();
    return (
      vehicle.patente.toLowerCase().includes(search) ||
      vehicle.modelo.toLowerCase().includes(search) ||
      vehicle.cliente_nombre.toLowerCase().includes(search) ||
      vehicle.cliente_apellido.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por patente, modelo o cliente..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
      </div>

      {filteredVehicles.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Car className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No se encontraron vehículos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => (
            <button
              key={vehicle.id}
              onClick={() => onSelectVehicle(vehicle)}
              className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-900">
                    {vehicle.patente}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {vehicle.marca} {vehicle.modelo}
                  </p>
                </div>
                <Car className="w-5 h-5 text-slate-400" />
              </div>

              <div className="space-y-1 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>
                    {vehicle.cliente_nombre} {vehicle.cliente_apellido}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(vehicle.fecha_ingreso).toLocaleDateString('es-AR')}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                {vehicle.kilometros.toLocaleString('es-AR')} km
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
