import app from "./app.js";
import { env } from "./config/env.js";

const PORT = 3000;

app.listen(env.port, () =>{
    console.log(`SecureVault server running on http://localhost:${env.port}`);
});