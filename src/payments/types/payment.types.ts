export interface PaymentData {
  id: string;
  status: string;
  status_detail: string;
  payment_method_id: string;
  external_reference?: string;
}
