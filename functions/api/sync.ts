/**
 * CamperPack - Sync API
 * Handles bidirectional sync between local IndexedDB and cloud D1
 */

interface Env {
  CAMPER_DB: D1Database;
}

interface SyncItem {
  id: number;
  table_name: string;
  record_id: string;
  action: 'upsert' | 'delete';
  data: string | null;
  created_at: string;
}

interface SyncRequest {
  changes: SyncItem[];
  lastSync?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body: SyncRequest = await request.json();
    const { changes, lastSync } = body;

    // Process incoming changes
    for (const change of changes) {
      await processChange(env.CAMPER_DB, change);
    }

    // Get server changes since last sync
    let serverChanges: any[] = [];
    if (lastSync) {
      serverChanges = await getServerChanges(env.CAMPER_DB, lastSync);
    }

    return new Response(JSON.stringify({
      success: true,
      processed: changes.length,
      serverChanges
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Sync error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function processChange(db: D1Database, change: SyncItem) {
  const { table_name, record_id, action, data } = change;

  // Map table names from IndexedDB to D1
  const tableMap: Record<string, string> = {
    items: 'items',
    templates: 'trip_templates',
    trips: 'trips',
    tripItems: 'trip_items',
    locations: 'storage_locations',
    templateItems: 'template_items'
  };

  const dbTable = tableMap[table_name];
  if (!dbTable) {
    console.warn(`Unknown table: ${table_name}`);
    return;
  }

  if (action === 'delete') {
    await db.prepare(`DELETE FROM ${dbTable} WHERE id = ?`).bind(record_id).run();
  } else if (action === 'upsert' && data) {
    const record = JSON.parse(data);
    await upsertRecord(db, dbTable, record);
  }
}

async function upsertRecord(db: D1Database, table: string, record: Record<string, any>) {
  // Get column names from the record
  const columns = Object.keys(record).filter(k => record[k] !== undefined);
  const placeholders = columns.map(() => '?').join(', ');
  const values = columns.map(k => {
    const val = record[k];
    // Convert booleans to integers for SQLite
    if (typeof val === 'boolean') return val ? 1 : 0;
    return val;
  });

  // Build upsert query
  const updateClause = columns
    .filter(c => c !== 'id')
    .map(c => `${c} = excluded.${c}`)
    .join(', ');

  const sql = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT(id) DO UPDATE SET ${updateClause}
  `;

  await db.prepare(sql).bind(...values).run();
}

async function getServerChanges(db: D1Database, lastSync: string): Promise<any[]> {
  // Get changes from sync_log since last sync
  const result = await db.prepare(`
    SELECT * FROM sync_log
    WHERE created_at > ?
    ORDER BY created_at ASC
  `).bind(lastSync).all();

  return result.results || [];
}

// GET endpoint to fetch all data for initial sync
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  try {
    const items = await env.CAMPER_DB.prepare('SELECT * FROM items').all();
    const templates = await env.CAMPER_DB.prepare('SELECT * FROM trip_templates').all();
    const trips = await env.CAMPER_DB.prepare('SELECT * FROM trips').all();
    const tripItems = await env.CAMPER_DB.prepare('SELECT * FROM trip_items').all();
    const locations = await env.CAMPER_DB.prepare('SELECT * FROM storage_locations').all();

    // Try to get template_items (may not exist in older databases)
    let templateItems: any[] = [];
    try {
      const result = await env.CAMPER_DB.prepare('SELECT * FROM template_items').all();
      templateItems = result.results || [];
    } catch (e) {
      // Table doesn't exist yet - that's OK
      console.log('template_items table not found, skipping');
    }

    return new Response(JSON.stringify({
      items: items.results,
      templates: templates.results,
      trips: trips.results,
      tripItems: tripItems.results,
      locations: locations.results,
      templateItems: templateItems
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
