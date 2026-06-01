import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/auth';
import { TotemProvider } from './lib/totem-flow-store';
import { AuthGuard } from './components/shared/AuthGuard';
import { AdminLayout } from './components/layout/AdminLayout';
import { BarbeiroLayout } from './components/layout/BarbeiroLayout';
import { TotemLayout } from './components/layout/TotemLayout';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Pesquisa from './pages/Pesquisa';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Servicos from './pages/admin/Servicos';
import Produtos from './pages/admin/Produtos';
import Categorias from './pages/admin/Categorias';
import Cortesias from './pages/admin/Cortesias';
import Barbeiros from './pages/admin/Barbeiros';
import Clientes from './pages/admin/Clientes';
import Agendamentos from './pages/admin/Agendamentos';
import Relatorios from './pages/admin/Relatorios';
import Pesquisas from './pages/admin/Pesquisas';

// Barbeiro Pages
import Fila from './pages/barbeiro/Fila';
import Atendimento from './pages/barbeiro/Atendimento';

// Totem Pages
import Welcome from './pages/totem/Welcome';
import Cpf from './pages/totem/Cpf';
import AgendamentosTotem from './pages/totem/Agendamentos';
import Idade from './pages/totem/Idade';
import Alcool from './pages/totem/Alcool';
import Cortesia from './pages/totem/Cortesia';
import Comanda from './pages/totem/Comanda';
import Pagamento from './pages/totem/Pagamento';
import Sucesso from './pages/totem/Sucesso';

import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TotemProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pesquisa/:token" element={<Pesquisa />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AuthGuard allowedRoles={['admin']}>
                  <AdminLayout />
                </AuthGuard>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="servicos" element={<Servicos />} />
              <Route path="produtos" element={<Produtos />} />
              <Route path="categorias" element={<Categorias />} />
              <Route path="cortesias" element={<Cortesias />} />
              <Route path="barbeiros" element={<Barbeiros />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="agendamentos" element={<Agendamentos />} />
              <Route path="relatorios" element={<Relatorios />} />
              <Route path="pesquisas" element={<Pesquisas />} />
            </Route>

            {/* Barbeiro Routes */}
            <Route
              path="/barbeiro"
              element={
                <AuthGuard allowedRoles={['barber']}>
                  <BarbeiroLayout />
                </AuthGuard>
              }
            >
              <Route path="fila" element={<Fila />} />
              <Route path="atendimento/:orderId" element={<Atendimento />} />
            </Route>

            {/* Totem Routes */}
            <Route
              path="/totem"
              element={
                <TotemLayout />
              }
            >
              <Route index element={<Welcome />} />
              <Route path="cpf" element={<Cpf />} />
              <Route path="agendamentos" element={<AgendamentosTotem />} />
              <Route path="idade" element={<Idade />} />
              <Route path="alcool" element={<Alcool />} />
              <Route path="cortesia" element={<Cortesia />} />
              <Route path="comanda" element={<Comanda />} />
              <Route path="pagamento" element={<Pagamento />} />
              <Route path="sucesso" element={<Sucesso />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TotemProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;