import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
}

export default function NavLink({ href, children, className = '', activeClassName = 'active' }: NavLinkProps) {
  const router = useRouter();
  const isActive = router.pathname === href;
  
  const combinedClassName = isActive 
    ? `${className} ${activeClassName}`.trim() 
    : className;

  return (
    <Link href={href} className={combinedClassName}>
      {children}
    </Link>
  );
}