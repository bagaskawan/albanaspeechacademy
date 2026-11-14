import React from 'react';
import { AuthButton } from './AuthButton';

export function CanvaButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <AuthButton
      label="Canva"
      icon={
        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" />
          <path d="M14.5 9c-1.5 0-2.5 1-2.5 2.5v1c0 1.5 1 2.5 2.5 2.5s2.5-1 2.5-2.5v-1" fill="none" stroke="#242424" strokeWidth="2" strokeLinecap="round" />
          <path d="M12.5 10c0-1-1-2-2.5-2-2 0-3 1.5-3 4s1 4 3 4c1.5 0 2.5-1 2.5-2" fill="none" stroke="#242424" strokeWidth="2" strokeLinecap="round" />
        </svg>
      }
      {...props}
    />
  );
}
