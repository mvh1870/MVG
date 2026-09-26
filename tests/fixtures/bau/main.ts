// Mini-Einstieg für tests/bau.test.ts – kein Teil des Produkts.
// Prüft nebenbei: .svg als Text, JSON eingebaut, __MVG_VERSION__ über define, Umlaute (charset utf8).
import zeichen from './zeichen.svg';
import daten from './daten.json';

declare const __MVG_VERSION__: string;

// Beide Folgen müssen im Bau entschärft werden, sonst zerbräche das Inline-Skript.
const gefaehrlich = '</script><!-- bleibt Text -->';

const wurzel = document.getElementById('mvg') ?? document.body;
const titel = document.createElement('h1');
titel.className = 'fixtur-titel';
titel.textContent = `${daten.titel} ${__MVG_VERSION__}`;
titel.setAttribute('data-pruef', 'fixtur-titel');
const bild = document.createElement('div');
bild.innerHTML = zeichen;
const hinweis = document.createElement('p');
hinweis.className = 'fixtur-hinweis';
hinweis.textContent = gefaehrlich;
wurzel.append(titel, bild, hinweis);
