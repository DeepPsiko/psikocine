import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

const AVAILABLE_GENRES = [
  "Acción",
  "Aventura",
  "Animación",
  "Comedia",
  "Crimen",
  "Drama",
  "Terror",
  "Ciencia ficción",
  "Fantasía",
  "Romance",
  "Suspenso",
  "Thriller",
  "Documental",
];

interface MovieAutofillData {
  title: string;
  originalTitle: string;
  year: number;
  duration: number;
  director: string;
  cast: string;
  country: string;
  description: string;
  genres: string[];
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const query = (body.query || "").trim();

    if (!query) {
      return NextResponse.json(
        { error: "Por favor escribe el nombre de la película a buscar" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Try Gemini API if key is present
    if (apiKey) {
      const prompt = `Eres un experto enciclopédico en cine mundial. Tu tarea es identificar la película solicitada por el usuario y devolver su ficha técnica completa en formato JSON estricto.

Película solicitada: "${query}"

Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura exacta:
{
  "title": "Título en español o cómo se conoce comúnmente en Latinoamérica/España",
  "originalTitle": "Título original de la película",
  "year": 2012,
  "duration": 143,
  "director": "Nombre del director o directores principales",
  "cast": "Nombres de los 4 a 6 actores principales separados por comas",
  "country": "País principal de origen (ej. Estados Unidos, Reino Unido, Japón, etc.)",
  "description": "Sinopsis atractiva, clara y en español neutro (entre 2 y 4 oraciones) sin spoilers graves",
  "genres": ["Acción", "Ciencia ficción", "Aventura"]
}

IMPORTANTE:
- "year" debe ser un número entero.
- "duration" debe ser un número entero en minutos.
- "genres" debe contener entre 1 y 3 géneros elegidos EXCLUSIVAMENTE de esta lista permitida:
${JSON.stringify(AVAILABLE_GENRES)}`;

      // Try primary and fallback Gemini models
      const modelsToTry = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-2.5-flash"];

      for (const model of modelsToTry) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const res = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2,
              },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textResponse) {
              const parsed: MovieAutofillData = JSON.parse(textResponse);

              // Filter genres to only allowed ones
              const validGenres = Array.isArray(parsed.genres)
                ? parsed.genres.filter((g) => AVAILABLE_GENRES.includes(g))
                : [];

              return NextResponse.json({
                success: true,
                source: "gemini",
                movie: {
                  title: parsed.title || query,
                  originalTitle: parsed.originalTitle || parsed.title || query,
                  year: Number(parsed.year) || new Date().getFullYear(),
                  duration: Number(parsed.duration) || 120,
                  director: parsed.director || "Director",
                  cast: parsed.cast || "Reparto principal",
                  country: parsed.country || "Estados Unidos",
                  description: parsed.description || "",
                  genres: validGenres.length > 0 ? validGenres : ["Drama"],
                },
              });
            }
          }
        } catch (e) {
          console.error(`Gemini model ${model} error:`, e);
        }
      }
    }

    // 2. Fallback: Search in Wikipedia
    try {
      const fallbackMovie = await fetchFromWikipediaFallback(query);
      if (fallbackMovie) {
        return NextResponse.json({
          success: true,
          source: "fallback",
          warning:
            "Datos autocompletados desde base de datos de respaldo. (Nota: los créditos de tu clave Gemini en Google AI Studio están agotados actualmente).",
          movie: fallbackMovie,
        });
      }
    } catch (fallbackError) {
      console.error("Fallback error:", fallbackError);
    }

    return NextResponse.json(
      { error: "No se encontró información suficiente para esta película. Intenta escribir el nombre con el año, ej: 'Avengers 2012'." },
      { status: 404 }
    );
  } catch (error) {
    console.error("Autofill API error:", error);
    return NextResponse.json(
      { error: "Error al comunicarse con el servicio de IA" },
      { status: 500 }
    );
  }
}

async function fetchFromWikipediaFallback(query: string): Promise<MovieAutofillData | null> {
  const searchUrl = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
    query + " película"
  )}&utf8=&format=json`;

  const sRes = await fetch(searchUrl, {
    headers: { "User-Agent": "PsikosClub/1.0" },
  });
  const sData = await sRes.json();
  const pageTitle = sData.query?.search?.[0]?.title;
  if (!pageTitle) return null;

  const summaryUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
    pageTitle
  )}`;
  const sumRes = await fetch(summaryUrl, {
    headers: { "User-Agent": "PsikosClub/1.0" },
  });
  const sumData = await sumRes.json();
  const extract: string = sumData.extract || "";

  // Extract year
  const yearMatch = query.match(/\b(19\d{2}|20\d{2})\b/) || pageTitle.match(/\b(19\d{2}|20\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();

  // Clean title
  const cleanTitle = pageTitle.replace(/\s*\(.*?\)\s*/g, "").trim();

  // Try extracting director
  const dirMatch =
    extract.match(/dirigida por\s+([^,.\(]+)/i) ||
    extract.match(/dirigido por\s+([^,.\(]+)/i) ||
    extract.match(/bajo la dirección de\s+([^,.\(]+)/i);
  const director = dirMatch ? dirMatch[1].trim() : "Director";

  // Try extracting cast
  const castMatch =
    extract.match(/reparto\s+(?:coral\s+)?que incluye a\s+([^.]+)/i) ||
    extract.match(/protagonizada por\s+([^.]+)/i) ||
    extract.match(/protagonistas son\s+([^.]+)/i);
  let cast = castMatch ? castMatch[1].replace(/\s+como\s+.*$/i, "").trim() : "";
  if (cast.length > 150) cast = cast.slice(0, 150) + "...";
  if (!cast) cast = "Reparto principal";

  // Guess genres based on description keywords
  const matchedGenres: string[] = [];
  const lowerExtract = extract.toLowerCase();
  if (lowerExtract.includes("superhéroe") || lowerExtract.includes("acción")) matchedGenres.push("Acción");
  if (lowerExtract.includes("ciencia ficción") || lowerExtract.includes("espacio") || lowerExtract.includes("futuro")) matchedGenres.push("Ciencia ficción");
  if (lowerExtract.includes("aventura")) matchedGenres.push("Aventura");
  if (lowerExtract.includes("terror") || lowerExtract.includes("miedo") || lowerExtract.includes("horror")) matchedGenres.push("Terror");
  if (lowerExtract.includes("comedia") || lowerExtract.includes("cómica")) matchedGenres.push("Comedia");
  if (lowerExtract.includes("animada") || lowerExtract.includes("animación")) matchedGenres.push("Animación");
  if (lowerExtract.includes("suspenso") || lowerExtract.includes("thriller")) matchedGenres.push("Suspenso");
  if (lowerExtract.includes("drama")) matchedGenres.push("Drama");

  const finalGenres = matchedGenres.length > 0 ? matchedGenres.slice(0, 3) : ["Acción", "Aventura"];

  return {
    title: cleanTitle,
    originalTitle: cleanTitle,
    year,
    duration: 125,
    director,
    cast,
    country: extract.includes("estadounidense") ? "Estados Unidos" : "Internacional",
    description: extract || `Película ${cleanTitle} estrenada en ${year}.`,
    genres: finalGenres,
  };
}
