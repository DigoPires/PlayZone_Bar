import { forwardRef } from "react";
import { Link, useRoute } from "wouter";
import { cn } from "@/lib/utils";

interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  activeClassName?: string;
}

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ href, className, activeClassName, children, ...props }, ref) => {
    const [isActive] = useRoute(href === "/" ? "/" : `${href}/*`);
    
    return (
      <Link 
        href={href} 
        className={cn(className, isActive && activeClassName)}
        {...props as any}
      >
        {children}
      </Link>
    );
  }
);
NavLink.displayName = "NavLink";
