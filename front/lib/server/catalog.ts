import { academyRequest } from "./academy-api";

// Harga, DP, dan jenis formulir hanya ada di Program; batch hanya nama dan jadwal.
const PROGRAM_COLUMNS =
  "slug,title,description,materials,price_idr,original_price_idr,dp_percent,form_kind,fee_details,form_prior_experience,form_goal,form_challenge,batches(slug,title,registration_open,is_active,sessions)";

export async function readPrograms() {
  const programs = await academyRequest(
    `programs?select=${PROGRAM_COLUMNS}&order=slug&batches.order=slug`,
  );
  if (!Array.isArray(programs)) throw new Error("Respons program tidak valid.");
  return programs;
}
