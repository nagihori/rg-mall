import * as migration_20260829_093914_init from './20260829_093914_init';
import * as migration_20260829_123513_add_pending_user_role from './20260829_123513_add_pending_user_role';
import * as migration_20260829_132633_media_upload from './20260829_132633_media_upload';
import * as migration_20260829_135500_media_rights_uploader from './20260829_135500_media_rights_uploader';
import * as migration_20260829_141200_media_drop_storage_key from './20260829_141200_media_drop_storage_key';
import * as migration_20260830_000000_media_sizes from './20260830_000000_media_sizes';
import * as migration_20260830_010000_events_created_by_discord from './20260830_010000_events_created_by_discord';
import * as migration_20260830_020000_events_created_by_username from './20260830_020000_events_created_by_username';
import * as migration_20260830_030000_events_location_and_review_requester from './20260830_030000_events_location_and_review_requester';
import * as migration_20260830_040000_events_deleted_at from './20260830_040000_events_deleted_at';
import * as migration_20260901_011906_vercel_usage_monitor from './20260901_011906_vercel_usage_monitor';

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
  {
    up: migration_20260830_010000_events_created_by_discord.up,
    down: migration_20260830_010000_events_created_by_discord.down,
    name: '20260830_010000_events_created_by_discord'
  },
  {
    up: migration_20260830_020000_events_created_by_username.up,
    down: migration_20260830_020000_events_created_by_username.down,
    name: '20260830_020000_events_created_by_username'
  },
  {
    up: migration_20260830_030000_events_location_and_review_requester.up,
    down: migration_20260830_030000_events_location_and_review_requester.down,
    name: '20260830_030000_events_location_and_review_requester'
  },
  {
    up: migration_20260830_040000_events_deleted_at.up,
    down: migration_20260830_040000_events_deleted_at.down,
    name: '20260830_040000_events_deleted_at'
  },
  {
    up: migration_20260901_011906_vercel_usage_monitor.up,
    down: migration_20260901_011906_vercel_usage_monitor.down,
    name: '20260901_011906_vercel_usage_monitor'
  },
];
