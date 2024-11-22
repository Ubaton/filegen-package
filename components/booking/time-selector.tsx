"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Database } from "@/types/database";
import { addDays, format, setHours, setMinutes } from "date-fns";

type Service = Database["public"]["Tables"]["services"]["Row"];

interface TimeSelectorProps {
  serviceId: string;
  onSelect: (time: Date) => void;
  services: Service[];
}

const AVAILABLE_HOURS = Array.from({ length: 8 }, (_, i) => i + 10); // 10 AM to 6 PM

export function TimeSelector({ serviceId, onSelect, services }: TimeSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      const [hours, minutes] = time.split(":").map(Number);
      const datetime = setMinutes(setHours(selectedDate, hours), minutes);
      onSelect(datetime);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Choose Date & Time</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={{ before: new Date() }}
            className="rounded-md border"
          />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-3">Available Times</h3>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABLE_HOURS.map((hour) => {
              const timeString = `${hour}:00`;
              return (
                <Button
                  key={timeString}
                  variant={selectedTime === timeString ? "default" : "outline"}
                  onClick={() => handleTimeSelect(timeString)}
                >
                  {format(setHours(new Date(), hour), "h:mm a")}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}