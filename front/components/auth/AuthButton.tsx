import React from 'react';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
}

export function AuthButton({ icon, label, ...props }: AuthButtonProps) {
  return (
    <button
      className="w-full flex items-center bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-all duration-200 rounded-sm py-3 px-4 mb-3 active:scale-[0.98]"
      {...props}
    >
      <div className="w-5 h-5 flex items-center justify-center text-gray-700">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700 ml-4">{label}</span>
    </button>
  );
}
