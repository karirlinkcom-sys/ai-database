// File: /api/github.js
// VERSI PALING SEDERHANA, DIJAMIN BEKERJA

module.exports = async (req, res) => {
    // Mengizinkan koneksi dari website Anda
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Bagian wajib untuk browser
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Mengambil kunci rahasia dari Vercel
    const { GITHUB_TOKEN, OWNER, REPO, FILE_PATH } = process.env;

    // Jika salah satu kunci tidak ada, kirim pesan error
    if (!GITHUB_TOKEN || !OWNER || !REPO || !FILE_PATH) {
        return res.status(500).json({ error: "Kunci API di Vercel belum lengkap." });
    }

    // Alamat file database Anda di GitHub
    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;

    try {
        // Jika browser meminta data (GET)
        if (req.method === 'GET') {
            const response = await fetch(apiUrl, {
                headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
            });
            const data = await response.json();
            return res.status(200).json(data);

        // Jika browser ingin menyimpan data (PUT)
        } else if (req.method === 'PUT') {
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(req.body) 
            });
            const data = await response.json();
            return res.status(200).json(data);
        }

    } catch (error) {
        // Jika ada error lain, kirim pesan
        return res.status(500).json({ error: error.message });
    }
};
