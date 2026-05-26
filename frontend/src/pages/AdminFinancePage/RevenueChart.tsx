import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartDataPoint {
  period: string;
  value: number;
}

interface RevenueChartProps {
  data: ChartDataPoint[];
  title: string;
  color?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

const CustomTooltip = ({ active, payload, label, color, valuePrefix = '', valueSuffix = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1.5, bgcolor: 'white', border: '1px solid #e0e0e0', borderRadius: 2, boxShadow: 2 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight="bold" sx={{ color }}>
          {valuePrefix}{payload[0]?.value?.toLocaleString('ru-RU')}{valueSuffix}
        </Typography>
      </Paper>
    );
  }
  return null;
};

const formatYAxis = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}М`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}К`;
  return `${value}`;
};

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  title,
  color = '#1976d2',
  valuePrefix = '',
  valueSuffix = '',
}) => {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3, flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight="bold" align="center" sx={{ mb: 2, textDecoration: 'underline' }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <Typography color="text.secondary" variant="body2">Нет данных</Typography>
        </Box>
      </Paper>
    );
  }

  const chartData = data.map(item => ({
    name: item.period,
    value: item.value,
  }));

  return (
    <Paper sx={{ p: 3, borderRadius: 3, flex: 1, minWidth: 0 }}>
      <Typography variant="subtitle1" fontWeight="bold" align="center" sx={{ mb: 2, textDecoration: 'underline' }}>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 9, fill: '#999' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 9, fill: '#999' }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            content={
              <CustomTooltip
                color={color}
                valuePrefix={valuePrefix}
                valueSuffix={valueSuffix}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};
