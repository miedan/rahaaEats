-- Nullify duplicate emails, keeping the one belonging to the most recently created account
UPDATE "User" u
SET email = NULL
WHERE email IS NOT NULL
  AND id NOT IN (
    SELECT DISTINCT ON (email) id
    FROM "User"
    WHERE email IS NOT NULL
    ORDER BY email, "createdAt" DESC
  );

-- Add partial unique index (NULL values are excluded, so multiple NULL emails are allowed)
CREATE UNIQUE INDEX "User_email_key" ON "User"("email") WHERE "email" IS NOT NULL;
