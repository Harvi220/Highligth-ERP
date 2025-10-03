// src/components/EmployeeDocumentCard/EmployeeDocumentCard.tsx
import type { Document } from '../../services/documents';
import styles from './EmployeeDocumentCard.module.css';

interface EmployeeDocumentCardProps {
  document: Document;
  onDownload: (id: number) => void;
  onView: (id: number) => void;
}

const EmployeeDocumentCard = ({ document, onDownload, onView }: EmployeeDocumentCardProps) => {
  const isRead = document.status === 'read';

  return (
    <div className={styles.documentCard}>
      <button
        className={styles.downloadButton}
        onClick={() => onDownload(document.id)}
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
        {document.description || 'Нет описания'}
      </p>

      <div className={styles.cardActions}>
        <button
          className={isRead ? styles.readButton : styles.unreadButton}
          onClick={() => !isRead && onView(document.id)}
          disabled={isRead}
        >
          {isRead ? 'Прочитано ✓' : 'Необходимо прочитать'}
        </button>
      </div>
    </div>
  );
};

export default EmployeeDocumentCard;
