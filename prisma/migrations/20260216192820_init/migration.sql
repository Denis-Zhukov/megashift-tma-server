-- CreateEnum
CREATE TYPE "AccessClaim" AS ENUM ('READ', 'EDIT_OWNER', 'EDIT_SELF', 'DELETE_OWNER', 'DELETE_SELF');

-- CreateEnum
CREATE TYPE "SalaryType" AS ENUM ('HOURLY', 'SHIFT', 'MONTHLY');

-- CreateTable
CREATE TABLE "shift_templates" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shift_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "shift_template_id" TEXT,
    "date" DATE NOT NULL,
    "actual_start_time" TIME,
    "actual_end_time" TIME,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_access" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "grantedToId" TEXT NOT NULL,
    "claim" "AccessClaim" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "patronymic" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "salary" DOUBLE PRECISION,
    "typeSalary" "SalaryType",
    "maxSalary" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shifts_owner_id_date_idx" ON "shifts"("owner_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "user_access_ownerId_grantedToId_claim_key" ON "user_access"("ownerId", "grantedToId", "claim");

-- AddForeignKey
ALTER TABLE "shift_templates" ADD CONSTRAINT "shift_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_shift_template_id_fkey" FOREIGN KEY ("shift_template_id") REFERENCES "shift_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_access" ADD CONSTRAINT "user_access_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_access" ADD CONSTRAINT "user_access_grantedToId_fkey" FOREIGN KEY ("grantedToId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
