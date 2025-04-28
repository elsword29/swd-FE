import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: ${props => props.fullScreen ? '100vh' : 'auto'};
  padding: ${props => props.fullScreen ? '0' : '2rem'};
`;

const Spinner = styled.div`
  width: ${props => props.size === 'small' ? '30px' : props.size === 'large' ? '80px' : '50px'};
  height: ${props => props.size === 'small' ? '30px' : props.size === 'large' ? '80px' : '50px'};
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #e94560;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 1rem;
`;

const LoadingText = styled.p`
  color: #a0a0a0;
  font-size: ${props => props.size === 'small' ? '0.9rem' : props.size === 'large' ? '1.2rem' : '1rem'};
  margin: 0;
`;

const Loading = ({ 
  text = 'Đang tải...', 
  fullScreen = false, 
  size = 'medium',
  showText = true
}) => {
  return (
    <LoadingContainer fullScreen={fullScreen}>
      <Spinner size={size} />
      {showText && <LoadingText size={size}>{text}</LoadingText>}
    </LoadingContainer>
  );
};

export default Loading;