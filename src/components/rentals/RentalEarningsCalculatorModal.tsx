import React, { useState } from 'react';
import { X, Calculator, DollarSign, Sparkles, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';

interface RentalEarningsCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPublish: () => void;
}

const PRESET_ITEMS = [
  { name: 'Hormigonera / Trompito', rate: 18000, daysTypical: 8 },
  { name: 'Hidrolavadora Kärcher', rate: 14000, daysTypical: 10 },
  { name: 'Generador Eléctrico 3500W', rate: 28000, daysTypical: 6 },
  { name: 'Gazebo 3x3 para Eventos', rate: 15000, daysTypical: 8 },
  { name: 'Parlante Potenciado Bluetooth', rate: 18500, daysTypical: 8 },
  { name: 'Proyector Cine + Pantalla', rate: 22000, daysTypical: 6 },
  { name: 'Escalera Telescópica 5m', rate: 9500, daysTypical: 10 },
  { name: 'Carpa de Camping 4 Personas', rate: 12000, daysTypical: 6 },
  { name: 'Bicicleta Mountain Bike', rate: 9000, daysTypical: 12 },
  { name: 'Máquina Lava-Tapizados', rate: 25000, daysTypical: 7 },
];

export const RentalEarningsCalculatorModal: React.FC<RentalEarningsCalculatorModalProps> = ({
  isOpen,
  onClose,
  onOpenPublish,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [dailyRate, setDailyRate] = useState<number>(PRESET_ITEMS[0].rate);
  const [daysPerMonth, setDaysPerMonth] = useState<number>(PRESET_ITEMS[0].daysTypical);

  if (!isOpen) return null;

  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    setDailyRate(PRESET_ITEMS[idx].rate);
    setDaysPerMonth(PRESET_ITEMS[idx].daysTypical);
  };

  const monthlyEarnings = dailyRate * daysPerMonth;
  const annualEarnings = monthlyEarnings * 12;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-fadeIn my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-md">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-200 block">
                CALCULÁ CUÁNTO PODÉS GANAR
              </span>
              <h2 className="text-lg sm:text-xl font-black">
                Calculadora de Ganancias
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 text-slate-800 font-sans">
          <p className="text-xs sm:text-sm text-slate-600">
            ¿Tenés herramientas, equipos de sonido, carpas o artículos guardados que usás solo de vez en cuando? Alquilalos de forma segura y convertilos en un ingreso pasivo mensual.
          </p>

          {/* Quick Item Presets */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-2">
              Seleccionar artículo común o similar:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ITEMS.map((item, idx) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleSelectPreset(idx)}
                  className={`text-xs px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    selectedPreset === idx
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Slider: Daily Rate */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Tarifa de Alquiler por Día:
              </label>
              <span className="text-base font-black text-orange-600">
                ${dailyRate.toLocaleString('es-AR')} ARS
              </span>
            </div>
            <input
              type="range"
              min={3000}
              max={60000}
              step={1000}
              value={dailyRate}
              onChange={(e) => {
                setDailyRate(Number(e.target.value));
                setSelectedPreset(-1);
              }}
              className="w-full accent-orange-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>$3.000</span>
              <span>$30.000</span>
              <span>$60.000</span>
            </div>
          </div>

          {/* Slider: Days rented per month */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Días alquilado por mes:
              </label>
              <span className="text-base font-black text-amber-600">
                {daysPerMonth} días / mes
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              step={1}
              value={daysPerMonth}
              onChange={(e) => {
                setDaysPerMonth(Number(e.target.value));
                setSelectedPreset(-1);
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>1 día (ocasión)</span>
              <span>10 días (promedio)</span>
              <span>25 días (alta rotación)</span>
            </div>
          </div>

          {/* Results Display */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-3xl shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-400">
              <TrendingUp className="w-4 h-4" />
              <span>Proyección de Ingreso Neto Estimado</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                <span className="text-[11px] text-slate-300 font-medium block">
                  Por Mes (Extra):
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 block mt-0.5">
                  ${monthlyEarnings.toLocaleString('es-AR')}
                </span>
                <span className="text-[10px] text-slate-400">
                  sin vender tu artículo
                </span>
              </div>

              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                <span className="text-[11px] text-slate-300 font-medium block">
                  Al Año (Acumulado):
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-300 block mt-0.5">
                  ${annualEarnings.toLocaleString('es-AR')}
                </span>
                <span className="text-[10px] text-slate-400">
                  amortiza el costo 3x
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Siempre con <strong>depósito de garantía</strong> que protege tu bien ante cualquier rotura.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
          >
            Cerrar
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenPublish();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs shadow-md shadow-orange-600/30 transition-all cursor-pointer"
          >
            <span>Publicar mi Producto Ahora</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
