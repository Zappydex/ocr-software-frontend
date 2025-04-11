import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginWithGoogle, registerWithGoogle, verifyOTP } from '../../../services/auth/api';
import { useAuth } from '../../../context/AuthContext';
import styled from 'styled-components';

// Use the same styled components as in your Register component
const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
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

const Select = styled.select`
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
`;

const BackButton = styled(Button)`
  background-color: white;
  color: #0056b3;
  border: 2px solid #0056b3;
`;

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

const StepTwoModal = styled(ModalBackground)`
  z-index: 1002;
`;

const StepTwoContainer = styled(ModalContent)`
  width: 300px;
`;

const OtpModal = styled(ModalBackground)`
  z-index: 1003;
`;

const OtpContainer = styled(ModalContent)`
  width: 300px;
`;

const Title = styled.h3`
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
`;

const SocialLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showOrgRoleModal, setShowOrgRoleModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [googleToken, setGoogleToken] = useState('');
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    organization: '',
    role: 'user'
  });
  const [otpCode, setOtpCode] = useState('');
  const [email, setEmail] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Check for id_token in URL (for Google callback)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idToken = params.get('id_token');
    
    if (idToken) {
      setGoogleToken(idToken);
      handleGoogleToken(idToken);
    }
  }, [location]);

  const handleGoogleToken = async (token) => {
    setIsLoading(true);
    try {
      const response = await loginWithGoogle(token);
      
      if (response.requires_otp) {
        setEmail(response.email);
        setShowOtpModal(true);
        toast.info('Please enter the verification code sent to your email');
      } else if (response.needs_additional_info) {
        setUserData({
          ...userData,
          username: response.suggested_username || ''
        });
        setEmail(response.email);
        setShowRegistrationModal(true);
        toast.info('Please complete your registration');
      } else if (response.token) {
        login(response);
        toast.success('Google login successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google token processing error:', error);
      toast.error('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    setGoogleToken(credentialResponse.credential);
    handleGoogleToken(credentialResponse.credential);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleContinueToOrgRole = (e) => {
    e.preventDefault();
    setShowRegistrationModal(false);
    setShowOrgRoleModal(true);
  };

  const handleBack = () => {
    setShowOrgRoleModal(false);
    setShowRegistrationModal(true);
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await registerWithGoogle(googleToken, {
        username: userData.username,
        password: userData.password,
        organization: userData.organization,
        role: userData.role,
        completing_registration: true
      });
      
      if (response.requires_otp) {
        setShowOrgRoleModal(false);
        setShowOtpModal(true);
        toast.success('Account created! Please verify with the code sent to your email');
      } else if (response.token) {
        login(response);
        toast.success('Registration successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await verifyOTP({
        email: email,
        otp: otpCode
      });
      
      login(response);
      toast.success('Verification successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Verification failed. Please check your code and try again.');
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
      
      {/* Step 1: Username and Password Modal */}
      {showRegistrationModal && (
        <ModalBackground>
          <ModalContent>
            <Title>Complete Registration</Title>
            <Form onSubmit={handleContinueToOrgRole}>
              <Input
                type="text"
                name="username"
                placeholder="Username"
                value={userData.username}
                onChange={handleInputChange}
                required
              />
              <Input
                type="password"
                name="password"
                placeholder="Create a password"
                value={userData.password}
                onChange={handleInputChange}
                required
              />
              <Button type="submit">Continue</Button>
            </Form>
          </ModalContent>
        </ModalBackground>
      )}
      
      {/* Step 2: Organization and Role Modal */}
      {showOrgRoleModal && (
        <StepTwoModal>
          <StepTwoContainer>
            <Title>Organization Details</Title>
            <Form onSubmit={handleRegistrationSubmit}>
              <Input
                type="text"
                name="organization"
                placeholder="Organization"
                value={userData.organization}
                onChange={handleInputChange}
                required
              />
              <Select
                name="role"
                value={userData.role}
                onChange={handleInputChange}
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
              </Select>
              <Button type="submit">Register</Button>
              <BackButton type="button" onClick={handleBack}>Back</BackButton>
            </Form>
          </StepTwoContainer>
        </StepTwoModal>
      )}
      
      {/* OTP Verification Modal */}
      {showOtpModal && (
        <OtpModal>
          <OtpContainer>
            <Title>Verification Required</Title>
            <Form onSubmit={handleOtpSubmit}>
              <Input
                type="text"
                placeholder="Enter verification code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
              />
              <Button type="submit">Verify</Button>
            </Form>
          </OtpContainer>
        </OtpModal>
      )}
      
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
