import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';

export function Logo({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) {
  const sizes = {
    sm: 'h-8',
    default: 'h-10',
    lg: 'h-14',
  };

  return (
    <Link to="/" className={`${sizes[size]} flex items-center gap-2 text-ink`}>
      <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
        <Scissors className="w-5 h-5 text-white" />
      </div>
      <span className="font-medium text-lg">Barbearia STYLE</span>
    </Link>
  );
}

export function LogoSmall() {
  return (
    <Link to="/" className="h-8 flex items-center gap-2 text-ink">
      <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
        <Scissors className="w-5 h-5 text-white" />
      </div>
    </Link>
  );
}