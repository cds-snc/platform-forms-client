-- CreateTable
CREATE TABLE "Setting" (
    "internalId" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionFr" TEXT,
    "value" TEXT,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("internalId")
);
