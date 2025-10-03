// src/pages/EmployeeDetailPage/EmployeeDetailPage.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEmployeeById, updateEmployee, deleteEmployee } from "../../services/adminEmployees";
import { getAllDocuments } from "../../services/adminDocuments";
import { getAllPositions, type Position } from "../../services/adminPositions";
import type { Employee } from "../../types/employee";
import type { Document } from "../../types/document";
import styles from "./EmployeeDetailPage.module.css";

type Tab = "personal" | "documents";

const EmployeeDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Личные данные
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [patronymic, setPatronymic] = useState("");
  const [positionId, setPositionId] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Документы
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [assignedDocumentIds, setAssignedDocumentIds] = useState<number[]>([]);

  // Справочники
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [employeeData, positionsData, documentsData] = await Promise.all([
        getEmployeeById(Number(id)),
        getAllPositions(),
        getAllDocuments()
      ]);

      // Заполняем форму данными сотрудника
      setLastName(employeeData.last_name || "");
      setFirstName(employeeData.first_name || "");
      setPatronymic(employeeData.patronymic || "");
      setPositionId(employeeData.position?.id || null);
      setPhone(employeeData.phone || "");

      // Получаем ID назначенных документов
      const assignedIds = employeeData.documents?.map(doc => doc.id) || [];
      setAssignedDocumentIds(assignedIds);

      setPositions(positionsData);
      setAllDocuments(documentsData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      alert('Ошибка при загрузке данных сотрудника');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id || !positionId) return;

    if (!lastName || !firstName || !phone) {
      alert('Заполните все обязательные поля');
      return;
    }

    setSaving(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');

      const updateData: any = {
        first_name: firstName,
        last_name: lastName,
        patronymic: patronymic || undefined,
        phone: cleanPhone,
        position_id: positionId,
        documents: assignedDocumentIds,
      };

      if (password) {
        updateData.password = password;
      }

      await updateEmployee(Number(id), updateData);
      navigate('/admin/employees');
    } catch (error: any) {
      console.error('Ошибка сохранения:', error);
      const errorMessage = error?.response?.data?.message || 'Ошибка при сохранении данных';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    if (!confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      return;
    }

    try {
      await deleteEmployee(Number(id));
      navigate('/admin/employees');
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка при удалении сотрудника');
    }
  };

  const toggleDocument = (docId: number) => {
    setAssignedDocumentIds(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate('/admin/employees')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Назад
      </button>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "personal" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          Личные данные
        </button>
        <button
          className={`${styles.tab} ${activeTab === "documents" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("documents")}
        >
          Документы
        </button>
      </div>

      {activeTab === "personal" && (
        <div className={styles.content}>
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
              <label className={styles.label}>Новый пароль</label>
              <div className={styles.passwordField}>
                <input
                  type={showPassword ? "text" : "password"}
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Оставьте пустым, чтобы не менять"
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

          <div className={styles.actions}>
            <button className={styles.deleteButton} onClick={handleDelete}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M8 6V4h8v2M19 6v14H5V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Удалить
            </button>
            <button
              className={styles.saveButton}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className={styles.content}>
          <div className={styles.documentsList}>
            {allDocuments.map(doc => (
              <div
                key={doc.id}
                className={styles.documentItem}
                onClick={() => toggleDocument(doc.id)}
              >
                <span className={styles.documentName}>{doc.title}</span>
                <div className={`${styles.checkbox} ${assignedDocumentIds.includes(doc.id) ? styles.checked : ''}`}>
                  {assignedDocumentIds.includes(doc.id) && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12L10 17L20 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button className={styles.deleteButton} onClick={handleDelete}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M8 6V4h8v2M19 6v14H5V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Удалить
            </button>
            <button
              className={styles.saveButton}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetailPage;
