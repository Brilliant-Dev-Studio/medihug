import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'medihug_fallback_secret'
);

export interface AdminTokenPayload {
  id:       string;
  name:     string;
  phone:    string;
  role:     string;
  doctorId?: string;
  clinicId?: string;
}

export async function signAdminToken(payload: AdminTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as AdminTokenPayload;
  } catch {
    return null;
  }
}

// Doctor and Partner sessions reuse the same JWT shape/secret, just a different cookie name.
export const signDoctorToken   = signAdminToken;
export const verifyDoctorToken = verifyAdminToken;
export const signPartnerToken   = signAdminToken;
export const verifyPartnerToken = verifyAdminToken;
