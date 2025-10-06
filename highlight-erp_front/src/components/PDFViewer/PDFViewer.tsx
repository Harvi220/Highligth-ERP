import { useState, useMemo } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import styles from "./PDFViewer.module.css";
import "../../utils/pdfConfig";

interface PDFViewerProps {
  fileUrl: string;
  onLoadSuccess?: () => void;
  onLoadError?: (error: Error) => void;
}

const PDFViewer = ({ fileUrl, onLoadSuccess, onLoadError }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    onLoadSuccess?.();
  };

  const onDocumentLoadError = (error: Error) => {
    setLoading(false);
    console.error("Ошибка загрузки PDF:", error);
    onLoadError?.(error);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  // Мемоизируем конфигурацию файла для предотвращения ненужных перезагрузок
  const fileConfig = useMemo(() => {
    const token = localStorage.getItem('auth_token');
    return {
      url: fileUrl,
      httpHeaders: {
        'Authorization': `Bearer ${token}`
      }
    };
  }, [fileUrl]);

  return (
    <div className={styles.container}>
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка документа...</p>
        </div>
      )}

      <Document
        file={fileConfig}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={null}
        className={styles.document}
      >
        {numPages > 0 && (
          <Page
            pageNumber={pageNumber}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className={styles.page}
            width={window.innerWidth > 768 ? 600 : window.innerWidth - 40}
          />
        )}
      </Document>

      {!loading && numPages > 0 && (
        <div className={styles.controls}>
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className={styles.navButton}
            aria-label="Предыдущая страница"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <span className={styles.pageInfo}>
            {pageNumber} / {numPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className={styles.navButton}
            aria-label="Следующая страница"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
