import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { updateLocalityAction } from "@/lib/actions/productActions";
import { toast } from "sonner";
import { GeologicalPeriod, Locality } from "@/lib/generated/prisma";
import { Plus, X } from "lucide-react";
import { geologicalPeriodEnumValues } from "./localityCreateSheet";

type LocalityEditSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdited: (locality: Locality) => void;
  initialLocality: Locality;
};

export default function LocalityEditSheet({
  open,
  onOpenChange,
  onEdited,
  initialLocality,
}: LocalityEditSheetProps) {
  const [locality, setLocality] = useState({
    ...initialLocality,
    latitude: initialLocality.latitude.toString(),
    longitude: initialLocality.longitude.toString(),
    _periodInput: "",
    _stageInput: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLocality({
        ...initialLocality,
        latitude: initialLocality.latitude.toString(),
        longitude: initialLocality.longitude.toString(),
        _periodInput: "",
        _stageInput: "",
      });
    }
  }, [initialLocality, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Modifier la localité</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-2">
          <label>Nom</label>
          <Input
            value={locality.name}
            onChange={(e) =>
              setLocality((l) => ({ ...l, name: e.target.value }))
            }
          />
          <label>Latitude</label>
          <Input
            type="number"
            value={locality.latitude}
            onChange={(e) =>
              setLocality((l) => ({ ...l, latitude: e.target.value }))
            }
          />
          <label>Longitude</label>
          <Input
            type="number"
            value={locality.longitude}
            onChange={(e) =>
              setLocality((l) => ({ ...l, longitude: e.target.value }))
            }
          />
          <label>Périodes géologiques</label>
          <div className="flex gap-2 mb-2">
            <Select
              value={locality._periodInput || ""}
              onValueChange={(value) =>
                setLocality((l) => ({ ...l, _periodInput: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ajouter une période" />
              </SelectTrigger>
              <SelectContent>
                {geologicalPeriodEnumValues
                  .filter(
                    (period) => !locality.geologicalPeriods.includes(period)
                  )
                  .map((period) => (
                    <SelectItem key={period} value={period}>
                      {period.charAt(0) + period.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={() => {
                if (
                  locality._periodInput?.trim() &&
                  geologicalPeriodEnumValues.includes(
                    locality._periodInput as GeologicalPeriod
                  )
                ) {
                  setLocality((l) => ({
                    ...l,
                    geologicalPeriods: [
                      ...(l.geologicalPeriods || []),
                      l._periodInput as GeologicalPeriod,
                    ],
                    _periodInput: "",
                  }));
                }
              }}
              size="sm"
              variant="outline"
              disabled={!locality._periodInput}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {(locality.geologicalPeriods || []).map((period, idx) => (
              <Badge
                key={idx}
                className="flex items-center gap-1"
                variant="secondary"
              >
                {period}
                <button
                  type="button"
                  onClick={() =>
                    setLocality((l) => ({
                      ...l,
                      geologicalPeriods: l.geologicalPeriods.filter(
                        (_, i) => i !== idx
                      ),
                    }))
                  }
                  className="ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <label>Étages géologiques</label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Ajouter un étage"
              value={locality._stageInput || ""}
              onChange={(e) =>
                setLocality((l) => ({ ...l, _stageInput: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && locality._stageInput?.trim()) {
                  setLocality((l) => ({
                    ...l,
                    geologicalStages: [
                      ...(l.geologicalStages || []),
                      l._stageInput!.trim(),
                    ],
                    _stageInput: "",
                  }));
                  e.preventDefault();
                }
              }}
            />
            <Button
              type="button"
              onClick={() => {
                if (locality._stageInput?.trim()) {
                  setLocality((l) => ({
                    ...l,
                    geologicalStages: [
                      ...(l.geologicalStages || []),
                      l._stageInput!.trim(),
                    ],
                    _stageInput: "",
                  }));
                }
              }}
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(locality.geologicalStages || []).map((stage, idx) => (
              <Badge
                key={idx}
                className="flex items-center gap-1"
                variant="secondary"
              >
                {stage}
                <button
                  type="button"
                  onClick={() =>
                    setLocality((l) => ({
                      ...l,
                      geologicalStages: l.geologicalStages.filter(
                        (_, i) => i !== idx
                      ),
                    }))
                  }
                  className="ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </SheetClose>
          <Button
            type="button"
            disabled={isSaving}
            onClick={async () => {
              setIsSaving(true);
              const res = await updateLocalityAction({
                id: locality.id,
                name: locality.name,
                latitude: parseFloat(locality.latitude),
                longitude: parseFloat(locality.longitude),
                geologicalPeriods: locality.geologicalPeriods,
                geologicalStages: locality.geologicalStages,
              });
              setIsSaving(false);
              if (res.success && res.data) {
                toast.success("Localité modifiée !");
                onEdited(res.data);
                onOpenChange(false);
              } else {
                toast.error(res.error);
              }
            }}
          >
            Modifier
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
