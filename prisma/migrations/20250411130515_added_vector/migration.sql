/*
  Warnings:

  - Added the required column `embedding` to the `Contents` table without a default value. This is not possible if the table is not empty.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "Contents" ADD COLUMN     "embedding" vector(768) NOT NULL;
