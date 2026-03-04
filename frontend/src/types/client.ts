export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: ClientStatus;
  advisorId: string;
  createdAt: string;
  updatedAt: string;
}

export type ClientStatus = 'active' | 'inactive' | 'pending' | 'archived';

export interface CreateClientRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  advisorId: string;
}
