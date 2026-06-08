export interface User {
  id: number;
  firstName: string;
  lastName: string;
  name: string; // firstName + lastName (frontend computed)
  email: string;
  role: 'admin' | 'student';
}

export interface Diploma {
  id: string;       // UUID
  diploma_no: string;
  first_name: string;
  last_name: string;
  email: string;
  student_no: string;
  university: string;
  faculty: string;
  department: string;
  graduation_year: number;
  tx_hash: string;
  arweave_tx: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface University {
  id: string;   // UUID from backend
  name: string;
}

export interface DiplomaUploadPayload {
  first_name: string;
  last_name: string;
  email: string;
  student_no: string;
  university_id: number;
  faculty: string;
  department: string;
  graduation_year: number;
  file: File;
}

export interface VerifyPayload {
  tx_hash: string;
}

export interface VerifyResult {
  verified: boolean;
  diplomaID?: string;
  studentName?: string;
  university?: string;
  degree?: string;
  issueDate?: string;
  diplomaHash?: string;
  polygonTxHash?: string;
  arweaveTxID?: string;
  arweaveUrl?: string;
  message?: string;
  // legacy fallback
  valid?: boolean;
  diploma?: Diploma;
}

export type DiplomaStatus = 'pending' | 'approved' | 'rejected';
