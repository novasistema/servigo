import React from 'react';

interface ServiGoAlquilerLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const ServiGoAlquilerLogo: React.FC<ServiGoAlquilerLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const logoUrl = '/assets/aistudio/Gemini_Generated_Image_igtdraigtdraigtd_37ae301b.jpg';

  const sizeClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-11 sm:h-12',
    lg: 'h-16 sm:h-20',
    xl: 'h-24 sm:h-32',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src={logoUrl}
        alt="ServiGo Alquiler de Productos"
        className={`${sizeClasses[size]} w-auto object-contain rounded-xl shadow-md bg-white p-1 border border-orange-400 shrink-0`}
      />
      {showSubtitle && (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
              Servi<span className="text-orange-600">Go</span>
            </span>
            <span className="bg-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              Alquiler
            </span>
          </div>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">
            Alquiler de Productos • Estilo Givy
          </p>
        </div>
      )}
    </div>
  );
};
