async function fetchSpotifyApi(endpoint, method, token, body) {
   const res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: {
         Authorization: `Bearer ${token}`,
      },
      method,
      body: JSON.stringify(body)
   });
   return await res.json();
};

export async function getTopTracks(token) {
   return (await fetchSpotifyApi('v1/me/top/tracks?time_range=long_term&limit=10', 'GET', token)).items;
}

export async function getNowPlaying(token) {
   const data = await fetchSpotifyApi('v1/me/player', 'GET', token);
   if (!data || !data.item) return { status: 'No song is currently playing' };
   return data.item;
}

export async function getDevices(token) {
   const data = await fetchSpotifyApi('v1/me/player/devices', 'GET', token);
   if (!data || !data.devices) return { status: 'No devices found' };
   return data.devices;
}

export async function pauseCurrentlyPlayingSong(device_id, token){
   try {
      const res = await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${device_id}`, {
         headers: {
            Authorization: `Bearer ${token}`,
         },
         method: 'PUT',
         body: JSON.stringify({})
      });
   
      if(res.status === 200) return { status: 'Song paused successfully' };
      
      let data = await res.json();
      if(data?.error?.reason === 'PREMIUM_REQUIRED') return { status: 'Premium account required' };
      else return { status: 'Failed to pause song' };

   } catch (error) {
      return { status: 'Failed to pause song' };
   }
}

export async function playTrack(trackUri, token) {
   try {
      const res = await fetch(`https://api.spotify.com/v1/me/player/play`, {
         method: 'PUT',
         headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({ uris: [trackUri] })
      });

      if (res.status === 204) return { status: 'Track is now playing' };
      else return { status: 'Failed to play track' };
   } catch (error) {
      return { status: 'Failed to play track' };
   }
}