#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/27342fb489481809e5194acc7a9a56138969ad3e8f0eee4524341a700145b253/contract';
import startContract from '../../snapshots/27342fb489481809e5194acc7a9a56138969ad3e8f0eee4524341a700145b253/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/c171c82dc07a89cb93b93182d8a858326b74124fcf7a718680473650b368b13b/contract';
import endContract from '../../snapshots/c171c82dc07a89cb93b93182d8a858326b74124fcf7a718680473650b368b13b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.setDefault({
        schema: 'public',
        table: 'User',
        column: col('isOnboarded', 'bool', {
          default: lit(false),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
