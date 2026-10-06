import './styles/app.css';
import { render } from 'preact';
import { App } from './App';
import { requestPrint } from './editor/print';
import { isPrintShortcut } from './preview/printing';
import { hydrateDraft, startAutosave } from './state/draft';
import { getStorage } from './state/storage';

const root = document.getElementById('app');
if (root === null) throw new Error('нет контейнера #app в index.html');

const storage = getStorage();
hydrateDraft(storage);
startAutosave(storage);

// Ctrl+P на странице редактора печатало бы форму: отдаём его печати листа.
window.addEventListener('keydown', (event) => {
  if (!isPrintShortcut(event)) return;
  event.preventDefault();
  requestPrint();
});

render(<App />, root);
