'use server';

import { summarizeNews, SummarizeNewsInput } from '@/ai/flows/ai-news-summaries';
import { getPersonalizedClubRecommendations, PersonalizedClubRecommendationsInput } from '@/ai/flows/personalized-club-recommendations';
import { Resend } from 'resend';
import { z } from 'zod';

const NewsSchema = z.object({
  articleContent: z.string().min(50, 'Article content must be at least 50 characters.'),
});

const ClubSchema = z.object({
    interests: z.string().min(3, 'Please enter at least one interest.'),
    profile: z.string().optional(),
});

// Reclamation (SOS) submission schema
const ReclamationSchema = z.object({
  name: z.string().min(2, 'Name is too short.'),
  universityYear: z.string().min(1, 'Year is required.'),
  email: z.string().email('Invalid email.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

export async function summarizeNewsAction(prevState: any, formData: FormData) {
  try {
    const validatedFields = NewsSchema.safeParse({
      articleContent: formData.get('articleContent'),
    });

    if (!validatedFields.success) {
      return {
        ...prevState,
        error: validatedFields.error.flatten().fieldErrors.articleContent?.[0],
      };
    }
    
    const input: SummarizeNewsInput = {
      articleContent: validatedFields.data.articleContent,
    };

    const result = await summarizeNews(input);
    return { ...result, error: null };
  } catch (error) {
    console.error(error);
    return {
      ...prevState,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

export async function getClubRecommendationsAction(prevState: any, formData: FormData) {
  try {
    const validatedFields = ClubSchema.safeParse({
      interests: formData.get('interests'),
      profile: formData.get('profile'),
    });

    if (!validatedFields.success) {
      return {
        ...prevState,
        error: validatedFields.error.flatten().fieldErrors.interests?.[0],
      };
    }

     const input: PersonalizedClubRecommendationsInput = {
      interests: validatedFields.data.interests,
      profile: validatedFields.data.profile || '',
    };
    
    const result = await getPersonalizedClubRecommendations(input);
    return { ...result, error: null };
  } catch (error) {
    console.error(error);
    return {
      ...prevState,
      error: 'Could not fetch recommendations. The AI model might be busy. Please try again later.',
    }
  }
}

export async function sendReclamationAction(prevState: any, formData: FormData) {
  try {
    const validated = ReclamationSchema.safeParse({
      name: formData.get('name'),
      universityYear: formData.get('universityYear'),
      email: formData.get('email'),
      message: formData.get('message'),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message || 'Invalid input.' };
    }

    const ASSOC_EMAIL = process.env.ASSOCIATION_CONTACT_EMAIL || process.env.NEXT_PUBLIC_ASSOCIATION_CONTACT_EMAIL;
    if (!process.env.RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY');
      return { success: false, error: 'Email service not configured.' };
    }
    if (!ASSOC_EMAIL) {
      console.error('Missing ASSOCIATION_CONTACT_EMAIL');
      return { success: false, error: 'Destination email not configured.' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const escape = (s: string) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const { name, universityYear, email, message } = validated.data;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charSet="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>New SOS Reclamation</title>
<style>
  body { font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background:#f5f7fa; margin:0; padding:0; }
  .wrapper { max-width:600px; margin:0 auto; padding:32px 16px; }
  .card { background:#ffffff; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.06); overflow:hidden; border:1px solid #e5e7eb; }
  .header { background:linear-gradient(135deg,#0f172a,#1e3a8a); padding:20px 24px; color:#fff; }
  .header h1 { margin:0; font-size:20px; letter-spacing:.5px; }
  .content { padding:24px 24px 8px; color:#111827; }
  .meta-table { width:100%; border-collapse:collapse; margin-bottom:24px; }
  .meta-table th { text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:1px; color:#6b7280; padding:0 0 4px; }
  .meta-table td { padding:8px 12px; background:#f9fafb; border:1px solid #e5e7eb; font-size:14px; }
  .meta-table td.label { width:130px; font-weight:600; background:#eef2ff; }
  .message-box { border:1px solid #e5e7eb; background:#fdfdfd; padding:16px 18px; border-radius:8px; line-height:1.5; white-space:pre-wrap; font-size:14px; }
  .footer { padding:16px 24px 24px; font-size:12px; color:#6b7280; }
  .badge { display:inline-block; background:#1d4ed8; color:#fff; padding:4px 10px; font-size:11px; font-weight:600; border-radius:999px; letter-spacing:.5px; }
  a.button { display:inline-block; margin-top:16px; background:#1e40af; color:#fff !important; text-decoration:none; padding:10px 18px; font-weight:600; border-radius:6px; font-size:14px; }
  @media (prefers-color-scheme: dark) {
    body { background:#0f172a; }
    .card { background:#1e293b; border-color:#334155; }
    .content { color:#f1f5f9; }
    .meta-table td { background:#1e293b; border-color:#334155; color:#e2e8f0; }
    .meta-table td.label { background:#1e3a8a; color:#fff; }
    .message-box { background:#0f172a; border-color:#334155; color:#e2e8f0; }
    .footer { color:#94a3b8; }
    a.button { background:#1d4ed8; }
  }
</style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>New SOS Reclamation</h1>
        <span class="badge">URGENT</span>
      </div>
      <div class="content">
        <table class="meta-table" role="presentation" aria-hidden="true">
          <tr><td class="label">Name</td><td>${escape(name)}</td></tr>
          <tr><td class="label">Email</td><td><a href="mailto:${escape(email)}" style="color:#1d4ed8; text-decoration:none;">${escape(email)}</a></td></tr>
          <tr><td class="label">Year</td><td>${escape(universityYear)}</td></tr>
          <tr><td class="label">Received</td><td>${new Date().toLocaleString()}</td></tr>
        </table>
        <div class="message-box">${escape(message)}</div>
        <a class="button" href="mailto:${escape(email)}?subject=Re:%20Your%20SOS%20Reclamation">Reply to Sender</a>
      </div>
      <div class="footer">
        This message was generated by the ADE SOS portal. If this was not expected, review portal access logs.
      </div>
    </div>
  </div>
</body>
</html>`;

    await resend.emails.send({
      from: 'ADE SOS <onboarding@resend.dev>',
      to: [ASSOC_EMAIL],
      replyTo: email,
      subject: 'New SOS Reclamation',
      html,
    });

    return { success: true, error: null };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Failed to send. Please try again later.' };
  }
}
