// src/pages/CreateEmployeePage/CreateEmployeePage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createEmployee } from "../../services/adminEmployees";
import { getAllDocuments } from "../../services/adminDocuments";
import { getAllPositions, type Position } from "../../services/adminPositions";
import {
  validateEmployeeForm,
  type EmployeeFormData,
} from "../../utils/validators";
import { cleanPhoneNumber, formatPhoneNumber } from "../../utils/phoneUtils";
import type { Document } from "../../types/document";
import FormInput from "../../components/FormInput/FormInput";
import FormSelect from "../../components/FormSelect/FormSelect";
import PhoneInput from "../../components/PhoneInput/PhoneInput";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import PositionsManager from "../../components/PositionsManager";
import styles from "./CreateEmployeePage.module.css";

const CreateEmployeePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isPositionsModalOpen, setIsPositionsModalOpen] = useState(false);

  // Шаг 1: Личные данные
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [patronymic, setPatronymic] = useState("");
  const [positionId, setPositionId] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Валидация
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Шаг 2: Документы
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);

  // Данные для селектов
  const [positions, setPositions] = useState<Position[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [positionsData, documentsData] = await Promise.all([
        getAllPositions(),
        getAllDocuments(),
      ]);
      setPositions(positionsData);
      setDocuments(documentsData);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    }
  };

  const handlePositionsUpdated = async () => {
    try {
      const positionsData = await getAllPositions();
      setPositions(positionsData);
    } catch (error) {
      console.error("Ошибка обновления должностей:", error);
    }
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const formData: EmployeeFormData = {
      firstName,
      lastName,
      patronymic,
      phone,
      password,
      positionId,
      isEdit: false,
    };

    const validationErrors = validateEmployeeForm(formData);
    setErrors(validationErrors);

    // Отмечаем все поля как touched
    setTouched({
      firstName: true,
      lastName: true,
      patronymic: true,
      phone: true,
      password: true,
      position: true,
    });

    return Object.keys(validationErrors).length === 0;
  };

  // Валидация отдельного поля
  const validateField = (fieldName: string) => {
    const formData: EmployeeFormData = {
      firstName,
      lastName,
      patronymic,
      phone,
      password,
      positionId,
      isEdit: false,
    };

    const validationErrors = validateEmployeeForm(formData);

    setErrors((prev) => ({
      ...prev,
      [fieldName]: validationErrors[fieldName] || "",
    }));
  };

  const handleNextStep = () => {
    // Валидация первого шага
    if (!validateForm()) {
      return;
    }
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const toggleDocument = (docId: number) => {
    setSelectedDocuments((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSubmit = async () => {
    if (!positionId) return;

    // Финальная валидация перед отправкой
    if (!validateForm()) {
      setStep(1); // Возвращаемся на первый шаг, если есть ошибки
      return;
    }

    setLoading(true);
    try {
      // Очищаем телефон от всех символов кроме цифр
      const cleanedPhone = cleanPhoneNumber(phone);

      await createEmployee({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        patronymic: patronymic.trim() || undefined,
        phone: cleanedPhone,
        password,
        position_id: positionId,
        documents: selectedDocuments,
      });

      navigate("/admin/employees");
    } catch (error: any) {
      console.error("Ошибка создания сотрудника:", error);
      const errorMessage =
        error?.response?.data?.message || "Ошибка при создании сотрудника";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Проверка, заполнены ли все обязательные поля для кнопки "Далее"
  const hasStep1Errors =
    errors.lastName ||
    errors.firstName ||
    errors.patronymic ||
    errors.phone ||
    errors.password ||
    errors.position;
  const isStep1Valid =
    lastName.trim() &&
    firstName.trim() &&
    positionId &&
    phone &&
    password &&
    !hasStep1Errors;

  return (
    <div className={styles.container}>
      <button
        className={styles.backButton}
        onClick={() => navigate("/admin/employees")}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M19 12H5M5 12L12 19M5 12L12 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Назад
      </button>

      {step === 1 && (
        <div className={styles.stepContainer}>
          <h1 className={styles.title}>Личные данные</h1>

          <div className={styles.form}>
            <FormInput
              label="Фамилия"
              name="lastName"
              value={lastName}
              onChange={(value) => {
                setLastName(value);
                if (touched.lastName) validateField("lastName");
              }}
              error={touched.lastName ? errors.lastName : ""}
              placeholder="Иванов"
              required
              maxLength={255}
              autoComplete="family-name"
            />

            <FormInput
              label="Имя"
              name="firstName"
              value={firstName}
              onChange={(value) => {
                setFirstName(value);
                if (touched.firstName) validateField("firstName");
              }}
              error={touched.firstName ? errors.firstName : ""}
              placeholder="Иван"
              required
              maxLength={255}
              autoComplete="given-name"
            />

            <FormInput
              label="Отчество"
              name="patronymic"
              value={patronymic}
              onChange={(value) => {
                setPatronymic(value);
                if (touched.patronymic) validateField("patronymic");
              }}
              error={touched.patronymic ? errors.patronymic : ""}
              placeholder="Иванович"
              maxLength={255}
              autoComplete="additional-name"
            />

            <div className={styles.fieldWithButton}>
              <div className={styles.fieldColumn}>
                <FormSelect
                  label="Должность"
                  name="position"
                  value={positionId || ""}
                  onChange={(value) => {
                    setPositionId(value ? Number(value) : null);
                    if (touched.position) validateField("position");
                  }}
                  options={positions.map((pos) => ({
                    value: pos.id,
                    label: pos.name,
                  }))}
                  error={touched.position ? errors.position : ""}
                  placeholder="Выберите должность"
                  required
                />
              </div>
              <button
                type="button"
                className={styles.manageButton}
                onClick={() => setIsPositionsModalOpen(true)}
                title="Управление должностями"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </button>
            </div>

            <PhoneInput
              label="Номер телефона"
              name="phone"
              value={phone}
              onChange={(value) => {
                setPhone(value);
                if (touched.phone) validateField("phone");
              }}
              error={touched.phone ? errors.phone : ""}
              required
            />

            <PasswordInput
              label="Пароль"
              name="password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                if (touched.password) validateField("password");
              }}
              error={touched.password ? errors.password : ""}
              placeholder="Минимум 8 символов"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            className={styles.nextButton}
            onClick={handleNextStep}
            disabled={!isStep1Valid}
          >
            Далее
          </button>
        </div>
      )}

      {step === 2 && (
        <div className={styles.stepContainer}>
          <h1 className={styles.title}>Документы</h1>

          <div className={styles.documentsList}>
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={styles.documentItem}
                onClick={() => toggleDocument(doc.id)}
              >
                <span className={styles.documentName}>{doc.title}</span>
                <div
                  className={`${styles.checkbox} ${selectedDocuments.includes(doc.id) ? styles.checked : ""}`}
                >
                  {selectedDocuments.includes(doc.id) && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12L10 17L20 7"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            className={styles.createButton}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Создание..." : "Создать"}
          </button>
        </div>
      )}

      <PositionsManager
        isOpen={isPositionsModalOpen}
        onClose={() => setIsPositionsModalOpen(false)}
        onPositionsUpdated={handlePositionsUpdated}
      />
    </div>
  );
};

export default CreateEmployeePage;
