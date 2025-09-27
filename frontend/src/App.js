import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Web3Provider } from './context/Web3ContextSepolia';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import TokenManagement from './pages/TokenManagement';
import LeaseManagement from './pages/LeaseManagement';
import ComplianceManagement from './pages/ComplianceManagement';
import PropertyDetails from './pages/PropertyDetails';

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen">
          <Navbar />
          <main className="container py-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tokens" element={<TokenManagement />} />
              <Route path="/leases" element={<LeaseManagement />} />
              <Route path="/compliance" element={<ComplianceManagement />} />
              <Route path="/property" element={<PropertyDetails />} />
            </Routes>
          </main>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;
