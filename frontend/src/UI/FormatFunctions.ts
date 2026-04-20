export const formatDate = (date?: string | Date | null): string => {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};