import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import theme from './theme'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onSwitchToRegister={() => {}} />} />
          <Route path="/register" element={<Register onSwitchToLogin={() => {}} />} />
        </Routes>

      </Router>
    </ThemeProvider>
  )
}

export default App
