// File: /api/github.js

// Gunakan 'npm install @octokit/rest' jika menjalankan secara lokal
const { Octokit } = require("@octokit/rest");

// --- KONFIGURASI PENTING ---
// Variabel ini akan diambil dari Environment Variables di Vercel.
// Ini adalah cara yang benar dan aman.
const { GITHUB_TOKEN, OWNER, REPO, FILE_PATH } = process.env;

const octokit = new Octokit({ auth: GITHUB_TOKEN });

export default async function handler(req, res) {
    // ✅ FIX: Menambahkan header CORS. Ini adalah bagian paling penting yang hilang.
    // Ini memberitahu browser bahwa frontend Anda diizinkan untuk mengakses API ini.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Browser mengirim request 'OPTIONS' (pre-flight) sebelum PUT untuk mengecek izin CORS.
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Pastikan semua variabel environment telah diatur di Vercel
    if (!GITHUB_TOKEN || !OWNER || !REPO || !FILE_PATH) {
        return res.status(500).json({ message: "Konfigurasi server (environment variables) tidak lengkap. Harap atur GITHUB_TOKEN, OWNER, REPO, dan FILE_PATH di Vercel." });
    }

    try {
        if (req.method === 'GET') {
            // Logika untuk MENGAMBIL konten file dari GitHub
            const { data } = await octokit.repos.getContent({
                owner: OWNER,
                repo: REPO,
                path: FILE_PATH,
            });
            return res.status(200).json(data);

        } else if (req.method === 'PUT') {
            // Logika untuk MEMPERBARUI konten file di GitHub
            const { message, content, sha } = req.body;

            if (!message || !content || !sha) {
                return res.status(400).json({ message: "Request body tidak lengkap. 'message', 'content', dan 'sha' dibutuhkan." });
            }

            const { data } = await octokit.repos.createOrUpdateFileContents({
                owner: OWNER,
                repo: REPO,
                path: FILE_PATH,
                message: message,
                content: content,
                sha: sha,
            });
            return res.status(200).json(data);
            
        } else {
            // Jika metode request bukan GET atau PUT
            res.setHeader('Allow', ['GET', 'PUT']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error("GitHub API Error:", error.message);
        if (error.status === 404) {
             return res.status(404).json({ message: `File tidak ditemukan di path: ${FILE_PATH}` });
        }
        return res.status(error.status || 500).json({ message: error.message });
    }
}
