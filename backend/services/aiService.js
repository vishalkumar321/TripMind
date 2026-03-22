const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateItinerary = async (tripData) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    generationConfig: { responseMimeType: "application/json" }
  });

  const { description, days, budget, currency, style, pace, destination } = tripData;
  const targetDestination = destination || "your chosen destination";

  const prompt = `You are TripMind, an expert travel planner. Plan a ${days} day trip to 
  ${targetDestination}. The traveler described their trip as: '${description}'. 
  Travel style: ${style}. Pace: ${pace}. Budget: ${currency ? currency + ' ' : ''}${budget}.
  
  Respond ONLY with a valid JSON object, no markdown, no explanation:
  {
    "title": "string",
    "summary": "string",
    "days": [
      {
        "day": 1,
        "theme": "string",
        "morning": { "activity": "string", "place": "string", "tip": "string", "lat": 0, "lng": 0 },
        "afternoon": { "activity": "string", "place": "string", "tip": "string", "lat": 0, "lng": 0 },
        "evening": { "activity": "string", "place": "string", "tip": "string", "lat": 0, "lng": 0 },
        "estimated_cost": "string"
      }
    ],
    "total_estimated_cost": "string",
    "best_time_to_visit": "string",
    "packing_tips": ["string"],
    "hidden_gems": ["string"]
  }`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error('Failed to generate itinerary');
  }
};

module.exports = { generateItinerary };
