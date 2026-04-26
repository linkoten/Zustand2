-- Migrate all GASTROPODE records to AUTRES before renaming the enum value
UPDATE "Product" SET "category" = 'AUTRES'::"Category" WHERE "category" = 'GASTROPODE'::"Category";
UPDATE "FossilSpecies" SET "category" = 'AUTRES'::"Category" WHERE "category" = 'GASTROPODE'::"Category";
UPDATE "fossil_requests" SET "category" = 'AUTRES'::"Category" WHERE "category" = 'GASTROPODE'::"Category";

-- Rename enum value GASTROPODE → GASTEROPODE (PostgreSQL 10+)
ALTER TYPE "Category" RENAME VALUE 'GASTROPODE' TO 'GASTEROPODE';
