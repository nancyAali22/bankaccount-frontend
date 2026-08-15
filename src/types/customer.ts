export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  address: string | null;
  dob: string | null;
  createdAt: string;
  updatedAt: string;
}