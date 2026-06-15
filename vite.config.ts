import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import dotenv from 'dotenv';
import {GoogleGenAI} from '@google/genai';
import { fileURLToPath } from 'url';

dotenv.config();

// Custom local dev API middleware to handle secure Gemini proxy requests
function geminiApiPlugin() {
  return {
    name: 'gemini-api-middleware',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url && req.url.startsWith('/api/generate') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });

          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const { model, prompt, systemInstruction, temperature, searchGrounding } = data;

              if (!prompt) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Prompt is required' }));
                return;
              }

              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  error: 'GEMINI_API_KEY is not defined in the environment. Please configure your API Key via Settings > Secrets in the AI Studio sidebar panel.'
                }));
                return;
              }

              const ai = new GoogleGenAI({
                apiKey: apiKey,
                httpOptions: {
                  headers: {
                    'User-Agent': 'aistudio-build',
                  }
                }
              });

              const config: any = {};
              if (systemInstruction) config.systemInstruction = systemInstruction;
              if (typeof temperature === 'number') config.temperature = temperature;
              if (searchGrounding) config.tools = [{ googleSearch: {} }];

              const response = await ai.models.generateContent({
                model: model || 'gemini-3.5-flash',
                contents: prompt,
                config,
              });

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                text: response.text || '',
                groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || null,
                webSearchQueries: response.candidates?.[0]?.groundingMetadata?.webSearchQueries || null,
              }));
            } catch (error: any) {
              console.error('Gemini API Dev Server Middleware error:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: error.message || 'Internal Server Error' }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig(() => {
  const rootDir = path.dirname(fileURLToPath(import.meta.url));

  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': rootDir,
      },
    },
    // SPA mode: all routes fall back to index.html so react-router-dom handles navigation
    appType: 'spa' as const,
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
