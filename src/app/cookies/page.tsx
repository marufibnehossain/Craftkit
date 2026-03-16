import { siteConfig } from "@/lib/site-config";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-bg">
      <section className="bg-bg">
        <div className="mx-auto max-w-[960px] px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="font-sans text-3xl md:text-4xl font-bold text-[#111827] mb-4">
            Cookies Policy
          </h1>
          <p className="font-sans text-sm md:text-base text-[#4B5563] leading-relaxed max-w-3xl mb-8">
            This Cookies Policy explains how {siteConfig.name} uses cookies and similar technologies when you visit our website.
          </p>

          <div className="space-y-8 font-sans text-sm md:text-base text-[#374151] leading-relaxed max-w-3xl">
            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">What are cookies?</h2>
              <p className="mb-3">
                Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the website owners.
              </p>
              <p>
                Cookies help us recognise your device and remember information about your visit, such as your preferences, settings, and how you use our site.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">Types of cookies we use</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-[#111827] mb-1">Essential cookies</h3>
                  <p>
                    These cookies are necessary for the website to function properly. They enable core features such as security, shopping cart functionality, and account access. You cannot opt out of these cookies.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#111827] mb-1">Functional cookies</h3>
                  <p>
                    These cookies allow us to remember your preferences and settings, such as your language selection, currency, and region. They help provide a more personalised experience.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#111827] mb-1">Analytics cookies</h3>
                  <p>
                    We use analytics cookies to understand how visitors interact with our website. These cookies collect information anonymously and help us improve our site&apos;s performance and usability.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#111827] mb-1">Marketing cookies</h3>
                  <p>
                    These cookies may be set by our advertising partners to build a profile of your interests and show you relevant advertisements on other websites. They do not directly store personal information but are based on uniquely identifying your browser and device.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">How long do cookies last?</h2>
              <p className="mb-3">
                <strong>Session cookies</strong> are temporary and are deleted when you close your browser. They are used to maintain your session while you browse.
              </p>
              <p>
                <strong>Persistent cookies</strong> remain on your device for a set period or until you delete them manually. They are used to remember your preferences for future visits.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">Managing cookies</h2>
              <p className="mb-3">
                Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies, delete existing cookies, or alert you when a cookie is being placed.
              </p>
              <p className="mb-3">
                Please note that disabling cookies may affect the functionality of our website. Some features, such as the shopping cart and account login, require cookies to work properly.
              </p>
              <p>
                For more information about managing cookies in your browser, visit your browser&apos;s help documentation or <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#111827]">www.allaboutcookies.org</a>.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">Third-party cookies</h2>
              <p>
                Some cookies on our website are placed by third-party services that appear on our pages, such as analytics providers and payment processors. We do not control these cookies. Please refer to the respective third-party privacy policies for more information on how they use cookies.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">Changes to this policy</h2>
              <p>
                We may update this Cookies Policy from time to time to reflect changes in our practices or for legal reasons. We encourage you to review this page periodically. If you have questions about our use of cookies, please contact us at {siteConfig.contactEmail}.
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
