-- Set createdAt to lastLogin for users where createdAt is after lastLogin
UPDATE "User"
SET "createdAt" = "lastLogin"
WHERE "createdAt" > "lastLogin";