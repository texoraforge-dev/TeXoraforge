/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import appLogo from '../assets/images/texora_app_logo_1786115622051.jpg';

export const COMPANY_LOGO_DATA_URI = appLogo;

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  subtext?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  subtext
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative shrink-0 rounded-full overflow-hidden shadow-md ring-2 ring-purple-600/40 ${sizeClasses[size]}`}>
        <img
          src={appLogo}
          alt="TeXora App Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {showText && (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
              TeXora <span className="text-purple-600 dark:text-purple-400">Forge</span>
            </span>
          </div>
          {subtext && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

