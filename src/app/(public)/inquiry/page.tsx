import { redirect } from 'next/navigation';

export default function LegacyInquiryRedirectPage() {
  // Cleanly redirect legacy /inquiry route to the active /contact page
  redirect('/contact');
}
