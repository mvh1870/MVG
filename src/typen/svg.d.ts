// SVG-Dateien kommen als Text ins Skript (esbuild-Loader `.svg: text` in werkzeuge/bau.mjs).
// Nur src/main.ts importiert sie und reicht sie an src/ui/marke.ts weiter – so bleiben alle anderen
// Module auch unter Node (Tests) ladbar.
declare module '*.svg' {
  const text: string;
  export default text;
}
