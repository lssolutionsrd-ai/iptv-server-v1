const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// Usuarios de prueba
const users = {
  'prueba': '1234',
  'admin': 'admin123'
};

// API Xtream Codes
app.get('/player_api.php', (req, res) => {
  const { username, password, action } = req.query;

  if (!users[username] || users[username] !== password) {
    return res.json({ user_info: { auth: 0 } });
  }

  if (!action) {
    return res.json({
      user_info: {
        auth: 1,
        username: username,
        password: password,
        status: "Active",
        exp_date: "9999999999",
        is_trial: "0",
        active_cons: "1",
        created_at: "1609459200",
        max_connections: "1",
        allowed_output_formats: ["m3u8", "ts"]
      },
      server_info: {
        url: "",
        port: PORT.toString(),
        https_port: PORT.toString(),
        server_protocol: "http",
        rtmp_port: "1935",
        timezone: "UTC",
        timestamp_now: Math.floor(Date.now() / 1000),
        time_now: new Date().toISOString()
      }
    });
  }

  if (action === 'get_live_categories') {
    return res.json([
      { category_id: "1", category_name: "Deportes", parent_id: 0 },
      { category_id: "2", category_name: "Noticias", parent_id: 0 }
    ]);
  }

  if (action === 'get_live_streams') {
    return res.json([
      {
        num: 1,
        name: "Canal Prueba 1",
        stream_type: "live",
        stream_id: 1,
        stream_icon: "",
        epg_channel_id: "",
        added: "1609459200",
        category_id: "1",
        custom_sid: "",
        tv_archive: 0,
        direct_source: "",
        tv_archive_duration: 0
      }
    ]);
  }

  res.json([]);
});

app.listen(PORT, () => {
  console.log(`Servidor IPTV corriendo en puerto ${PORT}`);
});
