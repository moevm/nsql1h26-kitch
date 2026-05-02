import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorker, useUpdateWorker, useDeleteWorker } from '../../../hooks/useWorkers.ts';
import { CommonInputField } from '../../../UI/CommonInputField/CommonInputField.tsx';
import { CommonButton } from '../../../UI/CommonButton/CommonButton.tsx';
import type { WorkerUpdate } from '../../../types/worker.ts';
import { formatDate } from '../../../UI/FormatFunctions.ts';
import styles from './EmployeeProfilePage.module.scss';
import { formatTimeMask, formatDateMask } from '../../../utils/formatters';

export const EmployeeProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: worker, isLoading, error } = useWorker(id!);
    const updateWorker = useUpdateWorker();
    const deleteWorker = useDeleteWorker();

    const [formData, setFormData] = useState<WorkerUpdate>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (worker) {
            setFormData({
                name: worker.name,
                email: worker.email,
                date_of_birth: worker.date_of_birth?.split('T')[0] || '',
                position: worker.current_position || '',
                work_day_start: worker.work_day_start || '',
                work_day_end: worker.work_day_end || '',
                comment: worker.comment || ''
            });
        }
    }, [worker]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (formData.name !== undefined && !formData.name.trim()) newErrors.name = 'Имя обязательно';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Некорректный email';
        if (formData.date_of_birth) {
            const date = new Date(formData.date_of_birth);
            if (isNaN(date.getTime())) newErrors.date_of_birth = 'Неверная дата';
            else if (date > new Date()) newErrors.date_of_birth = 'Дата не может быть в будущем';
        }
        if (formData.work_day_start && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(formData.work_day_start))
            newErrors.work_day_start = 'Формат ЧЧ:ММ';
        if (formData.work_day_end && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(formData.work_day_end))
            newErrors.work_day_end = 'Формат ЧЧ:ММ';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: keyof WorkerUpdate) => (value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleWorkDayStartChange = (value: string) => {
        const masked = formatTimeMask(value);
        handleChange('work_day_start')(masked);
    };

    const handleWorkDayEndChange = (value: string) => {
        const masked = formatTimeMask(value);
        handleChange('work_day_end')(masked);
    };

    const handleDateOfBirthChange = (value: string) => {
        const masked = formatDateMask(value);
        handleChange('date_of_birth')(masked);
    };

    const handleSave = async () => {
        if (!validate()) return;
        try {
            await updateWorker.mutateAsync({ id: id!, data: formData });
            alert('Сохранено');
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Уволить сотрудника? Это действие нельзя отменить.')) return;
        try {
            await deleteWorker.mutateAsync(id!);
            alert('Сотрудник успешно уволен');
            navigate('/admin/employees');
        } catch (err: any) {
            console.error('Ошибка при увольнении:', err);
            const errorDetail = err?.response?.data?.detail;
            const errorMessage = errorDetail || err?.message || 'Не удалось уволить сотрудника';
            alert(`Ошибка: ${errorMessage}`);
        }
    };

    const calculateAge = (birthDate: string | null): number | null => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    };

    if (isLoading) return <div className={styles.loading}>Загрузка...</div>;

    if (error || !worker) {
        return (
            <div className={styles.container}>
                <div className={styles.backButtonWrapper}>
                    <CommonButton title="← Назад" variant="text" onClick={() => navigate('/admin/employees')} />
                </div>
                <div className={styles.profileCard}>
                    <h2>Сотрудник не найден</h2>
                    <p>Возможно, сотрудник был удалён или произошла ошибка загрузки.</p>
                </div>
            </div>
        );
    }

    const age = calculateAge(worker.date_of_birth);
    const createdAt = worker.created_at ? formatDate(worker.created_at) : '—';
    const updatedAt = worker.updated_at ? formatDate(worker.updated_at) : '—';

    return (
        <div className={styles.container}>
            <div className={styles.backButtonWrapper}>
                <CommonButton title="← Назад" variant="text" onClick={() => navigate('/admin/employees')} />
            </div>
            <div className={styles.profileCard}>
                <div className={styles.row}>
                    <div className={styles.leftColumn}>
                        <div className={styles.headerSection}>
                            <h1 className={styles.pageTitle}>Информация о сотруднике</h1>
                            <div className={styles.employeeId}>№ {worker.id}</div>
                        </div>
                        <CommonInputField
                            label="Имя сотрудника"
                            value={formData.name || ''}
                            onChange={handleChange('name')}
                            error={!!errors.name}
                            helperText={errors.name}
                        />
                    </div>
                    <div className={styles.rightColumn}>
                        <div className={styles.infoStats}>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Возраст:</span>
                                <span className={styles.statValue}>{age !== null ? `${age} лет` : '—'}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Стаж (лет):</span>
                                <span className={styles.statValue}>{worker.experience_years}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Дата создания:</span>
                                <span className={styles.statValue}>{createdAt}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Дата изменения:</span>
                                <span className={styles.statValue}>{updatedAt}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.rowCompact}>
                    <CommonInputField
                        label="Email сотрудника"
                        value={formData.email || ''}
                        onChange={handleChange('email')}
                        error={!!errors.email}
                        helperText={errors.email}
                    />
                    <CommonInputField
                        label="Дата рождения"
                        type="text"
                        placeholder="ГГГГ-ММ-ДД"
                        value={formData.date_of_birth || ''}
                        onChange={handleDateOfBirthChange}
                        error={!!errors.date_of_birth}
                        helperText={errors.date_of_birth}
                    />
                    <CommonInputField
                        label="Начало смены"
                        placeholder="ЧЧ:ММ"
                        value={formData.work_day_start || ''}
                        onChange={handleWorkDayStartChange}
                        error={!!errors.work_day_start}
                        helperText={errors.work_day_start}
                    />
                    <CommonInputField
                        label="Конец смены"
                        placeholder="ЧЧ:ММ"
                        value={formData.work_day_end || ''}
                        onChange={handleWorkDayEndChange}
                        error={!!errors.work_day_end}
                        helperText={errors.work_day_end}
                    />
                    <CommonInputField
                        label="Должность"
                        value={formData.position || ''}
                        onChange={handleChange('position')}
                    />
                </div>
                <div className={styles.rowExtended}>
                    <div className={styles.leftColumn}>
                        <div className={styles.commentField}>
                            <label className={styles.commentLabel}>Комментарий</label>
                            <textarea
                                className={styles.commentTextarea}
                                value={formData.comment || ''}
                                onChange={(e) => handleChange('comment')(e.target.value)}
                                rows={5}
                                placeholder="Введите комментарий..."
                            />
                        </div>
                    </div>
                    <div className={styles.rightColumn}>
                        <div className={styles.historySection}>
                            <h3 className={styles.historyTitle}>История должностей</h3>
                            <ul className={styles.positionsList}>
                                {worker.positions.map((pos, idx) => (
                                    <li key={idx}>{pos}</li>
                                ))}
                            </ul>
                        </div>
                        <div className={styles.actionButtons}>
                            <CommonButton
                                title="Сохранить"
                                onClick={handleSave}
                                disabled={updateWorker.isPending}
                                className={styles.wideButton}
                            />
                            <CommonButton
                                title="Уволить"
                                variant="danger"
                                onClick={handleDelete}
                                disabled={deleteWorker.isPending}
                                className={styles.wideButton}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};