// Переиспользуемый компонент текстового инпута с валидацией

import React from 'react';
import styles from './FormInput.module.css';

interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  type?: 'text' | 'email' | 'number';
  maxLength?: number;
  autoComplete?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  type = 'text',
  maxLength,
  autoComplete,
}) => {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <span id={`${name}-error`} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormInput;
