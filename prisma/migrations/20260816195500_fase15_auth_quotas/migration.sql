-- AlterTable
ALTER TABLE "users" ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'free';
ALTER TABLE "users" ADD COLUMN "monthly_content_quota" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "users" ADD COLUMN "monthly_image_quota" INTEGER NOT NULL DEFAULT 20;

-- CreateTable
CREATE TABLE "generation_usages" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "year_month" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generation_usages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "generation_usages_user_id_idx" ON "generation_usages"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "generation_usages_user_id_kind_year_month_key" ON "generation_usages"("user_id", "kind", "year_month");

-- AddForeignKey
ALTER TABLE "generation_usages" ADD CONSTRAINT "generation_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
