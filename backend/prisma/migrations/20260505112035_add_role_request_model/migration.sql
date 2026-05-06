-- CreateTable
CREATE TABLE "RoleRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "requestedRole" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT NOT NULL,
    "position" TEXT,
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RoleRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "RoleRequest_userId_idx" ON "RoleRequest"("userId");

-- CreateIndex
CREATE INDEX "RoleRequest_status_idx" ON "RoleRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RoleRequest_userId_key" ON "RoleRequest"("userId");
