export type BodyResponse<T> = T | { message: string };

export interface CertificateMetadata {
  enrollmentNumber: string;
  ownerId: string;
  adminId: string;
  description: string;
  actValue: string;
  city: string;
}
