import { createClient } from '@supabase/supabase-js';

// Use Supabase service role key (server-side safe)
const supabase = createClient(
    process.env.SUPABASE_URL,               // server-side URL
    process.env.SUPABASE_SERVICE_ROLE_KEY   // server-side service role key
);
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // or your frontend URL
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const { data, error } = await supabase
                .from('house_points')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            res.status(200).json(data);
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
