import { Outlet } from 'react-router-dom';
import { Users, FileText, LayoutDashboard, ShoppingCart } from 'lucide-react';
import { AppSidebarLayout } from './app-sidebar-layout';

const BUDGET_OFFICER_NAV = [
  { to: '/budget-officer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/budget-officer/requests', icon: FileText, label: 'Requests' },
  { to: '/budget-officer/purchase-orders', icon: ShoppingCart, label: 'Purchase Orders' },
  { to: '/budget-officer/suppliers', icon: Users, label: 'Suppliers' },
];

const BudgetOfficerLayout = () => (
  <AppSidebarLayout
    navItems={BUDGET_OFFICER_NAV}
    homeHref="/budget-officer/dashboard"
    roleName="Budget Officer"
  >
    <Outlet />
  </AppSidebarLayout>
);

export default BudgetOfficerLayout;
