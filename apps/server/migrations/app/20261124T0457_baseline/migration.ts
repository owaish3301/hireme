#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/960014879ab19d676773012b9f2634814573a46c1ccfa378c5ea50f9fff6216a/contract';
import endContract from '../../snapshots/960014879ab19d676773012b9f2634814573a46c1ccfa378c5ea50f9fff6216a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } })],
        constraints: [primaryKey(['id'])],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
