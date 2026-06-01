import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

export default function NotFound() {
  const error = useRouteError();

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-medium text-ink mb-4">404</h1>
        <h2 className="text-xl text-muted mb-8">Página não encontrada</h2>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-ink text-white rounded-xl hover:bg-ink/90 transition-colors"
        >
          Voltar para início
        </Link>
      </div>
    </div>
  );
}