-- CreateTable
CREATE TABLE "CognitoCustom2FA" (
    "email" TEXT NOT NULL,
    "cognitoToken" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CognitoCustom2FA_verificationCode_key" ON "CognitoCustom2FA"("verificationCode");

-- CreateIndex
CREATE UNIQUE INDEX "CognitoCustom2FA_email_verificationCode_key" ON "CognitoCustom2FA"("email", "verificationCode");
