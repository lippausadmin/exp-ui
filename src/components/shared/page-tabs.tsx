"use client";

import { cn } from "@/lib/utils";
import type { LucideProps } from "lucide-react";
import {
  Suspense,
  useEffect,
  useState,
  type ElementType,
  type ForwardRefExoticComponent,
  type ReactNode,
  type RefAttributes,
} from "react";

export type Tab = {
  icon?: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  title: string;
  link: string;
};

type LinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

export type PageTabsProps = {
  tabs: Tab[];
  activeLink?: string;
  className?: string;
  linkComponent?: ElementType<LinkProps>;
};

function getCurrentUrl() {
  if (typeof window === "undefined") return "";

  return `${window.location.pathname}${window.location.search}`;
}

function DefaultLink({ href, className, children }: LinkProps) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

function PageTabsInner({
  tabs,
  activeLink,
  className,
  linkComponent: LinkComponent = DefaultLink,
}: PageTabsProps) {
  const [currentUrl, setCurrentUrl] = useState(getCurrentUrl);
  const selectedLink = activeLink ?? currentUrl;

  useEffect(() => {
    if (activeLink !== undefined) return;

    const updateCurrentUrl = () => setCurrentUrl(getCurrentUrl());

    updateCurrentUrl();
    window.addEventListener("popstate", updateCurrentUrl);
    window.addEventListener("hashchange", updateCurrentUrl);

    return () => {
      window.removeEventListener("popstate", updateCurrentUrl);
      window.removeEventListener("hashchange", updateCurrentUrl);
    };
  }, [activeLink]);

  return (
    <div className={cn("flex w-fit border-b", className)}>
      {tabs.map((tab) => {
        const isActive = selectedLink === tab.link;

        return (
          <LinkComponent
            key={tab.title}
            href={tab.link}
            className={cn(
              "flex items-center gap-2 rounded-t-sm px-3.5 py-1 transition",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-primary hover:bg-accent",
            )}
          >
            {tab.icon && <tab.icon className="size-[17px] text-current" />}
            <p className="text-[12px] font-medium 2xl:text-sm">{tab.title}</p>
          </LinkComponent>
        );
      })}
    </div>
  );
}

export function PageTabs(props: PageTabsProps) {
  return (
    <Suspense fallback={<div className="flex w-fit border-b" />}>
      <PageTabsInner {...props} />
    </Suspense>
  );
}
