const query = `
/* ACCOUNT */
ALTER TABLE accounts RENAME COLUMN "user_id" TO "userId";
ALTER TABLE accounts RENAME COLUMN "provider_id" TO "provider";
ALTER TABLE accounts RENAME COLUMN "provider_account_id" TO "providerAccountId";
ALTER TABLE accounts RENAME COLUMN "access_token_expires" TO "expires_at";
ALTER TABLE accounts RENAME COLUMN "provider_type" TO "type";

/* Do conversion of TIMESTAMPTZ to BIGINT */
ALTER TABLE accounts ALTER COLUMN "expires_at" TYPE TEXT USING CAST(extract(epoch FROM "expires_at") AS BIGINT)*1000;

ALTER TABLE accounts ALTER COLUMN "type" TYPE TEXT;
ALTER TABLE accounts ALTER COLUMN "provider" TYPE TEXT;
ALTER TABLE accounts ALTER COLUMN "providerAccountId" TYPE TEXT;

ALTER TABLE accounts ADD CONSTRAINT fk_user_id FOREIGN KEY ("userId") REFERENCES users(id);
ALTER TABLE accounts
DROP COLUMN IF EXISTS "compound_id";
/* The following two timestamp columns have never been necessary for NextAuth.js to function, but can be kept if you want */
ALTER TABLE accounts
DROP COLUMN IF EXISTS "created_at",
DROP COLUMN IF EXISTS "updated_at";

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS "token_type" TEXT NULL,
ADD COLUMN IF NOT EXISTS "scope" TEXT NULL,
ADD COLUMN IF NOT EXISTS "id_token" TEXT NULL,
ADD COLUMN IF NOT EXISTS "session_state" TEXT NULL;

/* USER */
ALTER TABLE users RENAME COLUMN "email_verified" TO "emailVerified";

ALTER TABLE users ALTER COLUMN "name" TYPE TEXT;
ALTER TABLE users ALTER COLUMN "email" TYPE TEXT;
ALTER TABLE users ALTER COLUMN "image" TYPE TEXT;
/* Do conversion of TIMESTAMPTZ to BIGINT and then TEXT */
ALTER TABLE users ALTER COLUMN "emailVerified" TYPE TEXT USING CAST(CAST(extract(epoch FROM "emailVerified") AS BIGINT)*1000 AS TEXT);
/* The following two timestamp columns have never been necessary for NextAuth.js to function, but can be kept if you want */
ALTER TABLE users
DROP COLUMN IF EXISTS "created_at",
DROP COLUMN IF EXISTS "updated_at";

/* SESSION */
ALTER TABLE sessions RENAME COLUMN "session_token" TO "sessionToken";
ALTER TABLE sessions RENAME COLUMN "user_id" TO "userId";

ALTER TABLE sessions ALTER COLUMN "sessionToken" TYPE TEXT;
ALTER TABLE sessions ADD CONSTRAINT fk_user_id FOREIGN KEY ("userId") REFERENCES users(id);
/* Do conversion of TIMESTAMPTZ to BIGINT and then TEXT */
ALTER TABLE sessions ALTER COLUMN "expires" TYPE TEXT USING CAST(CAST(extract(epoch FROM "expires") AS BIGINT)*1000 AS TEXT);
ALTER TABLE sessions DROP COLUMN IF EXISTS "access_token";
/* The following two timestamp columns have never been necessary for NextAuth.js to function, but can be kept if you want */
ALTER TABLE sessions
DROP COLUMN IF EXISTS "created_at",
DROP COLUMN IF EXISTS "updated_at";

/* VERIFICATION REQUESTS */
ALTER TABLE verification_requests RENAME TO verification_tokens;

ALTER TABLE verification_tokens ALTER COLUMN "identifier" TYPE TEXT;
ALTER TABLE verification_tokens ALTER COLUMN "token" TYPE TEXT;
/* Do conversion of TIMESTAMPTZ to BIGINT and then TEXT */
ALTER TABLE verification_tokens ALTER COLUMN "expires" TYPE TEXT USING CAST(CAST(extract(epoch FROM "expires") AS BIGINT)*1000 AS TEXT);
/* The following two timestamp columns have never been necessary for NextAuth.js to function, but can be kept if you want */
ALTER TABLE verification_tokens
DROP COLUMN IF EXISTS "created_at",
DROP COLUMN IF EXISTS "updated_at";
`;

module.exports.generateSql = () => `${query}`;
