import { z } from "zod";
import { prisma } from "./prisma";
import { ApiError } from "./api-error";

const optionalPhone = z.string().trim().transform((value) => value.replace(/\D/g, "")).refine((value) => !value || /^\d{10,15}$/.test(value), "Enter a valid phone number");
const optionalEmail = z.string().trim().refine((value) => !value || z.email().safeParse(value).success, "Enter a valid email");

export const supplierInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  legalName: z.string().trim().max(180).default(""),
  gstNumber: z.string().trim().toUpperCase().max(20).refine((value) => !value || /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/.test(value), "Enter a valid GST number"),
  contactName: z.string().trim().max(100).default(""),
  contactNumber: optionalPhone,
  email: optionalEmail,
  address: z.string().trim().min(5).max(1000),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit PIN code"),
  isActive: z.boolean().default(true)
});

export async function saveSupplier(raw: unknown, id?: number) {
  const input = supplierInputSchema.parse(raw);
  const data = { ...input, legalName: input.legalName || null, gstNumber: input.gstNumber || null, contactName: input.contactName || null, contactNumber: input.contactNumber || null, email: input.email || null };
  if (id && !await prisma.supplier.findUnique({ where: { id } })) throw new ApiError(404, "SUPPLIER_NOT_FOUND", "Supplier not found.");
  return id ? prisma.supplier.update({ where: { id }, data }) : prisma.supplier.create({ data });
}
