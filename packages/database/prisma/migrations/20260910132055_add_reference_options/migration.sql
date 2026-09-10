-- CreateTable
CREATE TABLE "reference_options" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reference_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reference_options_category_idx" ON "reference_options"("category");

-- CreateIndex
CREATE UNIQUE INDEX "reference_options_category_value_key" ON "reference_options"("category", "value");
