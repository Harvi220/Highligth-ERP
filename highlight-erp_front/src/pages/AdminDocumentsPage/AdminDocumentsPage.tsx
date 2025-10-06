// src/pages/AdminDocumentsPage/AdminDocumentsPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllDocuments, deleteDocument, downloadDocument } from "../../services/adminDocuments";
import type { Document } from "../../types/document";
import UserHeader from "../../components/UserHeader";
import PageHeader from "../../components/PageHeader";
import DocumentCard from "../../components/DocumentCard";
import AdminBottomNav from "../../components/AdminBottomNav";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import styles from "./AdminDocumentsPage.module.css";

const AdminDocumentsPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteDocumentId, setDeleteDocumentId] = useState<number | null>(null);
  const [deleteDocumentTitle, setDeleteDocumentTitle] = useState<string>("");
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteClick = (id: number, title: string) => {
    setDeleteDocumentId(id);
    setDeleteDocumentTitle(title);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDocumentId) return;

    setDeleting(true);
    try {
      await deleteDocument(deleteDocumentId);
      setDocuments(documents.filter(doc => doc.id !== deleteDocumentId));
      setIsDeleteDialogOpen(false);
      setDeleteDocumentId(null);
      setDeleteDocumentTitle("");
    } catch (err) {
      console.error('Ошибка при удалении:', err);
      alert('Ошибка при удалении документа');
    } finally {
      setDeleting(false);
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
        <UserHeader />
        <PageHeader
          title="Список документов"
          buttonText="Добавить"
          onButtonClick={() => navigate('/admin/documents/create')}
        />

        {filteredDocuments.length > 0 ? (
          <div className={styles.documentsList}>
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onDownload={handleDownload}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onView={handleView}
              />
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

      <AdminBottomNav />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Удаление документа"
        message={`Вы действительно хотите удалить документ «${deleteDocumentTitle}»`}
        isLoading={deleting}
      />
    </div>
  );
};

export default AdminDocumentsPage;