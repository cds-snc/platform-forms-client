-- CreateTable
CREATE TABLE "_TemplateNotificationsUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TemplateNotificationsUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TemplateNotificationsUsers_B_index" ON "_TemplateNotificationsUsers"("B");

-- AddForeignKey
ALTER TABLE "_TemplateNotificationsUsers" ADD CONSTRAINT "_TemplateNotificationsUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TemplateNotificationsUsers" ADD CONSTRAINT "_TemplateNotificationsUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
