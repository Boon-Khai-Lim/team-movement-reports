import React from 'react'
import { createRoot } from 'react-dom/client'
import Home from '@/routes/index'
import { AuthGate } from '@/components/auth-gate'

import './styles.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthGate>{onSignOut => <Home onSignOut={onSignOut} />}</AuthGate>
  </React.StrictMode>,
)
