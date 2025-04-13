import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../../../services/auth/api';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
`;

const ErrorContainer = styled.div`
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #b91c1c;
  padding: 16px;
  border-radius: 8px;
  max-width: 500px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #0056b3;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 16px;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.3s;
  &:hover {
    background-color: #004494;
  }
`;

const LoadingOverlay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SlidingSquares = styled.div`
  width: 50px;
  height: 50px;
  position: relative;
  margin-bottom: 20px;
  
  .square {
    background-color: #0056b3;
    width: 13px;
    height: 13px;
    position: absolute;
    top: 0;
    left: 0;
    animation: slide 1s infinite;
  }
  
  .square:nth-child(1) { animation-delay: 0s; }
  .square:nth-child(2) { animation-delay: 0.1s; }
  .square:nth-child(3) { animation-delay: 0.2s; }
  .square:nth-child(4) { animation-delay: 0.3s; }
  
  @keyframes slide {
    0% { transform: translate(0, 0); }
    25% { transform: translate(37px, 0); }
    50% { transform: translate(37px, 37px); }
    75% { transform: translate(0, 37px); }
    100% { transform: translate(0, 0); }
  }
`;

const GoogleAuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const processGoogleAuth = async () => {
      try {
        // Log full URL for debugging
        console.log('Full URL:', window.location.href);
        console.log('Search params:', window.location.search);
        console.log('Location state:', location.state);
        
        // Extract ID token from URL query parameters or location state
        const urlParams = new URLSearchParams(window.location.search);
        const idToken = urlParams.get('id_token');
        const stateToken = location.state?.idToken;
        const finalToken = idToken || stateToken;
        
        console.log("ID Token from URL:", idToken ? `${idToken.substring(0, 10)}...` : "Not found");
        console.log("ID Token from state:", stateToken ? `${stateToken.substring(0, 10)}...` : "Not found");
        console.log("Final token used:", finalToken ? `${finalToken.substring(0, 10)}...` : "Not found");
        
        if (!finalToken) {
          setError('No authentication token found. Please try again.');
          setLoading(false);
          return;
        }
        
        // Process the token with backend using the API service
        console.log("Sending token to backend...");
        const response = await loginWithGoogle(finalToken);
        console.log("Backend response:", response);
        
        // Clear the token from URL for security
        window.history.replaceState({}, document.title, '/auth/google');
        
        // Handle different response scenarios
        if (response.needs_additional_info) {
          // Store data for registration form
          sessionStorage.setItem('googleAuthData', JSON.stringify({
            idToken: finalToken,
            email: response.email,
            googleId: response.google_id,
            suggestedUsername: response.suggested_username
          }));
          
          toast.info('Please complete your registration with a username and password');
          
          // Navigate to registration completion page
          navigate('/complete-registration', { 
            state: { 
              email: response.email,
              suggestedUsername: response.suggested_username,
              googleAuth: true
            }
          });
          
        } else if (response.requires_otp || response.message?.includes('OTP sent')) {
          // Store email for OTP verification
          sessionStorage.setItem('pendingAuthEmail', response.email);
          sessionStorage.setItem('pendingAuthType', 'google');
          
          toast.success('OTP sent to your email');
          
          // Navigate to OTP verification page
          navigate('/verify-otp', { 
            state: { 
              email: response.email, 
              authType: 'google',
              redirectPath: '/workspace'
            } 
          });
          
        } else if (response.token) {
          // Successfully authenticated with token
          localStorage.setItem('token', response.token);
          login(response);
          toast.success('Successfully logged in!');
          navigate('/workspace');
        } else {
          // Default success case
          toast.success('Successfully authenticated!');
          navigate('/workspace');
        }
      } catch (error) {
        console.error('Google auth error:', error);
        const errorMessage = error.response?.data?.error || error.message || 'Authentication failed';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    processGoogleAuth();
  }, [location, navigate, login]);

  if (loading) return (
    <Container>
      <LoadingOverlay>
        <SlidingSquares>
          <div className="square"></div>
          <div className="square"></div>
          <div className="square"></div>
          <div className="square"></div>
        </SlidingSquares>
        <p>Processing authentication...</p>
      </LoadingOverlay>
    </Container>
  );
  
  if (error) return (
    <Container>
      <ErrorContainer>
        <p>Error: {error}</p>
        <Button onClick={() => navigate('/login')}>
          Return to Login
        </Button>
      </ErrorContainer>
    </Container>
  );
  
  return (
    <Container>
      <p>Redirecting to workspace...</p>
    </Container>
  );
};

export default GoogleAuthCallback;
