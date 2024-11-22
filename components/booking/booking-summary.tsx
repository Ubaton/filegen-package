"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database } from "@/types/database";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type Service = Database["public"]["Tables"]["services"]["Row"];

interface BookingSummaryProps {
  serviceId: string;
  time: Date;
  services: Service[];
}

export function BookingSummary({ serviceId, time, services }: BookingSummaryProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const service = services.find((s) => s.id === serviceId);

  if (!service) return null;

  const handleBooking = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to book an appointment");
        return;
      }

      const { data, error } = await supabase
        .from("appointments")
        .insert({
          user_id: user.id,
          service_id: serviceId,
          appointment_time: time.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Booking confirmed! Check your email for details.");
      router.push(`/queue?appointment=${data.id}`);
    } catch (error) {
      toast.error("Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Booking Summary</h2>
      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Service</p>
            <p className="font-medium">{service.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="font-medium">${service.price.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{format(time, "MMMM d, yyyy")}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Time</p>
            <p className="font-medium">{format(time, "h:mm a")}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-medium">{service.duration} minutes</p>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <Button 
            className="w-full" 
            onClick={handleBooking}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Booking
          </Button>
        </div>
      </Card>
    </div>
  );
}