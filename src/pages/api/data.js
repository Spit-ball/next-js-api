import { createClient } from '@supabase/supabase-js';

// Use Supabase service role key (server-side safe)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://congenial-adventure-jnwqzp8.pages.github.io');
    // or your frontend URL
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const HOUSES = ['Ambrosius', 'Valerius', 'Nicostratus', 'Sapientia'];

    try {
        if (req.method === 'GET') {
            const { data, error } = await supabase
                .from('house_points')
                .select('house, points');

            if (error) throw error;

            // Initialize totals
            const totals = HOUSES.reduce((acc, h) => ({ ...acc, [h]: 0 }), {});

            // Sum points per house
            data.forEach(row => {
                if (totals[row.house] !== undefined) {
                    totals[row.house] += row.points;
                }
            });

            res.status(200).json(totals); // return object with all houses
        } else if (req.method === 'POST') {
            const { house, student_name, points, teacher, reason } = req.body;
            const { data, error } = await supabase
                .from('house_points')
                .insert([{ house, student_name, points, teacher, reason }])
                .select();

            if (error) throw error;
            res.status(200).json(data[0]);
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
