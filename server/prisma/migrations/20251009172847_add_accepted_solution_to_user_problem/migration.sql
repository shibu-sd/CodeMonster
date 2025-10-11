-- AlterTable
ALTER TABLE "public"."user_problems" ADD COLUMN     "acceptedLanguage" "public"."Language",
ADD COLUMN     "acceptedMemory" INTEGER,
ADD COLUMN     "acceptedRuntime" INTEGER,
ADD COLUMN     "acceptedSolution" TEXT;
