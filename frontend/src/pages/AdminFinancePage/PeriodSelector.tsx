import React from 'react';
import { ToggleButtonGroup, ToggleButton, Box, Button, Popover } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import type { PeriodType } from '../../api/finance';

interface PeriodSelectorProps {
  periodType: PeriodType;
  onPeriodTypeChange: (value: PeriodType) => void;
  customStartDate: Date | null;
  customEndDate: Date | null;
  onCustomDateChange: (start: Date | null, end: Date | null) => void;
}

const periodButtons: { value: PeriodType; label: string }[] = [
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'season', label: 'Сезон' },
  { value: 'year', label: 'Год' },
  { value: 'custom', label: 'Свой' },
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  periodType,
  onPeriodTypeChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleCustomClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePeriodChange = (value: PeriodType) => {
    onPeriodTypeChange(value);
    if (value !== 'custom') {
      handleClose();
    }
  };

  const open = Boolean(anchorEl);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ToggleButtonGroup
          value={periodType}
          exclusive
          onChange={(_, value) => value && handlePeriodChange(value)}
          sx={{
            backgroundColor: '#fff',
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              px: 3,
              py: 1,
              borderColor: '#e0e0e0',
              '&.Mui-selected': {
                backgroundColor: '#1976d2',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
              },
            },
          }}
        >
          {periodButtons.map((btn) => (
            <ToggleButton key={btn.value} value={btn.value}>
              {btn.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {periodType === 'custom' && (
          <Button variant="outlined" onClick={handleCustomClick}>
            Выбрать даты
          </Button>
        )}

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Box sx={{ p: 3, display: 'flex', gap: 2, minWidth: 400 }}>
            <DatePicker
              label="Начальная дата"
              value={customStartDate}
              onChange={(date) => onCustomDateChange(date, customEndDate)}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DatePicker
              label="Конечная дата"
              value={customEndDate}
              onChange={(date) => onCustomDateChange(customStartDate, date)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>
        </Popover>
      </Box>
    </LocalizationProvider>
  );
};
