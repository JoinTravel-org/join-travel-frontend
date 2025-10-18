import { useEffect, useState } from 'react'
import axios from 'axios'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Logger from './logger'
import BACKEND_URL from './shared'

function App() {
  const logger = Logger.getInstance();
  const [count, setCount] = useState(0)
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
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + TS</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <div className="card">
        <p>
          Trying out deploy pipeline 3
        </p>
        <p>
          {backendStatus === null ? `Backend (${BACKEND_URL}) off` : `Backend (${BACKEND_URL}) status: ${backendStatus}`}
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
