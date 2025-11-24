/*
  Warnings:

  - A unique constraint covering the columns `[questionEn]` on the table `SecurityQuestion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[questionFr]` on the table `SecurityQuestion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SecurityQuestion_questionEn_key" ON "SecurityQuestion"("questionEn");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityQuestion_questionFr_key" ON "SecurityQuestion"("questionFr");
