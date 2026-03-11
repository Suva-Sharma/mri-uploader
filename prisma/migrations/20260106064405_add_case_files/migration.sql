-- CreateTable
CREATE TABLE "CaseFile" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedPath" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" BIGINT NOT NULL,
    "checksumSha256" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatedAt" TIMESTAMP(3),

    CONSTRAINT "CaseFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CaseFile_caseId_idx" ON "CaseFile"("caseId");

-- CreateIndex
CREATE INDEX "CaseFile_uploadedAt_idx" ON "CaseFile"("uploadedAt");

-- CreateIndex
CREATE INDEX "Case_submitterEmail_idx" ON "Case"("submitterEmail");

-- CreateIndex
CREATE INDEX "Case_status_idx" ON "Case"("status");

-- CreateIndex
CREATE INDEX "Case_createdAt_idx" ON "Case"("createdAt");

-- AddForeignKey
ALTER TABLE "CaseFile" ADD CONSTRAINT "CaseFile_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
