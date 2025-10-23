-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "invitedBy" TEXT;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
