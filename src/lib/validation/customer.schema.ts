import { z } from "zod";

/**
 * Mirrors CustomerRegistrationRequest (backend):
 *   firstName, lastName, email, phoneNumber: @NotBlank
 *   email: @Email
 *   nationalId: @NotBlank @Size(min = 14, max = 14)
 *   address, dob: optional
 *
 * Keeping these constraints identical to the backend means a form that
 * passes client validation almost never gets rejected by the server for a
 * reason the user wasn't already told about — but the backend remains the
 * real authority: server-side field errors are still surfaced to the user
 * (see the interceptor in api/axiosInstance.ts), this schema is just a fast,
 * friendly first check.
 */
export const customerRegistrationSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
  nationalId: z
    .string()
    .trim()
    .length(14, "National ID must be exactly 14 digits")
    .regex(/^\d{14}$/, "National ID must contain digits only"),
  address: z.string().trim().optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
});

export type CustomerRegistrationFormValues = z.infer<typeof customerRegistrationSchema>;

/**
 * Mirrors CustomerUpdateRequest (backend) — same as registration, minus
 * `nationalId`, which the backend does not accept on update at all.
 */
export const customerUpdateSchema = customerRegistrationSchema.omit({ nationalId: true });

export type CustomerUpdateFormValues = z.infer<typeof customerUpdateSchema>;
