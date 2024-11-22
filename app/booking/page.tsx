"use client";

import { useState } from "react";
import { useServices } from "@/lib/hooks/use-services";
import { ServiceSelector } from "@/components/booking/service-selector";
import { TimeSelector } from "@/components/booking/time-selector";
import { BookingSummary } from "@/components/booking/booking-summary";
import { Steps } from "@/components/booking/steps";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const { services, loading } = useServices();

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setStep(2);
    toast.success("Service selected! Now choose your preferred time.");
  };

  const handleTimeSelect = (time: Date) => {
    setSelectedTime(time);
    setStep(3);
    toast.success("Time selected! Please review your booking.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">Book Your Appointment</h1>
        
        <Steps currentStep={step} />

        <Card className="p-6 mt-8">
          {step === 1 && (
            <ServiceSelector 
              services={services} 
              loading={loading}
              onSelect={handleServiceSelect}
              selected={selectedService}
            />
          )}

          {step === 2 && selectedService && (
            <TimeSelector
              serviceId={selectedService}
              onSelect={handleTimeSelect}
              services={services}
            />
          )}

          {step === 3 && selectedService && selectedTime && (
            <BookingSummary
              serviceId={selectedService}
              time={selectedTime}
              services={services}
            />
          )}
        </Card>
      </div>
    </div>
  );
}