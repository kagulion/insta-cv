import './styles/global.css';
import { render } from 'preact';
import { App } from './App';

const root = document.getElementById('app');
if (root === null) throw new Error('нет контейнера #app в index.html');

render(<App />, root);
