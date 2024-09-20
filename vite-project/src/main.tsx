import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import fib from 'virtual:fib'
import env from 'virtual:env'

alert(fib(10))
console.log('eeeenv', env)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
