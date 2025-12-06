import type { Patient, Provider } from '@/types';

/**
 * Sample data for testing the application
 */

export const sampleProviders: Provider[] = [
  {
    id: 'prov_001',
    name: 'Dr. Sarah Chen',
    role: 'doctor',
    credentials: 'MD, Internal Medicine',
  },
  {
    id: 'prov_002',
    name: 'Michael Rodriguez',
    role: 'nurse',
    credentials: 'RN, BSN',
  },
  {
    id: 'prov_003',
    name: 'Emily Johnson',
    role: 'admin',
  },
  {
    id: 'prov_004',
    name: 'Dr. James Park',
    role: 'specialist',
    credentials: 'MD, Cardiology',
  },
];

export const samplePatients: Patient[] = [
  {
    id: 'pat_001',
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: '1975-03-15',
    medicalRecordNumber: 'MRN-2024-001',
    insuranceProvider: 'Blue Cross Blue Shield',
    primaryCarePhysician: 'Dr. Sarah Chen',
  },
  {
    id: 'pat_002',
    firstName: 'Maria',
    lastName: 'Garcia',
    dateOfBirth: '1988-07-22',
    medicalRecordNumber: 'MRN-2024-002',
    insuranceProvider: 'Aetna',
    primaryCarePhysician: 'Dr. Sarah Chen',
  },
  {
    id: 'pat_003',
    firstName: 'Robert',
    lastName: 'Williams',
    dateOfBirth: '1962-11-08',
    medicalRecordNumber: 'MRN-2024-003',
    insuranceProvider: 'Medicare',
  },
];

/**
 * Helper to get a random provider (useful for testing)
 */
export function getRandomProvider(): Provider {
  return sampleProviders[Math.floor(Math.random() * sampleProviders.length)];
}

/**
 * Helper to get a random patient (useful for testing)
 */
export function getRandomPatient(): Patient {
  return samplePatients[Math.floor(Math.random() * samplePatients.length)];
}
