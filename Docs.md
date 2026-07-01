# Clinic — Field Reference

Patient UI (`/patient/clinics/[id]`) မှာ သုံးတဲ့ field တွေနဲ့ DB (`Clinic` model) ရဲ့ ယှဉ်ချက်။

---

## DB ရှိပြီး (Clinic model)

| Field | Type | UI ဘာလုပ်လဲ |
|---|---|---|
| `id` | String CUID | URL `/patient/clinics/[id]` |
| `name` | String | clinic name (Myanmar) |
| `nameEn` | String? | clinic name (English) |
| `type` | Enum `CLINIC / PHARMACY / HOSPITAL` | filter badge |
| `phone` | String? | ဖုန်းနံပါတ် row |
| `openTime` | String? | ဆေးခန်းချိန် (e.g. `"08:00"`) |
| `closeTime` | String? | ဆေးခန်းချိန် (e.g. `"17:00"`) |
| `address` | String? | လိပ်စာ (Myanmar only) |
| `imageUrl` | String? | clinic square logo/photo |
| `isActive` | Boolean | ပြ/မပြ toggle |
| `isPartner` | Boolean | partner badge |
| `doctors` | ClinicDoctor[] | "Our Doctors" section |

---

## DB မရှိသေး — ထပ်ထည့်ဖို့လိုတဲ့ field တွေ

| Field | Type | UI ဘာလုပ်လဲ |
|---|---|---|
| `addressEn` | String? | လိပ်စာ (English) |
| `website` | String? | ဝက်ဘ်ဆိုက် row |
| `aboutMm` | String? | "About" section (Myanmar) |
| `aboutEn` | String? | "About" section (English) |
| `tagsMm` | String[] | service tags (Myanmar chips) |
| `tagsEn` | String[] | service tags (English chips) |
| `coverUrl` | String? | hero banner (wide image, 1600×600) |
| `verified` | Boolean | ✓ verified badge |
| `rating` | Float | ⭐ rating display |
| `reviewCount` | Int | (x reviews) count |

---

## Doctors section

DB `ClinicDoctor` relation → `Doctor` join ရပြီ။

Patient UI မှာ doctor card တွင် ပြတာ:

| Field | Source |
|---|---|
| `name` | Doctor.name / nameEn |
| `spec_mm / spec_en` | Doctor.specialty |
| `rating` | Doctor.rating |
| `price` | Doctor.price |
| `img` | Doctor.imageUrl |
| `reviews` | Doctor.reviewCount |
| `waitMin` | static hardcoded (15) — DB မရှိ, မလိုဘူး |
| `nextSlot_mm/en` | static hardcoded — real logic မရေးရသေး |

---

## Products section

Patient UI မှာ clinic products ပြနေတာ **static data** — DB `Product` model ရှိပေမယ့် `Clinic` နဲ့ **relation မချိတ်ဆက်ထား**။

ချိတ်ဆက်ဖို့ schema မှာ ထပ်ထည့်ဖို့လိုမယ်:

```prisma
model ClinicProduct {
  id        String  @id @default(cuid())
  clinicId  String
  productId String
  clinic    Clinic  @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@unique([clinicId, productId])
}
```

---

## Admin Dashboard ဆောက်ဖို့ လိုအပ်တာ Summary

### 1. Schema update
- `Clinic` model မှာ `addressEn, website, aboutMm, aboutEn, tagsMm[], tagsEn[], coverUrl, verified, rating, reviewCount` ထပ်ထည့်
- `ClinicProduct` junction table ထပ်ထည့် (Clinic ↔ Product)

### 2. Admin Clinics page (`/admin/clinics`)
- List view — name, type badge, isActive toggle, isPartner toggle, partner count
- Create drawer — all fields above (step 1: basic info, step 2: assign doctors)
- Search + filter by type (CLINIC / PHARMACY / HOSPITAL)

### 3. Admin Clinic detail page (`/admin/clinics/[id]`)
- Edit Info panel — name (MM/EN), type, phone, openTime, closeTime, address (MM/EN), website, imageUrl, coverUrl, verified toggle, isActive toggle, isPartner toggle
- About section — aboutMm / aboutEn textarea
- Tags section — tagsMm / tagsEn array inputs (add/remove)
- Linked Doctors section — assign/remove doctors from ClinicDoctor
- Products section — assign/remove products from ClinicProduct
- Gallery (optional, same pattern as Doctor gallery)

### 4. APIs needed
- `GET/POST /api/admin/clinics`
- `GET/PATCH/DELETE /api/admin/clinics/[id]`
- `GET /api/clinics` (public, for patient list page)
- `GET /api/clinics/[id]` (public, for patient detail page)
