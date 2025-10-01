// src/pages/AdminEmployeesPage/AdminEmployeesPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEmployees } from "../../services/adminEmployees";
import type { Employee } from "../../types/employee";
import UserHeader from "../../components/UserHeader";
import PageHeader from "../../components/PageHeader";
import AdminBottomNav from "../../components/AdminBottomNav";
import styles from "./AdminEmployeesPage.module.css";

const AdminEmployeesPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllEmployees();
      setEmployees(data);
    } catch (err) {
      setError('Ошибка при загрузке сотрудников');
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = () => {
    navigate('/admin/employees/create');
  };

  const handleEmployeeClick = (employeeId: number) => {
    navigate(`/admin/employees/${employeeId}`);
  };

  const getInitials = (employee: Employee) => {
    const lastName = employee.last_name || '';
    const firstInitial = employee.first_name?.charAt(0) || '';
    const patronymicInitial = employee.patronymic?.charAt(0) || '';
    return `${lastName}${firstInitial ? ` ${firstInitial}.` : ''}${patronymicInitial ? ` ${patronymicInitial}.` : ''}`.trim();
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
      <PageHeader
        title="Список сотрудников"
        buttonText="Добавить"
        onButtonClick={handleAddEmployee}
      />

      {/* Список сотрудников */}
      {employees.length === 0 ? (
        <div className={styles.empty}>
          <p>Нет сотрудников</p>
        </div>
      ) : (
        <div className={styles.employeesList}>
          {employees.map((employee) => (
            <div
              key={employee.id}
              className={styles.employeeCard}
              onClick={() => handleEmployeeClick(employee.id)}
            >
              <div className={styles.employeeAvatar}>
                {employee.avatar_url ? (
                  <img src={employee.avatar_url} alt="Avatar" />
                ) : (
                  <div className={styles.employeeAvatarPlaceholder}>
                    {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className={styles.employeeInfo}>
                <div className={styles.employeeName}>
                  {getInitials(employee)}
                </div>
                <div className={styles.employeePosition}>
                  {employee.position?.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminBottomNav />
    </div>
  );
};

export default AdminEmployeesPage;
