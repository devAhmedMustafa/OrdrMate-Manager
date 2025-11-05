import { HashRouter, Route, Routes } from 'react-router-dom'
import LoginPage from './features/auth/Login.page'
import './App.css'
import { AuthProvider } from './features/auth/Auth.context'
import BranchManagerRoute from './features/auth/BranchManagerRoute'
import { BranchManagerLayout } from './features/dashboard/BranchManagerLayout'
import BranchMenuPage from './features/items/BranchMenu.page'
import BranchSettingsPage from './features/branch-settings/BranchSettings.page'
import { Tables as TablesPage } from './features/tables/Tables.page'
import KitchenPowerPage from './features/branch/KitchenPower.page'
import Orders from './features/orders/Orders.page'
import DashboardHome from './features/dashboard/components/DashboardHome.page'
import AttendanceCodePage from './features/branch/AttendanceCode.page'
import AnalyticsPage from './features/analytics/Analytics.page'
import { useEffect } from 'react'
import OnlineEvent from './features/offline-support/OnlineEvent'
import ProtectedRoute from './features/auth/ProtectedRoute'

function AppContent() {

  useEffect(()=> {
    OnlineEvent.getInstance().subscribe((isOnline: boolean) => {
      console.log(`App is now ${isOnline ? 'online' : 'offline'}`);
    });
  }, [])

  return (
    <main>
      <HashRouter>
        <Routes>
          <Route path='/login' element={<LoginPage/>}/>

          <Route path='/' element={
            <BranchManagerRoute>
              <ProtectedRoute>
                <BranchManagerLayout />
              </ProtectedRoute>
            </BranchManagerRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="menu" element={<BranchMenuPage />} />
            <Route path="orders" element={<Orders />} />
            <Route path="tables" element={<TablesPage />} />
            <Route path="kitchen-power" element={<KitchenPowerPage />} />
            <Route path='analytics' element={<AnalyticsPage />} />
            <Route path="settings" element={<BranchSettingsPage />} />
            <Route path="attendance" element={<AttendanceCodePage />} />
          </Route>

        </Routes>
      </HashRouter>
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
