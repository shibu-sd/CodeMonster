-- Remove test harness fields from problems table
-- This migration converts from LeetCode-style to Codeforces-style execution

-- Remove test harness related columns
ALTER TABLE "public"."problems" DROP COLUMN IF EXISTS "testHarness";
ALTER TABLE "public"."problems" DROP COLUMN IF EXISTS "inputFormat";
ALTER TABLE "public"."problems" DROP COLUMN IF EXISTS "outputFormat";

-- Update any existing test cases to simple format if needed
-- Note: This should be run after converting test cases to Codeforces format
