/*
  Warnings:

  - You are about to drop the column `opponentStart` on the `PlayerMove` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PlayerMove" DROP COLUMN "opponentStart",
ADD COLUMN     "isOpponentStart" BOOLEAN NOT NULL DEFAULT false;
