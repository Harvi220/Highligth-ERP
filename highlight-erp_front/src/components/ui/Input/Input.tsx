// src/components/ui/Input/Input.tsx
import React from "react";
import clsx from "clsx";
import styles from "./Input.module.css";

interface InputProps extends React.ComponentProps<"input"> {
  label: string; // Теперь label обязательный
  error?: string;
  className?: string;
  containerClassName?: string;
  variant?: "floating" | "simple"; // Добавляем варианты
}

const Input = ({
  label,
  error,
  className,
  containerClassName,
  placeholder,
  variant = "floating", // По умолчанию floating
  ...props
}: InputProps) => {
  const internalId = React.useId();
  const id = props.id || internalId;

  if (variant === "simple") {
    // Простой вариант без floating labels
    return (
      <div className={clsx(styles.container, containerClassName)}>
        <label htmlFor={id} className={styles.simpleLabel}>
          {label}
        </label>
        <input
          id={id}
          className={clsx(styles.simpleInput, { [styles.error]: !!error }, className)}
          placeholder={placeholder}
          {...props}
        />
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    );
  }

  // Floating вариант (оригинальный)
  return (
    <div className={clsx(styles.container, containerClassName)}>
      <div className={styles.inputWrapper}>
        <input
          id={id}
          className={clsx(styles.input, { [styles.error]: !!error }, className)}
          // Важный трюк: плейсхолдер должен быть пустым, чтобы CSS-селектор :placeholder-shown работал
          placeholder=" "
          {...props}
        />
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      </div>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export { Input };
