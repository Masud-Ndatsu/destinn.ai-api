-- CreateTable
CREATE TABLE "scrape_targets" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "platform" TEXT,
    "label" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT,
    "last_scraped_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scrape_targets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scrape_targets_url_key" ON "scrape_targets"("url");
