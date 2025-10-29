import { app, BrowserWindow, BrowserView, globalShortcut, screen } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

app.setName('TODO');

function create() {
  const TITLEBAR = 28; // <- Höhe muss zu deiner CSS .titlebar passen!

  const win = new BrowserWindow({
    width: 400,
    height: 800,
    frame: false,
    resizable: true,
    alwaysOnTop: true,
    backgroundColor: '#000000',
    icon: join(__dirname, 'assets', 'favicon_400.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.setMenu(null);
  win.loadFile(join(__dirname, 'index.html'));

  const view = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.setBrowserView(view);

  // Ziel-URL
  view.webContents.setUserAgent(view.webContents.getUserAgent().replace(/Electron\/[^\s]+/i, '').trim());
  view.webContents.loadURL('https://to-do.live.com/tasks/today');

  // --- ROBUSTES LAYOUT ---
  const layout = () => {
    // Nutze Window-Bounds (DIP), nicht getContentSize – so sind Wayland/Fractional-Scaling-Fälle stabiler
    const { width, height } = win.getBounds();
    const w = Math.max(0, Math.round(width));
    const h = Math.max(0, Math.round(height - TITLEBAR));
    view.setBounds({ x: 0, y: TITLEBAR, width: w, height: h });
    view.setAutoResize({ width: true, height: true });
  };

  // Vor dem ersten Paint layouten
  win.once('ready-to-show', layout);
  // …und bei allen Größenänderungen nachziehen
  win.on('resize', layout);
  win.on('move', layout);
  win.on('enter-full-screen', layout);
  win.on('leave-full-screen', layout);

  // Shortcuts
  globalShortcut.register('Esc',  () => app.quit());
  globalShortcut.register('F11',  () => win.setFullScreen(!win.isFullScreen()));
  globalShortcut.register('Ctrl+R', () => view.webContents.reload());

  // Debughilfe: Rahmen sichtbar machen, falls nötig
  // view.setBackgroundColor('#111111');
  // view.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(create);
app.on('window-all-closed', () => app.quit());
