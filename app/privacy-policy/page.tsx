import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-3xl py-12">
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: April 21, 2025</p>

      <div className="prose prose-sm max-w-none">
        <h2>1. Introduction</h2>
        <p>
          Welcome to HomeScholar ("we," "our," or "us"). We are committed to protecting your privacy and personal
          information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
          you use our website and services.
        </p>
        <p>
          By accessing or using HomeScholar, you agree to this Privacy Policy. If you do not agree with our policies and
          practices, please do not use our services.
        </p>

        <h2>2. Information We Collect</h2>
        <h3>2.1 Personal Information</h3>
        <p>We may collect the following types of personal information:</p>
        <ul>
          <li>Contact information (name, email address)</li>
          <li>Account credentials (username, password)</li>
          <li>Profile information (biography, location, interests)</li>
          <li>User-generated content (posts, comments, resources, boards)</li>
          <li>Communication preferences</li>
        </ul>

        <h3>2.2 Usage Information</h3>
        <p>We automatically collect certain information about your device and how you interact with our services:</p>
        <ul>
          <li>Device information (browser type, operating system, device type)</li>
          <li>IP address and location information</li>
          <li>Pages visited and features used</li>
          <li>Time spent on pages and interaction with content</li>
          <li>Referral sources</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>We use the information we collect for various purposes, including:</p>
        <ul>
          <li>Providing and maintaining our services</li>
          <li>Personalizing your experience</li>
          <li>Communicating with you about updates, features, and events</li>
          <li>Responding to your requests and inquiries</li>
          <li>Improving our services and developing new features</li>
          <li>Analyzing usage patterns and trends</li>
          <li>Protecting the security and integrity of our platform</li>
          <li>Complying with legal obligations</li>
        </ul>

        <h2>4. How We Share Your Information</h2>
        <p>We may share your information in the following circumstances:</p>
        <ul>
          <li>With service providers who perform services on our behalf</li>
          <li>With other users, according to your privacy settings</li>
          <li>In response to legal requests or to protect our rights</li>
          <li>In connection with a business transaction (e.g., merger or acquisition)</li>
          <li>With your consent or at your direction</li>
        </ul>

        <h2>5. Your Choices and Rights</h2>
        <p>You have certain choices and rights regarding your information:</p>
        <ul>
          <li>Account Information: You can update your account information through your profile settings</li>
          <li>Communication Preferences: You can opt out of marketing communications</li>
          <li>Cookies: You can manage cookie preferences through your browser settings</li>
          <li>Access and Deletion: You can request access to or deletion of your personal information</li>
        </ul>

        <h2>6. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal information. However,
          no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee
          absolute security.
        </p>

        <h2>7. Children's Privacy</h2>
        <p>
          Our services are not directed to children under 13. We do not knowingly collect personal information from
          children under 13. If you believe we have collected information from a child under 13, please contact us.
        </p>

        <h2>8. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
          Privacy Policy on this page and updating the "Last updated" date.
        </p>

        <h2>9. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at:</p>
        <p>
          Email: privacy@homescholar.app
          <br />
          Address: 123 Education Lane, Learning City, HS 12345
        </p>
      </div>
    </div>
  )
}
