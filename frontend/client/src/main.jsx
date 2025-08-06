import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './Context/authContext.jsx'
import { CampaignProvider } from './Context/campaignContext.jsx'

createRoot(document.getElementById('root')).render(

  <StrictMode>
    <AuthProvider>
      <CampaignProvider>
       
      

           <App />
      </CampaignProvider>
    </AuthProvider>
    
  </StrictMode>,
)
