// src/features/auth/components/OTPVerification.js
import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOTP, resendOTP } from '../../../services/auth/api';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
`;

const FormContainer = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 16px;
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 10px;
  border: 2px solid #cdcdcd;
  border-radius: 12px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #0056b3;
  }
`;

const Button = styled.button`
  padding: 10px;
  background-color: #0056b3;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin: 8px 0;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.3s;
  &:hover {
    background-color: #004494;
  }
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const Title = styled.h2`
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  text-align: center;
`;

const ResendLink = styled.span`
  color: #0056b3;
  text-decoration: underline;
  cursor: pointer;
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
  display: block;
  &:disabled {
    color: #cccccc;
    cursor: not-allowed;
  }
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

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from location state or sessionStorage
  const email = location.state?.email || sessionStorage.getItem('pendingAuthEmail');
  const authType = location.state?.authType || sessionStorage.getItem('pendingAuthType') || 'regular';
  const redirectPath = location.state?.redirectPath || '/workspace';
  
  // Store email and auth type in sessionStorage if coming from location state
  if (location.state?.email && !sessionStorage.getItem('pendingAuthEmail')) {
    sessionStorage.setItem('pendingAuthEmail', location.state.email);
  }
  
  if (location.state?.authType && !sessionStorage.getItem('pendingAuthType')) {
    sessionStorage.setItem('pendingAuthType', location.state.authType);
  }

  const handleChange = useCallback((e) => {
    setOtp(e.target.value);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('OTP is required');
      return;
    }
    
    if (!email) {
      toast.error('Email information is missing. Please try logging in again.');
      navigate('/login');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await verifyOTP({ otp, email });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        
        // Clean up session storage
        sessionStorage.removeItem('pendingAuthEmail');
        sessionStorage.removeItem('pendingAuthType');
        
        setTimeout(() => {
          setIsLoading(false);
          login(response);
          navigate(redirectPath);
        }, 1000);
        
        toast.success('Login successful!');
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'OTP verification failed. Please try again.';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error('Email information is missing. Please try logging in again.');
      navigate('/login');
      return;
    }
    
    setIsResending(true);
    try {
      await resendOTP(email);
      toast.success('New OTP sent successfully');
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCancel = () => {
    // Clean up session storage
    sessionStorage.removeItem('pendingAuthEmail');
    sessionStorage.removeItem('pendingAuthType');
    navigate('/login');
  };

  return (
    <Container>
      <FormContainer>
        <Title>Verify OTP</Title>
        <Subtitle>
          We've sent a verification code to {email || 'your email'}. 
          Please enter it below to continue.
        </Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <Input 
            type="text" 
            placeholder="Enter OTP" 
            value={otp} 
            onChange={handleChange} 
            required 
          />
          <Button type="submit" disabled={isLoading || !otp}>
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </Form>
        
        <ResendLink 
          onClick={handleResendOTP} 
          disabled={isResending}
        >
          {isResending ? 'Sending...' : 'Resend OTP'}
        </ResendLink>
        
        <Button 
          onClick={handleCancel} 
          style={{ 
            backgroundColor: 'transparent', 
            color: '#666', 
            border: '1px solid #cdcdcd',
            marginTop: '20px'
          }}
        >
          Cancel
        </Button>
      </FormContainer>
      
      {(isLoading || isResending) && (
        <LoadingOverlay>
          <SlidingSquares>
            <div className="square"></div>
            <div className="square"></div>
            <div className="square"></div>
            <div className="square"></div>
          </SlidingSquares>
        </LoadingOverlay>
      )}
    </Container>
  );
};

export default OTPVerification;
