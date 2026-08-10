/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const COMPANY_LOGO_DATA_URI = '';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  subtext?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  showText = true,
  subtext
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
            TeXora <span className="text-indigo-600 dark:text-indigo-400">Forge</span>
          </span>
        </div>
        {subtext && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};


