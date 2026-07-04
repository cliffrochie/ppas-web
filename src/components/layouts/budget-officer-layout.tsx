import { Outlet } from 'react-router-dom';
import { Users, FileText, LayoutDashboard, ShoppingCart, ScrollText } from 'lucide-react';
import { AppSidebarLayout } from './app-sidebar-layout';

const BUDGET_OFFICER_NAV = [
  { to: '/budget-officer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/budget-officer/requests', icon: FileText, label: 'Requests' },
  { to: '/budget-officer/purchase-orders', icon: ShoppingCart, label: 'Purchase Orders' },
  { to: '/budget-officer/suppliers', icon: Users, label: 'Suppliers' },
  { to: '/budget-officer/audit-logs', icon: ScrollText, label: 'Audit Log' },
];

const BudgetOfficerLayout = () => (
  <AppSidebarLayout
    navItems={BUDGET_OFFICER_NAV}
    homeHref="/budget-officer/dashboard"
    roleName="Budget Officer"
    requestsPathPrefix="/budget-officer/requests"
  >
    <Outlet />
  </AppSidebarLayout>
);

export default BudgetOfficerLayout;
