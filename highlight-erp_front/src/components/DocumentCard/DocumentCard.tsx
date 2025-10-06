// src/components/DocumentCard/DocumentCard.tsx
import type { Document } from '../../types/document';
import styles from './DocumentCard.module.css';

interface DocumentCardProps {
  document: Document;
  onDownload: (id: number, filename: string) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number, title: string) => void;
  onView?: (id: number) => void;
}

const DocumentCard = ({ document, onDownload, onEdit, onDelete, onView }: DocumentCardProps) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Не вызываем onView если клик был на кнопках
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    onView?.(document.id);
  };

  return (
    <div
      className={styles.documentCard}
      onClick={handleCardClick}
      style={{ cursor: onView ? 'pointer' : 'default' }}
    >
      <button
        className={styles.downloadButton}
        onClick={() => onDownload(document.id, document.original_filename)}
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
          onClick={() => onEdit(document.id)}
        >
          Редактировать
        </button>
        <button
          className={styles.deleteButtonCard}
          onClick={() => onDelete(document.id, document.title)}
        >
          Удалить
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;
