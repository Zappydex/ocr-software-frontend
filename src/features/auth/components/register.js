import React, { useState } from 'react';
import styled from 'styled-components';
import { registerUser } from '../../../services/auth/api';
import Login from './login';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SocialLogin from './SocialLogin';

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

const Link = styled.a`
  color: #0056b3;
  text-decoration: none;
  margin: 8px 0;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    text-decoration: underline;
  }
`;

const Text = styled.p`
  font-size: 10px;
  color: #767676;
  text-align: center;
  margin: 8px 0;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 15px 0;
  width: 100%;
  
  &::before, &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #cdcdcd;
  }
  
  span {
    padding: 0 8px;
    color: #767676;
    font-size: 12px;
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
  z-index: 1003;
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

const StepTwoModal = styled(ModalBackground)`
  z-index: 1002;
`;

const StepTwoContainer = styled(ModalContent)`
  width: 300px;
`;

const BackButton = styled(Button)`
  background-color: white;
  color: #0056b3;
  border: 2px solid #0056b3;
`;

const SuccessMessage = styled.div`
  text-align: center;
  margin: 20px 0;
  
  h3 {
    color: #28a745;
    margin-bottom: 10px;
  }
  
  p {
    color: #666;
    font-size: 14px;
    line-height: 1.5;
  }
`;

const Register = ({ isOpen, onClose }) => {
  const initialFormState = {
    email: '',
    username: '',
    password1: '',
    password2: '',
    organization: '',
    role: 'user'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [step, setStep] = useState(1);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (formData.password1 !== formData.password2) {
      toast.error("Passwords don't match");
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await registerUser(formData);
      setRegistrationSuccess(true);
      setFormData(initialFormState); // Clear the form after successful registration
      setTimeout(() => {
        setIsLoading(false);
        if (onClose) onClose();
      }, 1000);
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate('/login');
    if (onClose) onClose();
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
  };

  return (
    <>
      {!isLoginOpen && (
        <Container>
          <FormContainer>
            {registrationSuccess ? (
              <SuccessMessage>
                <h3>Registration Successful!</h3>
                <p>Thank you for registering. We've sent an activation link to your email address.</p>
                <p>Please check your inbox and click the link to activate your account.</p>
                <Button onClick={handleLoginClick}>Go to Login</Button>
              </SuccessMessage>
            ) : (
              step === 1 && (
                <>
                  <Form onSubmit={handleContinue}>
                    <Input 
                      type="email" 
                      name="email"
                      placeholder="Email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      required 
                    />
                    <Input 
                      type="text" 
                      name="username"
                      placeholder="Username" 
                      value={formData.username} 
                      onChange={handleChange} 
                      required 
                    />
                    <Input 
                      type="password" 
                      name="password1"
                      placeholder="Create a password" 
                      value={formData.password1} 
                      onChange={handleChange} 
                      required 
                    />
                    <Input 
                      type="password" 
                      name="password2"
                      placeholder="Confirm password" 
                      value={formData.password2} 
                      onChange={handleChange} 
                      required 
                    />
                    <Button type="submit">Continue</Button>
                  </Form>
                  <Divider><span>OR</span></Divider>
                  <SocialLogin />
                  <Text>
                    Have an account? <Link onClick={handleLoginClick}>Log in</Link>
                  </Text>
                </>
              )
            )}
          </FormContainer>
        </Container>
      )}

      {step === 2 && !registrationSuccess && (
        <StepTwoModal>
          <StepTwoContainer>
            <Form onSubmit={handleSubmit}>
              <Input 
                type="text" 
                name="organization"
                placeholder="Organization" 
                value={formData.organization} 
                onChange={handleChange} 
                required 
              />
              <Select 
                name="role"
                value={formData.role} 
                onChange={handleChange} 
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

      {isLoginOpen && <Login isOpen={isLoginOpen} onClose={handleCloseLogin} />}
      
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

export default Register;
