import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const packageRunner = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const services = [
  {
    name: 'api-server',
    args: ['--filter', '@workspace/api-server', 'run', 'dev'],
  },
  {
    name: 'playzone-bar',
    args: ['--filter', '@workspace/playzone-bar', 'run', 'dev'],
  },
];

const children = services.map(({ name, args }) => {
  console.log(`Starting ${name}...`);

  const child = spawn(packageRunner, ['pnpm', ...args], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`${name} stopped with signal ${signal}`);
      return;
    }

    console.log(`${name} exited with code ${code}`);
  });

  child.on('error', (error) => {
    console.error(`Failed to start ${name}:`, error.message);
  });

  return child;
});

const shutdown = (signal) => {
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
};

process.on('SIGINT', () => {
  shutdown('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
  process.exit(0);
});
