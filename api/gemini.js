// HAPUS BARIS IMPORT DI ATAS. KITA TIDAK BUTUH IMPORT.
// Vercel (Node.js 18+) sudah punya 'fetch' bawaan.

export default async function handler(req, res) {
    // 1. SETTING PROJECT (Sama persis punya kamu)
    const apiKey = "AIzaSyD6QwvrvnjU7j-R6fkOghfIVKwtvc7SmLk";
    const projectID = "gemmy-ai-bdc03";
    const location = "us-central1";
    const baseUrl = "https://firebasevertexai.googleapis.com/v1beta";

    // 2. AMBIL DATA DARI URL
    // Kalau di Cloudflare: url.searchParams.get("prompt")
    // Kalau di Vercel: req.query.prompt
    const { prompt, model } = req.query;

    // 3. LOGIKA DEFAULT
    let modelName = model;
    if (!modelName) {
        modelName = "gemini-2.0-flash";
    }

    // Jika user cuma buka link tanpa tanya
    if (!prompt) {
        return res.status(200).json({
            status: true,
            message: "Vertex AI (Vercel Native Fetch)",
            author: "AngelaImut",
            cara_pakai: "/api/gemini?prompt=Halo"
        });
    }

    // Susun URL Google
    const apiUrl = `${baseUrl}/projects/${projectID}/locations/${location}/publishers/google/models/${modelName}:generateContent?key=${apiKey}`;

    try {
        // 4. TEMBAK KE GOOGLE (PAKAI FETCH BAWAAN)
        // Ini persis cara kerja Cloudflare Worker kamu
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-client": "gl-js/fire/worker"
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }]
            })
        });

        // 5. BACA HASILNYA
        const data = await response.json();

        // Cek apakah Google Error
        if (data.error) {
            return res.status(400).json({
                status: false,
                source: "Google Vertex Error",
                message: data.error.message
            });
        }

        // Ambil Jawaban AI
        if (data.candidates && data.candidates.length > 0) {
            const textJawaban = data.candidates[0].content.parts[0].text;

            return res.status(200).json({
                status: true,
                author: "AngelaImut",
                source: "Vertex AI (Vercel)", // Bukti ini jalan di Vercel
                result: textJawaban
            });
        } else {
            return res.status(200).json({
                status: false,
                message: "AI tidak menjawab (No candidates found)"
            });
        }

    } catch (error) {
        // Tangkap Error Koneksi
        return res.status(500).json({
            status: false,
            error: error.message,
            tips: "Pastikan koneksi internet Vercel aman."
        });
    }
}