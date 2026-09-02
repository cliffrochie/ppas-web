import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types';
import { ProtectedRoute, RoleProtectedRoute } from './auth';

const fakeUser = (roleName: string): User => ({
  id: 1,
  first_name: 'Test',
  middle_name: null,
  last_name: 'User',
  extension_name: null,
  email: 'test@nia.test',
  role_id: 1,
  office_id: 1,
  is_active: true,
  email_verified_at: null,
  created_at: '',
  updated_at: '',
  role: { id: 1, name: roleName, description: null, created_at: '', updated_at: '' },
});

const setAuth = (partial: Partial<ReturnType<typeof useAuthStore.getState>>) => {
  useAuthStore.setState({
    token: null,
    user: null,
    isAuthenticated: false,
    hasHydrated: true,
    ...partial,
  });
};

const renderAt = (initialPath: string, tree: React.ReactNode) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/403" element={<div>forbidden page</div>} />
        {tree}
      </Routes>
    </MemoryRouter>,
  );

afterEach(() => {
  setAuth({ hasHydrated: false });
});

describe('ProtectedRoute', () => {
  it('shows a loading state until the persisted store hydrates', () => {
    setAuth({ hasHydrated: false, isAuthenticated: true });
    renderAt(
      '/app',
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<div>protected content</div>} />
      </Route>,
    );
    expect(screen.getByText(/loading session/i)).toBeInTheDocument();
    expect(screen.queryByText('protected content')).not.toBeInTheDocument();
  });

  it('redirects to /login when hydrated but unauthenticated', () => {
    setAuth({ hasHydrated: true, isAuthenticated: false });
    renderAt(
      '/app',
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<div>protected content</div>} />
      </Route>,
    );
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('renders the child route when authenticated', () => {
    setAuth({ hasHydrated: true, isAuthenticated: true, user: fakeUser('requester') });
    renderAt(
      '/app',
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<div>protected content</div>} />
      </Route>,
    );
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });
});

describe('RoleProtectedRoute', () => {
  it('renders the child route when the user has an allowed role', () => {
    setAuth({ hasHydrated: true, isAuthenticated: true, user: fakeUser('bac_secretariat') });
    renderAt(
      '/bac',
      <Route element={<RoleProtectedRoute allowedRoles={['bac_secretariat']} />}>
        <Route path="/bac" element={<div>bac content</div>} />
      </Route>,
    );
    expect(screen.getByText('bac content')).toBeInTheDocument();
  });

  it('redirects to /403 when the user role is not allowed', () => {
    setAuth({ hasHydrated: true, isAuthenticated: true, user: fakeUser('requester') });
    renderAt(
      '/bac',
      <Route element={<RoleProtectedRoute allowedRoles={['bac_secretariat']} />}>
        <Route path="/bac" element={<div>bac content</div>} />
      </Route>,
    );
    expect(screen.getByText('forbidden page')).toBeInTheDocument();
    expect(screen.queryByText('bac content')).not.toBeInTheDocument();
  });
});
