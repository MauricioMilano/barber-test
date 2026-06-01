import React from 'react';
import { Link } from 'react-router-dom';
import { SignatureCard } from '@/components/shared/SignatureCard';
import { User, Scissors, Settings, ArrowRight } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="h-20 border-b border-hairline flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-ink flex items-center justify-center">
            <Scissors className="w-6 h-6 text-white" />
          </div>
          <span className="font-medium text-xl text-ink">Barbearia STYLE</span>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-medium text-ink mb-6 leading-tight">
            Comanda Digital
          </h1>
          <p className="text-lg text-muted mb-16 max-w-2xl mx-auto">
            Gerenciamento completo para barbearias. Acesse como cliente, barbeiro ou administrador.
          </p>

          {/* Role Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <SignatureCard
              variant="coral"
              icon={<User className="w-8 h-8 text-white" />}
              title="Sou Cliente"
              description="Faça check-in no totem com seu CPF e acompanhe sua comanda"
              ctaText="Abrir Totem"
              href="/totem"
            />

            <SignatureCard
              variant="dark"
              icon={<Scissors className="w-8 h-8 text-white" />}
              title="Sou Barbeiro"
              description="Gerencie sua fila de clientes e acompanhe comandas em tempo real"
              ctaText="Acessar Painel"
              href="/login"
            />

            <SignatureCard
              variant="forest"
              icon={<Settings className="w-8 h-8 text-white" />}
              title="Sou Admin"
              description="Gerencie serviços, produtos, agenda e visualize relatórios"
              ctaText="Acessar Admin"
              href="/login"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-8 bg-surface-soft">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-medium text-ink text-center mb-12">
            Como funciona
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-signature-cream flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-medium text-signature-coral">1</span>
              </div>
              <h3 className="text-lg font-medium text-ink mb-2">Check-in</h3>
              <p className="text-sm text-muted">
                Digite seu CPF no totem para ver seus agendamentos do dia
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-signature-cream flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-medium text-signature-coral">2</span>
              </div>
              <h3 className="text-lg font-medium text-ink mb-2">Escolha</h3>
              <p className="text-sm text-muted">
                Selecione bebida alcoólica e ganhe uma cortesia pelo serviço
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-signature-cream flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-medium text-signature-coral">3</span>
              </div>
              <h3 className="text-lg font-medium text-ink mb-2">Pagamento</h3>
              <p className="text-sm text-muted">
                Pague com cartão, PIX ou dinheiro e aguarde ser chamado
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-hairline">
        <div className="max-w-5xl mx-auto text-center text-sm text-muted">
          © 2024 Barbearia STYLE. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}