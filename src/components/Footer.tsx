import Link from "next/link";
import Logo from "@/components/Logo";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/products", label: "Shop" },
  { href: "/blog", label: "Our Blogs" },
  { href: "/contact", label: "Contact Us" },
];

const helpLinks = [
  { href: "/sell", label: "Become a Seller" },
  { href: "/faq", label: "FAQs" },
  { href: "/refund-policy", label: "Shipping & Returns" },
  { href: "#", label: "Order Tracking" },
  { href: "/terms", label: "Terms and Conditions" },
];

const aboutLinks = [
  { href: "/about", label: "Our Mission" },
  { href: "/about", label: "Our Story" },
  { href: "/sell", label: "Sell Your Patterns" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/blog", label: "How To & Idea" },
];

function FacebookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 011-1h3v-4h-3a5 5 0 00-5 5v2.01h-2l-.396 3.98h2.396v8.01z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="relative overflow-hidden" style={{ backgroundColor: "#faf6f1" }}>
        <div className="mx-auto max-w-[1440px] px-6 md:px-20 pt-[100px] pb-[80px] relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-0 lg:justify-between">
            <div className="flex flex-col gap-[31px] w-full lg:w-[296px] shrink-0">
              <div className="flex flex-col gap-6">
                <Logo width={112} />
                <p className="font-sans text-base leading-[1.6] tracking-[0.32px]" style={{ color: "#5f5d5d" }}>
                  Premium craft supplies, tools, and kits, curated for makers who care about quality, creativity, and ease.
                </p>
              </div>

              <div className="w-full h-px" style={{ backgroundColor: "#e0d6c9" }} />

              <div className="flex items-center gap-8">
                <a href="#" aria-label="Facebook" className="text-dark-100 hover:text-secondary-100 transition-colors">
                  <FacebookIcon />
                </a>
                <a href="#" aria-label="X" className="text-dark-100 hover:text-secondary-100 transition-colors">
                  <XIcon />
                </a>
                <a href="#" aria-label="Instagram" className="text-dark-100 hover:text-secondary-100 transition-colors">
                  <InstagramIcon />
                </a>
                <a href="#" aria-label="YouTube" className="text-dark-100 hover:text-secondary-100 transition-colors">
                  <YoutubeIcon />
                </a>
                <a href="#" aria-label="LinkedIn" className="text-dark-100 hover:text-secondary-100 transition-colors">
                  <LinkedInIcon />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-[99px] flex-1 lg:pl-[99px]">
              <div className="flex flex-col gap-6">
                <h4 className="font-display text-lg font-semibold text-dark-100 tracking-[0.18px] leading-none uppercase">
                  Quick Links
                </h4>
                <ul className="flex flex-col gap-4">
                  {quickLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="font-sans text-base font-light leading-[1.6] tracking-[0.32px] hover:text-dark-100 transition-colors"
                        style={{ color: "#5f5d5d" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-6">
                <h4 className="font-display text-lg font-semibold text-dark-100 tracking-[0.18px] leading-none uppercase">
                  Help & Support
                </h4>
                <ul className="flex flex-col gap-4">
                  {helpLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="font-sans text-base font-light leading-[1.6] tracking-[0.32px] hover:text-dark-100 transition-colors"
                        style={{ color: "#5f5d5d" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-6">
                <h4 className="font-display text-lg font-semibold text-dark-100 tracking-[0.18px] leading-none uppercase">
                  About Us
                </h4>
                <ul className="flex flex-col gap-4">
                  {aboutLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="font-sans text-base font-light leading-[1.6] tracking-[0.32px] hover:text-dark-100 transition-colors"
                        style={{ color: "#5f5d5d" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-6">
                <h4 className="font-display text-lg font-semibold text-dark-100 tracking-[0.18px] leading-none uppercase">
                  Accept Payment
                </h4>
                <div className="flex flex-wrap gap-3 w-[155px]">
                  <div className="h-7 w-[43px] bg-white border border-[#d6dce5] shadow-sm flex items-center justify-center rounded-[3px]">
                    <svg width="30" height="10" viewBox="0 0 30 10"><text x="2" y="9" fill="#1a1f71" fontFamily="Arial" fontWeight="bold" fontSize="10">VISA</text></svg>
                  </div>
                  <div className="h-7 w-[43px] bg-white border border-[#d6dce5] shadow-sm flex items-center justify-center rounded-[3px] overflow-hidden">
                    <svg width="24" height="16" viewBox="0 0 24 16">
                      <circle cx="9" cy="8" r="7" fill="#EB001B" />
                      <circle cx="15" cy="8" r="7" fill="#F79E1B" />
                      <path d="M12 2.4a7 7 0 010 11.2 7 7 0 000-11.2z" fill="#FF5F00" />
                    </svg>
                  </div>
                  <div className="h-7 w-[43px] bg-white border border-[#d6dce5] shadow-sm flex items-center justify-center rounded-[3px]">
                    <svg width="30" height="8" viewBox="0 0 40 8"><text x="0" y="7" fill="#FF6000" fontFamily="Arial" fontWeight="bold" fontSize="7">DISCOVER</text></svg>
                  </div>
                  <div className="h-7 w-[43px] bg-black border border-[#d6dce5] shadow-sm flex items-center justify-center rounded-[3px]">
                    <svg width="24" height="10" viewBox="0 0 24 10"><text x="0" y="8" fill="white" fontFamily="Arial" fontWeight="500" fontSize="8">Pay</text></svg>
                  </div>
                  <div className="h-7 w-[43px] bg-white border border-[#d6dce5] shadow-sm flex items-center justify-center rounded-[3px]">
                    <svg width="20" height="10" viewBox="0 0 20 10"><text x="3" y="9" fill="#5f6368" fontFamily="Arial" fontWeight="500" fontSize="10">G</text><text x="10" y="8" fill="#5f6368" fontFamily="Arial" fontSize="7">Pay</text></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-0 overflow-hidden pointer-events-none select-none" style={{ marginTop: "-20px" }}>
          <div className="mx-auto max-w-[1440px] px-6 md:px-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/craftkit-wordmark.png"
              alt=""
              className="w-full object-contain"
            />
          </div>
        </div>

        <div className="relative z-10 border-t" style={{ borderColor: "#e0d6c9" }}>
          <div className="mx-auto max-w-[1440px] px-6 md:px-20 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-sans text-sm tracking-[0.32px]" style={{ color: "#5f5d5d" }}>
              © {year} Craftkit. All rights reserved.
            </p>
            <div className="flex items-center gap-2 font-sans text-sm tracking-[0.32px]" style={{ color: "#5f5d5d" }}>
              <Link href="/privacy" className="hover:text-dark-100 transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-dark-100 transition-colors">Terms & Conditions</Link>
              <span>•</span>
              <Link href="/cookies" className="hover:text-dark-100 transition-colors">Cookies Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
