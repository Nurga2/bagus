/**
 * DRAMABOX SCRAPER API - Vercel Serverless Function
 * Created for: SofiApis Standard
 */

const axios = require("axios");

export default async function handler(req, res) {
  // Mendapatkan parameter dari Query URL
  const { action, q, keyword, page, rank_type } = req.query;
  
  const query = q || keyword;
  const pageNo = page || 1;
  const typeRank = rank_type || 2;

  const API_BASE = "https://nb-dramabox-gentoken.vercel.app";
  const creator = "SofiApis";

  // Konfigurasi Header CORS agar bisa diakses dari aplikasi mana saja
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // --- HELPER: GET TOKEN & SIGN ---
  async function getSession() {
    const response = await axios.get(`${API_BASE}/generate-token`);
    return response.data.data;
  }

  async function getSignature(body, session) {
    const response = await axios.post(`${API_BASE}/sign`, {
      body: body,
      device_id: session.device_id,
      android_id: session.android_id,
      token: session.sn
    });
    return response.data.data.sn;
  }

  // --- HELPER: POST TO DRAMABOX ---
  async function dramaboxRequest(endpoint, body) {
    const session = await getSession();
    const signature = await getSignature(body, session);

    const headers = {
      "User-Agent": "okhttp/4.10.0",
      "Content-Type": "application/json; charset=UTF-8",
      "tn": `Bearer ${session.sn}`,
      "device-id": session.device_id,
      "android-id": session.android_id,
      "sn": signature,
      "version": "492",
      "vn": "4.9.2",
      "package-name": "com.storymatrix.drama",
      "language": "in"
    };

    const response = await axios.post(endpoint, body, { headers });
    return response.data;
  }

  try {
    let resultData = null;

    // --- ROUTER LOGIC ---
    switch (action) {
      case "search":
        if (!query) throw new Error("Parameter 'q' atau 'keyword' diperlukan");
        const sRes = await dramaboxRequest("https://sapi.dramaboxdb.com/drama-box/search/suggest", { "keyword": query });
        resultData = sRes.data.suggestList;
        break;

      case "latest":
        const lRes = await dramaboxRequest("https://sapi.dramaboxdb.com/drama-box/he001/theater", {
          "newChannelStyle": 1,
          "isNeedRank": 1,
          "pageNo": parseInt(pageNo),
          "index": 1,
          "channelId": 43
        });
        resultData = lRes.data.newTheaterList.records;
        break;

      case "rank":
        const rRes = await dramaboxRequest("https://sapi.dramaboxdb.com/drama-box/he001/rank", { "rankType": parseInt(typeRank) });
        resultData = rRes.data.rankList;
        break;

      case "foryou":
        const fRes = await dramaboxRequest("https://sapi.dramaboxdb.com/drama-box/he001/theater", {
          "homePageStyle": 0,
          "isNeedRank": 1,
          "isNeedNewChannel": 1,
          "type": 0
        });
        resultData = fRes.data.columnVoList;
        break;

      default:
        return res.status(200).json({
          status: true,
          creator: creator,
          message: "Dramabox Vercel API is Online",
          endpoints: {
            search: "/api/dramabox?action=search&q=keyword",
            latest: "/api/dramabox?action=latest&page=1",
            rank: "/api/dramabox?action=rank&rank_type=1",
            foryou: "/api/dramabox?action=foryou"
          }
        });
    }

    // Response Sukses
    res.status(200).json({
      status: true,
      creator: creator,
      action: action,
      data: resultData
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      creator: creator,
      error: error.message
    });
  }
}
