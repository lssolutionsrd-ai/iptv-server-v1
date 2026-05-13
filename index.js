const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

const users = {
  'prueba': '1234',
  'admin': 'admin123'
};

const liveCategories = [
  { category_id: "1", category_name: "Noticias", parent_id: 0 },
  { category_id: "2", category_name: "Entretenimiento", parent_id: 0 }
];

const liveStreams = [
  {
    num: 1, name: "NASA TV", stream_type: "live", stream_id: 1,
    stream_icon: "https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg",
    category_id: "1", added: "1609459200",
    direct_source: "https://nasatv-lh.akamaihd.net/i/NASATV_1@592978/master.m3u8"
  },
  {
    num: 2, name: "DW News", stream_type: "live", stream_id: 2,
    stream_icon: "https://upload.wikimedia.org/wikipedia/commons/7/75/DW_logo_2012.svg",
    category_id: "1", added: "1609459200",
    direct_source: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8"
  },
  {
    num: 3, name: "France 24 Español", stream_type: "live", stream_id: 3,
    stream_icon: "https://upload.wikimedia.org/wikipedia/commons/e/e3/France_24_logo.svg",
    category_id: "1", added: "1609459200",
    direct_source: "https://stream.france24.com/hls/live/2037163/F24_ES_LO_HLS/master.m3u8"
  },
  {
    num: 4, name: "Bloomberg TV", stream_type: "live", stream_id: 4,
    stream_icon: "",
    category_id: "2", added: "1609459200",
    direct_source: "https://bloomberg-bloombergtv.amagi.tv/playlist.m3u8"
  }
];

const vodCategories = [
  { category_id: "10", category_name: "Peliculas Gratis", parent_id: 0 }
];

const vodStreams = [
  {
    num: 1, name: "Big Buck Bunny", stream_type: "movie", stream_id: 100,
    stream_icon: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg",
    category_id: "10", added: "1609459200", rating: "8",
    direct_source: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  },
  {
    num: 2, name: "Elephant Dream", stream_type: "movie", stream_id: 101,
    stream_icon: "",
    category_id: "10", added: "1609459200", rating: "7",
    direct_source: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  },
  {
    num: 3, name: "Subaru Outback Ad", stream_type: "movie", stream_id: 102,
    stream_icon: "",
    category_id: "10", added: "1609459200", rating: "6",
    direct_source: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4"
  }
];

const seriesCategories = [
  { category_id: "20", category_name: "Series Gratis", parent_id: 0 }
];

const series = [
  {
    num: 1, name: "Elephant Dream Series", series_id: 200,
    cover: "",
    category_id: "20", rating: "7",
    episodes: {
      "1": [
        {
          id: "1", episode_num: 1, title: "Episodio 1", season: 1,
          direct_source: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
        }
      ]
    }
  }
];

app.get('/player_api.php', (req, res) => {
  const { username, password, action, category_id, series_id } = req.query;

  if (!users[username] || users[username] !== password) {
    return res.json({ user_info: { auth: 0 } });
  }

  if (!action) {
    return res.json({
      user_info: {
        auth: 1, username, password,
        status: "Active", exp_date: "9999999999",
        is_trial: "0", active_cons: "1",
        created_at: "1609459200", max_connections: "2",
        allowed_output_formats: ["m3u8", "ts"]
      },
      server_info: {
        url: "iptv-server-v1-production.up.railway.app",
        port: "80", https_port: "443",
        server_protocol: "https", rtmp_port: "1935",
        timezone: "UTC",
        timestamp_now: Math.floor(Date.now() / 1000),
        time_now: new Date().toISOString()
      }
    });
  }

  if (action === 'get_live_categories') return res.json(liveCategories);
  if (action === 'get_live_streams') return res.json(liveStreams);
  if (action === 'get_vod_categories') return res.json(vodCategories);
  if (action === 'get_vod_streams') return res.json(vodStreams);
  if (action === 'get_series_categories') return res.json(seriesCategories);
  if (action === 'get_series') return res.json(series);
  if (action === 'get_series_info') {
    const s = series.find(x => x.series_id == series_id);
    return res.json(s || {});
  }

  res.json([]);
});

app.listen(PORT, () => {
  console.log(`Servidor IPTV corriendo en puerto ${PORT}`);
});
