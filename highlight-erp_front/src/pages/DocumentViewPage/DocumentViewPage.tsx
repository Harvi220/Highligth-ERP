// src/pages/DocumentViewPage/DocumentViewPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocumentContent, markDocumentAsRead, type Document } from "../../services/documents";
import styles from "./DocumentViewPage.module.css";

const DocumentViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [document, setDocument] = useState<Document | null>(null);
  const [content, setContent] = useState<string>("");
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
      const data = await getDocumentContent(docId);
      setDocument(data.document);
      setContent(data.content);
    } catch (err) {
      setError('Ошибка при загрузке документа');
      console.error('Ошибка:', err);
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
        {/* Заголовок документа */}
        <div className={styles.header}>
          <h1 className={styles.title}>{document.title}</h1>
          <div className={styles.pageCounter}>1 / 1 стр.</div>
        </div>

        {/* Содержимое документа */}
        <div className={styles.content}>
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <p>{document.description}</p>
          )}
        </div>

        {/* Кнопка ознакомления */}
        <div className={styles.footer}>
          <button
            onClick={handleAcknowledge}
            disabled={acknowledging || isAlreadyRead}
            className={`${styles.acknowledgeButton} ${isAlreadyRead ? styles.alreadyRead : ''}`}
          >
            {isAlreadyRead ? (
              <>
                Ознакомлен ✓
              </>
            ) : acknowledging ? (
              'Отмечаем...'
            ) : (
              <>
                Ознакомился ✓
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewPage;