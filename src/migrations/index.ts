import * as migration_20260829_093914_init from './20260829_093914_init';
import * as migration_20260829_123513_add_pending_user_role from './20260829_123513_add_pending_user_role';

export const migrations = [
  {
    up: migration_20260829_093914_init.up,
    down: migration_20260829_093914_init.down,
    name: '20260829_093914_init',
  },
  {
    up: migration_20260829_123513_add_pending_user_role.up,
    down: migration_20260829_123513_add_pending_user_role.down,
    name: '20260829_123513_add_pending_user_role'
  },
];
