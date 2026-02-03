// Simple health check endpoint
module.exports = (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        message: 'JNTU Attendance API is running',
        timestamp: new Date().toISOString()
    });
};