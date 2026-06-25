'use client';

import { LogOut, UserRound } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { humanizeEnum } from '@/lib/format';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserMenu() {
  const { role, logout } = useAuth();
  const roleLabel = role ? humanizeEnum(role) : 'Signed in';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <Avatar>
          <AvatarFallback>{role?.slice(0, 2) ?? 'MM'}</AvatarFallback>
        </Avatar>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium leading-tight text-foreground">
            {roleLabel}
          </span>
          <span className="block text-xs leading-tight text-muted-foreground">Moderns Milk</span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{roleLabel}</DropdownMenuLabel>
        <DropdownMenuItem disabled>
          <UserRound /> Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          onSelect={() => void logout()}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
