import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const proc = spawn('npx.cmd', ['-y', '-p', 'puppeteer', '-p', '@pinepaper.studio/mcp-server', 'pinepaper-mcp'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  shell: true,
  env: {
    ...process.env,
    PUPPETEER_EXECUTABLE_PATH: edgePath
  }
});

let msgId = 1;
const pending = new Map();
let buffer = '';

function send(method, params = {}) {
  const id = ++msgId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    const payload = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
    proc.stdin.write(payload);
  });
}

proc.stdout.on('data', (chunk) => {
  buffer += chunk.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop();
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    } catch {}
  }
});

async function exportCurrentScene(filePath, animated = true) {
  const res = await send('tools/call', {
    name: 'pinepaper_export_svg',
    arguments: { animated }
  });
  let svg = '';
  if (res?.content) {
    for (const c of res.content) {
      if (c.type === 'text') svg += c.text;
    }
  }
  if (svg) {
    fs.writeFileSync(filePath, svg);
    console.log(`Saved: ${filePath} (${fs.statSync(filePath).size} bytes)`);
  }
  return svg;
}

async function run() {
  console.log('Connecting to PinePaper Studio MCP server...');
  await send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'pinepaper-asset-generator', version: '1.0.0' }
  });
  console.log('PinePaper connected!');

  const root = 'D:\\Project\\fatu-openhouse';
  const mythologyDir = path.join(root, 'src', 'assets', 'mythology');
  const decorationsDir = path.join(root, 'src', 'assets', 'decorations');
  const animationsDir = path.join(root, 'src', 'assets', 'animations');

  // 1. Azure Dragon Emblem
  console.log('Creating Azure Dragon Emblem...');
  await send('tools/call', {
    name: 'pinepaper_agent_start_job',
    arguments: { name: 'azure_dragon_emblem', canvasPreset: 'web', clearCanvas: true }
  });
  await send('tools/call', {
    name: 'pinepaper_create_item',
    arguments: {
      itemType: 'circle',
      position: { x: 400, y: 300 },
      properties: { radius: 120, fillColor: '#0a2328', strokeColor: '#d4af37', strokeWidth: 5 },
      animationType: 'glow',
      animationSpeed: 0.8
    }
  });
  await send('tools/call', {
    name: 'pinepaper_create_item',
    arguments: {
      itemType: 'star',
      position: { x: 400, y: 300 },
      properties: { points: 8, radius1: 95, radius2: 70, fillColor: '#005b66', strokeColor: '#ffd700', strokeWidth: 2 },
      animationType: 'rotate',
      animationSpeed: 0.3
    }
  });
  await exportCurrentScene(path.join(mythologyDir, 'azure-dragon.svg'), true);

  // 2. White Tiger Emblem
  console.log('Creating White Tiger Emblem...');
  await send('tools/call', {
    name: 'pinepaper_agent_start_job',
    arguments: { name: 'white_tiger_emblem', canvasPreset: 'web', clearCanvas: true }
  });
  await send('tools/call', {
    name: 'pinepaper_create_item',
    arguments: {
      itemType: 'circle',
      position: { x: 400, y: 300 },
      properties: { radius: 120, fillColor: '#1b1e22', strokeColor: '#c0c0c0', strokeWidth: 5 },
      animationType: 'pulse',
      animationSpeed: 0.9
    }
  });
  await send('tools/call', {
    name: 'pinepaper_create_item',
    arguments: {
      itemType: 'diamond',
      position: { x: 400, y: 300 },
      properties: { width: 140, height: 140, fillColor: '#2a2e35', strokeColor: '#e0e0e0', strokeWidth: 3 },
      animationType: 'breathe',
      animationSpeed: 0.8
    }
  });
  await exportCurrentScene(path.join(mythologyDir, 'white-tiger.svg'), true);

  // 3. Nine-Tailed Fox Emblem
  console.log('Creating Nine-Tailed Fox Emblem...');
  await send('tools/call', {
    name: 'pinepaper_agent_start_job',
    arguments: { name: 'nine_tailed_fox_emblem', canvasPreset: 'web', clearCanvas: true }
  });
  await send('tools/call', {
    name: 'pinepaper_create_item',
    arguments: {
      itemType: 'circle',
      position: { x: 400, y: 300 },
      properties: { radius: 120, fillColor: '#280a0a', strokeColor: '#e63946', strokeWidth: 5 },
      animationType: 'glow',
      animationSpeed: 1.0
    }
  });
  await send('tools/call', {
    name: 'pinepaper_create_item',
    arguments: {
      itemType: 'heart',
      position: { x: 400, y: 295 },
      properties: { width: 110, height: 110, fillColor: '#800020', strokeColor: '#ff758f', strokeWidth: 3 },
      animationType: 'pulse',
      animationSpeed: 0.8
    }
  });
  await exportCurrentScene(path.join(mythologyDir, 'nine-tailed-fox.svg'), true);

  // 4. Red Phoenix Emblem
  console.log('Creating Red Phoenix Emblem...');
  await send('tools/call', {
    name: 'pinepaper_agent_start_job',
    arguments: { name: 'red_phoenix_emblem', canvasPreset: 'web', clearCanvas: true }
  });
  await send('tools/call', {
    name: 'pinepaper_create_item',
    arguments: {
      itemType: 'circle',
      position: { x: 400, y: 300 },
      properties: { radius: 120, fillColor: '#200808', strokeColor: '#ff4d00', strokeWidth: 5 },
      animationType: 'breathe',
      animationSpeed: 1.1
    }
  });
  await send('tools/call', {
    name: 'pinepaper_create_item',
    arguments: {
      itemType: 'triangle',
      position: { x: 400, y: 300 },
      properties: { radius: 95, fillColor: '#9e1c00', strokeColor: '#ffaa00', strokeWidth: 3 },
      animationType: 'pulse',
      animationSpeed: 1.0
    }
  });
  await exportCurrentScene(path.join(mythologyDir, 'red-phoenix.svg'), true);

  // 5. Chinese Cloud Decoration
  console.log('Creating Chinese Cloud decoration...');
  await send('tools/call', {
    name: 'pinepaper_agent_start_job',
    arguments: { name: 'chinese_cloud', canvasPreset: 'web', clearCanvas: true }
  });
  await send('tools/call', {
    name: 'pinepaper_create_item',
    arguments: {
      itemType: 'ellipse',
      position: { x: 400, y: 300 },
      properties: { radiusX: 100, radiusY: 45, fillColor: 'rgba(212, 175, 55, 0.25)', strokeColor: '#d4af37', strokeWidth: 2 },
      animationType: 'breathe',
      animationSpeed: 0.5
    }
  });
  await send('tools/call', {
    name: 'pinepaper_create_item',
    arguments: {
      itemType: 'circle',
      position: { x: 360, y: 280 },
      properties: { radius: 40, fillColor: 'rgba(212, 175, 55, 0.3)', strokeColor: '#d4af37', strokeWidth: 2 }
    }
  });
  await send('tools/call', {
    name: 'pinepaper_create_item',
    arguments: {
      itemType: 'circle',
      position: { x: 440, y: 285 },
      properties: { radius: 35, fillColor: 'rgba(212, 175, 55, 0.3)', strokeColor: '#d4af37', strokeWidth: 2 }
    }
  });
  await exportCurrentScene(path.join(decorationsDir, 'chinese-cloud.svg'), true);

  // 6. Traditional Red Dragon Seal
  console.log('Creating Dragon Red Seal...');
  await send('tools/call', {
    name: 'pinepaper_agent_start_job',
    arguments: { name: 'dragon_seal', canvasPreset: 'web', clearCanvas: true }
  });
  await send('tools/call', {
    name: 'pinepaper_create_item',
    arguments: {
      itemType: 'rectangle',
      position: { x: 400, y: 300 },
      properties: { width: 90, height: 90, radius: 12, fillColor: '#8b0000', strokeColor: '#d4af37', strokeWidth: 3 },
      animationType: 'pulse',
      animationSpeed: 0.6
    }
  });
  await exportCurrentScene(path.join(decorationsDir, 'dragon-seal.svg'), true);

  // 7. Gold Ornamental Divider
  console.log('Creating Gold Ornamental Divider...');
  await send('tools/call', {
    name: 'pinepaper_agent_start_job',
    arguments: { name: 'gold_divider', canvasPreset: 'web', clearCanvas: true }
  });
  await send('tools/call', {
    name: 'pinepaper_create_item',
    arguments: {
      itemType: 'diamond',
      position: { x: 400, y: 300 },
      properties: { width: 32, height: 32, fillColor: '#d4af37', strokeColor: '#8b0000', strokeWidth: 2 },
      animationType: 'rotate',
      animationSpeed: 0.4
    }
  });
  await exportCurrentScene(path.join(decorationsDir, 'gold-divider.svg'), true);

  // 8. Loading Animated Seal
  console.log('Creating Loading Animated Seal...');
  await send('tools/call', {
    name: 'pinepaper_agent_start_job',
    arguments: { name: 'loading_seal', canvasPreset: 'web', clearCanvas: true }
  });
  await send('tools/call', {
    name: 'pinepaper_create_item',
    arguments: {
      itemType: 'circle-outline',
      position: { x: 400, y: 300 },
      properties: { radius: 75, strokeColor: '#d4af37', strokeWidth: 4 },
      animationType: 'rotate',
      animationSpeed: 1.5
    }
  });
  await send('tools/call', {
    name: 'pinepaper_create_item',
    arguments: {
      itemType: 'circle',
      position: { x: 400, y: 300 },
      properties: { radius: 55, fillColor: '#8b0000', strokeColor: '#ffd700', strokeWidth: 2 },
      animationType: 'pulse',
      animationSpeed: 1.2
    }
  });
  await exportCurrentScene(path.join(animationsDir, 'loading-seal.svg'), true);

  // 9. Check-in Success Stamp
  console.log('Creating Check-in Success Stamp...');
  await send('tools/call', {
    name: 'pinepaper_agent_start_job',
    arguments: { name: 'checkin_stamp', canvasPreset: 'web', clearCanvas: true }
  });
  await send('tools/call', {
    name: 'pinepaper_create_item',
    arguments: {
      itemType: 'circle',
      position: { x: 400, y: 300 },
      properties: { radius: 85, fillColor: 'rgba(139, 0, 0, 0.95)', strokeColor: '#d4af37', strokeWidth: 5 },
      animationType: 'bounce',
      animationSpeed: 1.0
    }
  });
  await exportCurrentScene(path.join(animationsDir, 'checkin-stamp.svg'), true);

  // 10. Reward Chest Emblem
  console.log('Creating Reward Chest Emblem...');
  await send('tools/call', {
    name: 'pinepaper_agent_start_job',
    arguments: { name: 'reward_chest', canvasPreset: 'web', clearCanvas: true }
  });
  await send('tools/call', {
    name: 'pinepaper_create_item',
    arguments: {
      itemType: 'rectangle',
      position: { x: 400, y: 310 },
      properties: { width: 110, height: 75, radius: 8, fillColor: '#654321', strokeColor: '#ffd700', strokeWidth: 4 },
      animationType: 'glow',
      animationSpeed: 0.9
    }
  });
  await exportCurrentScene(path.join(animationsDir, 'reward-chest.svg'), true);

  console.log('=== ALL 10 PINEPAPER ASSETS GENERATED AND SAVED SUCCESSFULLY! ===');
  proc.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error('Error generating assets:', err);
  proc.kill();
  process.exit(1);
});
