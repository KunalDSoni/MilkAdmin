import { Role } from '@moderns-milk/contracts';

export interface ActorScope {
  role: Role;
  distributorId?: string;
  retailerId?: string;
}

const ORG_WIDE_ROLES: ReadonlySet<Role> = new Set<Role>(['ADMIN', 'SALES_HEAD']);

/**
 * Object-level authorization (anti-IDOR). Whether `actor` may touch a resource
 * belonging to a given distributor. Org-wide roles see everything; distributor
 * staff see only their own org; retailers only via the retailer-level check.
 */
export function canAccessDistributorResource(
  actor: ActorScope,
  ownerDistributorId: string,
): boolean {
  if (ORG_WIDE_ROLES.has(actor.role)) return true;
  if (actor.role === 'SALES_OFFICER' || actor.role === 'DISTRIBUTOR') {
    return !!actor.distributorId && actor.distributorId === ownerDistributorId;
  }
  // Retailers cannot access distributor-scoped resources directly.
  return false;
}

/**
 * Whether `actor` may touch a resource belonging to a specific retailer.
 * A retailer may only access their own data; distributor staff may access
 * retailers within their org; org-wide roles, everything.
 */
export function canAccessRetailerResource(
  actor: ActorScope,
  ownerRetailerId: string,
  ownerDistributorId: string,
): boolean {
  if (ORG_WIDE_ROLES.has(actor.role)) return true;
  if (actor.role === 'RETAILER') {
    return !!actor.retailerId && actor.retailerId === ownerRetailerId;
  }
  if (actor.role === 'SALES_OFFICER' || actor.role === 'DISTRIBUTOR') {
    return !!actor.distributorId && actor.distributorId === ownerDistributorId;
  }
  return false;
}
