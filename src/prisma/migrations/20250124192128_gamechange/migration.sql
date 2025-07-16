/*
  Warnings:

  - You are about to drop the column `allocated` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `opponentStart` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `player` on the `Game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "allocated",
DROP COLUMN "opponentStart",
DROP COLUMN "player",
ADD COLUMN     "userId" INTEGER NOT NULL DEFAULT 1;
