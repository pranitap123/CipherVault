-- AlterTable: add envelope-encryption columns. All nullable except
-- enc_version, which defaults to 1 so any pre-existing (legacy CBC) rows
-- remain valid without a backfill — they're read through the decrypt-only
-- v1 path in encryption.service.ts.
ALTER TABLE "files"
  ADD COLUMN "auth_tag" BYTEA,
  ADD COLUMN "wrapped_key" BYTEA,
  ADD COLUMN "key_iv" BYTEA,
  ADD COLUMN "key_auth_tag" BYTEA,
  ADD COLUMN "enc_version" INTEGER NOT NULL DEFAULT 1;
