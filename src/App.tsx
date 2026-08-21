import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { AcessibilidadeProvider } from './hooks/useAcessibilidade'
import { RotaProtegida } from './components/RotaProtegida'
import { BottomNav } from './components/BottomNav'
import { MicButton } from './components/MicButton'
import { Entrar } from './screens/Entrar'
import { Inicio } from './screens/Inicio'
import { Exames } from './screens/Exames'
import { Remedios } from './screens/Remedios'
import { Familia } from './screens/Familia'

function Shell() {
  const location = useLocation()
  const { session } = useAuth()
  const mostrarChrome = session && location.pathname !== '/entrar'

  return (
    <>
      <Routes>
        <Route path="/entrar" element={<Entrar />} />
        <Route
          path="/"
          element={
            <RotaProtegida>
              <Inicio />
            </RotaProtegida>
          }
        />
        <Route
          path="/exames"
          element={
            <RotaProtegida>
              <Exames />
            </RotaProtegida>
          }
        />
        <Route
          path="/remedios"
          element={
            <RotaProtegida>
              <Remedios />
            </RotaProtegida>
          }
        />
        <Route
          path="/familia"
          element={
            <RotaProtegida>
              <Familia />
            </RotaProtegida>
          }
        />
      </Routes>
      {mostrarChrome && (
        <>
          <MicButton />
          <BottomNav />
        </>
      )}
    </>
  )
}

function App() {
  return (
    <AcessibilidadeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </AuthProvider>
    </AcessibilidadeProvider>
  )
}

export default App
