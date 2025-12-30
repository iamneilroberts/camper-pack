# CamperPack - E2E Testing Session

## Project Overview
CamperPack is a PWA for iPhone to manage camper trailer packing lists. It's deployed at https://camper-pack.pages.dev

**Tech Stack:**
- Frontend: Vanilla JS PWA with IndexedDB
- Backend: Cloudflare Pages + Functions + D1
- Database: D1 (cloud) synced with IndexedDB (local)

**GitHub:** https://github.com/iamneilroberts/camper-pack
**Local Path:** `/home/neil/dev/camper-pack`

## Current Status (Completed Features)

### 1. Inventory Management
- 182 items imported from CSV
- Items have: name, category, storage_location, is_permanent, is_critical, purchase_timing, icon, quantity, notes
- Categories: clothing, toiletries, meds, pet, electronics, food, gear, kitchen, bedding, tools, other
- Storage locations organized by area: House (1), Truck (8), Trailer (22)

### 2. Trip Templates
- 5 templates: Weekend, Week, Extended, Day, Special
- Each template can have items associated via `templateItems` store
- Template editor with Select All / Deselect All / Select Permanent / Select Critical buttons

### 3. Trip Management
- Create trips with name, template, dates, destination
- Trip statuses: planning, packing, traveling, completed
- Trips list on home screen sorted by status

### 4. Packing Lists
- Generated from template items when trip is created
- Three view modes: Workflow, Location, Category
- Workflow view: Critical → House → Permanent → Purchase
- Location view: House → Truck → Trailer (by storage location)
- Items can be checked off as packed

### 5. Pre-Departure Checklist
- Shows only critical items
- Must verify all critical items before "Ready to Go"

### 6. Cloud Sync
- Bidirectional sync: push local changes, pull cloud data
- Syncs: items, templates, trips, tripItems, templateItems, locations
- Shows confirmation with pushed/pulled counts

## Database Schema

**IndexedDB Stores:**
- `items` - Master inventory
- `templates` - Trip templates (weekend, week, etc.)
- `templateItems` - Items associated with each template
- `trips` - Individual trips
- `tripItems` - Packing list items for each trip
- `locations` - Storage locations
- `syncQueue` - Pending sync changes

**Key Relationships:**
- Template → templateItems → items (many-to-many)
- Trip → tripItems → items (many-to-many)
- Trip → template (one-to-one)

## Files Structure

```
/home/neil/dev/camper-pack/
├── public/
│   ├── index.html          # Main app shell
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker
│   ├── css/app.css         # All styles
│   └── js/
│       ├── app.js          # Main controller, navigation
│       ├── db.js           # IndexedDB + sync
│       ├── inventory.js    # Inventory CRUD
│       ├── templates.js    # Template item editor
│       ├── trips.js        # Trips + packing lists
│       └── camera.js       # Camera/vision (stretch)
├── functions/api/
│   ├── sync.ts             # GET/POST sync endpoint
│   └── vision.ts           # Claude vision (stretch)
└── db/migrations/
    ├── 0001_initial.sql
    └── 0002_template_items.sql
```

## Task: End-to-End Testing with Playwright MCP

Use the Playwright MCP tools to perform comprehensive E2E testing of the app. The Playwright MCP provides browser automation tools like:
- `mcp__playwright__browser_navigate` - Navigate to URL
- `mcp__playwright__browser_snapshot` - Get page accessibility snapshot
- `mcp__playwright__browser_click` - Click elements
- `mcp__playwright__browser_type` - Type text
- `mcp__playwright__browser_fill_form` - Fill form fields
- `mcp__playwright__browser_select_option` - Select dropdown options
- `mcp__playwright__browser_wait_for` - Wait for elements/conditions

### Test Plan

#### Test 1: Initial Load & Sync
1. Navigate to https://camper-pack.pages.dev
2. Take snapshot to verify home screen loads
3. Click sync button
4. Verify sync confirmation appears
5. Verify "Last synced" updates

#### Test 2: Template Configuration
1. From home, click "Weekend Trip" template
2. Verify template editor opens with item list
3. Click "Deselect All"
4. Verify all items unchecked
5. Click "Select Critical"
6. Verify critical items are checked
7. Click "Select Permanent"
8. Verify permanent items are checked
9. Click "Save Template"
10. Verify returns to home

#### Test 3: Create New Trip
1. Click "New Trip" button
2. Fill form:
   - Trip name: "Test Trip"
   - Template: "Weekend Trip" (or "weekend")
   - Start date: tomorrow
   - End date: 3 days from now
   - Destination: "Test Campground"
3. Submit form
4. Verify redirects to packing list
5. Verify trip name shows in header
6. Verify items from template appear in list

#### Test 4: Packing List Views
1. On packing screen, verify "View by" dropdown exists
2. Select "Storage Location" view
3. Verify items grouped by House → Truck → Trailer
4. Select "Category" view
5. Verify items grouped by category names
6. Select "Packing Workflow" view
7. Verify sections: Critical, House, Permanent, Purchase

#### Test 5: Check Off Items
1. On packing list, click first unchecked item
2. Verify item shows as checked (strikethrough, green checkbox)
3. Verify progress counter updates (e.g., "1 / 50 packed")
4. Click the same item again
5. Verify item unchecks

#### Test 6: Trips List
1. Navigate to Home (click home nav)
2. Verify "Your Trips" section shows the test trip
3. Verify trip card shows name, destination, dates
4. Verify status badge shows "Packing"
5. Click the trip card
6. Verify opens packing list for that trip

#### Test 7: Inventory Screen
1. Click Inventory nav button
2. Verify items list loads
3. Verify filter tabs exist (All, Trailer, Truck, House)
4. Click "Trailer" filter
5. Verify only trailer items shown
6. Use search box, type "coffee"
7. Verify filtered to coffee-related items

#### Test 8: Pre-Departure Flow
1. Go to packing list for test trip
2. Click "Pre-Departure Check" button
3. Verify pre-departure screen shows critical items
4. Verify "Ready to Go" button is disabled
5. Check all critical items
6. Verify "Ready to Go" button enables
7. Click "Ready to Go"
8. Verify confirmation and returns to home
9. Verify trip status changes to "Traveling"

### Expected Outcomes
- All navigation works correctly
- Data persists between screen changes
- Template items correctly filter packing list
- Check/uncheck state persists
- Sync works and updates timestamp
- All view modes render correctly

### Notes
- If any test fails, take a snapshot and report the issue
- The app uses dark theme (green primary color)
- Elements use data attributes and IDs for targeting
- Some operations are async (sync, DB operations)
