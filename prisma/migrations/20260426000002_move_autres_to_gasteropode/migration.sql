-- Move all AUTRES records to GASTEROPODE
UPDATE "Product" SET "category" = 'GASTEROPODE'::"Category" WHERE "category" = 'AUTRES'::"Category";
UPDATE "FossilSpecies" SET "category" = 'GASTEROPODE'::"Category" WHERE "category" = 'AUTRES'::"Category";
UPDATE "fossil_requests" SET "category" = 'GASTEROPODE'::"Category" WHERE "category" = 'AUTRES'::"Category";
