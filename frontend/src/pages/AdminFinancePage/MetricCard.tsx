import React from 'react';
import styles from './MetricCard.module.scss';

interface MetricCardProps {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  color = '#1976d2',
}) => {
  const formattedValue = typeof value === 'number'
    ? value.toLocaleString('ru-RU')
    : value;

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.cardTitle}>{title}</div>
        <div className={styles.cardValue} style={{ color }}>
          {prefix}
          {formattedValue}
          {suffix}
        </div>
      </div>
    </div>
  );
};
