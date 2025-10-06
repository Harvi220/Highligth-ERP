// src/pages/DocumentViewPage/DocumentViewPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocumentContent, markDocumentAsRead, downloadDocument, type Document, type User } from "../../services/documents";
import PDFViewer from "../../components/PDFViewer";
import styles from "./DocumentViewPage.module.css";

const DocumentViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [document, setDocument] = useState<Document | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acknowledging, setAcknowledging] = useState(false);

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
      setDocument(data.document);
      setFileUrl(data.file_url);
      setUser(data.user);
    } catch (err: any) {
      console.error('Ошибка при загрузке:', err);
      console.error('Детали ошибки:', err.response?.data);
      setError(err.response?.data?.message || 'Ошибка при загрузке документа');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    if (!document) return;

    try {
      setAcknowledging(true);
      await markDocumentAsRead(document.id);

      // Обновляем статус документа локально
      setDocument(prev => prev ? { ...prev, status: 'read' } : null);

      // Возвращаемся к списку документов через 1 секунду
      setTimeout(() => {
        navigate('/documents');
      }, 1000);

    } catch (err) {
      console.error('Ошибка при отметке документа:', err);
      alert('Ошибка при отметке документа как прочитанного');
    } finally {
      setAcknowledging(false);
    }
  };

  const handleBack = () => {
    navigate('/documents');
  };

  const handleDownload = async () => {
    if (!document) return;

    try {
      const blob = await downloadDocument(document.id);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.original_filename || 'document.pdf';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
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

  if (error || !document) {
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

  const isAlreadyRead = document.status === 'read';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Заголовок документа с кнопкой скачивания */}
        <div className={styles.header}>
          <button onClick={handleBack} className={styles.backButton}>
            ← Назад
          </button>
          <h1 className={styles.title}>{document.title}</h1>
          <button onClick={handleDownload} className={styles.downloadButton}>
            ↓ Скачать
          </button>
        </div>

        {/* PDF Viewer */}
        <div className={styles.viewerContainer}>
          <PDFViewer
            fileUrl={fileUrl}
            onLoadError={(error) => {
              console.error('Ошибка загрузки PDF:', error);
              setError('Ошибка при загрузке PDF документа');
            }}
          />
        </div>

        {/* Кнопка ознакомления */}
        <div className={styles.footer}>
          <button
            onClick={handleAcknowledge}
            disabled={acknowledging || isAlreadyRead}
            className={`${styles.acknowledgeButton} ${isAlreadyRead ? styles.alreadyRead : ''}`}
          >
            {isAlreadyRead ? (
              'Ознакомлен ✓'
            ) : acknowledging ? (
              'Отмечаем...'
            ) : (
              'Ознакомился'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewPage;