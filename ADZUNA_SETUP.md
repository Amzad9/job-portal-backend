# Adzuna API Auto Job Import Setup

This guide explains how to set up automatic job posting from the Adzuna API.

## Prerequisites

1. Adzuna API credentials:
   - App ID (you'll need to get this from Adzuna - see Step 2)
   - App Key: `99a383380cda28c24599ebc95e220c4d` (provided)

## Step 1: Environment Variables

Add these to your `.env` file:

```env
# Adzuna API Configuration
# Get App ID from https://developer.adzuna.com/ (see Step 2)
ADZUNA_APP_ID=your-app-id-here
# Use the provided API key
ADZUNA_APP_KEY=99a383380cda28c24599ebc95e220c4d

# Cron Job Schedule (optional, default: every 3 hours)
# Cron format: "minute hour day month weekday"
# Examples:
#   "0 */3 * * *" = every 3 hours
#   "0 */6 * * *" = every 6 hours
#   "0 0 * * *" = once daily at midnight
#   "0 0 */2 * *" = every 2 days at midnight
ADZUNA_IMPORT_SCHEDULE=0 */3 * * *

# Countries to import from (comma-separated)
# Available: us, gb, au, ca, de, at, be, ch, es, fr, ie, it, mx, nl, nz, pl, sg, za
ADZUNA_IMPORT_COUNTRIES=us

# Results per page (optional, default: 50)
ADZUNA_RESULTS_PER_PAGE=50

# Enable/disable auto import (optional, default: true)
# Set to "false" to disable automatic imports
ENABLE_ADZUNA_IMPORT=true

# Run import on server start (optional, default: false)
# Set to "true" to run an import when server starts
ADZUNA_IMPORT_ON_START=false
```

## Step 2: Get Adzuna App ID

1. Go to [Adzuna API](https://developer.adzuna.com/)
2. Sign up for an account
3. Create a new application
4. Copy your App ID
5. Add it to your `.env` file as `ADZUNA_APP_ID`

## Step 3: How It Works

### Automatic Import (Cron Job)

The system automatically imports jobs from Adzuna API based on the schedule you set:

1. **Cron Job**: Runs automatically at the scheduled time
2. **Fetches Jobs**: Gets jobs from Adzuna API for specified countries
3. **Maps Data**: Converts Adzuna job format to our Job model
4. **Checks Duplicates**: Skips jobs that already exist (by external ID)
5. **Creates Jobs**: Saves new jobs to database with `externalSource: "adzuna"`

### Manual Import (Admin Only)

Admins can manually trigger imports via API:

**Endpoint**: `POST /api/adzuna/import`

**Headers**:
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "country": "us",
  "resultsPerPage": 50,
  "page": 1,
  "what": "software engineer",
  "where": "New York"
}
```

**Response**:
```json
{
  "success": true,
  "imported": 45,
  "skipped": 5,
  "errors": 0,
  "total": 50,
  "message": "Imported 45 jobs, skipped 5 duplicates, 0 errors"
}
```

### Import Statistics

Get import statistics:

**Endpoint**: `GET /api/adzuna/stats`

**Headers**:
```
Authorization: Bearer <admin-token>
```

**Response**:
```json
{
  "success": true,
  "stats": {
    "totalImported": 1250,
    "recentImported": 45,
    "countries": [...]
  }
}
```

## Step 4: Job Mapping

Adzuna API fields are mapped to our Job model as follows:

| Adzuna Field | Our Job Field | Notes |
|-------------|---------------|-------|
| `title` | `title` | Direct mapping |
| `company.display_name` | `companyName` | Direct mapping |
| `location.display_name` | `location` | Direct mapping |
| `location.country` | `country` | Direct mapping |
| `salary_min` / `salary_max` | `salary` | Formatted as "$X - $Y" |
| `contract_type` | `workType` | Mapped to Full-time/Part-time/Contract |
| `contract_time` | `jobType` | Mapped to Full-time/Part-time |
| `description` | `aboutRole` | Direct mapping |
| `redirect_url` | `applyLink` | Direct mapping |
| `category.tag` | `skills` | Array of skills |
| `id` | `externalId` | For duplicate detection |
| - | `externalSource` | Set to "adzuna" |
| - | `source` | Set to "Adzuna API" |
| - | `status` | Set to "active" |

## Step 5: Duplicate Detection

The system prevents duplicate imports by:

1. **External ID Check**: Checks if a job with the same `externalId` and `externalSource: "adzuna"` already exists
2. **Slug Check**: Ensures unique slugs (format: `{title-slug}-adzuna-{id}`)
3. **Skip Logic**: If duplicate found, job is skipped (counted in `skipped`)

## Step 6: Testing

### Test Manual Import

1. Start your server:
   ```bash
   npm run dev
   ```

2. Login as admin and get your token

3. Test manual import:
   ```bash
   curl -X POST http://localhost:5000/api/adzuna/import \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "country": "us",
       "resultsPerPage": 10,
       "page": 1
     }'
   ```

4. Check the response for import results

### Test Cron Job

1. Set a test schedule (every minute for testing):
   ```env
   ADZUNA_IMPORT_SCHEDULE=*/1 * * * *
   ```

2. Restart server and watch logs

3. Change back to production schedule after testing

## Step 7: Monitoring

### Logs

The cron job logs important information:

- Start time of import
- Number of jobs processed per country
- Import results (imported, skipped, errors)
- Error messages if any

### Check Imported Jobs

Query jobs imported from Adzuna:

```javascript
// In MongoDB or via API
db.jobs.find({ externalSource: "adzuna" })
```

Or via API:
```
GET /api/jobs?source=Adzuna API
```

## Troubleshooting

### No Jobs Imported

1. **Check API Credentials**: Verify `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` are correct
2. **Check API Response**: Add logging to see what Adzuna API returns
3. **Check Country Code**: Ensure country code is valid (e.g., "us", "gb")
4. **Check Rate Limits**: Adzuna may have rate limits

### Duplicate Jobs

- This is normal - the system skips duplicates automatically
- Check `skipped` count in import results

### Cron Job Not Running

1. **Check Schedule**: Verify cron schedule format is correct
2. **Check Logs**: Look for cron job initialization messages
3. **Check Environment**: Ensure `ENABLE_ADZUNA_IMPORT` is not "false"
4. **Server Timezone**: Cron uses UTC timezone

### API Errors

1. **Invalid Credentials**: Check App ID and App Key
2. **Rate Limiting**: Adzuna may limit requests per day/hour
3. **Network Issues**: Check server internet connection

## Production Checklist

- [ ] Set `ADZUNA_APP_ID` in production `.env`
- [ ] Set appropriate `ADZUNA_IMPORT_SCHEDULE` (not too frequent)
- [ ] Set `ADZUNA_IMPORT_COUNTRIES` for your target markets
- [ ] Monitor import logs regularly
- [ ] Set up alerts for import failures
- [ ] Review imported jobs quality
- [ ] Adjust `ADZUNA_RESULTS_PER_PAGE` if needed

## API Endpoints Summary

- `POST /api/adzuna/import` - Manual import (Admin only)
- `GET /api/adzuna/stats` - Import statistics (Admin only)

## Notes

- Imported jobs have `createdBy: null` (no user association)
- Jobs are automatically set to `status: "active"`
- External jobs can be identified by `externalSource: "adzuna"`
- The system handles errors gracefully and continues with next job

