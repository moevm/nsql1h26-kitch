export const formatDateMask = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const limited = digits.slice(0, 8);
  if (limited.length <= 4) return limited;
  if (limited.length <= 6) return `${limited.slice(0, 4)}-${limited.slice(4)}`;
  return `${limited.slice(0, 4)}-${limited.slice(4, 6)}-${limited.slice(6, 8)}`;
};

export const formatTimeMask = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const limited = digits.slice(0, 4);
  if (limited.length <= 2) return limited;
  return `${limited.slice(0, 2)}:${limited.slice(2, 4)}`;
};

export const formatDateTimeMask = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const limited = digits.slice(0, 12);
  if (limited.length === 0) return '';
  if (limited.length <= 2) return limited;
  if (limited.length <= 4) return `${limited.slice(0, 2)}.${limited.slice(2)}`;
  if (limited.length <= 8) {
    const day = limited.slice(0, 2);
    const month = limited.slice(2, 4);
    const year = limited.slice(4);
    return `${day}.${month}.${year}`;
  }
  if (limited.length <= 10) {
    const day = limited.slice(0, 2);
    const month = limited.slice(2, 4);
    const year = limited.slice(4, 8);
    const hour = limited.slice(8);
    return `${day}.${month}.${year} ${hour}`;
  }
  const day = limited.slice(0, 2);
  const month = limited.slice(2, 4);
  const year = limited.slice(4, 8);
  const hour = limited.slice(8, 10);
  const minute = limited.slice(10, 12);
  return `${day}.${month}.${year} ${hour}:${minute}`;
};