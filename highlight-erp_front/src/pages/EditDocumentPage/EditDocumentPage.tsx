// src/pages/EditDocumentPage/EditDocumentPage.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDocumentById, updateDocument } from "../../services/adminDocuments";
import styles from "./EditDocumentPage.module.css";

const EditDocumentPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [useForAll, setUseForAll] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [currentFileName, setCurrentFileName] = useState("");

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const doc = await getDocumentById(Number(id));
      setTitle(doc.title);
      setDescription(doc.description || "");
      setUseForAll(doc.is_for_all_employees || false);
      setCurrentFileName(doc.original_filename || "");
    } catch (error) {
      console.error('Ошибка загрузки документа:', error);
      alert('Ошибка при загрузке данных документа');
      navigate('/admin/documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!id) return;

    if (!title.trim()) {
      alert('Введите название документа');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      if (description) {
        formData.append('description', description);
      }
      if (file) {
        formData.append('file', file);
      }
      formData.append('is_for_all_employees', useForAll ? '1' : '0');
      formData.append('_method', 'PUT');

      await updateDocument(Number(id), formData);

      navigate('/admin/documents');
    } catch (error: any) {
      console.error('Ошибка обновления документа:', error);
      const errorMessage = error?.response?.data?.message || 'Ошибка при обновлении документа';
      alert(errorMessage);
    } finally {
      setSaving(false);
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
      <button className={styles.backButton} onClick={() => navigate('/admin/documents')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Назад
      </button>

      <h1 className={styles.title}>Редактирование документа</h1>

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
          <div className={styles.currentFile}>
            <span className={styles.currentFileLabel}>Текущий файл:</span>
            <span className={styles.currentFileName}>{currentFileName}</span>
          </div>
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
            Заменить файл
          </label>
          {file && <p className={styles.fileName}>Новый файл: {file.name}</p>}
        </div>
      </div>

      <button
        className={styles.createButton}
        onClick={handleSubmit}
        disabled={saving}
      >
        {saving ? 'Сохранение...' : 'Сохранить'}
      </button>
    </div>
  );
};

export default EditDocumentPage;
