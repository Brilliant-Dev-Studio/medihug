/** Manual bank-transfer accounts shown in the "Top up with mobile banking" section at
 * checkout, alongside MMQR/CB Pay. Picking the "Bank Transfer" payment method still requires
 * a receipt upload afterward, same as MMQR. */
export interface BankAccount {
  id: string;
  bankName: string;
  shortLabel: string;
  accountNumber: string;
  accountName: string;
  color: string;
  logoUrl?: string;
}

export const BANK_ACCOUNTS: BankAccount[] = [
  { id: 'ayabank', bankName: 'AYA Bank', shortLabel: 'AYA BANK', accountNumber: '10005203452', accountName: 'Medihug', color: '#f59e0b', logoUrl: '/payment/aya_bank.png' },
  { id: 'cbbank',  bankName: 'CB Bank',  shortLabel: 'CB BANK',  accountNumber: '0117100900020192', accountName: 'MEDIHUG', color: '#16a34a', logoUrl: '/payment/cb_bank.jpg' },
  { id: 'uabbank', bankName: 'UAB (Company Special)', shortLabel: 'UAB', accountNumber: '20011121419', accountName: 'Medihug', color: '#1e3a8a', logoUrl: '/payment/uab_bank.jpg' },
];
