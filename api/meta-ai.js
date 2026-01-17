// ==========================================
// Author  : If you like content like this, you can join this channel. 📲
// Contact : https://t.me/jieshuo_materials
// ==========================================

export default async function handler(req, res) {
  const { prompt } = req.query;
  if (!prompt) {
    return res.status(200).json({
      status: true,
      author: "AngelaImut",
      message: "Meta AI (Llama 3)",
      usage: "/api/meta?prompt=Apa itu Kuantum"
    });
  }
  const generateUUIDv4 = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
  const extract = (text, key, startStr = null, endStr = '",') => {
    startStr = startStr || (key ? `${key}":{"value":"` : "");
    let start = text.indexOf(startStr);
    if (start >= 0) {
      start += startStr.length;
      const end = text.indexOf(endStr, start);
      if (end >= 0) return text.substring(start, end);
    }
    return null;
  };
  const binaryToDecimal = (binary) => {
    let result = "";
    let currentBinary = binary;
    while (currentBinary !== "0" && currentBinary !== "") {
      let carry = 0;
      let next = "";
      for (let i = 0; i < currentBinary.length; i++) {
        carry = 2 * carry + parseInt(currentBinary[i], 10);
        if (carry >= 10) { next += "1"; carry -= 10; } else { next += "0"; }
      }
      result = carry.toString() + result;
      currentBinary = next.replace(/^0+/, "");
    }
    return result || "0";
  };
  const generateID = () => {
    const now = Date.now();
    const rand = Math.floor(Math.random() * 4294967295);
    const binary = ("0000000000000000000000" + rand.toString(2)).slice(-22);
    const full = now.toString(2) + binary;
    return binaryToDecimal(full);
  };
  try {
    const headers = {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "sec-ch-ua": '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    };
    const responseMain = await fetch("https://www.meta.ai/", { headers });
    const html = await responseMain.text();
    const lsdToken = extract(html, null, '"LSD",[],{"token":"', '"}');
    const cookies = {
      jsDatr: extract(html, "_js_datr"),
      csrfToken: extract(html, "abra_csrf"),
      datr: extract(html, "datr"),
    };
    const cookieString = Object.entries(cookies)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
    const tokenPayload = new URLSearchParams({
      lsd: lsdToken,
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "useAbraAcceptTOSForTempUserMutation",
      variables: JSON.stringify({
        dob: "1999-01-01",
        icebreaker_type: "TEXT_V2",
        __relay_internal__pv__WebPixelRatiorelayprovider: 1,
      }),
      doc_id: "8631373360323878",
    });
    const responseToken = await fetch("https://www.meta.ai/api/graphql", {
      method: "POST",
      headers: {
        ...headers,
        "content-type": "application/x-www-form-urlencoded",
        "x-fb-friendly-name": "useAbraAcceptTOSForTempUserMutation",
        "x-fb-lsd": lsdToken,
        "x-asbd-id": "129477",
        "cookie": cookieString,
      },
      body: tokenPayload
    });
    const tokenText = await responseToken.text();
    let accessToken = null;
    try {
      const match = tokenText.match(/"access_token":"(.*?)"/);
      if (match) accessToken = match[1];
    } catch (e) { }
    if (!accessToken) throw new Error("Gagal mendapatkan Access Token Meta.");
    const chatPayload = new URLSearchParams({
      access_token: accessToken,
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "useAbraSendMessageMutation",
      variables: JSON.stringify({
        message: { sensitive_string_value: prompt },
        externalConversationId: generateUUIDv4(),
        offlineThreadingId: generateID(),
        entrypoint: "ABRA__CHAT__TEXT",
        icebreaker_type: "TEXT_V2",
        __relay_internal__pv__AbraDebugDevOnlyrelayprovider: false,
        __relay_internal__pv__WebPixelRatiorelayprovider: 1,
      }),
      server_timestamps: "true",
      doc_id: "8544224345667255",
    });
    const responseChat = await fetch("https://graph.meta.ai/graphql?locale=user", {
      method: "POST",
      headers: {
        ...headers,
        "content-type": "application/x-www-form-urlencoded",
        "cookie": cookieString,
        "x-fb-friendly-name": "useAbraSendMessageMutation",
        "origin": "https://www.meta.ai",
        "referer": "https://www.meta.ai/"
      },
      body: chatPayload
    });
    const chatText = await responseChat.text();
    const lines = chatText.split("\n");
    let finalMessage = "";
    let lastLength = 0;
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        const botMessage = json?.data?.node?.bot_response_message;
        if (botMessage && (botMessage.streaming_state === "STREAMING" || botMessage.streaming_state === "OVERALL_DONE")) {
          const snippet = botMessage.snippet;
          if (snippet.length > lastLength) {
            finalMessage = snippet;
            lastLength = snippet.length;
          }
        }
      } catch (e) { }
    }
    return res.status(200).json({
      status: true,
      author: "AngelaImut",
      source: "Meta AI (Llama 3)",
      result: finalMessage || "Tidak ada jawaban."
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message,
      tips: "Meta AI sangat ketat, coba lagi nanti."
    });
  }
}