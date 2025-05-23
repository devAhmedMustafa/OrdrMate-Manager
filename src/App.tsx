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
import ItemDetailPage from './features/items/ItemDetail.page'
import SettingsPage from './features/dashboard/components/Settings.page'
import BranchRequestsPage from './features/admin/BranchRequests.page'
import TablesPage from './features/tables/Tables.page'

function App() {

  return (
    <AuthProvider>
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
            <Route index element={<div>Branch Dashboard Home</div>} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="menu/:id" element={<ItemDetailPage />} />
            <Route path="orders" element={<div>Branch Orders</div>} />
            <Route path="tables" element={<TablesPage />} />
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
    </AuthProvider>
  )
}

export default App
