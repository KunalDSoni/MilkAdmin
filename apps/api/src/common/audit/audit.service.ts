import { Injectable } from '@nestjs/common';
import { Prisma } from '@moderns-milk/database';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditInput {
  actorId?: string;
  action: string; // e.g. ORDER_APPROVED, ORDER_SUBMITTED
  entity: string;
  entityId: string;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  ip?: string;
}

/**
 * Writes immutable audit records for financial / approval / state-transition
 * actions. Callers pass an optional transaction client so the audit row commits
 * atomically with the change it records.
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(
    input: AuditInput,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    await client.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        before: input.before,
        after: input.after,
        ip: input.ip,
      },
    });
  }
}
