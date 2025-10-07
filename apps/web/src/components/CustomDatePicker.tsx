import React, { useState, useRef, useEffect } from 'react';
import './CustomDatePicker.css';

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  maxDate?: string;
  label?: React.ReactNode;
  placeholder?: string;
  id?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  maxDate,
  label,
  placeholder = 'Select date',
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    // Check if date is after maxDate
    if (maxDate) {
      const max = new Date(maxDate);
      if (newDate > max) return;
    }

    setSelectedDate(newDate);
    const formattedDate = newDate.toISOString().split('T')[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
    const formattedDate = today.toISOString().split('T')[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedDate(null);
    onChange('');
    setIsOpen(false);
  };

  const handleYearChange = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth()));
  };

  const handleMonthChange = (month: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), month));
    setShowYearMonthPicker(false);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    // Generate years from 1900 to current year
    for (let year = currentYear; year >= 1900; year--) {
      years.push(year);
    }
    return years;
  };

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return placeholder;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isDateDisabled = (day: number) => {
    if (!maxDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const max = new Date(maxDate);
    return date > max;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="custom-date-picker" ref={pickerRef}>
      {label && <label htmlFor={id} className="date-picker-label">{label}</label>}
      <div
        className="date-picker-input"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedDate ? 'date-selected' : 'date-placeholder'}>
          {formatDisplayDate(selectedDate)}
        </span>
        <i className="fas fa-calendar-alt date-picker-icon"></i>
      </div>

      {isOpen && (
        <div className="date-picker-dropdown">
          <div className="calendar-header">
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={handlePrevMonth}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              type="button"
              className="calendar-month-year-btn"
              onClick={() => setShowYearMonthPicker(!showYearMonthPicker)}
            >
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              <i className={`fas fa-chevron-${showYearMonthPicker ? 'up' : 'down'}`} style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}></i>
            </button>
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={handleNextMonth}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          {showYearMonthPicker && (
            <div className="year-month-picker">
              <div className="year-picker-section">
                <label className="picker-label">Year</label>
                <select
                  className="year-select"
                  value={currentMonth.getFullYear()}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                >
                  {generateYearOptions().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="month-picker-section">
                <label className="picker-label">Month</label>
                <div className="month-grid">
                  {months.map((month, index) => (
                    <button
                      key={month}
                      type="button"
                      className={`month-btn ${currentMonth.getMonth() === index ? 'active' : ''}`}
                      onClick={() => handleMonthChange(index)}
                    >
                      {month.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="calendar-days-header">
            {daysOfWeek.map(day => (
              <div key={day} className="calendar-day-name">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-days-grid">
            {days.map((day, index) => (
              <div key={index} className="calendar-day-cell">
                {day && (
                  <button
                    type="button"
                    className={`calendar-day ${isSelected(day) ? 'selected' : ''} ${
                      isToday(day) ? 'today' : ''
                    } ${isDateDisabled(day) ? 'disabled' : ''}`}
                    onClick={() => !isDateDisabled(day) && handleDateClick(day)}
                    disabled={isDateDisabled(day)}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="calendar-footer">
            <button
              type="button"
              className="calendar-action-btn clear-btn"
              onClick={handleClear}
            >
              <i className="fas fa-times"></i> Clear
            </button>
            <button
              type="button"
              className="calendar-action-btn today-btn"
              onClick={handleToday}
            >
              <i className="fas fa-calendar-day"></i> Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
