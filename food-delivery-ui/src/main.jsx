import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import SplashScreen from './SplashScreen.jsx'
import './index.css'

function Root() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}
      {/* Mount App immediately but hidden so it is ready when splash exits */}
      <div style={{ visibility: splashDone ? 'visible' : 'hidden' }}>
        <App />
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
