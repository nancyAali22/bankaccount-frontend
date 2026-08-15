import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteCustomer } from "@/hooks/useCustomers";
import type { Customer } from "@/types/customer";

interface DeleteCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | undefined;
}

export function DeleteCustomerDialog({ open, onOpenChange, customer }: DeleteCustomerDialogProps) {
  const deleteCustomer = useDeleteCustomer();

  function handleConfirm() {
    if (!customer) return;
    deleteCustomer.mutate(customer.id, {
      onSuccess: () => onOpenChange(false),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete customer?</DialogTitle>
          <DialogDescription>
            {customer && (
              <>
                This permanently removes <strong>{customer.firstName} {customer.lastName}</strong> and
                cannot be undone. This does not close their accounts on its own — check the backend's
                behavior for customers with open accounts before deleting.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteCustomer.isPending}
          >
            {deleteCustomer.isPending ? "Deleting…" : "Delete customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}