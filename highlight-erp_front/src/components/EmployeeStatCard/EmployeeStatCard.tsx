// src/components/EmployeeStatCard/EmployeeStatCard.tsx
import { useState } from "react";
import type { EmployeeStatistics } from "../../types/statistics";
import styles from "./EmployeeStatCard.module.css";

interface EmployeeStatCardProps {
  employee: EmployeeStatistics;
}

const EmployeeStatCard = ({ employee }: EmployeeStatCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getInitials = () => {
    const lastName = employee.last_name || "";
    const firstInitial = employee.first_name?.charAt(0) || "";
    const patronymicInitial = employee.patronymic?.charAt(0) || "";
    return `${lastName}${firstInitial ? ` ${firstInitial}.` : ""}${patronymicInitial ? ` ${patronymicInitial}.` : ""}`.trim();
  };

  const readDocuments = employee.documents.filter(
    (doc) => doc.status === "read"
  );
  const unreadDocuments = employee.documents.filter(
    (doc) => doc.status === "assigned"
  );

  return (
    <div className={styles.card}>
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={styles.employeeInfo}>
          <div className={styles.avatar}>
            {employee.avatar_url ? (
              <img src={employee.avatar_url} alt="Avatar" />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {employee.first_name?.charAt(0)}
                {employee.last_name?.charAt(0)}
              </div>
            )}
          </div>
          <div className={styles.details}>
            <div className={styles.name}>{getInitials()}</div>
            <div className={styles.position}>
              {employee.position?.name || "Должность не указана"}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#333333" />
                <path
                  d="M9 12L11 14L15 10"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className={styles.statCount} style={{ color: "#333333" }}>
                {readDocuments.length}
              </span>
            </div>

            <div className={styles.statItem}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#ef4444" />
                <path
                  d="M9 9L15 15M15 9L9 15"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className={styles.statCount} style={{ color: "#ef4444" }}>
                {unreadDocuments.length}
              </span>
            </div>
          </div>

          <button className={styles.expandButton}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className={isExpanded ? styles.expandedIcon : ""}
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.expandedContent}>
          {employee.documents.length === 0 ? (
            <p className={styles.noDocuments}>Нет назначенных документов</p>
          ) : (
            <ul className={styles.documentsList}>
              {employee.documents.map((doc) => (
                <li key={doc.id} className={styles.documentItem}>
                  <div
                    className={`${styles.docIcon} ${doc.status === "read" ? styles.docIconRead : styles.docIconUnread}`}
                  >
                    {doc.status === "read" ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle cx="12" cy="12" r="10" fill="#333333" />
                        <path
                          d="M9 12L11 14L15 10"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle cx="12" cy="12" r="10" fill="#ef4444" />
                        <path
                          d="M9 9L15 15M15 9L9 15"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className={styles.docTitle}>{doc.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeStatCard;
