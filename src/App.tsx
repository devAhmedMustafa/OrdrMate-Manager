import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginPage from './features/auth/Login.page'
import './App.css'
import { AuthProvider } from './features/auth/Auth.context'
import ProtectedRoute from './features/auth/ProtectedRoute'

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
