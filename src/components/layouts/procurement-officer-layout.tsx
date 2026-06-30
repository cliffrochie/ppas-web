import { Outlet } from 'react-router-dom';
import { Users, FileText, LayoutDashboard, ShoppingCart } from 'lucide-react';
import { AppSidebarLayout } from './app-sidebar-layout';

const NAV = [
  { to: '/procurement-officer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/procurement-officer/requests', icon: FileText, label: 'Requests' },
  { to: '/procurement-officer/purchase-orders', icon: ShoppingCart, label: 'Purchase Orders' },
  { to: '/procurement-officer/suppliers', icon: Users, label: 'Suppliers' },
];

const ProcurementOfficerLayout = () => (
  <AppSidebarLayout
    navItems={NAV}
    homeHref="/procurement-officer/dashboard"
    roleName="PPU Personnel"
  >
    <Outlet />
  </AppSidebarLayout>
);

export default ProcurementOfficerLayout;
