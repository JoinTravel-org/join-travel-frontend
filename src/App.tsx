import CssBaseline from '@mui/material/CssBaseline'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'

function App() {
  return (
    <CustomThemeProvider>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onSwitchToRegister={() => {}} />} />
          <Route path="/register" element={<Register onSwitchToLogin={() => {}} />} />
        </Routes>
      </Router>
    </CustomThemeProvider>
  )
}

export default App
