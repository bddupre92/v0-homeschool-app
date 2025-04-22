import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <div className="container max-w-3xl py-12">
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">Last updated: April 21, 2025</p>

      <div className="prose prose-sm max-w-none">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using HomeScholar ("we," "our," or "us"), you agree to be bound by these Terms of Service. If
          you do not agree to these terms, please do not use our services.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          HomeScholar is a platform that allows homeschooling families to discover, organize, and share educational
          resources, connect with other homeschoolers, and track their educational progress.
        </p>

        <h2>3. User Accounts</h2>
        <h3>3.1 Registration</h3>
        <p>
          To use certain features of our service, you must register for an account. You agree to provide accurate,
          current, and complete information during the registration process and to update such information to keep it
          accurate, current, and complete.
        </p>

        <h3>3.2 Account Security</h3>
        <p>
          You are responsible for safeguarding your password and for all activities that occur under your account. You
          agree to notify us immediately of any unauthorized use of your account.
        </p>

        <h3>3.3 Account Termination</h3>
        <p>
          We reserve the right to suspend or terminate your account and access to our services if you violate these
          Terms of Service or if we determine, in our sole discretion, that your use of the service is inappropriate.
        </p>

        <h2>4. User Content</h2>
        <h3>4.1 Ownership</h3>
        <p>
          You retain ownership of any content you submit, post, or display on or through our services ("User Content").
          By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce,
          modify, adapt, publish, translate, distribute, and display such content.
        </p>

        <h3>4.2 Content Guidelines</h3>
        <p>You agree not to post User Content that:</p>
        <ul>
          <li>Violates any applicable law or regulation</li>
          <li>Infringes upon the rights of any third party</li>
          <li>Contains false, misleading, or deceptive information</li>
          <li>Is harmful, abusive, offensive, or inappropriate</li>
          <li>Contains viruses, malware, or other harmful code</li>
          <li>Advertises products or services without our permission</li>
        </ul>

        <h3>4.3 Content Removal</h3>
        <p>
          We reserve the right to remove any User Content that violates these Terms of Service or that we find
          objectionable for any reason, without prior notice.
        </p>

        <h2>5. Intellectual Property</h2>
        <p>
          The HomeScholar service, including its content, features, and functionality, are owned by us and are protected
          by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, sell, or
          lease any part of our services without our express permission.
        </p>

        <h2>6. Privacy</h2>
        <p>
          Your use of our services is also governed by our Privacy Policy, which is incorporated into these Terms of
          Service by reference.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or in
          connection with your use of our services.
        </p>

        <h2>8. Disclaimer of Warranties</h2>
        <p>
          Our services are provided "as is" and "as available" without any warranties of any kind, either express or
          implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or
          non-infringement.
        </p>

        <h2>9. Governing Law</h2>
        <p>
          These Terms of Service shall be governed by and construed in accordance with the laws of the United States,
          without regard to its conflict of law provisions.
        </p>

        <h2>10. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms of Service at any time. We will notify you of any changes by
          posting the new Terms of Service on this page and updating the "Last updated" date.
        </p>

        <h2>11. Contact Us</h2>
        <p>If you have any questions about these Terms of Service, please contact us at:</p>
        <p>
          Email: terms@homescholar.app
          <br />
          Address: 123 Education Lane, Learning City, HS 12345
        </p>
      </div>
    </div>
  )
}
