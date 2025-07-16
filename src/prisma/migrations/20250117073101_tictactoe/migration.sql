/*
  Warnings:

  - You are about to drop the `BoardRow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BoardRowResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskResult` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BoardRow" DROP CONSTRAINT "BoardRow_taskId_fkey";

-- DropForeignKey
ALTER TABLE "BoardRowResult" DROP CONSTRAINT "BoardRowResult_taskResultId_fkey";

-- DropTable
DROP TABLE "BoardRow";

-- DropTable
DROP TABLE "BoardRowResult";

-- DropTable
DROP TABLE "Task";

-- DropTable
DROP TABLE "TaskResult";

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "player" INTEGER NOT NULL DEFAULT 1,
    "opponentStart" BOOLEAN NOT NULL DEFAULT true,
    "allocated" BOOLEAN NOT NULL DEFAULT false,
    "board" TEXT NOT NULL DEFAULT '0,0,0,0,0,0,0,0,0',

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerMove" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "moveCell" INTEGER NOT NULL,
    "allocated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlayerMove_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlayerMove" ADD CONSTRAINT "PlayerMove_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
