// src/pages/DocumentsPage/DocumentsPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDocuments, downloadDocument, type Document } from "../../services/documents";
import EmployeeDocumentCard from "../../components/EmployeeDocumentCard/EmployeeDocumentCard";
import UserHeader from "../../components/UserHeader";
import styles from "./DocumentsPage.module.css";

const DocumentsPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDocuments();
      console.log('Received data:', data);
      setDocuments(data.documents || []);
    } catch (err) {
      setError('Ошибка при загрузке документов');
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (docId: number) => {
    try {
      const doc = documents.find(d => d.id === docId);
      const blob = await downloadDocument(docId);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = doc?.original_filename || `document-${docId}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Ошибка при скачивании:', err);
      alert('Ошибка при скачивании документа');
    }
  };

  const handleViewDocument = (docId: number) => {
    navigate(`/documents/${docId}`);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loading}>Загрузка...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.error}>
            {error}
            <button onClick={loadDocuments} className={styles.retryButton}>
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <UserHeader />

        {/* Заголовок страницы */}
        <h1 className={styles.pageTitle}>Список документов</h1>

        {/* Список документов */}
        <div className={styles.documentsList}>
          {documents && documents.length > 0 ? (
            documents.map((document) => (
              <EmployeeDocumentCard
                key={document.id}
                document={document}
                onDownload={handleDownload}
                onView={handleViewDocument}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>Документы не найдены</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;