import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "hero" | "text-arrow";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  arrow?: boolean;
  disabled?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-sans text-sm tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-60 focus:ring-offset-2";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-dark-100 text-white px-6 py-3 hover:bg-dark-80",
  secondary:
    "bg-bg border border-dark-40 text-dark-100 px-6 py-3 hover:bg-brand-mid",
  hero:
    "bg-secondary-100 text-white px-6 py-3 hover:bg-secondary-60 transition-colors",
  "text-arrow":
    "text-dark-100 hover:text-dark-80 border-0 bg-transparent px-0 py-2",
};

export default function Button({
  children,
  href,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
  arrow = true,
  disabled = false,
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className} ${disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}`;

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
        {arrow && variant !== "text-arrow" && (
          <span className="opacity-60" aria-hidden>→</span>
        )}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
      {arrow && variant !== "text-arrow" && (
        <span className="opacity-60" aria-hidden>→</span>
      )}
    </button>
  );
}
