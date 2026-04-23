import {type ReactElement, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkers } from '../../../hooks/useWorkers.ts';
import { CommonButton } from '../../../UI/CommonButton/CommonButton.tsx';
import { AddEmployeeModal } from './AddEmployeeModal.tsx';
import styles from './AdminEmployeesPage.module.scss';
import type {WorkerPublic} from "../../../types/worker.ts";
import {WorkerCard} from "../../../UI/WorkerCard/WorkerCard.tsx";

export function AdminEmployeesPage(): ReactElement {
    const navigate = useNavigate();
    const { data: workers, isLoading, error, refetch } = useWorkers();
    const [modalOpen, setModalOpen] = useState(false);

    const handleModalClose = () => {
        setModalOpen(false);
        refetch();
    };

    const handleProfileClick = (worker: WorkerPublic) => {
        navigate(`/admin/employees/${worker.id}`);
    };

    if (isLoading) {
        return <div className={styles.loadingState}>Загрузка сотрудников...</div>;
    }

    if (error) {
        return <div className={styles.errorState}>Ошибка загрузки списка сотрудников</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.addButtonWrapper}>
                <CommonButton
                    title="Добавить сотрудника"
                    onClick={() => setModalOpen(true)}
                    className={styles.addButton}
                />
            </div>

            {workers && workers.length === 0 ? (
                <div className={styles.empty}>Нет сотрудников. Добавьте первого.</div>
            ) : (
                <div className={styles.cardsContainer}>
                    {workers?.map((worker) => (
                        <WorkerCard
                            key={worker.id}
                            worker={worker}
                            onProfileClick={handleProfileClick}
                        />
                    ))}
                </div>
            )}


            <AddEmployeeModal open={modalOpen} onClose={handleModalClose} />
        </div>
    );
}