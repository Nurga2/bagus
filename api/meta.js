// FORMAT: MODERN (ESM) - STABIL
// File: api/index.js

export default async function handler(req, res) {
  // 1. Ambil Parameter ?text=...
  const { text } = req.query;

  // Cek jika kosong
  if (!text) {
    return res.status(200).json({
      status: true,
      author: "AngelaImut",
      message: "WebPilot AI Search",
      usage: "/api?text=Berita hari ini"
    });
  }

  // URL Target WebPilot
  const targetUrl = 'https://api.webpilotai.com/rupee/v1/search';

  try {
    // 2. Request ke API WebPilot
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer null', // WebPilot mode Guest
        'Origin': 'https://www.webpilot.ai'
      },
      body: JSON.stringify({
        q: text,
        threadId: ''
      })
    });

    if (!response.ok) {
      throw new Error(`Server Error: ${response.status}`);
    }

    // 3. Ambil Data (Tunggu sampai full / await text)
    // Jangan pakai stream iterator biar tidak 404/Timeout di Vercel
    const rawData = await response.text();

    // 4. Parsing Manual (Bersihkan format 'data:')
    let cleanText = "";
    let sources = [];
    
    // Pecah per baris
    const lines = rawData.split('\n');
    
    for (const line of lines) {
      // Cuma ambil baris yang ada datanya
      if (line.trim().startsWith('data:')) {
        try {
          // Buang tulisan 'data:' dan parse JSON
          const jsonStr = line.replace('data:', '').trim();
          if (!jsonStr) continue;
          
          const jsonData = JSON.parse(jsonStr);
          
          // Ambil Teks Jawaban
          if (jsonData.type === 'data' && jsonData.data && jsonData.data.content && !jsonData.data.section_id) {
            cleanText += jsonData.data.content;
          }
          
          // Ambil Link Sumber
          if (jsonData.action === 'using_internet' && jsonData.data) {
            sources.push(jsonData.data);
          }
        } catch (e) {
          // Abaikan baris error/kosong
        }
      }
    }

    // 5. Kirim Hasil JSON
    return res.status(200).json({
      status: true,
      author: "AngelaImut",
      source: "WebPilot",
      query: text,
      result: {
        answer: cleanText.trim(),
        sources: sources
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message,
      tips: "Server WebPilot mungkin sedang sibuk atau menolak request."
    });
  }
}
