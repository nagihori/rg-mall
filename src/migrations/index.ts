import * as migration_20260829_093914_init from './20260829_093914_init';

export const migrations = [
  {
    up: migration_20260829_093914_init.up,
    down: migration_20260829_093914_init.down,
    name: '20260829_093914_init'
  },
];
