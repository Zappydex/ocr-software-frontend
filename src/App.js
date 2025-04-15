// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GoogleAuthCallback from './features/auth/components/GoogleAuthCallback';
import CompleteRegistration from './features/auth/components/CompleteRegistration';
import OTPVerification from './features/auth/components/OTPVerification';

// Context
import { AuthProvider } from './context/AuthContext';

// Auth Components
import Login from './features/auth/components/login';
import Register from './features/auth/components/register';
import AccountActivation from './features/auth/components/AccountActivation';
import PasswordReset from './features/auth/components/PasswordReset';
import ResetPasswordConfirm from './features/auth/components/ResetPasswordConfirm';
import Logout from './features/auth/components/logout';
import Home from './features/home/components/Home';
import Workspace from './features/workspace/components/Workspace';

// Debug Component
import DebugScreen from './components/DebugScreen';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Home Route */}
            <Route path="/" element={<Home />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/activate/:uidb64/:token/:user_id" element={<AccountActivation />} />
            <Route path="/activate/:uidb64/:token/:user_id/" element={<AccountActivation />} />
            
            <Route path="/auth/google" element={<GoogleAuthCallback />} />
            <Route path="/complete-registration" element={<CompleteRegistration />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/password-reset/:uidb64/:token" element={<ResetPasswordConfirm />} />
            <Route path="/api/accounts/password-reset/:uidb64/:token" element={<ResetPasswordConfirm />} />
            <Route path="/logout" element={<Logout />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Navigate to="/workspace" />
              </ProtectedRoute>
            } />
            
            {/* Workspace Route */}
            <Route path="/workspace" element={
              <ProtectedRoute>
                <Workspace />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          
          {/* Debug Screen - will capture all errors across the app */}
          <DebugScreen />
        </Router>
        <ToastContainer position="top-right" autoClose={5000} />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
