import { PrismaClient } from "../lib/prismaClient";
import jwt from 'jsonwebtoken';

export interface Context {
  prisma: PrismaClient;
  user: jwt.JwtPayload | null;
}
