// src/pages/AdminEmployeeStatsPage/AdminEmployeeStatsPage.tsx
import { useState, useEffect } from "react";
import { getEmployeeStatistics } from "../../services/adminStatistics";
import type { EmployeeStatistics } from "../../types/statistics";
import UserHeader from "../../components/UserHeader";
import EmployeeStatCard from "../../components/EmployeeStatCard";
import AdminBottomNav from "../../components/AdminBottomNav";
import styles from "./AdminEmployeeStatsPage.module.css";

const AdminEmployeeStatsPage = () => {
  const [employees, setEmployees] = useState<EmployeeStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployeeStatistics();
      setEmployees(data);
    } catch (err) {
      setError('Ошибка при загрузке статистики');
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <UserHeader />

      <h1 className={styles.title}>Статистика по сотрудникам</h1>

      {employees.length === 0 ? (
        <div className={styles.empty}>
          <p>Нет данных о сотрудниках</p>
        </div>
      ) : (
        <div className={styles.employeesList}>
          {employees.map((employee) => (
            <EmployeeStatCard key={employee.id} employee={employee} />
          ))}
        </div>
      )}

      <AdminBottomNav />
    </div>
  );
};

export default AdminEmployeeStatsPage;
