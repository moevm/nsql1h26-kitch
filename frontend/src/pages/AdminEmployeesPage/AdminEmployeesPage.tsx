import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkers } from '../../hooks/useWorkers';
import { CommonButton } from '../../UI/CommonButton/CommonButton';
import { AddEmployeeModal } from './AddEmployeeModal';
import styles from './AdminEmployeesPage.module.scss';

export const AdminEmployeesPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: workers, isLoading, error, refetch } = useWorkers();
    const [modalOpen, setModalOpen] = useState(false);

    const handleModalClose = () => {
        setModalOpen(false);
        window.location.reload();
    };

    if (isLoading) {
        return <div className={styles.loading}>Загрузка сотрудников...</div>;
    }

    if (error) {
        return (
            <div className={styles.error}>
                <p>Ошибка загрузки списка сотрудников</p>
                <CommonButton title="Повторить" onClick={() => refetch()} variant="text" />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Сотрудники</h1>
                <CommonButton title="+ Добавить сотрудника" onClick={() => setModalOpen(true)} />
            </div>

            {workers && workers.length === 0 ? (
                <div className={styles.empty}>Нет сотрудников. Добавьте первого.</div>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Имя</th>
                            <th>Email</th>
                            <th>Должность</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workers?.map((worker) => (
                            <tr key={worker.id}>
                                <td>{worker.name}</td>
                                <td>{worker.email}</td>
                                <td>{worker.current_position || '—'}</td>
                                <td>{worker.is_active ? 'Активен' : 'Уволен'}</td>
                                <td>
                                    <CommonButton
                                        title="Профиль"
                                        variant="text"
                                        onClick={() => {
                                            navigate(`/admin/employees/${worker.id}`);
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <AddEmployeeModal open={modalOpen} onClose={handleModalClose} />
        </div>
    );
};
