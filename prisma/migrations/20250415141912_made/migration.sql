/*
  Warnings:

  - Made the column `title` on table `Contents` required. This step will fail if there are existing NULL values in that column.
  - Made the column `content` on table `Contents` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Contents" ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "content" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
