/*
  Warnings:

  - You are about to drop the column `unitNumber` on the `Address` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "unitNumber",
ADD COLUMN     "apartmentName" TEXT,
ADD COLUMN     "buildingNumber" TEXT,
ADD COLUMN     "doorNumber" TEXT,
ADD COLUMN     "floorNumber" TEXT,
ADD COLUMN     "formattedAddress" TEXT,
ADD COLUMN     "houseNumber" TEXT;
