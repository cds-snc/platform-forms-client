-- CreateTable
CREATE TABLE "UserFeature" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,

    CONSTRAINT "UserFeature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserFeature_userId_feature_key" ON "UserFeature"("userId", "feature");

-- AddForeignKey
ALTER TABLE "UserFeature" ADD CONSTRAINT "UserFeature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
