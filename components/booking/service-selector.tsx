"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Database } from "@/types/database";
import { Clock, Scissors } from "lucide-react";

type Service = Database["public"]["Tables"]["services"]["Row"];

interface ServiceSelectorProps {
  services: Service[];
  loading: boolean;
  onSelect: (serviceId: string) => void;
  selected: string | null;
}

export function ServiceSelector({ services, loading, onSelect, selected }: ServiceSelectorProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Choose Your Service</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`p-4 cursor-pointer transition-all ${
              selected === service.id
                ? "border-primary shadow-lg"
                : "hover:border-primary/50"
            }`}
            onClick={() => onSelect(service.id)}
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Scissors className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{service.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{service.duration} mins</span>
                </div>
                <p className="mt-2 font-semibold">
                  ${service.price.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}