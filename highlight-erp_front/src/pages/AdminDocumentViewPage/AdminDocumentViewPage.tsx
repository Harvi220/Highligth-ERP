// src/pages/AdminDocumentViewPage/AdminDocumentViewPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocumentContent, downloadDocument, type DocumentContentResponse } from "../../services/adminDocuments";
import PDFViewer from "../../components/PDFViewer";
import styles from "./AdminDocumentViewPage.module.css";

const AdminDocumentViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [documentData, setDocumentData] = useState<DocumentContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadDocument(parseInt(id));
    }
  }, [id]);

  const loadDocument = async (docId: number) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Загрузка документа ID:', docId);
      const data = await getDocumentContent(docId);
      console.log('Получены данные:', data);
      setDocumentData(data);
    } catch (err: any) {
      console.error('Ошибка при загрузке:', err);
      console.error('Детали ошибки:', err.response?.data);
      setError(err.response?.data?.message || 'Ошибка при загрузке документа');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/documents');
  };

  const handleDownload = async () => {
    if (!documentData) return;

    try {
      await downloadDocument(documentData.document.id, documentData.file_name);
    } catch (err) {
      console.error('Ошибка при скачивании документа:', err);
      alert('Ошибка при скачивании документа');
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loading}>Загрузка документа...</div>
        </div>
      </div>
    );
  }

  if (error || !documentData) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.error}>
            {error || 'Документ не найден'}
            <button onClick={handleBack} className={styles.backButton}>
              Вернуться к списку
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Заголовок документа с кнопкой скачивания */}
        <div className={styles.header}>
          <button onClick={handleBack} className={styles.backButton}>
            ← Назад
          </button>
          <h1 className={styles.title}>{documentData.document.title}</h1>
          <button onClick={handleDownload} className={styles.downloadButton}>
            ↓ Скачать
          </button>
        </div>

        {/* PDF Viewer */}
        <div className={styles.viewerContainer}>
          <PDFViewer
            fileUrl={documentData.file_url}
            onLoadError={(error) => {
              console.error('Ошибка загрузки PDF:', error);
              setError('Ошибка при загрузке PDF документа');
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDocumentViewPage;
