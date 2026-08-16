import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/useCustomers";
import {
  customerRegistrationSchema,
  customerUpdateSchema,
  type CustomerRegistrationFormValues,
} from "@/lib/validation/customer.schema";
import type { Customer } from "@/types/customer";
import type { ApiError } from "@/types/apiError";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Presence of `customer` decides add vs. edit mode. */
  customer?: Customer;
}

const emptyValues: CustomerRegistrationFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  nationalId: "",
  address: "",
  dob: "",
};

function toFormValues(customer: Customer): CustomerRegistrationFormValues {
  return {
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phoneNumber: customer.phoneNumber,
    nationalId: customer.nationalId,
    address: customer.address ?? "",
    dob: customer.dob ?? "",
  };
}

/**
 * Add/Edit customer form.
 *
 * Validation runs in two layers, deliberately:
 *   1. zod schema (customer.schema.ts), checked by hand in onSubmit via
 *      `.safeParse` — mirrors the backend's @NotBlank/@Size/@Email rules so
 *      most mistakes are caught before a request is even sent. No
 *      @hookform/resolvers dependency: that package isn't in this project,
 *      and a manual safeParse + setError is ~10 lines, so adding a new
 *      dependency for it wasn't worth it.
 *   2. The backend's own validation (authoritative). If it still rejects
 *      the request (e.g. a duplicate nationalId/email the frontend can't
 *      know about ahead of time), the interceptor gives us `ApiError.
 *      fieldErrors`, which we map back onto the same form fields below.
 */
export function CustomerFormDialog({ open, onOpenChange, customer }: CustomerFormDialogProps) {
  const isEdit = !!customer;
  const form = useForm<CustomerRegistrationFormValues>({ defaultValues: emptyValues });

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer(customer?.id ?? -1);
  const mutation = isEdit ? updateCustomer : createCustomer;

  // Reset the form whenever the dialog opens (or the target customer
  // changes), so stale values from a previous edit never leak into a new
  // "Add customer" run, and vice versa.
  useEffect(() => {
    if (open) {
      form.reset(customer ? toFormValues(customer) : emptyValues);
    }
  }, [open, customer, form]);

  function onSubmit(values: CustomerRegistrationFormValues) {
    const schema = isEdit ? customerUpdateSchema : customerRegistrationSchema;
    const result = schema.safeParse(values);

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CustomerRegistrationFormValues;
        form.setError(field, { message: issue.message });
      }
      return;
    }

    mutation.mutate(result.data as CustomerRegistrationFormValues, {
      onSuccess: () => onOpenChange(false),
      onError: (error: ApiError) => {
        if (error.fieldErrors) {
          for (const [field, message] of Object.entries(error.fieldErrors)) {
            form.setError(field as keyof CustomerRegistrationFormValues, { message });
          }
        }
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit customer" : "Add customer"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this customer's contact details."
              : "All KYC fields are validated before the record is created."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input placeholder="Amina" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input placeholder="Hassan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number</FormLabel>
                    <FormControl>
                      <Input placeholder="+20 100 000 0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nationalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>National ID / KYC number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="29104120103882"
                        disabled={isEdit}
                        title={isEdit ? "The backend does not allow changing the national ID" : undefined}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mailing address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street, city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Create customer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}