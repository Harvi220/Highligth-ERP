// src/pages/DocumentsPage/DocumentsPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDocuments, markDocumentAsRead, downloadDocument, type Document, type User } from "../../services/documents";
import styles from "./DocumentsPage.module.css";

const DocumentsPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [user, setUser] = useState<User | null>(null);
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
      setUser(data.user);
    } catch (err) {
      setError('Ошибка при загрузке документов');
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (docId: number) => {
    try {
      const blob = await downloadDocument(docId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `document-${docId}.pdf`; // Имя файла
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Ошибка при скачивании:', err);
      alert('Ошибка при скачивании документа');
    }
  };

  const handleDocumentAction = (document: Document) => {
    if (document.status === 'unread' || document.status === 'assigned') {
      // Переходим на страницу просмотра документа
      navigate(`/documents/${document.id}`);
    }
    // Для уже прочитанных документов ничего не делаем
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
        {/* Заголовок пользователя */}
        {user && (
          <div className={styles.userHeader}>
            <img
              src={user.avatar || "https://via.placeholder.com/80x80/4A90E2/FFFFFF?text=" + user.name.slice(0, 2)}
              alt={user.name}
              className={styles.avatar}
            />
            <div className={styles.userInfo}>
              <h2 className={styles.userName}>{user.name}</h2>
              <p className={styles.userPosition}>{user.position || 'Сотрудник'}</p>
            </div>
          </div>
        )}

        {/* Заголовок страницы */}
        <h1 className={styles.pageTitle}>Список документов</h1>

        {/* Список документов */}
        <div className={styles.documentsList}>
          {documents && documents.length > 0 ? documents.map((document) => (
            <div key={document.id} className={styles.documentCard}>
              <div className={styles.documentHeader}>
                <h3 className={styles.documentTitle}>{document.title}</h3>
                <button
                  className={styles.downloadButton}
                  onClick={() => handleDownload(document.id)}
                  aria-label="Скачать документ"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 16L7 11H10V4H14V11H17L12 16Z" fill="currentColor"/>
                    <path d="M20 18H4V20H20V18Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>

              <p className={styles.documentDescription}>
                {document.description}
              </p>

              <div className={styles.documentActions}>
                <button
                  className={`${styles.actionButton} ${
                    (document.status === "unread" || document.status === "assigned") ? styles.unreadButton : styles.readButton
                  }`}
                  onClick={() => handleDocumentAction(document)}
                >
                  {(document.status === "unread" || document.status === "assigned") ? "Необходимо прочитать" : "Прочитано"}
                </button>
              </div>
            </div>
          )) : (
            <div className={styles.documentCard}>
              <p>Документы не найдены</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;