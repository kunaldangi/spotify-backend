// import dotenv from 'dotenv'; dotenv.config();

import express from 'express';
import querystring from 'querystring';
import { getTopTracks, getNowPlaying, getDevices, pauseCurrentlyPlayingSong, playTrack } from '../../utils/spotify/index.js';

const router = express.Router();

let clientId = process.env.SPOTIFY_CLIENT_ID || '';
let clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
let token = process.env.SPOTIFY_TOKEN || '';
let refreshToken = process.env.SPOTIFY_REFRESH_TOKEN || '';

router.get('/', async (req, res) => {
   try {
      const { options } = req.query;

      if (!options) { // top 10 tracks
         let topTracks = await getTopTracks(token);

         if (!topTracks) {
            console.log('/spotify error: No top tracks found');
            return res.status(404).json({ error: 'No top tracks found' });
         }

         return res.status(200).json(topTracks);
      }

      else if (options === 'now-playing') { // currently playing song
         let nowPlaying = await getNowPlaying(token);

         if (!nowPlaying) {
            console.log('/spotify error: No song is currently playing');
            return res.status(404).json({ error: 'No song is currently playing' });
         }

         return res.status(200).json(nowPlaying);
      }

      else if (options === 'stop') { // pause currently playing song
         let devices = await getDevices(token);

         if (!devices[0].id) {
            console.log('/spotify error: No devices found');
            return res.status(404).json({ error: 'No devices found' });
         }

         let nowPlaying = await getNowPlaying(token);
         if (!nowPlaying) {
            console.log('/spotify error: No song is currently playing');
            return res.status(404).json({ error: 'No song is currently playing' });
         }

         let pause = await pauseCurrentlyPlayingSong(devices[0].id, token);

         if (pause?.error?.reason === 'PREMIUM_REQUIRED') {
            console.log('/spotify error: Premium account required');
            return res.status(403).json({ error: 'Premium account required' });
         }

         return res.status(200).json(pause);
      }

      else if (options === 'play-top-tracks') {
         let topTracks = await getTopTracks(token);

         if (!topTracks || topTracks.length === 0) {
            console.log('/spotify error: No top tracks found');
            return res.status(404).json({ error: 'No top tracks found' });
         }

         const num = Math.floor(Math.random() * 10);
         let trackUri = topTracks[num].uri;

         const play = await playTrack(trackUri, token);
         return res.status(200).json(play);
      }

   } catch (error) {
      console.log('/spotify error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
   }
})

export async function refreshSpotifyToken() {
   const tokenUrl = 'https://accounts.spotify.com/api/token';
   const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
   };

   const body = querystring.stringify({ grant_type: 'refresh_token', refresh_token: refreshToken });

   try {
      const response = await fetch(tokenUrl, { method: 'POST', headers, body });

      if (!response.ok) {
         const errorBody = await response.text();
         return res.status(response.status).send({ error: 'Failed to refresh token', details: errorBody });
      }

      const data = await response.json();
      
      if(data.access_token) {
         token = data.access_token;
         process.env.SPOTIFY_TOKEN = token;
      }

      return token;
   } catch (error) {
      res.status(500).send({ error: 'Internal server error', details: error.message });
   }
}

export default router;
