import express from "express";

const app = express();
const PORT = 3000;

app.get("/health", (_req,res) => {
    res.json({ status: "ok"});
});

app.listen(PORT, () =>{
    console.log(`Securevault server is running on http://localhost:${PORT}`);
});