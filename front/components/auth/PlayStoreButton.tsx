import React from 'react';

export function PlayStoreButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="flex flex-1 items-center bg-[#1c1c1e] hover:bg-[#2c2c2e] transition-colors rounded-xl py-2 px-3 border border-transparent hover:border-zinc-700"
      {...props}
    >
      <div className="mr-2">
        <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 3.414v17.172c0 .414.336.75.75.75.184 0 .363-.068.503-.191l8.349-7.394-3.149-3.056-6.453 6.38z" fill="#4285F4"/>
          <path d="M14.33 11.233l6.452-3.725c.343-.198.544-.564.516-.957-.027-.393-.277-.732-.638-.865L6.376 1.056l7.954 10.177z" fill="#34A853"/>
          <path d="M13.602 10.695L4.475 2.18A.753.753 0 0 0 4 2.064v4.468l9.602 4.163z" fill="#FBBC04"/>
          <path d="M14.33 12.767l-3.15 3.056 3.15 3.056 6.33-3.655c.421-.243.682-.693.682-1.179 0-.486-.261-.936-.682-1.179l-6.33-3.655z" fill="#EA4335"/>
        </svg>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[10px] text-gray-400 leading-none">Get it on</span>
        <span className="text-sm font-semibold text-white leading-tight">Google play</span>
      </div>
    </button>
  );
}
