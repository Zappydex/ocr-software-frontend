import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { registerWithGoogle } from '../../../services/auth/api';
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
  width: 350px;
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
  margin-bottom: 15px;
  padding: 12px;
  border: 2px solid #cdcdcd;
  border-radius: 12px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #0056b3;
  }
`;

const Select = styled.select`
  margin-bottom: 15px;
  padding: 12px;
  border: 2px solid #cdcdcd;
  border-radius: 12px;
  font-size: 14px;
  background-color: white;
  &:focus {
    outline: none;
    border-color: #0056b3;
  }
`;

const Button = styled.button`
  padding: 12px;
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

const Title = styled.h2`
  color: #333;
  margin-bottom: 20px;
  font-weight: 600;
  text-align: center;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
`;

const Label = styled.label`
  font-size: 14px;
  color: #555;
  margin-bottom: 5px;
  font-weight: 500;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 16px;
  width: 350px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
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

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const Step = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#0056b3' : '#e9ecef'};
  color: ${props => props.active ? 'white' : '#6c757d'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 5px;
  font-weight: 600;
  font-size: 14px;
`;

const CompleteRegistration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    organization: '',
    role: ''
  });
  
  useEffect(() => {
    let googleData;
    try {
      googleData = location.state || JSON.parse(sessionStorage.getItem('googleAuthData') || '{}');
    } catch (error) {
      googleData = {};
    }
    
    if (googleData.suggestedUsername) {
      setFormData(prev => ({
        ...prev,
        username: googleData.suggestedUsername
      }));
    }
    
    if (!googleData.email || !googleData.idToken) {
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
  
  const handleInitialSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error('Username and password are required');
      return;
    }
    
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    setShowModal(true);
  };
  
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let googleData;
      try {
        googleData = location.state || JSON.parse(sessionStorage.getItem('googleAuthData') || '{}');
      } catch (error) {
        googleData = {};
      }
      
      if (!googleData.idToken) {
        toast.error('Authentication token missing or expired. Please try again.');
        navigate('/login');
        return;
      }
      
      sessionStorage.removeItem('googleAuthToken');
      
      const response = await registerWithGoogle(googleData.idToken, formData);
      
      if (response.requires_otp || response.message?.includes('OTP sent')) {
        sessionStorage.setItem('pendingAuthEmail', response.email);
        sessionStorage.setItem('pendingAuthType', 'google');
        
        sessionStorage.removeItem('googleAuthData');
        
        toast.success('OTP sent to your email');
        
        navigate('/verify-otp', { 
          state: { 
            email: response.email, 
            authType: 'google',
            redirectPath: '/workspace'
          } 
        });
      } else if (response.token) {
        localStorage.setItem('token', response.token);
        
        sessionStorage.removeItem('googleAuthData');
        
        login(response);
        toast.success('Registration completed successfully!');
        navigate('/workspace');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.error || error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Container>
      <FormContainer>
        <StepIndicator>
          <Step active={true}>1</Step>
          <Step active={false}>2</Step>
        </StepIndicator>
        
        <Title>Complete Your Registration</Title>
        <Subtitle>Please create a username and password to continue</Subtitle>
        
        <Form onSubmit={handleInitialSubmit}>
          <Label htmlFor="username">Username</Label>
          <Input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username"
            required
          />
          
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            required
          />
          
          <Button type="submit">Continue</Button>
        </Form>
      </FormContainer>
      
      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <StepIndicator>
              <Step active={false}>1</Step>
              <Step active={true}>2</Step>
            </StepIndicator>
            
            <Title>Additional Information</Title>
            <Subtitle>Please provide your organization and role</Subtitle>
            
            <Form onSubmit={handleFinalSubmit}>
              <Label htmlFor="organization">Organization</Label>
              <Input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="Your organization name"
              />
              
              <Label htmlFor="role">Role</Label>
              <Select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="">Select your role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </Select>
              
              <Button type="submit">Complete Registration</Button>
            </Form>
          </ModalContent>
        </ModalOverlay>
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
    </Container>
  );
};

export default CompleteRegistration;
