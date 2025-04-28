import React from 'react';
import styled, { css } from 'styled-components';

const ButtonStyles = css`
  display: inline-block;
  padding: ${props => props.size === 'small' ? '8px 16px' : props.size === 'large' ? '12px 24px' : '10px 20px'};
  font-size: ${props => props.size === 'small' ? '0.9rem' : props.size === 'large' ? '1.1rem' : '1rem'};
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  border: none;
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  ${props => props.variant === 'primary' && css`
    background-color: #e94560;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #ff6b81;
    }
  `}
  
  ${props => props.variant === 'secondary' && css`
    background-color: transparent;
    color: white;
    border: 1px solid #333;
    
    &:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `}
  
  ${props => props.variant === 'outline' && css`
    background-color: transparent;
    color: #e94560;
    border: 1px solid #e94560;
    
    &:hover:not(:disabled) {
      background-color: rgba(233, 69, 96, 0.1);
    }
  `}
  
  ${props => props.fullWidth && css`
    display: block;
    width: 100%;
  `}
`;

const StyledButton = styled.button`${ButtonStyles}`;
const StyledLink = styled.a`${ButtonStyles}`;

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  fullWidth = false, 
  href, 
  type = 'button',
  onClick,
  ...props 
}) => {
  if (href) {
    return (
      <StyledLink
        href={href}
        variant={variant}
        size={size}
        disabled={disabled}
        fullWidth={fullWidth}
        {...props}
      >
        {children}
      </StyledLink>
    );
  }
  
  return (
    <StyledButton
      type={type}
      variant={variant}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      onClick={onClick}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;