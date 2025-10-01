// src/components/PageHeader/PageHeader.tsx
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  buttonText: string;
  onButtonClick: () => void;
}

const PageHeader = ({ title, buttonText, onButtonClick }: PageHeaderProps) => {
  return (
    <div className={styles.header}>
      <h1 className={styles.pageTitle}>{title}</h1>
      <button className={styles.addButton} onClick={onButtonClick}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
        </svg>
        {buttonText}
      </button>
    </div>
  );
};

export default PageHeader;
