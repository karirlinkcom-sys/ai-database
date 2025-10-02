// File: api/github.js

export default async function handler(request, response) {
    // --- KONFIGURASI ---
    const GITHUB_USERNAME = "karirlinkcom-sys";
    const REPO_NAME = "ai-database";
    const FILE_PATH = "database.json";
    // Ambil token rahasia dari Environment Variable di Vercel
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;

    try {
        // Jika frontend meminta untuk MEMBACA data (GET)
        if (request.method === 'GET') {
            const githubResponse = await fetch(apiUrl, {
                headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
            });
            if (!githubResponse.ok) throw new Error(`GitHub API Error: ${githubResponse.statusText}`);
            const data = await githubResponse.json();
            response.status(200).json(data); // Kirim hasilnya kembali ke frontend
        }
        
        // Jika frontend meminta untuk MENYIMPAN data (PUT)
        else if (request.method === 'PUT') {
            // Ambil data yang dikirim dari frontend
            const body = request.body; 
            
            const githubResponse = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            if (!githubResponse.ok) throw new Error(`GitHub API Error: ${githubResponse.statusText}`);
            const data = await githubResponse.json();
            response.status(200).json(data); // Kirim hasilnya kembali ke frontend
        }
        
        // Jika metodenya bukan GET atau PUT
        else {
            response.setHeader('Allow', ['GET', 'PUT']);
            response.status(405).end(`Method ${request.method} Not Allowed`);
        }

    } catch (error) {
        console.error("Serverless function error:", error);
        response.status(500).json({ error: error.message });
    }
}
