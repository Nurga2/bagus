// ==========================================
// Author  : If you like content like this, you can join this channel. 📲
// Contact : https://t.me/jieshuo_materials
// ==========================================

import axios from 'axios';

export default async function handler(req, res) {
  const startTime = Date.now();
  const author = "AngelaImut";

  // Konfigurasi Header
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');

  const q = req.query.q || req.query.text;

  if (!q) {
    return res.status(400).json({
      success: false,
      author: author,
      message: "Masukkan query pencarian! Contoh: ?q=love",
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`
    });
  }

  try {
    // Proses Scraping ke Dramabox
    const response = await axios.get(`https://www.dramabox.com/search?searchValue=${encodeURIComponent(q)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    // Mengambil data dari script __NEXT_DATA__
    const match = response.data.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!match) throw new Error("Gagal mengambil data dari server Dramabox.");

    const json = JSON.parse(match[1]);
    const list = json.props.pageProps.bookList || [];

    if (list.length === 0) {
      return res.status(404).json({
        success: false,
        author: author,
        message: "Drama tidak ditemukan.",
        timestamp: new Date().toISOString(),
        responseTime: `${Date.now() - startTime}ms`
      });
    }

    // Mapping hasil pencarian
    const results = list.map(v => ({
      id: v.bookId,
      title: v.bookName,
      episodes: v.totalChapterNum,
      description: v.introduction,
      cover: v.coverCutWap || v.coverWap,
      play_url: `https://www.dramabox.com/video/${v.bookId}_${v.bookNameEn}/${v.chapterId}_Episode-1`
    }));

    return res.status(200).json({
      success: true,
      author: author,
      total: results.length,
      result: results,
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      author: author,
      error: error.message,
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`
    });
  }
}
