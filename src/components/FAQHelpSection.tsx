import Link from "next/link";
import Image from "next/image";

export default function FAQHelpSection() {
  return (
    <section className="bg-[#f5ede2]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-20 pb-16 md:pb-[100px]">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 bg-[#faf6f1] flex flex-col md:flex-row items-center justify-between px-8 md:px-14 py-12">
            <div className="flex flex-col gap-3.5">
              <h3 className="font-sans text-[32px] font-medium text-[#1b1718] leading-[1.4]">
                Still Need Help?
              </h3>
              <p className="font-sans text-lg text-[#8d8b8b] leading-[1.6] max-w-[429px]">
                Our support team is here to assist you with any other questions you might have.
              </p>
              <div className="flex flex-wrap items-center gap-7 pt-2.5">
                <div className="flex items-center gap-2.5">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#8d8b8b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="22 3 16 10 22 17" />
                    <line x1="1" y1="3" x2="16" y2="12" />
                  </svg>
                  <span className="font-sans text-base font-medium text-[#8d8b8b] tracking-[0.32px]">
                    hello@craftkit.store
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#8d8b8b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="font-sans text-base font-medium text-[#8d8b8b] tracking-[0.32px]">
                    Replies within 24 hours
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-3 md:gap-[19px] mt-8 md:mt-0 w-full md:w-auto md:flex-col shrink-0">
              <Link
                href="/contact"
                className="flex-1 md:flex-none flex items-center justify-center h-12 md:h-14 px-5 md:px-10 bg-[#1b1718] text-white font-sans text-base md:text-lg text-center leading-[1.6] hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Contact Support
              </Link>
              <button
                type="button"
                className="flex-1 md:flex-none flex items-center justify-center h-12 md:h-14 px-5 md:px-10 border border-[#e0d6c9] bg-transparent text-[#1b1718] font-sans text-base md:text-lg text-center leading-[1.6] hover:bg-[#f5eae2] transition-colors whitespace-nowrap"
              >
                Live Chat
              </button>
            </div>
          </div>

          <div className="w-full lg:w-[405px] shrink-0 bg-[#faf6f1] flex flex-col items-center justify-center px-9 py-10 shadow-[0px_5px_28px_0px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-start justify-center pr-5">
                <div className="w-14 h-14 rounded-full border-[3.5px] border-white overflow-hidden -mr-5 relative z-30">
                  <Image
                    src="/images/community-avatar-1.webp"
                    alt="Community member"
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="w-14 h-14 rounded-full border-[3.5px] border-white overflow-hidden -mr-5 relative z-20">
                  <Image
                    src="/images/community-avatar-2.webp"
                    alt="Community member"
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="w-14 h-14 rounded-full border-[3.5px] border-white overflow-hidden -mr-5 relative z-10">
                  <Image
                    src="/images/community-avatar-3.webp"
                    alt="Community member"
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="w-14 h-14 rounded-full border-[3.5px] border-white overflow-hidden relative z-0">
                  <Image
                    src="/images/community-avatar-4.webp"
                    alt="Community member"
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-6">
                <h3 className="font-sans text-2xl font-semibold text-[#1b1718] text-center leading-[1.34]">
                  Join Our Maker Community
                </h3>
                <div className="flex flex-col items-center gap-8">
                  <p className="font-sans text-base text-[#5f5d5d] text-center leading-[1.6] tracking-[0.32px] max-w-[337px]">
                    Ask questions, share your projects, and connect with other crafters.
                  </p>
                  <button
                    type="button"
                    className="flex items-center justify-center h-14 px-10 border border-[#e0d6c9] bg-transparent text-[#1b1718] font-sans text-lg text-center leading-[1.6] hover:bg-[#f5eae2] transition-colors w-full max-w-[325px]"
                  >
                    Visit Forum
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
