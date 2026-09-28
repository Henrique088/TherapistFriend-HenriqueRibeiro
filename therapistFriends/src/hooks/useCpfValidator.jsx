// hooks/useCpfValidator.js

import { useState } from 'react';

export const useCpfValidator = () => {
  const [cpfError, setCpfError] = useState('');

  const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) {
      setCpfError('CPF deve ter 11 dígitos');
      return false;
    }
    
    if (/^(\d)\1{10}$/.test(cpf)) {
      setCpfError('CPF não pode ter todos os dígitos iguais');
      return false;
    }
    
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i-1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) {
      setCpfError('CPF inválido');
      return false;
    }
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i-1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) {
      setCpfError('CPF inválido');
      return false;
    }
    
    setCpfError('');
    return true;
  };

  return { cpfError, validateCPF };
};