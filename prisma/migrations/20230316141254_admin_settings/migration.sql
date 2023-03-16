-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "brandingRequestFormId" TEXT NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_brandingRequestFormId_key" ON "Settings"("brandingRequestFormId");
