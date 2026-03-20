const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Simulamos la base de datos cargando los JSON en la memoria del servidor
// (Debes crear una carpeta 'data' aquí y meter tus JSON reales dentro)
let RECORRIDOS = {};
let PARADAS = [];

try {
    RECORRIDOS = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'recorridos_rosario.json'), 'utf8'));
    PARADAS = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'paradas_rosario.json'), 'utf8'));
    console.log("✅ Base de datos local cargada en el servidor.");
} catch (error) {
    console.warn("⚠️ No se encontraron los archivos JSON en /data. El servidor devolverá arrays vacíos.");
}

// --- ENDPOINTS DE LA API ---

// 1. Obtener la traza (forma) del recorrido
app.get('/api/recorridos/:linea', (req, res) => {
    const linea = req.params.linea.trim();
    const coords = RECORRIDOS[linea] || [];
    res.json(coords);
});

// 2. Obtener las paradas de una línea
app.get('/api/paradas/:linea', (req, res) => {
    const linea = req.params.linea.trim();
    const stops = PARADAS.filter(p => p.lineas && p.lineas.some(l => l.toString().trim() === linea));
    res.json(stops);
});

// 3. Simular API de Colectivos en Vivo (En el futuro esto se conecta a ws.rosario.gob.ar)
app.get('/api/live/:linea', (req, res) => {
    const linea = req.params.linea.trim();
    // Creamos coordenadas simuladas dinámicas basadas en la hora actual
    const now = new Date().getTime();
    const offset = (now % 10000) / 1000000; 
    
    const liveBuses = [
        { id: `int-${Math.floor(Math.random() * 100)}`, lat: -32.9468 + offset, lng: -60.6393 - offset },
        { id: `int-${Math.floor(Math.random() * 100)}`, lat: -32.9500 - offset, lng: -60.6400 + offset }
    ];
    
    // Pequeño delay artificial para simular red
    setTimeout(() => res.json(liveBuses), 600);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Subite corriendo en http://localhost:${PORT}`);
    console.log(`Pruébalo abriendo: http://localhost:${PORT}/api/recorridos/115`);
});