import { axiosInstance } from "./axiosInstance";
import type { Customer } from "@/types/customer";
import type {
  CustomerRegistrationFormValues,
  CustomerUpdateFormValues,
} from "@/lib/validation/customer.schema";

export async function getCustomers(): Promise<Customer[]> {
  const response = await axiosInstance.get<Customer[]>("customers");
  return response.data;
}

export async function getCustomer(id: number): Promise<Customer> {
  const response = await axiosInstance.get<Customer>(`customers/${id}`);
  return response.data;
}

/**
 * Maps the form's optional-empty-string fields to what the backend expects:
 * `dob`/`address` should be omitted (not sent as `""`) when the user left
 * them blank, since the backend fields are plain optional strings/dates,
 * not "empty string means no value".
 */
function toRegistrationPayload(values: CustomerRegistrationFormValues) {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    phoneNumber: values.phoneNumber,
    nationalId: values.nationalId,
    address: values.address ? values.address : undefined,
    dob: values.dob ? values.dob : undefined,
  };
}

function toUpdatePayload(values: CustomerUpdateFormValues) {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    phoneNumber: values.phoneNumber,
    address: values.address ? values.address : undefined,
    dob: values.dob ? values.dob : undefined,
  };
}

export async function createCustomer(values: CustomerRegistrationFormValues): Promise<Customer> {
  const response = await axiosInstance.post<Customer>("customers", toRegistrationPayload(values));
  return response.data;
}

export async function updateCustomer(
  id: number,
  values: CustomerUpdateFormValues,
): Promise<Customer> {
  const response = await axiosInstance.put<Customer>(`customers/${id}`, toUpdatePayload(values));
  return response.data;
}

export async function deleteCustomer(id: number): Promise<void> {
  await axiosInstance.delete(`customers/${id}`);
}