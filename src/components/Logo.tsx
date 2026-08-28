/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, GraduationCap } from 'lucide-react';

export const COMPANY_LOGO_DATA_URI = '/src/assets/images/texora_app_logo_1786115622051.jpg';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  subtext?: string;
  variant?: 'default' | 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  showText = true,
  subtext,
  variant = 'default'
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: { box: 'h-6 w-6 rounded-md', img: 'h-6 w-6', text: 'text-xs', icon: 'h-3.5 w-3.5' },
    sm: { box: 'h-8 w-8 rounded-lg', img: 'h-8 w-8', text: 'text-sm', icon: 'h-4 w-4' },
    md: { box: 'h-10 w-10 rounded-xl', img: 'h-10 w-10', text: 'text-base sm:text-lg', icon: 'h-5 w-5' },
    lg: { box: 'h-12 w-12 rounded-2xl', img: 'h-12 w-12', text: 'text-xl sm:text-2xl', icon: 'h-6 w-6' },
    xl: { box: 'h-16 w-16 rounded-2xl', img: 'h-16 w-16', text: 'text-2xl sm:text-3xl', icon: 'h-8 w-8' }
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative shrink-0 ${sizeClasses.box} overflow-hidden shadow-sm ring-1 ring-slate-900/10 dark:ring-white/15 bg-gradient-to-tr from-indigo-900 via-indigo-700 to-indigo-500 flex items-center justify-center`}>
        {!imageError ? (
          <img
            src={COMPANY_LOGO_DATA_URI}
            alt="TeXora Forge"
            className={`w-full h-full object-cover object-center transform transition-transform duration-300 hover:scale-105`}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white bg-gradient-to-tr from-indigo-700 to-purple-600">
            <GraduationCap className={sizeClasses.icon} />
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-display font-black tracking-tight ${sizeClasses.text} ${
              variant === 'light' ? 'text-white' : 'text-slate-900 dark:text-white'
            }`}>
              TeXora <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">Forge</span>
            </span>
          </div>
          {subtext && (
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px] sm:max-w-xs mt-0.5">
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );
};



