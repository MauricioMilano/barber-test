import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

type SignatureVariant = 'coral' | 'forest' | 'dark' | 'cream' | 'navy';

interface SignatureCardProps {
  variant: SignatureVariant;
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaText: string;
  onClick?: () => void;
  href?: string;
}

const variantStyles: Record<SignatureVariant, { bg: string; text: string; iconBg: string }> = {
  coral: {
    bg: 'bg-signature-coral',
    text: 'text-white',
    iconBg: 'bg-white/20',
  },
  forest: {
    bg: 'bg-signature-forest',
    text: 'text-white',
    iconBg: 'bg-white/20',
  },
  dark: {
    bg: 'bg-surface-dark',
    text: 'text-white',
    iconBg: 'bg-white/10',
  },
  navy: {
    bg: 'bg-surface-dark',
    text: 'text-white',
    iconBg: 'bg-white/10',
  },
  cream: {
    bg: 'bg-signature-cream',
    text: 'text-ink',
    iconBg: 'bg-signature-coral/10',
  },
};

export function SignatureCard({
  variant,
  icon,
  title,
  description,
  ctaText,
  onClick,
  href,
}: SignatureCardProps) {
  const styles = variantStyles[variant];

  const content = (
    <div
      className={`
        ${styles.bg} ${styles.text}
        rounded-xl p-8 lg:p-12
        flex flex-col items-center text-center
        transition-transform hover:scale-[1.02]
        cursor-pointer
        min-h-[280px] justify-between
      `}
    >
      <div className={`w-16 h-16 ${styles.iconBg} rounded-2xl flex items-center justify-center mb-6`}>
        {icon}
      </div>
      
      <div className="space-y-2 mb-6">
        <h3 className="text-2xl font-medium">{title}</h3>
        <p className="text-sm opacity-80 max-w-xs mx-auto">{description}</p>
      </div>

      <Button
        variant="ghost"
        className={`
          ${variant === 'coral' || variant === 'forest' || variant === 'navy' || variant === 'dark'
            ? 'bg-white text-ink hover:bg-white/90' 
            : 'bg-ink text-white hover:bg-ink/90'
          }
          rounded-xl px-8 py-3
        `}
      >
        {ctaText}
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block no-underline">
        {content}
      </a>
    );
  }

  return (
    <div onClick={onClick} className="cursor-pointer">
      {content}
    </div>
  );
}