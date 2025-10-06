// Переиспользуемый компонент select с валидацией

import React from 'react';
import styles from './FormSelect.module.css';

interface FormSelectProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (value: string) => void;
  options: Array<{ value: string | number; label: string }>;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  placeholder = 'Выберите...',
  required = false,
  disabled = false,
}) => {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <select
        id={name}
        name={name}
        className={`${styles.select} ${error ? styles.selectError : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${name}-error`} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormSelect;
