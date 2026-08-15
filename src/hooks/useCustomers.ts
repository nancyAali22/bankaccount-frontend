import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from "@/api/customersApi";
import { queryKeys } from "@/lib/queryKeys";
import { notify } from "@/lib/notify";
import type { ApiError } from "@/types/apiError";
import type {
  CustomerRegistrationFormValues,
  CustomerUpdateFormValues,
} from "@/lib/validation/customer.schema";

export function useCustomers() {
  return useQuery({
    queryKey: queryKeys.customers.all(),
    queryFn: getCustomers,
  });
}

/**
 * Creates a customer, then invalidates the customers list so the table
 * refetches and shows the new record. We invalidate rather than manually
 * patching the cache: the backend assigns the id/createdAt, so re-fetching
 * is the only way to be sure the cache matches what the server actually
 * persisted.
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CustomerRegistrationFormValues) => createCustomer(values),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all() });
      notify.success(`${customer.firstName} ${customer.lastName} was added.`);
    },
    onError: (error: ApiError) => {
      // Field-level errors (400 validation) are shown inline on the form by
      // the caller; this toast only fires for errors the form can't attach
      // to a specific field (e.g. 409 duplicate national ID/email).
      if (!error.fieldErrors) {
        notify.error(error.message);
      }
    },
  });
}

export function useUpdateCustomer(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CustomerUpdateFormValues) => updateCustomer(id, values),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(id) });
      notify.success(`${customer.firstName} ${customer.lastName} was updated.`);
    },
    onError: (error: ApiError) => {
      if (!error.fieldErrors) {
        notify.error(error.message);
      }
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all() });
      notify.success("Customer deleted.");
    },
    onError: (error: ApiError) => {
      notify.error(error.message);
    },
  });
}