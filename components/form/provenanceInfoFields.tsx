import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { ProductFormData } from "./createProductForm";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useState } from "react";
import { Locality } from "@/lib/generated/prisma";
import LocalityCreateSheet from "./localityCreateSheet";
import { Button } from "../ui/button";
import { Pencil } from "lucide-react";
import LocalityEditSheet from "./localityEditSheet";

type ProvenanceInfoFieldsProps = {
  form: UseFormReturn<ProductFormData>;
  localities: Locality[];
  onLocalityCreated: (locality: Locality) => void;
};

export default function ProvenanceInfoFields({
  form,
  localities: initialLocalities,
  onLocalityCreated,
}: ProvenanceInfoFieldsProps) {
  const [localities, setLocalities] = useState<Locality[]>(initialLocalities);
  const [showAddLocalitySheet, setShowAddLocalitySheet] = useState(false);
  const [showEditLocalitySheet, setShowEditLocalitySheet] = useState(false);
  const [localityToEdit, setLocalityToEdit] = useState<Locality | null>(null);

  // Trouve la localité sélectionnée
  const selectedLocality = localities.find(
    (loc) => loc.id.toString() === form.watch("locality")
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Provenance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="countryOfOrigin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pays d&apos;origine</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: France" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localité</FormLabel>
                  <div className="flex gap-2 items-center">
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        if (value === "__add__") {
                          setShowAddLocalitySheet(true);
                        } else {
                          field.onChange(value);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une localité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {localities.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id.toString()}>
                            {loc.name}
                          </SelectItem>
                        ))}
                        <SelectItem
                          value="__add__"
                          className="text-primary font-bold"
                        >
                          ➕ Ajouter une localité
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedLocality && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setLocalityToEdit(selectedLocality);
                          setShowEditLocalitySheet(true);
                        }}
                        title="Modifier la localité"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Création */}
      <LocalityCreateSheet
        open={showAddLocalitySheet}
        onOpenChange={setShowAddLocalitySheet}
        onCreated={(locality) => {
          setLocalities((prev) => [...prev, locality]);
          onLocalityCreated(locality);
        }}
      />

      {/* Edition */}
      {localityToEdit && (
        <LocalityEditSheet
          open={showEditLocalitySheet}
          onOpenChange={(open) => {
            setShowEditLocalitySheet(open);
            if (!open) setLocalityToEdit(null);
          }}
          onEdited={(updatedLocality) => {
            setLocalities((prev) =>
              prev.map((loc) =>
                loc.id === updatedLocality.id ? updatedLocality : loc
              )
            );
            onLocalityCreated(updatedLocality);
          }}
          initialLocality={localityToEdit}
        />
      )}
    </>
  );
}
