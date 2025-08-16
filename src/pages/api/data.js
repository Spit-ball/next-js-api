import { createClient } from '@supabase/supabase-js';

// Use Supabase service role key (server-side only)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    // CORS headers for GitHub Pages / other frontends
    res.setHeader('Access-Control-Allow-Origin', '*'); // replace * with your frontend if needed
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            // Check if client requested full submissions
            if (req.query.type === 'submissions') {
                const { data, error } = await supabase
                    .from('house_points')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                res.status(200).json(data);
            } else {
                // Return totals per house
                const { data, error } = await supabase
                    .from('house_points')
                    .select('house, points');

                if (error) throw error;

                // Aggregate totals
                const totals = data.reduce(
                    (acc, row) => {
                        acc[row.house] = (acc[row.house] || 0) + row.points;
                        return acc;
                    },
                    { Ambrosius: 0, Valerius: 0, Nicostratus: 0, Sapientia: 0 }
                );

                res.status(200).json(totals);
            }
        } else if (req.method === 'POST') {
            // Create new submission
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
