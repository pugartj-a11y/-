const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.INWORLD_API_KEY;

app.use(express.json({limit:"64kb"}));
app.use(express.static(path.join(__dirname)));

app.post("/api/tts", async (req,res)=>{
  if(!API_KEY) return res.status(500).json({error:"INWORLD_API_KEY is not configured"});
  const text=typeof req.body?.text==="string"?req.body.text.trim():"";
  if(!text) return res.status(400).json({error:"Text is required"});
  if(text.length>3000) return res.status(400).json({error:"Text is too long"});
  try{
    const response=await fetch("https://api.inworld.ai/tts/v1/voice",{
      method:"POST",
      headers:{"Authorization":"Basic "+API_KEY,"Content-Type":"application/json"},
      body:JSON.stringify({
        text,
        voiceId:"posh-penguin-9779__design-voice-16146089",
        modelId:"inworld-tts-2",
        audioConfig:{speakingRate:1},
        deliveryMode:"BALANCED",
        language:"AUTO"
      })
    });
    const data=await response.json();
    if(!response.ok)return res.status(response.status).json({error:data?.message||"Inworld TTS error"});
    res.json({audioContent:data.audioContent});
  }catch(error){
    console.error(error);
    res.status(502).json({error:"TTS service unavailable"});
  }
});

app.listen(PORT,()=>console.log("GAMEHUB running on http://localhost:"+PORT));