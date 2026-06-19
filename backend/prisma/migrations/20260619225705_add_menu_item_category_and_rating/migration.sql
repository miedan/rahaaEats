-- CreateEnum
CREATE TYPE "FoodCategory" AS ENUM ('BURGER', 'BEEF', 'DESSERT', 'JUICE', 'NOODLES', 'PIZZA', 'SALAD', 'OTHER');

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "category" "FoodCategory" NOT NULL DEFAULT 'OTHER';

-- CreateIndex
CREATE INDEX "MenuItem_category_idx" ON "MenuItem"("category");

-- CreateIndex
CREATE INDEX "Restaurant_isApproved_isOpen_idx" ON "Restaurant"("isApproved", "isOpen");
