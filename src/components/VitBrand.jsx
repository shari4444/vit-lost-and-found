import React from 'react';

export const VitBrand = ({ className = "h-9", showSubtitle = true, subtitle = "Campus Custodial Registry" }) => {
  return (
    <div className="flex items-center gap-3">
      <img
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAn_RlHqZntGXICBwCWSpAypQJi_tJRwVKX7qXJ9xiKYe3nGzLhjCrgOgDiOBJPNkUADvEqWVfrmlptznC1lJknTBjY6P_fMlI0I2FXGJdqrln3FbgOSq0ZRmZoEYIjMmgo4hMZ9QLOorU9vawidGCvvdoVoVC_BVN5XcH608xJqXbUz8tGGGDlWTijEqmjym7LpKx35iUAHTU2iP9z_JOI1rTDl1ogLusxoRPxgiMWJSwK9fTxivljDA"
        alt="Vidyalankar Institute of Technology"
        className={`${className} w-auto object-contain shrink-0`}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
      <div className="flex flex-col min-w-0">
        <span className="font-display font-bold text-sm tracking-tight text-primary dark:text-white leading-tight">
          VIT Lost & Found
        </span>
        {showSubtitle && (
          <span className="text-[10px] text-secondary dark:text-darkcanvas-muted font-medium uppercase tracking-wider truncate">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
