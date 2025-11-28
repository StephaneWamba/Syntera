# Clear All Data - Instructions

This guide will help you clear all conversations and messages from your database.

## Step 1: Clear MongoDB Data (Conversations & Messages)

Run the MongoDB clear script:

```bash
pnpm run db:clear-all
```

Or directly:

```bash
tsx scripts/clear-mongodb-data.ts
```

## What Gets Cleared

### MongoDB:
- ✅ `conversations` collection - All conversation records
- ✅ `messages` collection - All message records (including transcripts)

## Verification

After running the script, verify the data is cleared:

**MongoDB:**
The script will automatically verify and show counts after deletion.

## Notes

- This operation **cannot be undone** - make sure you have backups if needed
- The scripts are idempotent - safe to run multiple times
- Only conversation and message data is cleared (transcripts are stored as messages)
