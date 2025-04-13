import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      console.log("Google credential received:", credentialResponse.credential ? 
        `${credentialResponse.credential.substring(0, 10)}...` : "None");
      
      // Store the token in sessionStorage for the callback component to use
      sessionStorage.setItem('googleAuthToken', credentialResponse.credential);
      
      // Navigate to callback page
      navigate('/auth/google');
      
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
          onError={(error) => {
            console.error('Google Login Failed:', error);
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
