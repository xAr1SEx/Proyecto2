import { useState, useEffect } from "react";
import { Calendar as MUICalendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Box, Paper, Typography } from "@mui/material";
import { FC } from "react";
import { format } from "date-fns";

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  markedDates?: Date[];
}

export const Calendar: FC<CalendarProps> = ({
  onDateSelect,
  selectedDate = new Date(),
  markedDates = [],
}) => {
  const [value, setValue] = useState<Date>(selectedDate);

  useEffect(() => {
    setValue(selectedDate);
  }, [selectedDate]);

  const onChange = (newValue: any) => {
    if (!newValue) return;
    let date: Date;
    if (Array.isArray(newValue)) {
      date = newValue[0] as Date;
    } else {
      date = newValue as Date;
    }
    if (date instanceof Date && !isNaN(date.getTime())) {
      setValue(date);
      onDateSelect?.(date);
    }
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const hasNote = markedDates.some(
      (markedDate) => format(markedDate, "yyyy-MM-dd") === dateStr
    );
    return hasNote ? "has-note" : "";
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Calendario
        </Typography>
        <Box
          sx={{
            "& .react-calendar": {
              width: "100%",
              border: "none",
              fontFamily: "inherit",
            },
            "& .react-calendar__tile--active": {
              background: "primary.main",
              color: "white",
            },
            "& .react-calendar__tile.has-note": {
              backgroundColor: "rgba(156, 39, 176, 0.2)",
            },
            "& .react-calendar__tile.has-note:hover": {
              backgroundColor: "rgba(156, 39, 176, 0.3)",
            },
          }}
        >
          <MUICalendar
            onChange={onChange}
            value={value}
            tileClassName={tileClassName}
          />
        </Box>
      </Paper>
      <style>{`
        .react-calendar {
          width: 100%;
          border: none;
          font-family: 'Roboto', sans-serif;
        }
        .react-calendar__navigation button {
          min-width: 44px;
          background: none;
          font-size: 16px;
          margin-top: 8px;
        }
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: rgba(156, 39, 176, 0.1);
        }
        .react-calendar__month-view__weekdays {
          text-align: center;
          text-transform: uppercase;
          font-weight: bold;
          font-size: 0.75em;
        }
        .react-calendar__tile {
          max-width: 100%;
          padding: 10px 6.6667px;
          background: none;
          text-align: center;
          line-height: 16px;
          font-size: 0.833em;
        }
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background-color: rgba(156, 39, 176, 0.1);
        }
        .react-calendar__tile--now {
          background: rgba(156, 39, 176, 0.15);
        }
        .react-calendar__tile--active {
          background: #9c27b0;
          color: white;
        }
      `}</style>
    </Box>
  );
};
