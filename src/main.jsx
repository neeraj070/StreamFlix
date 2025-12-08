import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { SearchHistoryProvider } from './context/SearchHistoryContext'
import { RecentlyViewedProvider } from './context/RecentlyViewedContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <SearchHistoryProvider>
          <RecentlyViewedProvider>
            <AuthProvider>
              <App />
            <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
            </AuthProvider>
          </RecentlyViewedProvider>
        </SearchHistoryProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

