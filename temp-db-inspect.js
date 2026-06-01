const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 30805,
  database: 'nexovibe_bd',
  user: 'postgres',
  password: 'dAG172005%'
});
(async () => {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
    console.log('tables:', res.rows.map((r) => r.table_name).join(', '));
    for (const t of res.rows.map((r) => r.table_name)) {
      try {
        const c = await pool.query(`SELECT count(*) FROM ${t}`);
        console.log(t, c.rows[0].count);
      } catch (e) {
        console.log(t, 'count error', e.message);
      }
    }
  } catch (e) {
    console.error('db error', e);
  } finally {
    await pool.end();
  }
})();
