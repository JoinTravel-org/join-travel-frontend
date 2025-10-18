import { useEffect, useState } from 'react'
import axios from 'axios'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Box } from '@mui/material'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Logger from './logger'
import BACKEND_URL from './shared'
import theme from './theme'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'

function App() {
  const logger = Logger.getInstance();
  const [backendStatus, setBackendStatus] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        logger.info('Fetching server status...');
        const response = await axios.get(BACKEND_URL);
        setBackendStatus(`${response.status} ${response.statusText} ${JSON.stringify(response.data)}`);
        logger.info(`Server status fetched successfully: ${response.data.status}`);
      } catch (error) {
        logger.error('Error fetching server status', error);
        setBackendStatus('error');
      }
    };

    fetchStatus();
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onSwitchToRegister={() => {}} />} />
          <Route path="/register" element={<Register onSwitchToLogin={() => {}} />} />
        </Routes>

        {/* Debug info - can be removed in production */}
        <Box sx={{ position: 'fixed', bottom: 0, right: 0, p: 1, opacity: 0.7, fontSize: '0.75rem', backgroundColor: 'background.paper' }}>
          <div>
            <a href="https://vite.dev" target="_blank">
              <img src={viteLogo} style={{ height: '1rem', marginRight: '0.25rem' }} alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} style={{ height: '1rem' }} alt="React logo" />
            </a>
          </div>
          <p style={{ margin: '0.25rem 0' }}>
            {backendStatus === null ? `Backend (${BACKEND_URL}) off` : `Backend (${BACKEND_URL}) status: ${backendStatus}`}
          </p>
        </Box>
      </Router>
    </ThemeProvider>
  )
}

export default App
