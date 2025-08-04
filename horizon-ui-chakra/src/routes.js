import React from 'react';

import { Icon } from '@chakra-ui/react';
import {
  MdPerson,
  MdHome,
  MdLock,
  MdInventory,
  MdBuild,
  MdDirectionsBike,
  MdGroup,
  MdAssessment,
  MdCalendarToday,
  MdAccountBalance,
  MdSettings,
  MdPalette,
} from 'react-icons/md';

// Admin Imports
import MainDashboard from 'views/admin/default';
import CustomerManagement from 'views/admin/customers';
import StockManagement from 'views/admin/stock';
import ServiceTracking from 'views/admin/service';
import VespaModels from 'views/admin/vespa-models';
import Reports from 'views/admin/reports';
import Profile from 'views/admin/profile';
import AppointmentManagement from 'views/admin/appointments';
import PaintStudio from 'views/admin/paint-studio';
import TaxReports from 'views/admin/tax-reports';
import SystemSettings from 'views/admin/settings';

// Auth Imports
import SignInCentered from 'views/auth/signIn';

const routes = [
  {
    name: 'Ana Sayfa',
    layout: '/admin',
    path: '/default',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <MainDashboard />,
  },
  {
    name: 'Müşteri Yönetimi',
    layout: '/admin',
    path: '/customers',
    icon: <Icon as={MdGroup} width="20px" height="20px" color="inherit" />,
    component: <CustomerManagement />,
  },
  {
    name: 'Stok Yönetimi',
    layout: '/admin',
    path: '/stock',
    icon: <Icon as={MdInventory} width="20px" height="20px" color="inherit" />,
    component: <StockManagement />,
  },
  {
    name: 'Servis Takibi',
    layout: '/admin',
    path: '/service',
    icon: <Icon as={MdBuild} width="20px" height="20px" color="inherit" />,
    component: <ServiceTracking />,
  },
  {
    name: 'Randevu Sistemi',
    layout: '/admin',
    path: '/appointments',
    icon: <Icon as={MdCalendarToday} width="20px" height="20px" color="inherit" />,
    component: <AppointmentManagement />,
  },
  {
    name: 'Paint Studio',
    layout: '/admin',
    path: '/paint-studio',
    icon: <Icon as={MdPalette} width="20px" height="20px" color="inherit" />,
    component: <PaintStudio />,
  },
  {
    name: 'Vergi Beyanı',
    layout: '/admin',
    path: '/tax-reports',
    icon: <Icon as={MdAccountBalance} width="20px" height="20px" color="inherit" />,
    component: <TaxReports />,
  },
  {
    name: 'Vespa Modelleri',
    layout: '/admin',
    path: '/vespa-models',
    icon: <Icon as={MdDirectionsBike} width="20px" height="20px" color="inherit" />,
    component: <VespaModels />,
  },
  {
    name: 'Raporlar',
    layout: '/admin',
    path: '/reports',
    icon: <Icon as={MdAssessment} width="20px" height="20px" color="inherit" />,
    component: <Reports />,
  },
  {
    name: 'Sistem Ayarları',
    layout: '/admin',
    path: '/settings',
    icon: <Icon as={MdSettings} width="20px" height="20px" color="inherit" />,
    component: <SystemSettings />,
  },
  {
    name: 'Profil',
    layout: '/admin',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <Profile />,
  },
  {
    name: 'Giriş',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <SignInCentered />,
  },
];

export default routes;
