-- CreateEnum
CREATE TYPE "MenuSectionType" AS ENUM ('FOOD', 'DRINK');

-- AlterTable
ALTER TABLE "MenuSection" ADD COLUMN     "type" "MenuSectionType" NOT NULL DEFAULT 'FOOD';
