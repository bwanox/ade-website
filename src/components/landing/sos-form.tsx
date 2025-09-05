"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState, useFormStatus } from 'react-dom';
import { sendReclamationAction } from '@/app/actions';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const schema = z.object({
  name: z.string().min(2),
  universityYear: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(10),
});

interface FormValues extends z.infer<typeof schema> {}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full font-bold">
      {pending ? 'Sending...' : 'Send Reclamation'}
    </Button>
  );
}

export default function SosForm() {
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', universityYear: '', email: '', message: '' } });
  const { toast } = useToast();
  const [state, formAction] = useFormState(sendReclamationAction as any, { success: false, error: null });

  useEffect(() => {
    if (state.success) {
      toast({ title: 'Sent', description: 'Your reclamation has been delivered.' });
      form.reset();
    } else if (state.error) {
      toast({ title: 'Error', description: state.error, variant: 'destructive' });
    }
  }, [state, toast, form]);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-6">
          <Form {...form}>
            <div className="grid gap-6 md:grid-cols-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="universityYear" render={({ field }) => (
                <FormItem>
                  <FormLabel>University Year</FormLabel>
                  <FormControl><Input placeholder="e.g. 1st Year, 2nd Year, Final Year" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                <FormDescription>We will reply to this address.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="message" render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl><Textarea rows={6} placeholder="Describe the issue or request..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <SubmitButton />
          </Form>
        </form>
      </CardContent>
    </Card>
  );
}
