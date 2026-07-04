import { Outlet } from 'react-router-dom';
import {
  Users,
  FileText,
  LayoutDashboard,
  ShoppingCart,
  FileSearch,
  ClipboardList,
  Gavel,
  Award,
  ScrollText,
  History,
} from 'lucide-react';
import { AppSidebarLayout } from './app-sidebar-layout';

const NAV = [
  { to: '/procurement-officer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/procurement-officer/requests', icon: FileText, label: 'Requests' },
  { to: '/procurement-officer/purchase-orders', icon: ShoppingCart, label: 'Purchase Orders' },
  { to: '/procurement-officer/suppliers', icon: Users, label: 'Suppliers' },
  { to: '/procurement-officer/rfqs', icon: FileSearch, label: 'RFQs' },
  { to: '/procurement-officer/abstracts', icon: ClipboardList, label: 'Abstracts of Quotation' },
  { to: '/procurement-officer/bac-resolutions', icon: Gavel, label: 'BAC Resolutions' },
  { to: '/procurement-officer/notices-of-award', icon: Award, label: 'Notices of Award' },
  { to: '/procurement-officer/audit-logs', icon: ScrollText, label: 'Audit Log' },
  { to: '/procurement-officer/login-logs', icon: History, label: 'Login Log' },
];

const ProcurementOfficerLayout = () => (
  <AppSidebarLayout
    navItems={NAV}
    homeHref="/procurement-officer/dashboard"
    roleName="PPU Personnel"
    requestsPathPrefix="/procurement-officer/requests"
  >
    <Outlet />
  </AppSidebarLayout>
);

export default ProcurementOfficerLayout;
