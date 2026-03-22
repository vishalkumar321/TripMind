const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Attempt to extract the first valid JSON object from an arbitrary string.
 * Falls back to reconstructing a minimal itinerary object if all parsing fails.
 */
function extractJSON(text) {
  // First pass: naive brace extraction
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    const slice = text.substring(first, last + 1);
    try {
      return JSON.parse(slice);
    } catch (_) {
      // fall through to second pass
    }
  }

  // Second pass: strip markdown code fences then retry
  const stripped = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(stripped);
  } catch (_) {
    // return null to signal a parse failure
    return null;
  }
}

const generateItinerary = async (tripData) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const { description, days, budget, currency, style, pace, destination } = tripData;
  const targetDestination = destination || 'your chosen destination';

  const prompt = `You are TripMind, an expert travel planner. Plan a ${days} day trip to \
${targetDestination}. The traveler described their trip as: '${description}'. \
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

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const parsed = extractJSON(text);
  if (!parsed) {
    throw new Error('AI returned malformed data. Please try again.');
  }
  return parsed;
};

const chatWithTrip = async (message, tripContext) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const systemContext = tripContext
    ? `You are TripMind Assistant. The user is viewing this trip: ${JSON.stringify({
      title: tripContext.title,
      destination: tripContext.destination,
      days: tripContext.days,
      budget: tripContext.budget,
      style: tripContext.style,
      itinerary: tripContext.itinerary,
    })}.`
    : 'You are TripMind Assistant, an expert in travel planning.';

  const prompt = `${systemContext}

Answer questions, suggest alternatives, give local tips. Be concise, friendly, and helpful. Keep responses under 180 words. Do not use excessive bullet points — write naturally.

User question: ${message}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

module.exports = { generateItinerary, chatWithTrip };
