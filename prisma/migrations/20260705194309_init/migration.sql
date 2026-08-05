-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "searches" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "city" TEXT,
    "neighborhood" TEXT,
    "postal_code" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "radius" DOUBLE PRECISION,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "total_found" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "google_place_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "formatted_address" TEXT NOT NULL,
    "website_uri" TEXT,
    "national_phone_number" TEXT,
    "rating" DOUBLE PRECISION,
    "user_rating_count" INTEGER,
    "current_opening_hours" JSONB,
    "business_status" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "google_maps_uri" TEXT,
    "primary_type" TEXT,
    "types" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_searches" (
    "search_id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_searches_pkey" PRIMARY KEY ("search_id","business_id")
);

-- CreateTable
CREATE TABLE "digital_presences" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "emails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "facebook_url" TEXT,
    "instagram_url" TEXT,
    "linkedin_url" TEXT,
    "tiktok_url" TEXT,
    "ssl_valid" BOOLEAN NOT NULL DEFAULT false,
    "ssl_issuer" TEXT,
    "load_time_ms" INTEGER,
    "domain_expiry" TIMESTAMP(3),
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "has_google_analytics" BOOLEAN NOT NULL DEFAULT false,
    "has_meta_pixel" BOOLEAN NOT NULL DEFAULT false,
    "gbp_photo_count" INTEGER NOT NULL DEFAULT 0,
    "is_claimed" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "digital_presences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_analyses" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "lead_score" INTEGER NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'LOW',
    "scoring_rules" JSONB NOT NULL,
    "ai_needs" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "opportunities" TEXT[],
    "sales_proposal" TEXT NOT NULL,
    "cold_email" TEXT NOT NULL,
    "whatsapp_message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "searches_user_id_idx" ON "searches"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_google_place_id_key" ON "businesses"("google_place_id");

-- CreateIndex
CREATE INDEX "businesses_latitude_longitude_idx" ON "businesses"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "businesses_primary_type_idx" ON "businesses"("primary_type");

-- CreateIndex
CREATE UNIQUE INDEX "digital_presences_business_id_key" ON "digital_presences"("business_id");

-- CreateIndex
CREATE INDEX "business_analyses_business_id_idx" ON "business_analyses"("business_id");

-- CreateIndex
CREATE INDEX "business_analyses_priority_idx" ON "business_analyses"("priority");

-- AddForeignKey
ALTER TABLE "searches" ADD CONSTRAINT "searches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_searches" ADD CONSTRAINT "business_searches_search_id_fkey" FOREIGN KEY ("search_id") REFERENCES "searches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_searches" ADD CONSTRAINT "business_searches_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_presences" ADD CONSTRAINT "digital_presences_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_analyses" ADD CONSTRAINT "business_analyses_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
