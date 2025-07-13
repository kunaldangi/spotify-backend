import express from "express";

import spotifyRouter from "./api/spotify/index.js";

const app = express();
const port = process.env.PORT || 3000;

app.use('/spotify', spotifyRouter);

app.listen(port, () => {
	console.log(`Server is running on PORT:${port}`)
})