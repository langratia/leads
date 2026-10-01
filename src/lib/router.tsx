"use client";

import React from "react";
import * as Wouter from "wouter";

export function Link({ href, className, children, onClick, ...props }: any) {
  return (
    <Wouter.Link href={href || "#"} className={className} onClick={onClick} {...props}>
      {children}
    </Wouter.Link>
  );
}

export function useLocation(): [string, (href: string) => void] {
  try {
    return Wouter.useLocation();
  } catch {
    const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
    const navigate = (href: string) => {
      if (typeof window !== "undefined") {
        window.location.href = href;
      }
    };
    return [pathname, navigate];
  }
}

export function useRoute(pattern: string): any {
  try {
    return Wouter.useRoute(pattern);
  } catch {
    const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
    const prefix = pattern.split(":")[0];
    
    if (pattern.includes(":") && pathname.startsWith(prefix)) {
      const paramName = pattern.split(":")[1];
      const paramValue = pathname.slice(prefix.length);
      return [true, { [paramName]: paramValue }];
    }
    
    return [pathname === pattern, null];
  }
}
