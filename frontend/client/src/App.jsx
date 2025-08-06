import React from 'react'
import { AuthProvider } from './Context/authContext'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './Pages/Login'
import Dashboard from './Pages/Dashboard'
import CampaignDetail from './component/Campaign/CampaignDetails'
import CampaignForm from './Component/Campaign/CampaignForm'  // Add this import
import CampaignListing from './Component/Campaign/CampaignList.jsx'
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
   <AuthProvider>
    <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path='/dashboard' element={<Dashboard />} />
          {/* Add the create route BEFORE the parameterized route */}
          <Route path="/campaigns/create" element={<CampaignForm />} />
          <Route path="/campaigns/:campaignId" element={<CampaignDetail />} />
          <Route path="/campaigns" element={<CampaignListing />} />
          {/* Add other routes here */}
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
