'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  FileText,
  Play,
  Wrench,
  BarChart3
} from 'lucide-react';

const navigation = [
  { name: 'Chat', href: '/', icon: MessageSquare },
  { name: 'Plans', href: '/plans', icon: FileText },
  { name: 'Executions', href: '/executions', icon: Play },
  { name: 'Tools', href: '/tools', icon: Wrench },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
