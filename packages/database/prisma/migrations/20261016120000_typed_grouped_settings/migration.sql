-- Add metadata for typed and grouped application settings. Existing values are intentionally
-- untouched so currently configured production settings keep their behavior.
ALTER TABLE "Setting"
ADD COLUMN "type" TEXT NOT NULL DEFAULT 'string',
ADD COLUMN "groupEn" TEXT,
ADD COLUMN "groupFr" TEXT;
