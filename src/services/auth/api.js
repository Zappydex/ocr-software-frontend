import api from '../apiConfig';

// Authentication services
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/api/accounts/register/', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/api/accounts/login/', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post('/api/accounts/logout/');
    localStorage.removeItem('token');
    return response.data;
  } catch (error) {
    console.error('Logout error:', error.response?.data || error.message);
    throw error;
  }
};

// For backward compatibility with existing imports
export const logout = logoutUser;

// Account Activation
export const checkActivationToken = async (uidb64, token, user_id) => {
  try {
    const response = await api.get(`/activate/${uidb64}/${token}/${user_id}/`);
    console.log('Check token response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Activation token check error:', error);
    throw error;
  }
};

export const confirmAccountActivation = async (uidb64, token, user_id) => {
  try {
    const response = await api.post(`/activate/${uidb64}/${token}/${user_id}/`);
    return response.data;
  } catch (error) {
    console.error('Account activation error:', error.response?.data || error.message);
    throw error;
  }
};


export const resendActivationEmail = async (email) => {
  try {
    const response = await api.post('/api/accounts/resend-activation/', { email });
    return response.data;
  } catch (error) {
    console.error('Resend activation error:', error.response?.data || error.message);
    throw error;
  }
};

// Google Authentication
export const getGoogleAuthUrl = async () => {
  try {
    const response = await api.get('/api/accounts/google/login/');
    return response.data;
  } catch (error) {
    console.error('Google auth URL error:', error.response?.data || error.message);
    throw error;
  }
};

export const registerWithGoogle = async (idToken, userData = {}) => {
  try {
    const tokenHash = idToken.substring(0, 20);
    const processingKey = `processing_google_token_${tokenHash}`;
    
    if (sessionStorage.getItem(processingKey)) {
      console.log('Token already being processed for registration');
      return { message: 'Authentication in progress', requires_otp: true };
    }
    
    sessionStorage.setItem(processingKey, 'true');
    
    const requestData = { token: idToken };
    
    // Add registration data if provided
    if (userData && Object.keys(userData).length > 0) {
      requestData.completing_registration = true;
      requestData.username = userData.username;
      requestData.password = userData.password;
      requestData.organization = userData.organization;
      requestData.role = userData.role;
    }
    
    try {
      // Use the login endpoint for both login and registration
      const response = await api.post('/api/accounts/google/login/', requestData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } finally {
      // Remove processing flag after a delay
      setTimeout(() => {
        sessionStorage.removeItem(processingKey);
      }, 5000);
    }
  } catch (error) {
    console.error('Google registration error:', error.response?.data || error.message);
    throw error;
  }
};

export const loginWithGoogle = async (idToken) => {
  try {
    console.log('loginWithGoogle called at:', new Date().toISOString());
    
    // Create a unique key based on part of the token
    const tokenHash = idToken.substring(0, 20);
    const processingKey = `processing_google_token_${tokenHash}`;
    
    // Check if this token is already being processed
    if (sessionStorage.getItem(processingKey)) {
      console.log('Token already being processed, returning cached response');
      return { message: 'Authentication in progress', requires_otp: true };
    }
    
    // Mark this token as being processed
    sessionStorage.setItem(processingKey, 'true');
    
    try {
      const response = await api.post('/api/accounts/google/login/', { token: idToken });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } finally {
      // Remove processing flag after a delay
      setTimeout(() => {
        sessionStorage.removeItem(processingKey);
      }, 5000);
    }
  } catch (error) {
    console.error('Google login error:', error.response?.data || error.message);
    throw error;
  }
};

export const checkGoogleAuthStatus = async () => {
  try {
    const response = await api.get('/api/accounts/google/auth/');
    return response.data;
  } catch (error) {
    console.error('Google auth status error:', error.response?.data || error.message);
    throw error;
  }
};

// Password Reset
export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/api/accounts/request-reset-email/', { email });
    return response.data;
  } catch (error) {
    console.error('Password reset request error:', error.response?.data || error.message);
    throw error;
  }
};

export const checkPasswordResetToken = async (uidb64, token) => {
  try {
    const response = await api.get(`/api/accounts/password-reset/${uidb64}/${token}/`);
    return response.data;
  } catch (error) {
    console.error('Password reset token check error:', error.response?.data || error.message);
    throw error;
  }
};

export const resetPassword = async (passwordData) => {
  try {
    const response = await api.patch('/api/accounts/password-reset-complete/', passwordData);
    return response.data;
  } catch (error) {
    console.error('Password reset error:', error.response?.data || error.message);
    throw error;
  }
};

// OTP Verification
export const verifyOTP = async (otpData) => {
  try {
    const response = await api.post('/api/accounts/verify-otp/', otpData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('OTP verification error:', error.response?.data || error.message);
    throw error;
  }
};

export const resendOTP = async (email) => {
  try {
    const response = await api.post('/api/accounts/resend-otp/', { email });
    return response.data;
  } catch (error) {
    console.error('Resend OTP error:', error.response?.data || error.message);
    throw error;
  }
};

// User Profile
export const getUserProfile = async () => {
  try {
    const response = await api.get('/api/accounts/profile/');
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/api/accounts/profile/', profileData);
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error.response?.data || error.message);
    throw error;
  }
};
