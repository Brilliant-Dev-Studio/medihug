-- Foreign-key indexes Postgres doesn't create automatically (unlike MySQL) — speeds up
-- lookups by doctor/clinic/user/conversation across the app's most-queried relations.
CREATE INDEX IF NOT EXISTS "DoctorGallery_doctorId_idx" ON "DoctorGallery"("doctorId");
CREATE INDEX IF NOT EXISTS "DoctorSlot_doctorId_idx" ON "DoctorSlot"("doctorId");
CREATE INDEX IF NOT EXISTS "ClinicDoctor_doctorId_idx" ON "ClinicDoctor"("doctorId");
CREATE INDEX IF NOT EXISTS "ClinicProduct_productId_idx" ON "ClinicProduct"("productId");
CREATE INDEX IF NOT EXISTS "Appointment_userId_idx" ON "Appointment"("userId");
CREATE INDEX IF NOT EXISTS "Appointment_doctorId_idx" ON "Appointment"("doctorId");
CREATE INDEX IF NOT EXISTS "Appointment_clinicId_idx" ON "Appointment"("clinicId");
CREATE INDEX IF NOT EXISTS "CustomTimeRequest_userId_idx" ON "CustomTimeRequest"("userId");
CREATE INDEX IF NOT EXISTS "CustomTimeRequest_doctorId_idx" ON "CustomTimeRequest"("doctorId");
CREATE INDEX IF NOT EXISTS "Blog_authorDoctorId_idx" ON "Blog"("authorDoctorId");
CREATE INDEX IF NOT EXISTS "FavoriteDoctor_doctorId_idx" ON "FavoriteDoctor"("doctorId");
CREATE INDEX IF NOT EXISTS "FavoriteProduct_productId_idx" ON "FavoriteProduct"("productId");
CREATE INDEX IF NOT EXISTS "SupportMessage_conversationId_idx" ON "SupportMessage"("conversationId");
