// Main API health check endpoint for Vercel
module.exports = (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Health check
    if (req.method === 'GET') {
        res.status(200).json({ 
            status: 'ok', 
            message: 'JNTU Attendance API is running',
            timestamp: new Date().toISOString()
        });
        return;
    }

    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' });
};