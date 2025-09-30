// src/pages/AdminDocumentsPage/AdminDocumentsPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllDocuments, deleteDocument, downloadDocument } from "../../services/adminDocuments";
import type { Document } from "../../types/document";
import styles from "./AdminDocumentsPage.module.css";

const AdminDocumentsPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllDocuments();
      setDocuments(data);
    } catch (err) {
      setError('Ошибка при загрузке документов');
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Вы уверены, что хотите удалить документ "${title}"?`)) {
      return;
    }

    try {
      await deleteDocument(id);
      setDocuments(documents.filter(doc => doc.id !== id));
    } catch (err) {
      console.error('Ошибка при удалении:', err);
      alert('Ошибка при удалении документа');
    }
  };

  const handleDownload = async (id: number, filename: string) => {
    try {
      await downloadDocument(id, filename);
    } catch (err) {
      console.error('Ошибка при скачивании:', err);
      alert('Ошибка при скачивании документа');
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/admin/documents/${id}/edit`);
  };

  const handleView = (id: number) => {
    navigate(`/admin/documents/${id}`);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
    return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            <img
              src="https://via.placeholder.com/80"
              alt="Аватар пользователя"
              className={styles.avatarImage}
            />
          </div>
          <div className={styles.userDetails}>
            <h2 className={styles.userName}>Иванов И. И.</h2>
            <p className={styles.userRole}>Администратор</p>
          </div>
        </div>

        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Список документов</h1>
          <button
            className={styles.addButton}
            onClick={() => navigate('/admin/documents/create')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
            </svg>
            Добавить
          </button>
        </div>

        {filteredDocuments.length > 0 ? (
          <div className={styles.documentsList}>
            {filteredDocuments.map((document) => (
              <div key={document.id} className={styles.documentCard}>
                <button
                  className={styles.downloadButton}
                  onClick={() => handleDownload(document.id, document.original_filename)}
                  title="Скачать"
                  aria-label="Скачать документ"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 16L7 11H10V4H14V11H17L12 16Z" fill="currentColor"/>
                    <path d="M20 18H4V20H20V18Z" fill="currentColor"/>
                  </svg>
                </button>

                <h2 className={styles.documentTitle}>{document.title}</h2>
                <p className={styles.documentDescription}>
                  {document.description || 'Body text for whatever you\'d like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story.'}
                </p>

                <div className={styles.cardActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEdit(document.id)}
                  >
                    Редактировать
                  </button>
                  <button
                    className={styles.deleteButtonCard}
                    onClick={() => handleDelete(document.id, document.title)}
                  >
                    Удалить
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Документы не найдены</p>
            {searchQuery && (
              <button
                className={styles.clearButton}
                onClick={() => setSearchQuery('')}
              >
                Очистить поиск
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDocumentsPage;