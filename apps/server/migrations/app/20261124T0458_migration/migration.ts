#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/27342fb489481809e5194acc7a9a56138969ad3e8f0eee4524341a700145b253/contract';
import endContract from '../../snapshots/27342fb489481809e5194acc7a9a56138969ad3e8f0eee4524341a700145b253/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/960014879ab19d676773012b9f2634814573a46c1ccfa378c5ea50f9fff6216a/contract';
import startContract from '../../snapshots/960014879ab19d676773012b9f2634814573a46c1ccfa378c5ea50f9fff6216a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Session',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('expiresAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('familyId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('refreshTokenHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('replacedById', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('revokedAt', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('avatarUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'User',
        column: 'createdAt',
        type: 'timestamptz(3)',
        temporaryDefault: sql`'epoch'`,
      }),
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'User',
        column: 'email',
        type: 'text',
        temporaryDefault: sql`''`,
      }),
      this.addRequiredColumnToEmptyTable({
        schema: 'public',
        table: 'User',
        column: 'googleSub',
        type: 'text',
      }),
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'User',
        column: 'isOnboarded',
        type: 'bool',
        temporaryDefault: sql`false`,
      }),
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'User',
        column: 'name',
        type: 'text',
        temporaryDefault: sql`''`,
      }),
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'User',
        column: 'updatedAt',
        type: 'timestamptz(3)',
        temporaryDefault: sql`'epoch'`,
      }),
      this.addUnique({
        schema: 'public',
        table: 'Session',
        constraint: 'Session_refreshTokenHash_key',
        columns: ['refreshTokenHash'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_googleSub_key',
        columns: ['googleSub'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Session',
        index: 'Session_familyId_idx_3d03045e',
        columns: ['familyId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Session',
        index: 'Session_replacedById_idx_e1ebf6a3',
        columns: ['replacedById'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Session',
        index: 'Session_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Session',
        foreignKey: {
          name: 'Session_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Session',
        foreignKey: {
          name: 'Session_replacedById_fkey',
          columns: ['replacedById'],
          references: { schema: 'public', table: 'Session', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
