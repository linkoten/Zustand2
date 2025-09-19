import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area"; // ✅ Ajout du ScrollArea
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createLocalityAction } from "@/lib/actions/productActions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Locality } from "@/lib/generated/prisma";

export const geologicalPeriodEnumValues = [
  "CAMBRIEN",
  "ORDOVICIEN",
  "SILURIEN",
  "DEVONIEN",
  "CARBONIFERE",
  "PERMIEN",
  "TRIAS",
  "JURASSIQUE",
  "CRETACE",
  "PALEOGENE",
  "NEOGENE",
  "QUATERNAIRE",
] as const;
type GeologicalPeriod = (typeof geologicalPeriodEnumValues)[number];

type LocalityCreateProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (locality: Locality) => void;
};

export default function LocalityCreateSheet({
  open,
  onOpenChange,
  onCreated,
}: LocalityCreateProps) {
  const [newLocality, setNewLocality] = useState({
    name: "",
    latitude: "",
    longitude: "",
    geologicalPeriods: [] as string[],
    geologicalStages: [] as string[],
    _periodInput: "",
    _stageInput: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Ajouter une localité</SheetTitle>
        </SheetHeader>

        {/* ✅ Zone de contenu avec scroll */}
        <ScrollArea className="flex-1 px-1">
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={newLocality.name}
                onChange={(e) =>
                  setNewLocality((l) => ({ ...l, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input
                type="number"
                value={newLocality.latitude}
                onChange={(e) =>
                  setNewLocality((l) => ({ ...l, latitude: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input
                type="number"
                value={newLocality.longitude}
                onChange={(e) =>
                  setNewLocality((l) => ({ ...l, longitude: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Périodes géologiques</Label>
              <div className="flex gap-2">
                <Select
                  value={newLocality._periodInput || ""}
                  onValueChange={(value) =>
                    setNewLocality((l) => ({ ...l, _periodInput: value }))
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Ajouter une période" />
                  </SelectTrigger>
                  <SelectContent>
                    {geologicalPeriodEnumValues
                      .filter(
                        (period) =>
                          !newLocality.geologicalPeriods.includes(period)
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
                    if (newLocality._periodInput?.trim()) {
                      setNewLocality((l) => ({
                        ...l,
                        geologicalPeriods: [
                          ...(l.geologicalPeriods || []),
                          l._periodInput!.trim(),
                        ],
                        _periodInput: "",
                      }));
                    }
                  }}
                  size="sm"
                  variant="outline"
                  disabled={!newLocality._periodInput}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Liste des périodes sélectionnées */}
              {newLocality.geologicalPeriods.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newLocality.geologicalPeriods.map((period, idx) => (
                    <Badge
                      key={idx}
                      className="flex items-center gap-1"
                      variant="secondary"
                    >
                      {period}
                      <button
                        type="button"
                        onClick={() =>
                          setNewLocality((l) => ({
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
              )}
            </div>

            <div className="space-y-2">
              <Label>Étages géologiques</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter un étage"
                  value={newLocality._stageInput || ""}
                  onChange={(e) =>
                    setNewLocality((l) => ({
                      ...l,
                      _stageInput: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newLocality._stageInput?.trim()) {
                      setNewLocality((l) => ({
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
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (newLocality._stageInput?.trim()) {
                      setNewLocality((l) => ({
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

              {/* Liste des étages sélectionnés */}
              {newLocality.geologicalStages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newLocality.geologicalStages.map((stage, idx) => (
                    <Badge
                      key={idx}
                      className="flex items-center gap-1"
                      variant="secondary"
                    >
                      {stage}
                      <button
                        type="button"
                        onClick={() =>
                          setNewLocality((l) => ({
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
              )}
            </div>
          </div>
        </ScrollArea>

        {/* ✅ Footer fixe en bas */}
        <SheetFooter className="border-t pt-4">
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </SheetClose>
          <Button
            type="button"
            disabled={isCreating}
            onClick={async () => {
              setIsCreating(true);
              const validGeologicalPeriods = (
                newLocality.geologicalPeriods || []
              ).filter((period): period is GeologicalPeriod =>
                geologicalPeriodEnumValues.includes(period as GeologicalPeriod)
              );
              const res = await createLocalityAction({
                name: newLocality.name,
                latitude: parseFloat(newLocality.latitude),
                longitude: parseFloat(newLocality.longitude),
                geologicalPeriods: validGeologicalPeriods,
                geologicalStages: newLocality.geologicalStages,
              });
              setIsCreating(false);
              if (res.success && res.data) {
                toast.success("Localité créée !");
                onCreated(res.data); // callback vers le parent
                onOpenChange(false);
              } else {
                toast.error(res.error);
              }
            }}
          >
            Ajouter
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
