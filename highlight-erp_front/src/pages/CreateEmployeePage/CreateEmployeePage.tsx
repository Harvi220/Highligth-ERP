// src/pages/CreateEmployeePage/CreateEmployeePage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createEmployee } from "../../services/adminEmployees";
import { getAllDocuments } from "../../services/adminDocuments";
import { getAllPositions, type Position } from "../../services/adminPositions";
import type { Document } from "../../types/document";
import styles from "./CreateEmployeePage.module.css";

const CreateEmployeePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Шаг 1: Личные данные
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [patronymic, setPatronymic] = useState("");
  const [positionId, setPositionId] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

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
        getAllDocuments()
      ]);
      setPositions(positionsData);
      setDocuments(documentsData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  const handleNextStep = () => {
    // Валидация первого шага
    if (!lastName || !firstName || !positionId || !phone || !password) {
      alert('Заполните все обязательные поля');
      return;
    }
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const toggleDocument = (docId: number) => {
    setSelectedDocuments(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSubmit = async () => {
    if (!positionId) return;

    setLoading(true);
    try {
      // Очищаем телефон от всех символов кроме цифр
      const cleanPhone = phone.replace(/\D/g, '');

      await createEmployee({
        first_name: firstName,
        last_name: lastName,
        patronymic: patronymic || undefined,
        phone: cleanPhone,
        password,
        position_id: positionId,
        documents: selectedDocuments
      });

      navigate('/admin/employees');
    } catch (error: any) {
      console.error('Ошибка создания сотрудника:', error);
      const errorMessage = error?.response?.data?.message || 'Ошибка при создании сотрудника';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate('/admin/employees')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Назад
      </button>

      {step === 1 && (
        <div className={styles.stepContainer}>
          <h1 className={styles.title}>Личные данные</h1>

          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Фамилия</label>
              <input
                type="text"
                className={styles.input}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Сидоров"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Имя</label>
              <input
                type="text"
                className={styles.input}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Иван"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Отчество</label>
              <input
                type="text"
                className={styles.input}
                value={patronymic}
                onChange={(e) => setPatronymic(e.target.value)}
                placeholder="Иванович"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Должность</label>
              <select
                className={styles.input}
                value={positionId || ''}
                onChange={(e) => setPositionId(Number(e.target.value))}
              >
                <option value="">Выберите должность</option>
                {positions.map(pos => (
                  <option key={pos.id} value={pos.id}>{pos.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Номер телефона</label>
              <input
                type="tel"
                className={styles.input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7-999-999-99-99"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Пароль</label>
              <div className={styles.passwordField}>
                <input
                  type={showPassword ? "text" : "password"}
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="***************"
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5C7 5 2.73 8.11 1 12.5C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12.5C21.27 8.11 17 5 12 5Z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <button className={styles.nextButton} onClick={handleNextStep}>
            Далее
          </button>
        </div>
      )}

      {step === 2 && (
        <div className={styles.stepContainer}>
          <h1 className={styles.title}>Документы</h1>

          <div className={styles.documentsList}>
            {documents.map(doc => (
              <div
                key={doc.id}
                className={styles.documentItem}
                onClick={() => toggleDocument(doc.id)}
              >
                <span className={styles.documentName}>{doc.title}</span>
                <div className={`${styles.checkbox} ${selectedDocuments.includes(doc.id) ? styles.checked : ''}`}>
                  {selectedDocuments.includes(doc.id) && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12L10 17L20 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
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
            {loading ? 'Создание...' : 'Создать'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateEmployeePage;
