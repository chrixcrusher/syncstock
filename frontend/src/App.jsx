import * as React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider'; // Adjust the import path as necessary
import api from './api/api';
import useAuthAxios from './hooks/useAuthAxios';
import Dashboard from './components/primary/Dashboard'; // Adjust the import path as necessary
import PublicRoute from './components/rerouter/PublicRoute';
import PrivateRoute from './components/rerouter/PrivateRoute';
import SignIn from './components/publicroutes/SignIn';
import SignUp from './components/publicroutes/SignUp';
import CompanyRegistration from './components/publicroutes/CompanyRegistration';
import Inventory from './components/pages/inventory/Inventory';
import CurrentInventory from './components/pages/current-inventory/CurrentInventory';
import Adjustments from './components/pages/adjustment/Adjustments';
import Transfer from './components/pages/transfer/Transfer';
import Analytics from './components/pages/analytics/Analytics.jsx';
import Category from './components/pages/category/Category';
import Location from './components/pages/location/Location';
import Settings from './components/pages/settings/Settings';
import PageNotFound from './components/pages/pagenotfound/PageNotFound';
import LandingPage from './components/primary/LandingPage.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute restricted />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/register-company" element={<CompanyRegistration />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />}>
              <Route path="inventory" element={<Inventory />} />
              <Route path="current-inventory" element={<CurrentInventory />} />
              <Route path="adjustments" element={<Adjustments />} />
              <Route path="transfer" element={<Transfer />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="category" element={<Category />} />
              <Route path="location" element={<Location />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* 404 Not Found Route */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
