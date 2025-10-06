// src/pages/LoginPage/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/auth";
import { validatePhone, validatePassword } from "../../utils/validators";
import { cleanPhoneNumber } from "../../utils/phoneUtils";
import PhoneInput from "../../components/PhoneInput/PhoneInput";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const validateField = (fieldName: string, value: string) => {
    let fieldError = '';

    if (fieldName === 'phone') {
      fieldError = validatePhone(value) || '';
    } else if (fieldName === 'password') {
      fieldError = validatePassword(value, false) || '';
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldError
    }));
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, fieldName === 'phone' ? phone : password);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Отмечаем все поля как touched
    setTouched({ phone: true, password: true });

    // Валидация
    const phoneError = validatePhone(phone);
    const passwordError = validatePassword(password, false);

    setErrors({
      phone: phoneError || '',
      password: passwordError || ''
    });

    if (phoneError || passwordError) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Очищаем телефон от нецифровых символов
      const cleanedPhone = cleanPhoneNumber(phone);

      const response = await login({ phone: cleanedPhone, password });

      // Перенаправляем в зависимости от роли пользователя
      if (response.user.role?.name === "admin") {
        navigate("/admin/documents");
      } else {
        navigate("/documents");
      }
    } catch (err: unknown) {
      console.error("Ошибка входа:", err);
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Ошибка при входе в систему";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = errors.phone || errors.password;
  const isFormValid = phone && password && !hasErrors;

  return (
    <div className={styles.page}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Вход в систему</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <PhoneInput
            label="Номер телефона"
            name="phone"
            value={phone}
            onChange={(value) => {
              setPhone(value);
              if (touched.phone) validateField('phone', value);
            }}
            error={touched.phone ? errors.phone : ''}
            required
            autoComplete="tel"
          />

          <PasswordInput
            label="Пароль"
            name="password"
            value={password}
            onChange={(value) => {
              setPassword(value);
              if (touched.password) validateField('password', value);
            }}
            error={touched.password ? errors.password : ''}
            required
            autoComplete="current-password"
          />

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !isFormValid}
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;