// Переиспользуемый компонент загрузки файлов с валидацией

import React, { useRef } from 'react';
import styles from './FileInput.module.css';

interface FileInputProps {
  label: string;
  name: string;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  accept?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
}

const FileInput: React.FC<FileInputProps> = ({
  label,
  name,
  file,
  onChange,
  error,
  accept,
  required = false,
  disabled = false,
  helpText,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onChange(selectedFile);
  };

  const handleRemoveFile = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      {helpText && <p className={styles.helpText}>{helpText}</p>}

      <div className={styles.fileInputWrapper}>
        <input
          ref={inputRef}
          id={name}
          name={name}
          type="file"
          className={styles.hiddenInput}
          onChange={handleFileChange}
          accept={accept}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />

        {!file ? (
          <label
            htmlFor={name}
            className={`${styles.uploadButton} ${error ? styles.uploadButtonError : ''} ${
              disabled ? styles.uploadButtonDisabled : ''
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17 8L12 3L7 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 3V15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Выбрать файл</span>
          </label>
        ) : (
          <div className={styles.selectedFile}>
            <div className={styles.fileIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="14 2 14 8 20 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className={styles.fileInfo}>
              <div className={styles.fileName}>{file.name}</div>
              <div className={styles.fileSize}>{formatFileSize(file.size)}</div>
            </div>
            <button
              type="button"
              className={styles.removeButton}
              onClick={handleRemoveFile}
              disabled={disabled}
              aria-label="Удалить файл"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <line
                  x1="18"
                  y1="6"
                  x2="6"
                  y2="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="6"
                  y1="6"
                  x2="18"
                  y2="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {error && (
        <span id={`${name}-error`} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FileInput;
