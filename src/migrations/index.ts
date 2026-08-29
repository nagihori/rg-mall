import * as migration_20260829_093914_init from './20260829_093914_init';
import * as migration_20260829_123513_add_pending_user_role from './20260829_123513_add_pending_user_role';
import * as migration_20260829_132633_media_upload from './20260829_132633_media_upload';
import * as migration_20260829_135500_media_rights_uploader from './20260829_135500_media_rights_uploader';
import * as migration_20260829_141200_media_drop_storage_key from './20260829_141200_media_drop_storage_key';
import * as migration_20260830_000000_media_sizes from './20260830_000000_media_sizes';

export const migrations = [
  {
    up: migration_20260829_093914_init.up,
    down: migration_20260829_093914_init.down,
    name: '20260829_093914_init',
  },
  {
    up: migration_20260829_123513_add_pending_user_role.up,
    down: migration_20260829_123513_add_pending_user_role.down,
    name: '20260829_123513_add_pending_user_role',
  },
  {
    up: migration_20260829_132633_media_upload.up,
    down: migration_20260829_132633_media_upload.down,
    name: '20260829_132633_media_upload'
  },
  {
    up: migration_20260829_135500_media_rights_uploader.up,
    down: migration_20260829_135500_media_rights_uploader.down,
    name: '20260829_135500_media_rights_uploader'
  },
  {
    up: migration_20260829_141200_media_drop_storage_key.up,
    down: migration_20260829_141200_media_drop_storage_key.down,
    name: '20260829_141200_media_drop_storage_key'
  },
  {
    up: migration_20260830_000000_media_sizes.up,
    down: migration_20260830_000000_media_sizes.down,
    name: '20260830_000000_media_sizes'
  },
];
