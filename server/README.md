# AI Study Assistant Backend

## Run

From the project root:

```bash
npm install
npm run server
```

The API runs at `http://localhost:5000`.

In another terminal:

```bash
npm run dev
```

Vite proxies `/api` to port 5000.

## Optional real AI

Copy `server/.env.example` to `server/.env` and set an OpenAI-compatible endpoint:

```env
PORT=5000
AI_BASE_URL=https://your-provider.example/v1
AI_API_KEY=your-key
AI_MODEL=your-model
```

If these values are not configured, the backend still works and uses deterministic fallback AI responses. PDF text extraction and RAG retrieval are handled by the backend.
