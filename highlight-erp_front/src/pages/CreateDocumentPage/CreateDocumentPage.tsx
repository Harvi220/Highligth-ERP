// src/pages/CreateDocumentPage/CreateDocumentPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDocument } from "../../services/adminDocuments";
import styles from "./CreateDocumentPage.module.css";

const CreateDocumentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [useForAll, setUseForAll] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Введите название документа');
      return;
    }

    if (!file) {
      alert('Выберите файл для загрузки');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      if (description) {
        formData.append('description', description);
      }
      formData.append('file', file);
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
        <div className={styles.formGroup}>
          <label className={styles.label}>Название документа</label>
          <input
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Введите название..."
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Описание</label>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Введите описание..."
            rows={4}
          />
        </div>

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

        <div className={styles.fileUploadGroup}>
          <input
            type="file"
            id="file-upload"
            className={styles.fileInput}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <label htmlFor="file-upload" className={styles.fileUploadButton}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Загрузить файл
          </label>
          {file && <p className={styles.fileName}>{file.name}</p>}
        </div>
      </div>

      <button
        className={styles.createButton}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Создание...' : 'Создать'}
      </button>
    </div>
  );
};

export default CreateDocumentPage;
