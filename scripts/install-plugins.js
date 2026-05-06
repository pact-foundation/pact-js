#!/usr/bin/env node

const { execFileSync } = require('node:child_process');
const {
  existsSync,
  mkdirSync,
  createWriteStream,
  chmodSync,
} = require('node:fs');
const { get } = require('node:https');
const { homedir } = require('node:os');
const { join } = require('node:path');
const { createGunzip } = require('node:zlib');

const PLUGIN_CLI_VERSION = '0.1.2';
const MATT_PLUGIN_VERSION = '0.1.1';

function detectOsArch() {
  const { platform, arch } = process;
  if (platform === 'linux' && arch === 'x64')
    return { os: 'linux', arch: 'x86_64', ext: '' };
  if (platform === 'linux' && arch === 'arm64')
    return { os: 'linux', arch: 'aarch64', ext: '' };
  if (platform === 'darwin' && arch === 'x64')
    return { os: 'osx', arch: 'x86_64', ext: '' };
  if (platform === 'darwin' && arch === 'arm64')
    return { os: 'osx', arch: 'aarch64', ext: '' };
  if (platform === 'win32')
    return { os: 'windows', arch: 'x86_64', ext: '.exe' };
  throw new Error(
    `Unsupported platform: ${platform} ${arch}. Please install the plugin CLI manually.`,
  );
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        download(res.headers.location, dest).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(
          new Error(`Download failed with HTTP ${res.statusCode}: ${url}`),
        );
        return;
      }
      const out = createWriteStream(dest);
      res.pipe(createGunzip()).pipe(out);
      out.on('finish', () => out.close(resolve));
      out.on('error', reject);
    }).on('error', reject);
  });
}

async function installPluginCli() {
  const { os, arch, ext } = detectOsArch();
  const binDir = join(homedir(), '.pact', 'bin');
  const cliPath = join(binDir, `pact-plugin-cli${ext}`);

  if (existsSync(cliPath)) {
    console.log('=> Plugin CLI already installed');
    return;
  }

  const url = `https://github.com/pact-foundation/pact-plugins/releases/download/pact-plugin-cli-v${PLUGIN_CLI_VERSION}/pact-plugin-cli-${os}-${arch}${ext}.gz`;
  console.log(`=> Installing plugin CLI v${PLUGIN_CLI_VERSION}`);
  console.log(`   OS: ${os}, Arch: ${arch}`);
  console.log(`   Downloading into: ${binDir}`);

  mkdirSync(binDir, { recursive: true });
  await download(url, cliPath);
  if (ext !== '.exe') chmodSync(cliPath, 0o755);
}

function installMattPlugin() {
  const pluginDir = join(
    homedir(),
    '.pact',
    'plugins',
    `matt-${MATT_PLUGIN_VERSION}`,
  );

  if (existsSync(pluginDir)) {
    console.log('=> MATT plugin already installed');
    return;
  }

  const { ext } = detectOsArch();
  const cliPath = join(homedir(), '.pact', 'bin', `pact-plugin-cli${ext}`);
  const url = `https://github.com/mefellows/pact-matt-plugin/releases/tag/v${MATT_PLUGIN_VERSION}`;
  console.log(`=> Installing MATT plugin v${MATT_PLUGIN_VERSION}`);
  execFileSync(cliPath, ['install', url], { stdio: 'inherit' });
}

async function main() {
  await installPluginCli();
  installMattPlugin();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
