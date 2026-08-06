import { tool } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/db';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const searchDoctors = tool({
  description: 'Search for doctors by specialty or name. Use whenever the user asks about doctors, specialists, consultation fees, or "do you have a doctor for X". IMPORTANT: specialty names may be stored in Myanmar or English — call listSpecialties first to get the exact name on record, then pass that exact string here. Do not translate or guess the specialty name.',
  inputSchema: z.object({
    specialty: z.string().optional().describe('Exact specialty name as returned by listSpecialties, e.g. "မျက်စိရောဂါကု" or "Cardiology"'),
    search: z.string().optional().describe('Free-text search over doctor name'),
    limit: z.number().int().min(1).max(10).optional().default(10),
  }),
  execute: async ({ specialty, search, limit }) => {
    const where: Record<string, unknown> = { isActive: true, isAvailable: true };
    const and: Record<string, unknown>[] = [];
    if (specialty) and.push({
      OR: [
        { specialty: { contains: specialty, mode: 'insensitive' } },
        { specialtyEn: { contains: specialty, mode: 'insensitive' } },
      ],
    });
    if (search) and.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
      ],
    });
    if (and.length > 0) where.AND = and;
    const doctors = await db.doctor.findMany({
      where,
      select: {
        id: true, name: true, nameEn: true, specialty: true, specialtyEn: true,
        bio: true, experience: true, rating: true, reviewCount: true, price: true,
        qualifications: true, languages: true, location: true,
      },
      take: limit ?? 10,
      orderBy: { rating: 'desc' },
    });
    return { count: doctors.length, doctors };
  },
});

export const getDoctorAvailability = tool({
  description: "Get a specific doctor's weekly availability schedule. Use when the user asks when a doctor is available or what days/times they work.",
  inputSchema: z.object({
    doctorName: z.string().describe('The doctor\'s name (partial match ok)'),
  }),
  execute: async ({ doctorName }) => {
    const doctor = await db.doctor.findFirst({
      where: {
        isActive: true,
        OR: [
          { name: { contains: doctorName, mode: 'insensitive' } },
          { nameEn: { contains: doctorName, mode: 'insensitive' } },
        ],
      },
      select: {
        name: true, nameEn: true,
        slots: { where: { isActive: true }, orderBy: { dayOfWeek: 'asc' }, select: { dayOfWeek: true, startTime: true, endTime: true } },
      },
    });
    if (!doctor) return { found: false };
    return {
      found: true,
      name: doctor.nameEn ?? doctor.name,
      schedule: doctor.slots.map(s => `${DAYS[s.dayOfWeek]}: ${s.startTime}–${s.endTime}`),
    };
  },
});

export const listSpecialties = tool({
  description: 'List all doctor specialties offered on the platform. Use when the user asks what specialties/departments are available.',
  inputSchema: z.object({}),
  execute: async () => {
    const specialties = await db.specialty.findMany({ select: { name: true, nameEn: true }, orderBy: { name: 'asc' } });
    return { specialties };
  },
});

export const searchClinics = tool({
  description: 'Search for partner clinics/hospitals by type or name. Use when the user asks about partner clinics, hospitals, or locations.',
  inputSchema: z.object({
    type: z.string().optional().describe('Clinic type, e.g. "Hospital", "Clinic"'),
    search: z.string().optional(),
    limit: z.number().int().min(1).max(10).optional().default(10),
  }),
  execute: async ({ type, search, limit }) => {
    const where: Record<string, unknown> = { isActive: true, isPartner: true };
    if (type) where.type = { contains: type, mode: 'insensitive' };
    if (search) where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { nameEn: { contains: search, mode: 'insensitive' } },
    ];
    const clinics = await db.clinic.findMany({
      where,
      select: {
        name: true, nameEn: true, type: true, address: true, township: true, state: true,
        openTime: true, closeTime: true, aboutMm: true, aboutEn: true, tagsEn: true, rating: true,
      },
      take: limit ?? 10,
    });
    return { count: clinics.length, clinics };
  },
});

export const searchProducts = tool({
  description: 'Search the pharmacy/product catalog. Use when the user asks about products, medicines, or health items for sale.',
  inputSchema: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    limit: z.number().int().min(1).max(10).optional().default(10),
  }),
  execute: async ({ search, category, limit }) => {
    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = { contains: category, mode: 'insensitive' };
    if (search) where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { nameEn: { contains: search, mode: 'insensitive' } },
    ];
    const products = await db.product.findMany({
      where,
      select: { name: true, nameEn: true, description: true, price: true, category: true, brand: true, keyBenefits: true },
      take: limit ?? 10,
    });
    return { count: products.length, products };
  },
});

export const listHealthcarePrograms = tool({
  description: 'List active healthcare programs offered by the platform (e.g. weight management, child healthcare). Use when the user asks about programs or special care plans.',
  inputSchema: z.object({}),
  execute: async () => {
    const programs = await db.healthcareProgram.findMany({
      where: { isActive: true },
      select: { titleMm: true, titleEn: true, descMm: true, descEn: true },
      orderBy: { order: 'asc' },
    });
    return { programs };
  },
});

export const partnerChatTools = {
  searchDoctors,
  getDoctorAvailability,
  listSpecialties,
  searchClinics,
  searchProducts,
  listHealthcarePrograms,
};
