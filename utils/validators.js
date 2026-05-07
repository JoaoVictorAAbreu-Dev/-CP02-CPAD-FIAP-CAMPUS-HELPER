export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (pwd) => pwd.length >= 6;

export const validateName = (name) => name.trim().length >= 2;

export const validateRequired = (value) =>
  value !== null && value !== undefined && String(value).trim().length > 0;
