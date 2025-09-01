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
import LocalityCreate from "./localityCreateSheet";
import { useState } from "react";
import { Locality } from "@/lib/generated/prisma";

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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <LocalityCreate
        open={showAddLocalitySheet}
        onOpenChange={setShowAddLocalitySheet}
        onCreated={(locality) => {
          onLocalityCreated(locality);
        }}
      />
    </>
  );
}
