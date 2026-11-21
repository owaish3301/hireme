import postgres from '@prisma/orm-postgres/runtime';
import { contractFromJson } from '@prisma/orm-postgres/static';
import type { Contract } from './contract.d.js';
import contractJson from './contract.json' with { type: 'json' };
import { config } from '../config/env.js';

export const contract = contractFromJson<Contract>(contractJson);

export const db: ReturnType<typeof postgres<Contract>> = postgres({
  contract,
  url: config.DSN,
});
