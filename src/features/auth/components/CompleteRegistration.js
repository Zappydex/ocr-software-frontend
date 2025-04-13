// src/features/auth/components/CompleteRegistration.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { registerWithGoogle } from '../../../services/auth/api';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

const CompleteRegistration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    organization: '',
    role: ''
  });
  
  useEffect(() => {
    // Get data from location state or sessionStorage
    const googleData = location.state || JSON.parse(sessionStorage.getItem('googleAuthData') || '{}');
    
    if (googleData.suggestedUsername) {
      setFormData(prev => ({
        ...prev,
        username: googleData.suggestedUsername
      }));
    }
    
    if (!googleData.email) {
      toast.error('Missing registration data');
      navigate('/login');
    }
  }, [location, navigate]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const googleData = location.state || JSON.parse(sessionStorage.getItem('googleAuthData') || '{}');
      const response = await registerWithGoogle(googleData.idToken, formData);
      
      if (response.token) {
        login(response);
        toast.success('Registration completed successfully!');
        navigate('/workspace');
      } else if (response.requires_otp) {
        sessionStorage.setItem('pendingAuthEmail', response.email);
        sessionStorage.setItem('pendingAuthType', 'google');
        navigate('/verify-otp', { 
          state: { 
            email: response.email, 
            authType: 'google',
            redirectPath: '/workspace'
          } 
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    }
  };
  
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Complete Your Registration</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="organization" className="form-label">Organization (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Role (Optional)</label>
                  <select
                    className="form-select"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="">Select role</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="user">User</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100">Complete Registration</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteRegistration;
