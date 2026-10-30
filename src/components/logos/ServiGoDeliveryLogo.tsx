import React from 'react';

interface ServiGoDeliveryLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only';
}

export const ServiGoDeliveryLogo: React.FC<ServiGoDeliveryLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
}) => {
  const heights = {
    sm: 'h-7',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
  };

  const currentHeight = heights[size];

  if (variant === 'icon-only') {
    return (
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${currentHeight} w-auto object-contain ${className}`}
        aria-label="ServiGo Delivery Icon"
      >
        {/* Speed motion lines */}
        <rect x="0" y="44" width="28" height="8" rx="4" fill="#F26522" />
        <rect x="12" y="60" width="22" height="8" rx="4" fill="#F26522" />

        {/* Orange Circular Body & Launch Arrow */}
        <circle cx="82" cy="74" r="50" fill="#F26522" />
        <path
          d="M74 38L128 12L124 64L108 48L74 72L58 56L94 32L74 38Z"
          fill="#F26522"
        />

        {/* Navy Blue Map Pin Shield */}
        <path
          d="M86 44C108 44 126 62 126 84C126 108 86 148 86 148C86 148 46 108 46 84C46 62 64 44 86 44Z"
          fill="#0A3B7B"
        />

        {/* White Center Circle */}
        <circle cx="86" cy="80" r="24" fill="#FFFFFF" />

        {/* Navy Keyhole Silhouette */}
        <circle cx="86" cy="74" r="9" fill="#0A3B7B" />
        <path
          d="M81 74L77 94H95L91 74Z"
          fill="#0A3B7B"
        />
      </svg>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Brand Typography */}
      <div className="flex flex-col justify-center leading-none">
        <span
          className="font-black tracking-tight text-[#0A3B7B] uppercase"
          style={{
            fontSize: size === 'sm' ? '18px' : size === 'md' ? '26px' : size === 'lg' ? '36px' : '48px',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
          }}
        >
          SERVIGO
        </span>
        <span
          className="font-black tracking-wider text-[#F26522] uppercase"
          style={{
            fontSize: size === 'sm' ? '17px' : size === 'md' ? '25px' : size === 'lg' ? '35px' : '46px',
            lineHeight: 0.95,
            letterSpacing: '0.04em',
          }}
        >
          DELIVERY
        </span>
      </div>

      {/* Official Graphic Pin Logo */}
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${currentHeight} w-auto object-contain shrink-0`}
        aria-label="ServiGo Delivery Icon"
      >
        {/* Speed motion lines */}
        <rect x="0" y="44" width="28" height="8" rx="4" fill="#F26522" />
        <rect x="12" y="60" width="22" height="8" rx="4" fill="#F26522" />

        {/* Orange Circular Body & Launch Arrow */}
        <circle cx="82" cy="74" r="50" fill="#F26522" />
        <path
          d="M74 38L128 12L124 64L108 48L74 72L58 56L94 32L74 38Z"
          fill="#F26522"
        />

        {/* Navy Blue Map Pin Shield */}
        <path
          d="M86 44C108 44 126 62 126 84C126 108 86 148 86 148C86 148 46 108 46 84C46 62 64 44 86 44Z"
          fill="#0A3B7B"
        />

        {/* White Center Circle */}
        <circle cx="86" cy="80" r="24" fill="#FFFFFF" />

        {/* Navy Keyhole Silhouette */}
        <circle cx="86" cy="74" r="9" fill="#0A3B7B" />
        <path
          d="M81 74L77 94H95L91 74Z"
          fill="#0A3B7B"
        />
      </svg>
    </div>
  );
};
