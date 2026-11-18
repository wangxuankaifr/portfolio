import React from 'react'
import { createRoot } from 'react-dom/client'
import MobileDemo from './MobileDemo'

createRoot(document.getElementById('mobile-root')).render(<React.StrictMode><MobileDemo/></React.StrictMode>)
