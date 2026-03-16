import { siteConfig } from "@/lib/site-config";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg">
      <section className="bg-bg">
        <div className="mx-auto max-w-[960px] px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="font-sans text-3xl md:text-4xl font-bold text-[#111827] mb-4">
            Privacy Policy
          </h1>
          <p className="font-sans text-sm md:text-base text-[#4B5563] leading-relaxed max-w-3xl mb-8">
            This Privacy Policy explains how {siteConfig.name} collects, uses, and protects your personal information when you use our website.
          </p>

          <div className="space-y-8 font-sans text-sm md:text-base text-[#374151] leading-relaxed max-w-3xl">
            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">What is a cookie?</h2>
              <p className="mb-3">
                Cookies are small text files stored on your computer&apos;s browser directory or program data subfolders. They are created when you visit a website that uses cookies to keep track of your movements within the site, help you resume where you left off, remember your login, theme selection, preferences, and other customisation functions.
              </p>
              <p className="mb-3">
                Cookies are often indispensable for websites that have large databases, need logins, have customisable themes, and other advanced features. Cookies usually don&apos;t contain much information except for the URL of the website that created the cookie, the duration of the cookie&apos;s abilities and effects, and a random number.
              </p>
              <p>
                There are two types of cookies: <strong>session cookies</strong> and <strong>persistent cookies</strong>. Session cookies are created temporarily while you visit a website and are deleted when you leave. Persistent cookies remain in your browser&apos;s subfolder for the duration set within the cookie&apos;s file and are activated again when you revisit the website.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">Personal data</h2>
              <p className="mb-3">
                Supplying personally identifiable information is mandatory for processing and delivering orders, as well as for drawing up invoices. This information is strictly confidential. Failing to supply such information shall lead to the order being automatically rejected.
              </p>
              <p className="mb-3">
                You are entitled to access, change, correct, and delete your information at any time. To do so, contact us at {siteConfig.contactEmail} with a copy of your ID.
              </p>
              <p>
                We may communicate personal data to our business partners for marketing purposes. You can oppose this communication at any time by emailing {siteConfig.contactEmail} with the subject: &quot;I oppose the communication of my personal details with third parties for marketing purposes.&quot;
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">How we use cookies</h2>
              <p className="mb-3">
                {siteConfig.name} uses cookies to personalise the services offered to you. Cookies allow us to remember your preferences, keep you signed in, and improve your browsing experience.
              </p>
              <p>
                You can refuse cookies by configuring your browser. However, you may lose the ability to use certain features of our website.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">Data we collect</h2>
              <p className="mb-3">
                We collect information necessary for:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Processing and delivering your orders</li>
                <li>Customer management and support</li>
                <li>Fighting fraud and protecting our business</li>
                <li>Marketing (only if you have given consent)</li>
              </ul>
              <p>
                We never sell your personal data to third parties.
              </p>
            </section>

            <p className="text-xs text-[#6B7280] pt-4">
              Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
