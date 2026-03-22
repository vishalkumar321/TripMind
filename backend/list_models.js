require('dotenv').config({ path: '/home/vishal/Downloads/TripMind/backend/.env' });

async function run() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        if (data.error) {
            console.error(data.error);
        } else {
            console.log("AVAILABLE MODELS:");
            console.log(JSON.stringify(data.models.map(m => m.name), null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}
run();
