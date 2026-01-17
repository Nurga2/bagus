// ==========================================
// API BIBLE / CHAT (Native Fetch Version)
// Target: convertsw.my.id
// ==========================================

export default async function handler(req, res) {
    // Kita tangkap parameter ?prompt=...
    const { prompt } = req.query;

    // Validasi jika user tidak kirim pertanyaan
    if (!prompt) {
        return res.status(200).json({
            status: true,
            author: "AngelaImut",
            message: "API Bible Chat",
            usage: "/api/bible?prompt=Siapa itu Musa"
        });
    }

    const targetUrl = 'https://convertsw.my.id/api/chat';

    try {
        // REQUEST KE SERVER (Pakai Fetch Bawaan)
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Header tambahan biar disangka browser beneran
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({
                message: prompt // API minta key 'message'
            })
        });

        // Ambil data JSON dari sana
        const data = await response.json();

        // Validasi respon dari sana
        if (!data || !data.reply) {
            return res.status(404).json({
                status: false,
                message: "API Target tidak memberikan jawaban."
            });
        }

        // Kirim hasil bersih ke kamu
        return res.status(200).json({
            status: true,
            author: "AngelaImut",
            source: "ConvertSW API",
            result: data.reply.trim() // Kita bersihkan spasi
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            error: error.message,
            tips: "Server target mungkin sedang down."
        });
    }
}
