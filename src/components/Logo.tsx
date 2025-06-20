
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <img 
      src="/lovable-uploads/5f55ff69-a65d-45fa-b743-8be28fec7025.png" 
      alt="ICTasks Logo" 
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};
