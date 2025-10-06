// Переиспользуемый компонент инпута телефона с маской

import React, { useRef } from 'react';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const newValue = input.value;
    const cursorPosition = input.selectionStart || 0;

    // Сохраняем количество цифр до курсора для восстановления позиции
    const digitsBeforeCursor = newValue.substring(0, cursorPosition).replace(/\D/g, '').length;

    const formatted = formatPhoneNumber(newValue);
    onChange(formatted);

    // Восстанавливаем позицию курсора после форматирования
    requestAnimationFrame(() => {
      if (inputRef.current) {
        let newCursorPosition = 0;
        let digitCount = 0;

        // Находим позицию курсора, учитывая количество цифр
        for (let i = 0; i < formatted.length; i++) {
          if (/\d/.test(formatted[i])) {
            digitCount++;
            if (digitCount >= digitsBeforeCursor) {
              newCursorPosition = i + 1;
              break;
            }
          }
        }

        // Если не нашли позицию, ставим в конец
        if (newCursorPosition === 0) {
          newCursorPosition = formatted.length;
        }

        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    });
  };

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
