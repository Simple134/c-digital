import { useRouter } from 'next/navigation';
import { useScreenSize } from '@/hooks/useScreenSize';

interface RedirectButtonProps {
  children: React.ReactNode;
  className?: string;
  whatsappLink: () => void;
  service?: string;
}

export const RedirectButton = ({ children, className = '', whatsappLink, service }: RedirectButtonProps) => {
  const router = useRouter();
  const isMobile = useScreenSize();

  const handleClick = () => {
    if (isMobile) {
      whatsappLink();
    } else {
      router.push(`/contacto?service=${service}`);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={className}
    >
      {children}
    </button>
  );
}; 