'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { visibleSections } from '@/lib/nav';
import { useAuth } from '@/lib/auth-context';

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { role } = useAuth();
  const sections = visibleSections(role);

  return (
    <nav className="flex flex-col gap-6" aria-label="Primary">
      {sections.map((section) => (
        <div key={section.heading}>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-foreground/40">
            {section.heading}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-brand-foreground/70 hover:bg-white/5 hover:text-brand-foreground',
                    )}
                  >
                    <Icon className="size-[18px] shrink-0" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
