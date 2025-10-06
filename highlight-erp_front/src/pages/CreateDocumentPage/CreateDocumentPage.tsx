// src/pages/CreateDocumentPage/CreateDocumentPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDocument } from "../../services/adminDocuments";
import { validateDocumentForm, type DocumentFormData } from "../../utils/validators";
import FormInput from "../../components/FormInput/FormInput";
import FormTextarea from "../../components/FormTextarea/FormTextarea";
import FileInput from "../../components/FileInput/FileInput";
import styles from "./CreateDocumentPage.module.css";

const CreateDocumentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [useForAll, setUseForAll] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Валидация формы
  const validateForm = (): boolean => {
    const formData: DocumentFormData = {
      title,
      description,
      file
    };

    const validationErrors = validateDocumentForm(formData);
    setErrors(validationErrors);

    // Отмечаем все поля как touched при попытке отправки
    setTouched({ title: true, description: true, file: true });

    return Object.keys(validationErrors).length === 0;
  };

  // Валидация отдельного поля
  const validateField = (fieldName: keyof DocumentFormData) => {
    const formData: DocumentFormData = {
      title,
      description,
      file
    };

    const validationErrors = validateDocumentForm(formData);

    setErrors(prev => ({
      ...prev,
      [fieldName]: validationErrors[fieldName] || ''
    }));
  };

  const handleBlur = (fieldName: keyof DocumentFormData) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      if (description.trim()) {
        formData.append('description', description.trim());
      }
      formData.append('file', file!);
      formData.append('is_for_all_employees', useForAll ? '1' : '0');

      await createDocument(formData);

      navigate('/admin/documents');
    } catch (error: any) {
      console.error('Ошибка создания документа:', error);
      const errorMessage = error?.response?.data?.message || 'Ошибка при создании документа';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Проверка, можно ли отправить форму
  const hasErrors = errors.title || errors.description || errors.file;
  const isFormValid = title.trim() && file && !hasErrors;

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate('/admin/documents')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Назад
      </button>

      <h1 className={styles.title}>Создание документа</h1>

      <div className={styles.form}>
        <FormInput
          label="Название документа"
          name="title"
          value={title}
          onChange={(value) => {
            setTitle(value);
            if (touched.title) validateField('title');
          }}
          error={touched.title ? errors.title : ''}
          placeholder="Введите название документа"
          required
          maxLength={255}
          autoComplete="off"
        />

        <FormTextarea
          label="Описание"
          name="description"
          value={description}
          onChange={(value) => {
            setDescription(value);
            if (touched.description) validateField('description');
          }}
          error={touched.description ? errors.description : ''}
          placeholder="Опишите содержание и назначение документа"
          rows={4}
          maxLength={5000}
        />

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={useForAll}
              onChange={(e) => setUseForAll(e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>Использовать для всех</span>
          </label>
          <p className={styles.checkboxDescription}>
            При включении делает документ обязательным для всех текущих и новых сотрудников
          </p>
        </div>

        <FileInput
          label="Файл документа"
          name="file"
          file={file}
          onChange={(selectedFile) => {
            setFile(selectedFile);
            if (touched.file) {
              setTouched(prev => ({ ...prev, file: true }));
              validateField('file');
            }
          }}
          error={touched.file ? errors.file : ''}
          accept=".pdf,.docx,.xlsx"
          required
          helpText="Допустимые форматы: PDF, DOCX, XLSX. Максимальный размер: 10 МБ"
        />
      </div>

      <button
        className={styles.createButton}
        onClick={handleSubmit}
        disabled={loading || !isFormValid}
      >
        {loading ? 'Создание...' : 'Создать'}
      </button>
    </div>
  );
};

export default CreateDocumentPage;
