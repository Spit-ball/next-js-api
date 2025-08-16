import { Pool } from 'pg';

// Use Vercel environment variable for DB connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
    // Allow GitHub Pages domain (CORS)
    res.setHeader('Access-Control-Allow-Origin', 'https://username.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        // Preflight request
        return res.status(200).end();
    }

    try {
        const result = await pool.query('SELECT * FROM my_table'); // replace with your table
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
