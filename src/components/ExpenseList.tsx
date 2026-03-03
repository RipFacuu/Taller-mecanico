import { useState } from 'react';
import { Search, Plus, Calendar, CheckCircle2, XCircle, Trash2, Edit2 } from 'lucide-react';
import { Gasto, supabase } from '../lib/supabase';

interface ExpenseListProps {
  expenses: Gasto[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddExpense: () => void;
  onUpdate: () => void;
}

export function ExpenseList({
  expenses,
  searchTerm,
  onSearchChange,
  onAddExpense,
  onUpdate,
}: ExpenseListProps) {
  const filteredExpenses = expenses.filter((expense) =>
    expense.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalGasto = expenses.reduce((acc, curr) => acc + Number(curr.monto), 0);
  const totalPago = expenses
    .filter((e) => e.esta_pago)
    .reduce((acc, curr) => acc + Number(curr.monto), 0);
  const totalPendiente = totalGasto - totalPago;

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este gasto?')) return;

    try {
      const { error } = await supabase.from('gastos').delete().eq('id', id);
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
      alert('Error al eliminar el gasto.');
    }
  };

  const togglePago = async (expense: Gasto) => {
    try {
      const { error } = await supabase
        .from('gastos')
        .update({ esta_pago: !expense.esta_pago })
        .eq('id', expense.id);
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error al actualizar gasto:', error);
      alert('Error al actualizar el estado del pago.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Gastos</p>
          <p className="text-2xl font-bold text-slate-900">${totalGasto.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Pago</p>
          <p className="text-2xl font-bold text-green-600">${totalPago.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Pendiente de Pago</p>
          <p className="text-2xl font-bold text-amber-600">${totalPendiente.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por descripción..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
          />
        </div>
        <button
          onClick={onAddExpense}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Registrar Gasto</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Fecha</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Descripción</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Monto</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">Estado</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {new Date(expense.fecha).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {expense.descripcion}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      ${Number(expense.monto).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => togglePago(expense)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          expense.esta_pago
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                      >
                        {expense.esta_pago ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Pago</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Pendiente</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    {searchTerm ? 'No se encontraron gastos que coincidan con la búsqueda.' : 'No hay gastos registrados.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
