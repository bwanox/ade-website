import { Suspense } from 'react';
import SosForm from '../../components/landing/sos-form';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const metadata = {
  title: 'Emergency SOS | ADE',
};

export default function SosPage() {
  return (
    <div className="max-w-3xl mx-auto w-full py-12 px-4 space-y-8 pt-24">
      <Sheet>
        {/* Page header */}
        <div>
          <h1 className="font-headline text-4xl mb-2">SOS ADE/ Reclamation</h1>
          <p className="text-muted-foreground text-sm">Use this form to quickly reach the association if you need help or want to report a concern. For life-threatening situations call your local emergency number first.</p>
        </div>

        {/* Prominent inline anonymity banner (clearly visible) */}
        <Alert className="bg-gradient-to-r from-rose-500/10 via-red-500/10 to-orange-500/10 border-red-500/40">
          <Lock className="h-5 w-5 text-red-600" />
          <AlertTitle>Your reclamation is anonymous</AlertTitle>
          <AlertDescription>
            It is confidential and seen only by ADE. It will not be shared, leaked, or used for anything other than helping you.
            <SheetTrigger asChild>
              <button className="ml-2 inline-flex items-center text-red-700 hover:text-red-800 underline underline-offset-4 font-medium">
                How it works
              </button>
            </SheetTrigger>
          </AlertDescription>
        </Alert>

        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Anonymous & Confidential</SheetTitle>
            <SheetDescription>
              Your identity is private. Only ADE&apos;s can access it. Nothing is published or shared outside ADE, and your information is used only to assist with your case.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-3 text-sm leading-relaxed">
            <p>• Visible only to ADE. Not visible to other students, staff outside ADE, or the public.</p>
            <p>• Stored and handled with strict confidentiality. We do not sell, publish, or disclose your message.</p>
            <p>• Used solely to understand your situation and provide help or follow‑up.</p>
          </div>
         
        </SheetContent>

        <Suspense>
          <SosForm />
        </Suspense>
      </Sheet>
    </div>
  );
}
