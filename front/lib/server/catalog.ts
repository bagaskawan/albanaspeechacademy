import { academyRequest } from "./academy-api";

const PROGRAM_COLUMNS =
  "slug,title,description,materials,form_prior_experience,form_goal,form_challenge,batches(slug,title,registration_open,is_active,venue,address,price_idr,normal_price_idr,fee_details,form_kind,dp_percent,sessions)";

export async function readPrograms() {
  const programs = await academyRequest(
    `programs?select=${PROGRAM_COLUMNS}&order=slug&batches.order=slug`,
  );
  if (!Array.isArray(programs)) throw new Error("Respons program tidak valid.");
  return programs;
}
