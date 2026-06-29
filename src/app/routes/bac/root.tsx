import { Outlet } from 'react-router-dom';
import { FileText, LayoutDashboard, ShoppingCart } from 'lucide-react';
import { AppSidebarLayout } from '@/components/layouts/app-sidebar-layout';

const BAC_NAV = [
  { to: '/bac/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/bac/requests', icon: FileText, label: 'Requests' },
  { to: '/bac/purchase-orders', icon: ShoppingCart, label: 'Purchase Orders' },
];

const BacRootLayout = () => (
  <AppSidebarLayout navItems={BAC_NAV} homeHref="/bac/dashboard" roleName="BAC Secretariat">
    <Outlet />
  </AppSidebarLayout>
);

export default BacRootLayout;
