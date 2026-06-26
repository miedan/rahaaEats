-- CreateTable
CREATE TABLE "SavedMomoNumber" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "provider" "MomoProvider" NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedMomoNumber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedMomoNumber_userId_phoneNumber_key" ON "SavedMomoNumber"("userId", "phoneNumber");

-- AddForeignKey
ALTER TABLE "SavedMomoNumber" ADD CONSTRAINT "SavedMomoNumber_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
