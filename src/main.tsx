import './styles/app.css';
import { render } from 'preact';
import { App } from './App';
import { hydrateDraft, startAutosave } from './state/draft';
import { getStorage } from './state/storage';

const root = document.getElementById('app');
if (root === null) throw new Error('нет контейнера #app в index.html');

const storage = getStorage();
hydrateDraft(storage);
startAutosave(storage);

render(<App />, root);
