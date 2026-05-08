export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (pwd) => pwd.length >= 6;

export const validateName = (name) =>
  /^[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\s'-]{2,}$/.test(name.trim());

export const validateRM = (rm) => /^\d+$/.test(String(rm).trim());

export const validateRequired = (value) =>
  value !== null && value !== undefined && String(value).trim().length > 0;
