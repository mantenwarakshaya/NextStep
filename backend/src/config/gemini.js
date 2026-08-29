const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

const getModel = (modelName) => ({
  async generateContent(prompt) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const response = await fetch(
      `${GEMINI_API_URL}/${encodeURIComponent(
        modelName,
      )}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      },
    );

    const body = await response.json();

    if (!response.ok) {
      throw new Error(
        body.error?.message || `Gemini request failed (${response.status}).`,
      );
    }

    const text = body.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    return {
      response: {
        text: () => text,
      },
    };
  },
});

const callWithRetry = async (operation, attempts = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  throw lastError;
};

module.exports = {
  getModel,
  callWithRetry,
};
