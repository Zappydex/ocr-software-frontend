// src/features/auth/components/SocialLogin.js
import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginWithGoogle } from '../../../services/auth/api';
import { useAuth } from '../../../context/AuthContext';
import styled from 'styled-components';

const SocialLoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 0;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
`;

const SlidingSquares = styled.div`
  width: 50px;
  height: 50px;
  position: relative;
  
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

const SocialLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const response = await loginWithGoogle(credentialResponse.credential);
      
      // Check if OTP is required
      if (response.requires_otp || response.message?.includes('OTP sent')) {
        // Store email for OTP verification
        const email = response.email;
        sessionStorage.setItem('pendingAuthEmail', email);
        sessionStorage.setItem('pendingAuthType', 'google');
        
        // Navigate to OTP verification page
        navigate('/verify-otp', { 
          state: { 
            email, 
            authType: 'google',
            redirectPath: '/workspace'
          } 
        });
        
        toast.success('OTP sent to your email and phone (if available)');
      } else if (response.needs_additional_info) {
        // Navigate to Google auth callback for additional registration
        navigate('/auth/google', { 
          state: { 
            idToken: credentialResponse.credential,
            email: response.email,
            suggestedUsername: response.suggested_username
          } 
        });
      } else if (response.token) {
        // Direct login if token is provided
        localStorage.setItem('token', response.token);
        login(response);
        navigate('/workspace');
        toast.success('Google login successful!');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SocialLoginContainer>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            console.error('Google Login Failed');
            toast.error('Google Login Failed');
          }}
        />
      </SocialLoginContainer>
      
      {isLoading && (
        <LoadingOverlay>
          <SlidingSquares>
            <div className="square"></div>
            <div className="square"></div>
            <div className="square"></div>
            <div className="square"></div>
          </SlidingSquares>
        </LoadingOverlay>
      )}
    </>
  );
};

export default SocialLogin;
