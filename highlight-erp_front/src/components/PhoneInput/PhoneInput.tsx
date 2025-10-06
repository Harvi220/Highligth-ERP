// Переиспользуемый компонент инпута телефона с маской

import React, { useRef, useEffect } from 'react';
import { formatPhoneNumber, getPhonePlaceholder } from '../../utils/phoneUtils';
import styles from './PhoneInput.module.css';

interface PhoneInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const previousValue = useRef<string>(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const formatted = formatPhoneNumber(newValue);

    previousValue.current = formatted;
    onChange(formatted);
  };

  // Устанавливаем курсор в правильную позицию после форматирования
  useEffect(() => {
    if (inputRef.current && value !== previousValue.current) {
      const input = inputRef.current;
      const selectionStart = input.selectionStart || 0;

      // Если курсор в конце, оставляем его там
      if (selectionStart >= previousValue.current.length) {
        input.setSelectionRange(value.length, value.length);
      }
    }
  }, [value]);

  return (
    <div className={styles.formGroup}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="tel"
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        value={value}
        onChange={handleChange}
        placeholder={getPhonePlaceholder()}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        autoComplete="tel"
      />
      {error && (
        <span id={`${name}-error`} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default PhoneInput;
