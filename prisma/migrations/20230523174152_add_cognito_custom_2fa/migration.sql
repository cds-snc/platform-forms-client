-- CreateTable
CREATE TABLE "CognitoCustom2FA" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cognitoToken" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CognitoCustom2FA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CognitoCustom2FA_email_key" ON "CognitoCustom2FA"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CognitoCustom2FA_verificationCode_key" ON "CognitoCustom2FA"("verificationCode");

-- CreateIndex
CREATE UNIQUE INDEX "CognitoCustom2FA_id_email_key" ON "CognitoCustom2FA"("id", "email");
