import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
// GitHub Pages처럼 하위 경로(/저장소이름/)에 배포할 때는 빌드 시 VITE_BASE=/저장소이름/ 으로 지정한다. 기본값은 루트(/).
export default defineConfig({ base: process.env.VITE_BASE ?? '/', plugins: [react()], test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], testTimeout: 20000 }, server: { port:5173, strictPort:true, fs: { deny: ['**/private/**', '**/.env*', '**/references/**', '**/tmp/**'] } } });
