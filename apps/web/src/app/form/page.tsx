import { Suspense } from 'react';
import MultiStepFormPage from './multi-step-page';

export default function FormPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MultiStepFormPage />
    </Suspense>
  );
}