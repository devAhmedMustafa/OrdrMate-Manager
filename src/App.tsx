import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginPage from './features/auth/Login.page'
import './App.css'
import { AuthProvider } from './features/auth/Auth.context'
import ProtectedRoute from './features/auth/ProtectedRoute'
import AdminRoute from './features/auth/AdminRoute'
import BranchManagerRoute from './features/auth/BranchManagerRoute'
import AddItemPage from './features/items/AddItem.page'
import { DashboardLayout } from './features/dashboard/DashboardLayout'
import { BranchManagerLayout } from './features/dashboard/BranchManagerLayout'
import MenuPage from './features/items/Menu.page'
import BranchMenuPage from './features/items/BranchMenu.page'
import ItemDetailPage from './features/items/ItemDetail.page'
import SettingsPage from './features/dashboard/components/Settings.page'
import BranchSettingsPage from './features/branch-settings/BranchSettings.page'
import BranchRequestsPage from './features/admin/BranchRequests.page'
import IncomingOrders from './features/orders/OrdersQueue.page'
import DashboardHome from './features/dashboard/components/DashboardHome.page'
import Orders from './features/orders/Orders.page'
import OnDeliveryOrders from './features/orders/OrderOnDelivery.page'

function AppContent() {
  return (
    <main>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<LoginPage/>}/>

          <Route path='/' element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<div>Dashboard Home</div>} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="menu/:id" element={<ItemDetailPage />} />
            <Route path="orders" element={<div>Orders</div>} />
            <Route path="settings" element={<SettingsPage/>} />
          </Route>

          <Route path='/branch' element={
            <BranchManagerRoute>
              <BranchManagerLayout />
            </BranchManagerRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="menu" element={<BranchMenuPage />} />
            <Route path="orders" element={<Orders />} />
            <Route path="incoming-orders" element={<IncomingOrders />} />
            <Route path="on-delivery" element={<OnDeliveryOrders />} />
            <Route path="settings" element={<BranchSettingsPage />} />
          </Route>

          <Route path='/items/add' element={
            <ProtectedRoute>
              <AddItemPage/>
            </ProtectedRoute>
          }/>

          <Route path='/admin/branch-requests' element={
            <AdminRoute>
              <BranchRequestsPage />
            </AdminRoute>
          }/>
        </Routes>
      </BrowserRouter>
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
