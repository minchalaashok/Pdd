require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL and SUPABASE_KEY must be set in server/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Supabase connected:', supabaseUrl);

function tableName(sql) {
  const m =
    sql.match(/FROM\s+\w+/i) ||
    sql.match(/INSERT\s+INTO\s+(\w+)/i) ||
    sql.match(/UPDATE\s+(\w+)/i) ||
    sql.match(/DELETE\s+FROM\s+(\w+)/i);
  if (!m) return null;
  const raw = (m[1] || m[0].split(/\s+/).pop()).replace(/["`']/g, '');
  return raw.toLowerCase();
}

function inlineParams(sql, params) {
  if (!params || !params.length) return sql;
  let i = 0;
  let pg = sql.replace(/\?/g, () => '$' + (++i));
  for (let j = params.length; j >= 1; j--) {
    const val = params[j - 1];
    const esc = (val === null || val === undefined) ? 'NULL' : "'" + String(val).replace(/'/g, "''") + "'";
    pg = pg.replace(new RegExp('\\$' + j + '(?!\\d)', 'g'), esc);
  }
  return pg;
}

function applyWhere(builder, sql, params) {
  const finSql = inlineParams(sql, params || []);
  const wm = finSql.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+LIMIT|\s+GROUP|$)/is);
  if (!wm) return builder;
  for (const cond of wm[1].trim().split(/\s+AND\s+/i)) {
    const eq  = cond.match(/^(\w+)\s*=\s*'([^']*)'$/);
    const eqN = cond.match(/^(\w+)\s*=\s*(\d+)$/);
    const neq = cond.match(/^(\w+)\s*!=\s*'([^']*)'$/);
    const gt  = cond.match(/^(\w+)\s*>\s*(\d+)$/);
    const lk  = cond.match(/^(\w+)\s+LIKE\s+'([^']*)'/i);
    if (eq)       builder = builder.eq(eq[1], eq[2]);
    else if (eqN) builder = builder.eq(eqN[1], Number(eqN[2]));
    else if (neq) builder = builder.neq(neq[1], neq[2]);
    else if (gt)  builder = builder.gt(gt[1], Number(gt[2]));
    else if (lk)  builder = builder.ilike(lk[1], lk[2]);
  }
  return builder;
}

const query = async (sql, params) => {
  try {
    const tbl = tableName(sql);
    if (!tbl) { console.error('[DB] Cannot parse table from:', sql.slice(0,80)); return []; }
    if (/JOIN|COUNT\(\*\)|SUM\(|strftime|to_char/i.test(sql)) return execRaw(sql, params);
    let b = supabase.from(tbl).select('*');
    b = applyWhere(b, sql, params);
    const om = sql.match(/ORDER\s+BY\s+(\w+)\s*(ASC|DESC)?/i);
    if (om) b = b.order(om[1], { ascending: (om[2]||'ASC').toUpperCase()==='ASC' });
    const lm = sql.match(/LIMIT\s+(\d+)/i);
    if (lm) b = b.limit(Number(lm[1]));
    const { data, error } = await b;
    if (error) { console.error('[DB query error]', error.message); return []; }
    return data || [];
  } catch (err) { console.error('[DB query exception]', err.message); return []; }
};

const getOne = async (sql, params) => { const rows = await query(sql, params); return rows[0] ?? null; };

const run = async (sql, params) => {
  try {
    const tbl = tableName(sql);
    if (!tbl) throw new Error('Cannot parse table from SQL');
    if (/^\s*INSERT/i.test(sql)) {
      const cm = sql.match(/\(([^)]+)\)\s*VALUES/i);
      if (!cm) throw new Error('Cannot parse INSERT columns');
      const cols = cm[1].split(',').map(c => c.trim());
      const row = {};
      cols.forEach((col, idx) => { row[col] = (params && params[idx] !== undefined) ? params[idx] : null; });
      const { data, error } = await supabase.from(tbl).insert(row).select('id').single();
      if (error) { console.error('[DB insert error]', error.message, JSON.stringify(row)); throw new Error(error.message); }
      return { id: data?.id ?? null, changes: 1 };
    }
    if (/^\s*UPDATE/i.test(sql)) {
      const sm = sql.match(/SET\s+(.+?)\s+WHERE/is);
      if (!sm) throw new Error('Cannot parse UPDATE SET');
      const pairs = sm[1].split(',').map(s => s.trim());
      const updates = {};
      pairs.forEach((p, idx) => { updates[p.split('=')[0].trim()] = params ? params[idx] : null; });
      let b = supabase.from(tbl).update(updates);
      const wp = params ? params.slice(pairs.length) : [];
      b = applyWhere(b, sql, [...new Array(pairs.length).fill(null), ...wp]);
      const { error } = await b;
      if (error) { console.error('[DB update error]', error.message); throw new Error(error.message); }
      return { id: null, changes: 1 };
    }
    if (/^\s*DELETE/i.test(sql)) {
      let b = supabase.from(tbl).delete();
      b = applyWhere(b, sql, params);
      const { error } = await b;
      if (error) { console.error('[DB delete error]', error.message); throw new Error(error.message); }
      return { id: null, changes: 1 };
    }
    throw new Error('Unsupported SQL: ' + sql.slice(0,60));
  } catch (err) { console.error('[DB run exception]', err.message); throw err; }
};

const execRaw = async (sql, params) => {
  try {
    const norm = (s) => s
      .replace(/\bUsers\b/g,'users').replace(/\bDonors\b/g,'donors')
      .replace(/\bReceivers\b/g,'receivers').replace(/\bHospitals\b/g,'hospitals')
      .replace(/\bBloodInventory\b/g,'bloodinventory').replace(/\bOrganInventory\b/g,'organinventory')
      .replace(/\bRequests\b/g,'requests').replace(/\bDonations\b/g,'donations')
      .replace(/\bAuditLogs\b/g,'auditlogs').replace(/\bNotifications\b/g,'notifications')
      .replace(/\bChats\b/g,'chats').replace(/\bMedicalDocuments\b/g,'medicaldocuments')
      .replace(/strftime\('%Y-%m',\s*([^)]+)\)/g,"to_char($1, 'YYYY-MM')");
    const finalSql = norm(inlineParams(sql, params || []));
    const { data, error } = await supabase.rpc('exec_sql', { query: finalSql });
    if (error) { console.error('[execRaw error]', error.message); return []; }
    return Array.isArray(data) ? data : [];
  } catch (err) { console.error('[execRaw exception]', err.message); return []; }
};

module.exports = { supabase, query, getOne, run };
