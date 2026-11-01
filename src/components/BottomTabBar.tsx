import React from 'react';
import { Home, Wrench, Bike, RotateCcw } from 'lucide-react';

export type BottomTab = 'inicio' | 'servicios' | 'delivery' | 'alquiler';

interface BottomTabBarProps {
  active: BottomTab;
  onSelect: (tab: BottomTab) => void;
}

const TABS: { id: BottomTab; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'inicio', label: 'Inicio', icon: Home, color: 'text-white' },
  { id: 'servicios', label: 'Servicios', icon: Wrench, color: 'text-[#6aa8ff]' },
  { id: 'delivery', label: 'Delivery', icon: Bike, color: 'text-sg-orange' },
  { id: 'alquiler', label: 'Alquiler', icon: RotateCcw, color: 'text-sg-green' },
];

/**
 * Barra fija inferior para celular: cambia de módulo sin volver al inicio.
 * En pantallas grandes se oculta (la barra superior ya cubre la navegación).
 */
export const BottomTabBar: React.FC<BottomTabBarProps> = ({ active, onSelect }) => (
  <nav
    aria-label="Secciones de ServiGo"
    className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-sg-navy-3/95 backdrop-blur border-t border-white/10 font-sans"
    style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 10px)' }}
  >
    <div className="grid grid-cols-4 px-2 pt-1.5">
      {TABS.map((t) => {
        const Icon = t.icon;
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 py-2 min-h-[52px] text-xs cursor-pointer ${
              isActive ? `${t.color} font-extrabold` : 'text-[#9fb0d4] font-semibold'
            }`}
          >
            <Icon className="w-6 h-6" strokeWidth={2.2} aria-hidden="true" />
            {t.label}
          </button>
        );
      })}
    </div>
  </nav>
);
