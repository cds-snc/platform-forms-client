-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "brandingRequestForm" TEXT NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_brandingRequestForm_key" ON "Settings"("brandingRequestForm");
