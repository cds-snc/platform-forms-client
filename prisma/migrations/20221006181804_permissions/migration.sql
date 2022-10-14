/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "role";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "Privilege" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionFr" TEXT,
    "permissions" JSONB NOT NULL,

    CONSTRAINT "Privilege_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PrivilegeToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Privilege_nameEn_key" ON "Privilege"("nameEn");

-- CreateIndex
CREATE UNIQUE INDEX "Privilege_nameFr_key" ON "Privilege"("nameFr");

-- CreateIndex
CREATE UNIQUE INDEX "_PrivilegeToUser_AB_unique" ON "_PrivilegeToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PrivilegeToUser_B_index" ON "_PrivilegeToUser"("B");

-- AddForeignKey
ALTER TABLE "_PrivilegeToUser" ADD CONSTRAINT "_PrivilegeToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Privilege"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrivilegeToUser" ADD CONSTRAINT "_PrivilegeToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Populate with Privileges

INSERT INTO
  "Privilege" ("id","nameEn", "nameFr", "descriptionEn", "descriptionFr", "permissions")
VALUES
  (uuid_generate_v4(),'Base','Base','Base Permissions','Autorisations de Base','[
    {"action":"create","subject":"FormRecord"},
    {"action":["view","update","delete"],"subject":"FormRecord","conditions":{"users":{"$elemMatch":{"id":"${user.id}"}}}},
    {"action":"update","subject":"FormRecord","fields":["publishingStatus"],"inverted":true},
    {"action":"delete","subject":"FormRecord","conditions":{"publishingStatus":true},"inverted":true}
  ]'::JSONB),
    (uuid_generate_v4(),'PublishForm','PublierUnFormulaire','Permission to Publish a Form','Autorisation de publier un formulaire','[
    {"action":["update"],"subject":"FormRecord","fields":["publishingStatus"],"conditions":{"users":{"$elemMatch":{"id":"${user.id}"}}}}
  ]'::JSONB),
    (uuid_generate_v4(),'ManageForm','GérerLesFormulaire','Permission to manage all Forms','Autorisation de gérer tous les formulaires','[
    {"action":["create","view","update","delete"],"subject":"FormRecord"}
  ]'::JSONB),
  (uuid_generate_v4(),'ViewUserPrivileges','VisionnerPrivilègesUtilisateur','Permission to view user privileges','Autorisation d''afficher les privilèges de l''utilisateur','[
    {"action":"view","subject":["User","Privilege"]}
  ]'::JSONB),
  (uuid_generate_v4(),'ManageUsers','GérerUtilisateurs','Permission to manage users','Autorisation de gérer les utilisateurs','[
    {"action":"view","subject":["User","Privilege"]},
    {"action":"update","subject":"User"}
  ]'::JSONB),
   (uuid_generate_v4(),'ManagePrivileges','GérerPrivilèges','Permission to manage privileges','Autorisation de gérer les privilèges','[
    {"action":["create","view","update","delete"],"subject":"Privilege"}
  ]'::JSONB),
  (uuid_generate_v4(),'ViewApplicationSettings','VisionnerParamètresApplication','Permission to view application settings','Autorisation d''afficher les paramètres de l''application','[
    {"action":"view","subject":"Flags"}
  ]'::JSONB),
  (uuid_generate_v4(),'ManageApplicationSettings','GérerParamètresApplication','Permission to manage application settings','Autorisation de gérer les paramètres de l''application','[
    {"action":"view","subject":"Flags"},
    {"action":"update","subject":"Flags"}
  ]'::JSONB);
  
    