import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginPage from './features/auth/Login.page'
import './App.css'
import { AuthProvider } from './features/auth/Auth.context'
import ProtectedRoute from './features/auth/ProtectedRoute'
import AddItemPage from './features/items/AddItem.page'

function App() {

  return (
    <AuthProvider>
      <main>
        <BrowserRouter>
        <Routes>
          <Route path='/login' element={<LoginPage/>}/>
          <Route path='/' element={
            <ProtectedRoute>
              <HomeTest/>
            </ProtectedRoute>
            }/>
          <Route path='/items/add' element={
            <ProtectedRoute>
              <AddItemPage/>
            </ProtectedRoute>
          }/>
        </Routes>
        </BrowserRouter>
      </main>
    </AuthProvider>
  )
}

function HomeTest(){
  return <div>Hello</div>
}

export default App
