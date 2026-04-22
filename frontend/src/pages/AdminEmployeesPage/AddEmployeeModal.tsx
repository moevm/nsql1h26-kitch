import React, { useState } from 'react';
import { Modal, Box, IconButton, Alert } from '@mui/material';
import { CommonInputField } from '../../UI/CommonInputField/CommonInputField';
import { CommonButton } from '../../UI/CommonButton/CommonButton';
import { useCreateWorker } from '../../hooks/useWorkers';
import type { WorkerCreate } from '../../types/worker';

interface AddEmployeeModalProps {
    open: boolean;
    onClose: () => void;
}

const modalStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: '90vh',
    overflowY: 'auto'
};

const formatDate = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    const limited = digits.slice(0, 8);
    if (limited.length <= 4) return limited;
    if (limited.length <= 6) return `${limited.slice(0, 4)}-${limited.slice(4)}`;
    return `${limited.slice(0, 4)}-${limited.slice(4, 6)}-${limited.slice(6, 8)}`;
};

const formatTime = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    const limited = digits.slice(0, 4);
    if (limited.length <= 2) return limited;
    return `${limited.slice(0, 2)}:${limited.slice(2, 4)}`;
};

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ open, onClose }) => {
    const createWorker = useCreateWorker();
    const [formData, setFormData] = useState<WorkerCreate>({
        name: '',
        email: '',
        date_of_birth: '',
        position: '',
        start_experience: 0,
        work_day_start: '',
        work_day_end: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Имя обязательно';
        if (!formData.email.trim()) newErrors.email = 'Email обязателен';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Некорректный email';
        if (!formData.date_of_birth) newErrors.date_of_birth = 'Дата рождения обязательна';
        else {
            const date = new Date(formData.date_of_birth);
            if (isNaN(date.getTime())) newErrors.date_of_birth = 'Неверная дата';
            else if (date > new Date()) newErrors.date_of_birth = 'Дата не может быть в будущем';
        }
        if (!formData.position.trim()) newErrors.position = 'Должность обязательна';
        if (formData.start_experience < 0 || !Number.isInteger(formData.start_experience))
            newErrors.start_experience = 'Стаж должен быть целым неотрицательным числом';
        if (!formData.work_day_start) newErrors.work_day_start = 'Начало смены обязательно';
        else if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(formData.work_day_start))
            newErrors.work_day_start = 'Формат ЧЧ:ММ';
        if (!formData.work_day_end) newErrors.work_day_end = 'Конец смены обязательно';
        else if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(formData.work_day_end))
            newErrors.work_day_end = 'Формат ЧЧ:ММ';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: keyof WorkerCreate) => (value: string) => {
        let processedValue: string | number = value;
        if (field === 'start_experience') {
            processedValue = value === '' ? 0 : Number(value);
        }
        setFormData(prev => ({ ...prev, [field]: processedValue }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleDateChange = (value: string) => {
        const formatted = formatDate(value);
        setFormData(prev => ({ ...prev, date_of_birth: formatted }));
        if (errors.date_of_birth) setErrors(prev => ({ ...prev, date_of_birth: '' }));
    };

    const handleStartTimeChange = (value: string) => {
        const formatted = formatTime(value);
        setFormData(prev => ({ ...prev, work_day_start: formatted }));
        if (errors.work_day_start) setErrors(prev => ({ ...prev, work_day_start: '' }));
    };

    const handleEndTimeChange = (value: string) => {
        const formatted = formatTime(value);
        setFormData(prev => ({ ...prev, work_day_end: formatted }));
        if (errors.work_day_end) setErrors(prev => ({ ...prev, work_day_end: '' }));
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            const payload = {
                ...formData,
                start_experience: Number(formData.start_experience)
            };
            await createWorker.mutateAsync(payload);
            onClose();
            setFormData({
                name: '', email: '', date_of_birth: '', position: '',
                start_experience: 0, work_day_start: '', work_day_end: ''
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ textDecoration: 'underline' }}>Добавить сотрудника</h2>
                    <IconButton onClick={onClose}>
                        <span style={{ fontSize: 24 }}>✕</span>
                    </IconButton>
                </div>
                {createWorker.error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {(createWorker.error as any)?.response?.data?.detail || 'Ошибка при создании'}
                    </Alert>
                )}
                <CommonInputField label="Имя сотрудника *" value={formData.name} onChange={handleChange('name')} error={!!errors.name} helperText={errors.name} />
                <CommonInputField label="Email *" value={formData.email} onChange={handleChange('email')} error={!!errors.email} helperText={errors.email} />
                <CommonInputField label="Дата рождения *" type="text" placeholder="ГГГГММДД (только цифры)" value={formData.date_of_birth} onChange={handleDateChange} error={!!errors.date_of_birth} helperText={errors.date_of_birth} />
                <CommonInputField label="Должность *" value={formData.position} onChange={handleChange('position')} error={!!errors.position} helperText={errors.position} />
                <CommonInputField label="Стаж (лет)" type="text" placeholder="0" value={String(formData.start_experience)} onChange={(v) => handleChange('start_experience')(v)} error={!!errors.start_experience} helperText={errors.start_experience} />
                <CommonInputField label="Начало смены *" placeholder="ЧЧММ (только цифры)" value={formData.work_day_start} onChange={handleStartTimeChange} error={!!errors.work_day_start} helperText={errors.work_day_start} />
                <CommonInputField label="Конец смены *" placeholder="ЧЧММ (только цифры)" value={formData.work_day_end} onChange={handleEndTimeChange} error={!!errors.work_day_end} helperText={errors.work_day_end} />
                <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                    <CommonButton title={createWorker.isPending ? 'Добавление...' : 'Добавить'} onClick={handleSubmit} disabled={createWorker.isPending} />
                </div>
            </Box>
        </Modal>
    );
};