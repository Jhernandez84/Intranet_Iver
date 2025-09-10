import React, { useState, FC } from "react";

// Definición de las interfaces para los props y el objeto de día
interface DayInfo {
  day: number;
  week: number;
  isPrevMonth?: boolean;
  isNextMonth?: boolean;
  fulldate?: string;
}

interface CalendarMonthViewProps {
  month?: number;
  year?: number;
  ShowBorder?: boolean;
  ShowTodayBtn?: boolean;
  ShowWeekNumber?: boolean;
}

const daysInMonth = (month: number, year: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getWeek = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor(
    (date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000),
  );
  return Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
};

const generateCalendar = (month: number, year: number): DayInfo[] => {
  const totalDays = daysInMonth(month, year);
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const calendar: DayInfo[] = [];

  // Llena los días del mes anterior
  const prevMonthDays = daysInMonth(
    month - 1 < 0 ? 11 : month - 1,
    month - 1 < 0 ? year - 1 : year,
  );
  const prevMonthStart = prevMonthDays - firstDayOfWeek + 1;
  for (let i = prevMonthStart; i <= prevMonthDays; i++) {
    calendar.push({
      day: i,
      week: getWeek(new Date(year, month - 1 < 0 ? 11 : month - 1, i)),
      isPrevMonth: true,
    });
  }

  // Llena los días del mes actual
  for (let day = 1; day <= totalDays; day++) {
    calendar.push({
      day,
      week: getWeek(new Date(year, month, day)),
      isPrevMonth: false,
      fulldate: `${year}-${month + 1 < 10 ? "0" : ""}${month + 1}-${day < 10 ? "0" : ""}${day}`,
    });
  }

  // Llena los días del mes siguiente
  const daysAfter = 42 - calendar.length;
  for (let i = 1; i <= daysAfter; i++) {
    calendar.push({
      day: i,
      week: getWeek(new Date(year, month + 1 > 11 ? 0 : month + 1, i)),
      isNextMonth: true,
    });
  }
  return calendar;
};

const getMonthName = (monthNumber: number): string => {
  const monthDate = new Date(2023, monthNumber);
  return monthDate.toLocaleString("es-CL", { month: "long" });
};

// Main function for the calendar view
const CalendarMonthView: FC<CalendarMonthViewProps> = ({
  month = new Date().getMonth(),
  year = new Date().getFullYear(),
  ShowBorder = true,
  ShowTodayBtn = true,
  ShowWeekNumber = true,
}) => {
  const getCurrentDate = (): string => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    return `${currentYear}-${currentMonth < 10 ? "0" : ""}${currentMonth}-${currentDay < 10 ? "0" : ""}${currentDay}`;
  };

  const [monthCalendar, setMonthCalendar] = useState<number>(month);
  const [yearCalendar, setYearCalendar] = useState<number>(year);
  const [selectedDate, setSelectedDate] = useState<string | false>(false);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [calendarView, setCalendarView] = useState<string>("default"); // Default => Calendar, Year => Year Selector, Month => Month Selector
  const [fullScreen, setFullScreen] = useState<boolean>(false);

  const calendar = generateCalendar(monthCalendar, yearCalendar);

  const initialState = (): void => {
    setMonthCalendar(month);
    setYearCalendar(year);
  };

  const openModal = (): void => {
    setModalOpen(true);
  };

  const closeModal = (): void => {
    setModalOpen(false);
  };

  const dateHandler = (date: string | undefined): void => {
    if (date) {
      setSelectedDate(date);
      openModal();
    }
  };

  const MonthsArray = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const generateYearArray = (): number[] => {
    return Array.from({ length: 25 }, (_, index) => year - 10 + index);
  };

  const Years = generateYearArray();

  const handleCalendarView = (value: string): void => {
    setCalendarView(calendarView === value ? "default" : value);
  };

  const handleMonthChange = (direction: "next" | "prev"): void => {
    if (direction === "next") {
      setMonthCalendar((prevMonth) => (prevMonth + 1 > 11 ? 0 : prevMonth + 1));
      if (monthCalendar === 11) {
        setYearCalendar((prevYear) => prevYear + 1);
      }
    } else {
      setMonthCalendar((prevMonth) => (prevMonth - 1 < 0 ? 11 : prevMonth - 1));
      if (monthCalendar === 0) {
        setYearCalendar((prevYear) => prevYear - 1);
      }
    }
  };

  return (
    <>
      {/* {isModalOpen && <MyModal onClose={closeModal} SelectedDate={selectedDate} />} */}
      <style>
        {`
          .cdr-main-container {
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            font-family: 'Inter', sans-serif;
            background-color: #ffffff;
            color: #333333;
          }
          .cdr-main-container-w-border {
            border: 1px solid #e5e7eb;
          }
          .cdr-secondary-container {
            padding: 1rem;
          }
          .cdr-header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }
          .cdr-selector {
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 0.5rem;
            transition: background-color 0.2s;
            text-transform: capitalize;
            font-weight: 600;
          }
          .cdr-selector:hover {
            background-color: #e5e7eb;
          }
          .cdr-header-days {
            text-align: center;
            text-transform: uppercase;
            font-weight: 600;
            color: #4b5563;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            text-align: center;
            table-layout: fixed;
          }
          th, td {
            width: 14.28%; /* 100% / 7 días = 14.28% */
            border-radius: 0.25rem;
          }
          td:hover {
            background-color: #f3f4f6;
            cursor: pointer;
          }
          .day-cell-container {
            position: relative;
            width: 100%;
            padding-top: 100%; /* Crea una celda cuadrada */
          }
          .day-cell-content {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .cdr-week-number {
            font-size: 0.8rem;
            color: #9ca3af;
            cursor: default;
          }
          .cdr-current-month,
          .cdr-last-next-month {
            font-size: 0.9rem;
            font-weight: 500;
          }
          .cdr-last-next-month {
            color: #d1d5db;
          }
          .cdr-current-day {
            background-color: #3b82f6;
            color: #ffffff;
            font-weight: 700;
            border-radius: 9999px;
            transition: all 0.2s;
          }
          .cdr-current-day:hover {
            background-color: #2563eb;
          }
          .cdr-footer-container {
            display: flex;
            justify-content: center;
            margin-top: 1rem;
          }
          .btn-cdr-current-day {
            cursor: pointer;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            background-color: #f3f4f6;
            transition: background-color 0.2s;
            font-weight: 500;
          }
          .btn-cdr-current-day:hover {
            background-color: #e5e7eb;
          }
          .combined-header-text {
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 0.5rem;
            transition: background-color 0.2s;
            text-transform: capitalize;
            font-weight: 600;
          }
        `}
      </style>
      <div
        className={
          ShowBorder ? "cdr-main-container-w-border" : "cdr-main-container"
        }
      >
        <div className="cdr-secondary-container">
          <div className="cdr-header-container">
            <div
              className="cdr-selector"
              onClick={() => handleMonthChange("prev")}
            >
              <p>{`<`}</p>
            </div>
            <p
              className="combined-header-text"
              onClick={() => handleCalendarView("month")}
            >
              {`${getMonthName(monthCalendar)} - ${yearCalendar}`}
            </p>
            <div
              className="cdr-selector"
              onClick={() => handleMonthChange("next")}
            >
              <p>{`>`}</p>
            </div>
          </div>

          {calendarView === "month" ? (
            <div className="grid grid-cols-3 p-4 text-center">
              {MonthsArray.map((mesNombre, index) => (
                <p
                  key={mesNombre}
                  className="rounded p-2 hover:cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setMonthCalendar(index);
                    handleCalendarView("month");
                  }}
                >
                  {mesNombre}
                </p>
              ))}
            </div>
          ) : null}

          {calendarView === "year" ? (
            <div className="grid grid-cols-5 p-4 text-center">
              {Years.map((year) => (
                <p
                  key={year}
                  className="rounded p-2 hover:cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setYearCalendar(year);
                    handleCalendarView("year");
                  }}
                >
                  {year}
                </p>
              ))}
            </div>
          ) : null}

          {calendarView === "default" ? (
            <table className="">
              <thead>
                <tr className="cdr-header-days">
                  {ShowWeekNumber && <th>Sem</th>}
                  <th>Lun</th>
                  <th>Mar</th>
                  <th>Mié</th>
                  <th>Jue</th>
                  <th>Vie</th>
                  <th>Sáb</th>
                  <th>Dom</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, weekIndex) => (
                  <tr key={weekIndex}>
                    {ShowWeekNumber && (
                      <td className="cdr-week-number">
                        <div className="day-cell-container">
                          <div className="day-cell-content">
                            {calendar[weekIndex * 7]?.week}
                          </div>
                        </div>
                      </td>
                    )}
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const dataIndex = weekIndex * 7 + dayIndex;
                      const dayInfo = calendar[dataIndex];

                      const isPrevOrNextMonth =
                        dayInfo?.isPrevMonth || dayInfo?.isNextMonth;
                      const isCurrentDay =
                        dayInfo?.fulldate === getCurrentDate();

                      return (
                        <td
                          key={dayIndex}
                          onClick={() => dateHandler(dayInfo?.fulldate)}
                          className={` ${isPrevOrNextMonth ? "cdr-last-next-month" : ""} ${isCurrentDay ? "cdr-current-day" : "cdr-current-month"} `}
                        >
                          <div className="day-cell-container">
                            <div className="day-cell-content">
                              {dayInfo?.day}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}

          {ShowTodayBtn ? (
            <div className="cdr-footer-container">
              <div
                className="btn-cdr-current-day"
                onClick={() => {
                  initialState();
                  handleCalendarView("default");
                }}
              >
                Hoy: {getCurrentDate()}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default CalendarMonthView;
