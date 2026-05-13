const express = require('express');
const https = require('https');
const http = require('http');
const app = express();
const PORT = process.env.PORT || 8080;

const users = {
  'prueba': '1234',
  'admin': 'admin123'
};

const M3U_URL = 'https://zona593movie.com:2096/playlist/kirikiflow/Soriano12/m3u_plus';

let liveStreams = [];
let vodStreams = [];
let seriesStreams = [];
let liveCategories = [];
let vodCategories = [];
let seriesCategories = [];

function fetchM3U() {
  return new Promise((resolve, reject) => {
    https.get(M3U_URL, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseM3U(data) {
  const lines = data.split('\n');
  const live = [], vod = [], series = [];
  const liveCats = {}, vodCats = {}, seriesCats = {};
  let liveCatId = 1, vodCatId = 1, seriesCatId = 1;
  let streamId = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#EXTINF')) {
      const url = lines[i + 1]?.trim();
      if (!url || url.startsWith('#')) continue;

      const nameMatch = line.match(/,(.+)$/);
      const groupMatch = line.match(/group-title="([^"]*)"/);
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);

      const name = nameMatch ? nameMatch[1].trim() : 'Sin nombre';
      const group = groupMatch ? groupMatch[1].trim() : 'General';
      const logo = logoMatch ? logoMatch[1] : '';

      const isVod = /pelicul|movie|film|vod/i.test(group);
      const isSeries = /serie|series|show/i.test(group);

      if (isVod) {
        if (!vodCats[group]) {
          vodCats[group] = vodCatId++;
        }
        vod.push({
          num: streamId, name, stream_type: 'movie',
          stream_id: streamId, stream_icon: logo,
          category_id: String(vodCats[group]),
          added: '1609459200', rating: '8',
          direct_source: url
        });
      } else if (isSeries) {
        if (!seriesCats[group]) {
          seriesCats[group] = seriesCatId++;
        }
        series.push({
          num: streamId, name, stream_type: 'live',
          stream_id: streamId, stream_icon: logo,
          category_id: String(seriesCats[group]),
          added: '1609459200',
          direct_source: url
        });
      } else {
        if (!liveCats[group]) {
          liveCats[group] = liveCatId++;
        }
        live.push({
          num: streamId, name, stream_type: 'live',
          stream_id: streamId, stream_icon: logo,
          category_id: String(liveCats[group]),
          added: '1609459200',
          direct_source: url
        });
      }
      streamId++;
    }
  }

  liveStreams = live;
  vodStreams = vod;
  seriesStreams = series;
  liveCategories = Object.entries(liveCats).map(([name, id]) => ({
    category_id: String(id), category_name: name, parent_id: 0
  }));
  vodCategories = Object.entries(vodCats).map(([name, id]) => ({
    category_id: String(id), category_name: name, parent_id: 0
  }));
  seriesCategories = Object.entries(seriesCats).map(([name, id]) => ({
    category_id: String(id), category_name: name, parent_id: 0
  }));

  console.log(`Cargado: ${live.length} canales, ${vod.length} películas, ${series.length} series`);
}

// Cargar lista al iniciar
fetchM3U().then(parseM3U).catch(console.error);
// Actualizar cada 6 horas
setInterval(() => fetchM3U().then(parseM3U).catch(console.error), 6 * 60 * 60 * 1000);

app.get('/player_api.php', (req, res) => {
  const { username, password, action, series_id } = req.query;

  if (!users[username] || users[username] !== password) {
    return res.json({ user_info: { auth: 0 } });
  }

  if (!action) {
    return res.json({
      user_info: {
        auth: 1, username, password,
        status: "Active", exp_date: "9999999999",
        is_trial: "0", active_cons: "2",
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
  if (action === 'get_series') return res.json(seriesStreams);

  res.json([]);
});

app.listen(PORT, () => {
  console.log(`Servidor IPTV corriendo en puerto ${PORT}`);
});
