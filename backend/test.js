const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '/home/vishal/Downloads/TripMind/backend/.env' });
const axios = require('axios');

const token = jwt.sign({ id: "test-user-id" }, process.env.JWT_SECRET, { expiresIn: '1h' });

(async () => {
    try {
        const res = await axios.post('http://localhost:8000/trips/generate', {
            description: "masoori trip",
            days: 5,
            budget: "10000",
            currency: "INR",
            style: "Mid-range",
            pace: "Balanced"
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("SUCCESS:", res.data);
    } catch (e) {
        console.error("ERROR:");
        console.error(e.response ? e.response.data : e.message);
    }
})();
