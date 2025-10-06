// src/pages/EmployeeDetailPage/EmployeeDetailPage.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEmployeeById, updateEmployee, deleteEmployee } from "../../services/adminEmployees";
import { getAllDocuments } from "../../services/adminDocuments";
import { getAllPositions, type Position } from "../../services/adminPositions";
import { validateEmployeeForm, type EmployeeFormData } from "../../utils/validators";
import { cleanPhoneNumber, formatPhoneNumber } from "../../utils/phoneUtils";
import type { Employee } from "../../types/employee";
import type { Document } from "../../types/document";
import FormInput from "../../components/FormInput/FormInput";
import FormSelect from "../../components/FormSelect/FormSelect";
import PhoneInput from "../../components/PhoneInput/PhoneInput";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import PositionsManager from "../../components/PositionsManager";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import styles from "./EmployeeDetailPage.module.css";

type Tab = "personal" | "documents";

const EmployeeDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isPositionsModalOpen, setIsPositionsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Личные данные
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [patronymic, setPatronymic] = useState("");
  const [positionId, setPositionId] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Валидация
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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

      // Форматируем телефон при загрузке
      const formattedPhone = employeeData.phone ? formatPhoneNumber(employeeData.phone) : "";
      setPhone(formattedPhone);

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

  // Валидация формы
  const validateForm = (): boolean => {
    const formData: EmployeeFormData = {
      firstName,
      lastName,
      patronymic,
      phone,
      password,
      positionId,
      isEdit: true
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
      position: true
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
      isEdit: true
    };

    const validationErrors = validateEmployeeForm(formData);

    setErrors(prev => ({
      ...prev,
      [fieldName]: validationErrors[fieldName] || ''
    }));
  };

  const handleSave = async () => {
    if (!id || !positionId) return;

    // Валидация перед сохранением
    if (!validateForm()) {
      setActiveTab('personal'); // Переключаемся на вкладку с ошибками
      return;
    }

    setSaving(true);
    try {
      const cleanedPhone = cleanPhoneNumber(phone);

      const updateData: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        patronymic: patronymic.trim() || undefined,
        phone: cleanedPhone,
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

  // Проверка, можно ли сохранить форму
  const hasErrors = errors.lastName || errors.firstName || errors.patronymic || errors.phone || errors.password || errors.position;
  const isFormValid = lastName.trim() && firstName.trim() && phone && positionId && !hasErrors;

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;

    setDeleting(true);
    try {
      await deleteEmployee(Number(id));
      navigate('/admin/employees');
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка при удалении сотрудника');
      setDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const toggleDocument = (docId: number) => {
    setAssignedDocumentIds(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handlePositionsUpdated = async () => {
    try {
      const positionsData = await getAllPositions();
      setPositions(positionsData);
    } catch (error) {
      console.error('Ошибка обновления должностей:', error);
    }
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
            <FormInput
              label="Фамилия"
              name="lastName"
              value={lastName}
              onChange={(value) => {
                setLastName(value);
                if (touched.lastName) validateField('lastName');
              }}
              error={touched.lastName ? errors.lastName : ''}
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
                if (touched.firstName) validateField('firstName');
              }}
              error={touched.firstName ? errors.firstName : ''}
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
                if (touched.patronymic) validateField('patronymic');
              }}
              error={touched.patronymic ? errors.patronymic : ''}
              placeholder="Иванович"
              maxLength={255}
              autoComplete="additional-name"
            />

            <div className={styles.fieldWithButton}>
              <div className={styles.fieldColumn}>
                <FormSelect
                  label="Должность"
                  name="position"
                  value={positionId || ''}
                  onChange={(value) => {
                    setPositionId(value ? Number(value) : null);
                    if (touched.position) validateField('position');
                  }}
                  options={positions.map(pos => ({ value: pos.id, label: pos.name }))}
                  error={touched.position ? errors.position : ''}
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
              </button>
            </div>

            <PhoneInput
              label="Номер телефона"
              name="phone"
              value={phone}
              onChange={(value) => {
                setPhone(value);
                if (touched.phone) validateField('phone');
              }}
              error={touched.phone ? errors.phone : ''}
              required
            />

            <PasswordInput
              label="Новый пароль"
              name="password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                if (touched.password) validateField('password');
              }}
              error={touched.password ? errors.password : ''}
              placeholder="Оставьте пустым, чтобы не менять"
              autoComplete="new-password"
            />
          </div>

          <div className={styles.actions}>
            <button className={styles.deleteButton} onClick={handleDeleteClick}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M8 6V4h8v2M19 6v14H5V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Удалить
            </button>
            <button
              className={styles.saveButton}
              onClick={handleSave}
              disabled={saving || !isFormValid}
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
            <button className={styles.deleteButton} onClick={handleDeleteClick}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M8 6V4h8v2M19 6v14H5V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Удалить
            </button>
            <button
              className={styles.saveButton}
              onClick={handleSave}
              disabled={saving || !isFormValid}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      )}

      <PositionsManager
        isOpen={isPositionsModalOpen}
        onClose={() => setIsPositionsModalOpen(false)}
        onPositionsUpdated={handlePositionsUpdated}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Удаление сотрудника"
        message={`Вы действительно хотите удалить сотрудника ${lastName} ${firstName} ${patronymic || ''}`.trim()}
        isLoading={deleting}
      />
    </div>
  );
};

export default EmployeeDetailPage;
