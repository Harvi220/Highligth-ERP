// src/components/PositionsManager/PositionsManager.tsx
import { useState, useEffect } from 'react';
import { getAllPositions, createPosition, updatePosition, deletePosition, type Position } from '../../services/adminPositions';
import Modal from '../ui/Modal';
import styles from './PositionsManager.module.css';

interface PositionsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onPositionsUpdated?: () => void;
}

const PositionsManager = ({ isOpen, onClose, onPositionsUpdated }: PositionsManagerProps) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPositionName, setNewPositionName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadPositions();
    }
  }, [isOpen]);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const data = await getAllPositions();
      setPositions(data);
    } catch (error) {
      alert('Ошибка при загрузке должностей');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPositionName.trim()) return;

    try {
      await createPosition(newPositionName.trim());
      setNewPositionName('');
      await loadPositions();
      onPositionsUpdated?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Ошибка при создании должности';
      alert(errorMessage);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;

    try {
      await updatePosition(id, editingName.trim());
      setEditingId(null);
      setEditingName('');
      await loadPositions();
      onPositionsUpdated?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Ошибка при обновлении должности';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Вы уверены, что хотите удалить должность "${name}"?`)) {
      return;
    }

    try {
      await deletePosition(id);
      await loadPositions();
      onPositionsUpdated?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Ошибка при удалении должности';
      alert(errorMessage);
    }
  };

  const startEdit = (position: Position) => {
    setEditingId(position.id);
    setEditingName(position.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Управление должностями">
      <div className={styles.container}>
        {/* Форма создания */}
        <form onSubmit={handleCreate} className={styles.createForm}>
          <input
            type="text"
            className={styles.input}
            value={newPositionName}
            onChange={(e) => setNewPositionName(e.target.value)}
            placeholder="Название новой должности"
          />
          <button
            type="submit"
            className={styles.createButton}
            disabled={!newPositionName.trim() || loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Добавить
          </button>
        </form>

        {/* Список должностей */}
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : (
          <div className={styles.positionsList}>
            {positions.length === 0 ? (
              <p className={styles.emptyState}>Нет созданных должностей</p>
            ) : (
              positions.map((position) => (
                <div key={position.id} className={styles.positionItem}>
                  {editingId === position.id ? (
                    <>
                      <input
                        type="text"
                        className={styles.input}
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                      />
                      <div className={styles.actions}>
                        <button
                          className={styles.saveButton}
                          onClick={() => handleUpdate(position.id)}
                          disabled={!editingName.trim()}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                        <button
                          className={styles.cancelButton}
                          onClick={cancelEdit}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className={styles.positionName}>{position.name}</span>
                      <div className={styles.actions}>
                        <button
                          className={styles.editButton}
                          onClick={() => startEdit(position)}
                          title="Редактировать"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(position.id, position.name)}
                          title="Удалить"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PositionsManager;
