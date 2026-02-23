-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('RUB', 'USD', 'BYN', 'EUR', 'KZT');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currency" "Currency",
ALTER COLUMN "maxSalary" DROP NOT NULL,
ALTER COLUMN "maxSalary" DROP DEFAULT;
