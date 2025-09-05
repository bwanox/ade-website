import { Suspense } from 'react';
import SosForm from '../../components/landing/sos-form';

export const metadata = {
  title: 'Emergency SOS | ADE',
};

export default function SosPage() {
  return (
    <div className="max-w-3xl mx-auto w-full py-12 px-4 space-y-8">
      <div>
        <h1 className="font-headline text-4xl mb-2">Emergency SOS / Reclamation</h1>
        <p className="text-muted-foreground text-sm">Use this form to quickly reach the association if you need help or want to report a concern. For life-threatening situations call your local emergency number first.</p>
      </div>
      <Suspense>
        <SosForm />
      </Suspense>
    </div>
  );
}
