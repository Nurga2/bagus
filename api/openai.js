export default async function handler(req, res) {  
const MY_API_KEY = "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";  
const { action, prompt, model } = req.query;  
if (!MY_API_KEY || MY_API_KEY.includes("XXXXX")) {    
return res.status(500).json({ status: false, message: "Kunci API belum disetting!" });  
}  
const headers = {    
"Content-Type": "application/json",    
"Authorization": `Bearer ${MY_API_KEY}`  
};  
if (action === 'models') {    
try {      
const response = await fetch("https://api.openai.com/v1/models", { method: "GET", headers: headers });      
const data = await response.json();      
if (!response.ok) throw new Error(data.error?.message);      
const modelList = data.data.map(m => m.id).sort();      
return res.status(200).json({ status: true, mode: "list_models", models: modelList });    
} catch (error) {      
return res.status(500).json({ status: false, error: error.message });    
}  
}  
const selectedModel = model || "gpt-4.1-mini";  
if (!prompt) {    
return res.status(400).json({ status: false, message: "Prompt kosong." });  
}  
try {    
const response = await fetch("https://api.openai.com/v1/chat/completions", {      
method: "POST",      
headers: headers,      
body: JSON.stringify({        
model: selectedModel,        
messages: [          
{ role: "user", content: prompt }        
],        
temperature: 0.5      
})    
});    
const data = await response.json();    
if (data.error) throw new Error(data.error.message);    
return res.status(200).json({      
status: true,      
author: "AngelaImut",      
model: selectedModel,      
result: data.choices[0].message.content    
});  
} catch (error) {    
return res.status(500).json({ status: false, error: error.message });  
}
}
