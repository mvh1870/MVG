/*
 * Bilder der Themen (P17.9, O-55): je Kapitel eine kleine flache Illustration im Kopf und je Teil ein Bauplan-Motiv
 * als Kopf-Hintergrund (feine Linienzeichnung auf Rasterpapier im Stil O-45). Rein (Zeichenketten), deterministisch
 * (kein Zufall, keine Uhr), ohne fremde Ressourcen und ohne Farbwerte: Farben nur über Klassen, die Werte setzt
 * src/stil/theorie.css aus den Tokens des Teils (`--teil`, `--teil-soft`, `--teil-text`, O-57/L-226).
 *
 *   themaBild(thema)  – Illustration eines Themas (160 × 160) bzw. des Inhaltsverzeichnisses („uebersicht“)
 *   kopfMotiv(teil)   – Bauplan im Kopf: I Grundriss und Fundament · II Tragwerk und Gerüst · III Baustelle mit Kran ·
 *                       IV Plan mit Maßstab, Winkel und Zirkel · Anhang Planschrank; „alle“: die vier Motive in Reihe
 *
 * Beide sind Schmuck neben einer Überschrift, die die Bedeutung trägt: aria-hidden, nicht fokussierbar.
 */

// ------------------------------------------------------------------------------------------- Werkzeug
const r1 = (n: number): number => Math.round(n * 10) / 10;
const el = (tag: string, klasse: string, attrs: Record<string, number | string>): string =>
  `<${tag} class="${klasse}"${Object.entries(attrs).map(([k, v]) => ` ${k}="${typeof v === 'number' ? r1(v) : v}"`).join('')}/>`;
const kreis = (k: string, cx: number, cy: number, r: number): string => el('circle', k, { cx, cy, r });
const rechteck = (k: string, x: number, y: number, width: number, height: number, rx = 0): string =>
  el('rect', k, rx > 0 ? { x, y, width, height, rx } : { x, y, width, height });
const pfad = (k: string, d: string): string => `<path class="${k}" d="${d}"/>`;
const linie = (k: string, x1: number, y1: number, x2: number, y2: number): string => pfad(k, `M${r1(x1)} ${r1(y1)}L${r1(x2)} ${r1(y2)}`);
const gruppe = (k: string, inhalt: string, transform = ''): string => `<g${k ? ` class="${k}"` : ''}${transform ? ` transform="${transform}"` : ''}>${inhalt}</g>`;
const punkt = (w: number, r: number, cx: number, cy: number): [number, number] => {
  const a = (w * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

/** Bogen mit Pfeilspitze am Ende (Winkel in Grad, im Uhrzeigersinn ab „rechts“). */
function bogenPfeil(k: string, spitze: string, cx: number, cy: number, r: number, von: number, bis: number, dicke: number): string {
  const [x1, y1] = punkt(von, r, cx, cy);
  const ende = bis - (dicke * 0.9 * 180) / (Math.PI * r);
  const [x2, y2] = punkt(ende, r, cx, cy);
  const gross = ende - von > 180 ? 1 : 0;
  const [sx, sy] = punkt(bis, r, cx, cy);
  const [ax, ay] = punkt(ende, r + dicke * 1.1, cx, cy);
  const [bx, by] = punkt(ende, r - dicke * 1.1, cx, cy);
  return pfad(k, `M${r1(x1)} ${r1(y1)}A${r} ${r} 0 ${gross} 1 ${r1(x2)} ${r1(y2)}`)
    + pfad(spitze, `M${r1(ax)} ${r1(ay)}L${r1(sx + (sx - x2) * 0.2)} ${r1(sy + (sy - y2) * 0.2)}L${r1(bx)} ${r1(by)}Z`);
}

/** Zahnrad: n Zähne zwischen Innen- und Außenradius. */
function zahnrad(k: string, cx: number, cy: number, innen: number, aussen: number, n: number, drehung = 0): string {
  const teile: string[] = [];
  const schritt = 360 / n;
  for (let i = 0; i < n; i++) {
    const w = drehung + i * schritt;
    const pk = [[w - schritt * 0.5, innen], [w - schritt * 0.22, innen], [w - schritt * 0.14, aussen], [w + schritt * 0.14, aussen], [w + schritt * 0.22, innen]] as const;
    for (const [wi, ri] of pk) {
      const [x, y] = punkt(wi, ri, cx, cy);
      teile.push(`${teile.length === 0 ? 'M' : 'L'}${r1(x)} ${r1(y)}`);
    }
  }
  return pfad(k, `${teile.join('')}Z`);
}

/** Feste Streuung ohne Zufall (wie campus-iso.ts) → [0, 1). */
function streu(i: number, salz: number): number {
  let h = Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(salz + 7, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

// ------------------------------------------------------------------------------------------- Illustrationen
/** Grund jeder Illustration: weiße Scheibe mit Ring in der Teilfarbe, Bodenschatten. */
function scheibe(): string {
  return kreis('tb-scheibe', 80, 80, 74) + kreis('tb-ring', 80, 80, 74) + kreis('tb-ring-fein', 80, 80, 66);
}
const schatten = (rx = 42, cy = 128): string => el('ellipse', 'tb-schatten', { cx: 80, cy, rx, ry: 5.5 });

/** Drei kleine Funken um das Motiv (Plus, Punkt, Ring), Lage fest aus dem Namen. */
function funken(salz: number): string {
  const plaetze: readonly [number, number][] = [[28, 46], [134, 40], [138, 112], [24, 104], [118, 22], [40, 24]];
  const start = Math.floor(streu(salz, 3) * plaetze.length);
  const aus: string[] = [];
  for (let i = 0; i < 3; i++) {
    const [x, y] = plaetze[(start + i * 2) % plaetze.length] as [number, number];
    if (i === 0) aus.push(pfad('tb-funke', `M${x - 4} ${y}H${x + 4}M${x} ${y - 4}V${y + 4}`));
    else if (i === 1) aus.push(kreis('tb-gold', x, y, 2.6));
    else aus.push(kreis('tb-funke', x, y, 3.2));
  }
  return aus.join('');
}

/** Blatt Papier mit Textzeilen (weiß mit Kante). */
function blatt(x: number, y: number, b: number, h: number, zeilen: number, kopf = false): string {
  const aus = [rechteck('tb-w tb-kante', x, y, b, h, 3)];
  if (kopf) aus.push(rechteck('tb-f1', x + 6, y + 6, b * 0.45, 5, 2.5));
  for (let i = 0; i < zeilen; i++) aus.push(linie('tb-zeile', x + 6, y + (kopf ? 18 : 10) + i * 7, x + b - 6 - (i % 2) * b * 0.22, y + (kopf ? 18 : 10) + i * 7));
  return aus.join('');
}

function haken(cx: number, cy: number, s: number, k = 'tb-haken'): string {
  return pfad(k, `M${r1(cx - s)} ${r1(cy)}L${r1(cx - s * 0.3)} ${r1(cy + s * 0.7)}L${r1(cx + s)} ${r1(cy - s * 0.65)}`);
}

const BILDER: Readonly<Record<string, () => string>> = {
  /** Inhaltsverzeichnis: ein Buch mit vier Registerfahnen in den Farben der Teile. */
  uebersicht: () => [
    schatten(40),
    rechteck('tb-w tb-kante', 58, 38, 60, 88, 4),
    ...['gruen', 'lagune', 'orange', 'violett'].map((a, i) => rechteck(`tb-a-${a}`, 108, 46 + i * 18, 18, 13, 3)),
    rechteck('tb-n', 42, 32, 66, 94, 5),
    rechteck('tb-n2', 42, 32, 11, 94, 5),
    rechteck('tb-n2', 48, 32, 5, 94),
    kreis('tb-gold', 81, 66, 14),
    kreis('tb-n', 81, 66, 10),
    pfad('tb-gold', 'M81 57.5L84.5 66L81 74.5L77.5 66Z'),
    rechteck('tb-lw', 64, 92, 34, 3.2, 1.6),
    rechteck('tb-lw', 68, 100, 26, 3.2, 1.6),
  ].join(''),

  /** Überblick: Kompass auf einem Plan. */
  ueberblick: () => [
    schatten(46),
    gruppe('', rechteck('tb-f3 tb-kante', 30, 50, 100, 70, 4)
      + [0, 1, 2, 3].map((i) => linie('tb-planlinie', 38 + i * 24, 56, 38 + i * 24, 114)).join('')
      + [0, 1, 2].map((i) => linie('tb-planlinie', 36, 66 + i * 18, 124, 66 + i * 18)).join(''), 'rotate(-7 80 85)'),
    kreis('tb-f2', 80, 84, 35),
    kreis('tb-w', 80, 84, 29),
    kreis('tb-f2', 80, 46, 5.5), kreis('tb-w', 80, 46, 2.2),
    ...[0, 90, 180, 270].map((w) => { const [a, b] = punkt(w, 26, 80, 84); const [c, d] = punkt(w, 21, 80, 84); return linie('tb-strich', a, b, c, d); }),
    ...[45, 135, 225, 315].map((w) => { const [a, b] = punkt(w, 24, 80, 84); return kreis('tb-f1', a, b, 1.6); }),
    pfad('tb-gold', 'M80 60L87 84H73Z'),
    pfad('tb-f1', 'M80 108L87 84H73Z'),
    kreis('tb-n', 80, 84, 4.5), kreis('tb-w', 80, 84, 1.6),
    funken(1),
  ].join(''),

  /** Ausgangslage: Fragezeichen über der Bauakte. */
  ausgangslage: () => [
    schatten(46),
    pfad('tb-f2', 'M36 66a4 4 0 0 1 4-4h22l7 8h51a4 4 0 0 1 4 4v48a4 4 0 0 1-4 4H40a4 4 0 0 1-4-4Z'),
    gruppe('', blatt(46, 58, 62, 50, 3, true), 'rotate(-5 77 83)'),
    gruppe('', blatt(54, 62, 60, 46, 2), 'rotate(4 84 85)'),
    pfad('tb-f1', 'M34 86a4 4 0 0 1 4-4h84a4 4 0 0 1 4 4.4l-3.4 33.6a4 4 0 0 1-4 3.6H41.4a4 4 0 0 1-4-3.6Z'),
    rechteck('tb-lw-flaeche', 64, 98, 32, 9, 2.5),
    pfad('tb-gold', 'M106 50l-4 10 10-6Z'),
    kreis('tb-gold', 114, 38, 18),
    pfad('tb-frage', 'M107.5 33.5a6.5 6.5 0 1 1 9.5 5.8c-2 1-3 2.4-3 4.4v1.3'),
    kreis('tb-n', 114, 50.5, 2.3),
    funken(2),
  ].join(''),

  /** Begriffsrahmen: zwei Puzzleteile greifen ineinander. */
  begriffe: () => {
    const links = 'M30 56H80V70a9 9 0 1 1 0 18V106H30Z';
    const rechts = 'M80 56H130V106H80V88a9 9 0 1 0 0-18Z';
    return [
      schatten(50),
      gruppe('', pfad('tb-f2', links), 'translate(0 6)'),
      pfad('tb-f1', links),
      pfad('tb-lw-flaeche', 'M38 64h20v4H38Z'),
      gruppe('', gruppe('', pfad('tb-n', rechts), 'translate(0 6)') + pfad('tb-f2', rechts) + pfad('tb-lw-flaeche', 'M112 64h10v4h-10Z'), 'translate(9 -9) rotate(7 105 81)'),
      kreis('tb-gold', 56, 86, 7),
      haken(56, 86, 3.6, 'tb-haken-n'),
      funken(3),
    ].join('');
  },

  /** Verantwortungsfelder: Schild mit Haus, Siegel. */
  verantwortung: () => [
    schatten(40),
    pfad('tb-f1', 'M80 28L122 43V79c0 25-17.5 41.5-42 50-24.5-8.5-42-25-42-50V43Z'),
    pfad('tb-f2', 'M80 28L122 43V79c0 25-17.5 41.5-42 50Z'),
    pfad('tb-ring-w', 'M80 37L113 49V79c0 19.5-13.6 33-33 40-19.4-7-33-20.5-33-40V49Z'),
    pfad('tb-w', 'M62 94V75L80 61L98 75V94Z'),
    rechteck('tb-f2', 75.5, 80, 9, 14, 1.5),
    kreis('tb-gold', 110, 106, 13),
    haken(110, 106, 6, 'tb-haken-n'),
    funken(4),
  ].join(''),

  /** Führungsmodell: Fahne auf gestuftem Sockel. */
  fuehrungsmodell: () => [
    schatten(48),
    rechteck('tb-n', 32, 104, 96, 20, 3),
    rechteck('tb-f2', 46, 88, 68, 18, 3),
    rechteck('tb-f1', 60, 72, 40, 18, 3),
    rechteck('tb-lw-flaeche', 38, 112, 18, 3, 1.5),
    rechteck('tb-lw-flaeche', 52, 96, 14, 3, 1.5),
    linie('tb-mast', 80, 72, 80, 28),
    kreis('tb-n', 80, 27, 3),
    pfad('tb-gold', 'M82 31H118L109 42.5L118 54H82Z'),
    pfad('tb-lw-flaeche', 'M82 40H112L110.5 42.5L112 45H82Z'),
    funken(5),
  ].join(''),

  /** Arbeitsweise: ein Vorgang im Kreislauf. */
  arbeitsweise: () => [
    schatten(36),
    bogenPfeil('tb-bogen1', 'tb-f1', 80, 80, 44, 200, 330, 7),
    bogenPfeil('tb-bogen2', 'tb-f2', 80, 80, 44, 20, 150, 7),
    blatt(60, 52, 40, 54, 4, true),
    kreis('tb-gold', 98, 100, 9),
    haken(98, 100, 4.4, 'tb-haken-n'),
    funken(6),
  ].join(''),

  /** Ergebnisbild: Stempel und Siegel auf dem Ergebnis. */
  ergebnisbild: () => [
    schatten(46),
    gruppe('', blatt(40, 50, 70, 76, 6, true), 'rotate(-6 75 88)'),
    kreis('tb-f1', 100, 98, 21),
    kreis('tb-ring-w', 100, 98, 16),
    haken(100, 98, 8, 'tb-haken'),
    pfad('tb-bewegung', 'M56 64h-8M60 56l-6-5M52 72h-6'),
    gruppe('', [
      kreis('tb-n', 82, 24, 8),
      rechteck('tb-n', 78.5, 29, 7, 14, 2),
      rechteck('tb-f2', 66, 42, 32, 11, 3),
      rechteck('tb-gold', 68, 53, 28, 5, 1.5),
    ].join(''), 'rotate(-14 82 40)'),
    funken(7),
  ].join(''),

  /** Leistungsarchitektur: drei Ebenen übereinander. */
  leistungen: () => {
    const lage = (y: number, oben: string, l: string, r: string): string => {
      const w = 46;
      const h = 22;
      const d = 8;
      return pfad(l, `M${80 - w} ${y}L80 ${y + h}V${y + h + d}L${80 - w} ${y + d}Z`)
        + pfad(r, `M${80 + w} ${y}L80 ${y + h}V${y + h + d}L${80 + w} ${y + d}Z`)
        + pfad(oben, `M80 ${y - h}L${80 + w} ${y}L80 ${y + h}L${80 - w} ${y}Z`);
    };
    return [
      schatten(46, 130),
      lage(98, 'tb-f3', 'tb-f1', 'tb-f2'),
      lage(76, 'tb-f1', 'tb-f2', 'tb-n'),
      lage(54, 'tb-gold', 'tb-gold-d', 'tb-gold-dd'),
      pfad('tb-lw-flaeche', 'M68 54l12-6 12 6-12 6Z'),
      funken(8),
    ].join('');
  },

  /** Implementierung: Zahnräder und Schraubenschlüssel. */
  einfuehrung: () => [
    schatten(46),
    zahnrad('tb-f1', 70, 84, 25, 32, 10, 9),
    kreis('tb-w', 70, 84, 11),
    kreis('tb-f2', 70, 84, 5),
    zahnrad('tb-gold', 112, 50, 11, 16, 8),
    kreis('tb-w', 112, 50, 5),
    gruppe('', [
      rechteck('tb-f2', 62, 76.5, 62, 13, 6.5),
      kreis('tb-f2', 126, 83, 15),
      rechteck('tb-w', 122, 78, 22, 10, 2),
      kreis('tb-w', 70, 83, 2.6),
    ].join(''), 'rotate(-42 100 83)'),
    funken(9),
  ].join(''),

  /** Anwendungssituationen: Bauherr mit Helm und Plan. */
  anwendung: () => [
    schatten(44),
    pfad('tb-f1', 'M50 124c0-24 13-37 30-37s30 13 30 37Z'),
    pfad('tb-f2', 'M73 88h14l-7 14Z'),
    pfad('tb-lw-flaeche', 'M60 108h7v16h-7ZM93 108h7v16h-7Z'),
    kreis('tb-haut', 80, 66, 15),
    pfad('tb-gold', 'M63 62a17 17 0 0 1 34 0Z'),
    rechteck('tb-gold-d', 60, 60, 40, 4.5, 2.2),
    gruppe('', blatt(96, 82, 34, 28, 2) + rechteck('tb-f1', 102, 100, 10, 6, 1), 'rotate(10 113 96)'),
    funken(10),
  ].join(''),

  /** Neuinitialisierung: Neustart im Kreis, Kompassnadel neu ausgerichtet. */
  neuausrichtung: () => [
    schatten(36),
    bogenPfeil('tb-bogen1', 'tb-f1', 80, 80, 42, 130, 410, 9),
    kreis('tb-f3', 80, 80, 26),
    gruppe('', pfad('tb-gold', 'M80 60L86 80H74Z') + pfad('tb-f2', 'M80 100L86 80H74Z'), 'rotate(35 80 80)'),
    kreis('tb-n', 80, 80, 4), kreis('tb-w', 80, 80, 1.5),
    funken(11),
  ].join(''),

  /** Was Bauherren gewinnen: steigende Säulen mit Pfeil. */
  nutzen: () => [
    schatten(46),
    rechteck('tb-f3 tb-kante', 44, 96, 18, 28, 3),
    rechteck('tb-f1', 70, 78, 18, 46, 3),
    rechteck('tb-f2', 96, 58, 18, 66, 3),
    linie('tb-basis', 36, 124, 124, 124),
    pfad('tb-trend', 'M40 90L66 70L84 76L112 42'),
    pfad('tb-gold', 'M116 36L103 41L113 51Z'),
    kreis('tb-gold', 66, 70, 3.5), kreis('tb-gold', 84, 76, 3.5),
    funken(12),
  ].join(''),

  /** Glossar: aufgeschlagenes Buch mit Lesezeichen. */
  glossar: () => [
    schatten(50),
    pfad('tb-f1', 'M80 60c-14-6-34-8-50-4v62c16-4 36-2 50 4 14-6 34-8 50-4V56c-16-4-36-2-50 4Z'),
    pfad('tb-w tb-kante', 'M80 56c-12-6-30-7-44-4v58c14-3 32-2 44 4Z'),
    pfad('tb-w tb-kante', 'M80 56c12-6 30-7 44-4v58c-14-3-32-2-44 4Z'),
    [0, 1, 2, 3].map((i) => pfad('tb-zeile', `M44 ${68 + i * 10}c10-2 20-1 28 2`)).join(''),
    [0, 1, 2].map((i) => pfad('tb-zeile', `M88 ${70 + i * 10}c8-3 18-4 28-2`)).join(''),
    pfad('tb-gold', 'M104 48v28l5-4 5 4V48Z'),
    funken(13),
  ].join(''),

  /** Entscheidungsvorlage: Waage mit zwei Optionen. */
  entscheidungsvorlage: () => [
    schatten(40),
    pfad('tb-n', 'M60 124H100L94 114H66Z'),
    rechteck('tb-n', 78, 48, 4, 68, 2),
    gruppe('', [
      linie('tb-balken', 40, 52, 120, 52),
      linie('tb-faden', 40, 52, 30, 84), linie('tb-faden', 40, 52, 50, 84),
      linie('tb-faden', 120, 52, 110, 84), linie('tb-faden', 120, 52, 130, 84),
    ].join(''), 'rotate(-7 80 52)'),
    gruppe('', [
      pfad('tb-f1', 'M26 84A16 9 0 0 0 58 84Z'),
      rechteck('tb-w tb-kante', 34, 66, 16, 18, 2),
      linie('tb-zeile', 37, 72, 47, 72), linie('tb-zeile', 37, 77, 44, 77),
      kreis('tb-gold', 50, 64, 6.5),
      haken(50, 64, 3.2, 'tb-haken-n'),
    ].join(''), 'translate(1 8)'),
    gruppe('', [
      pfad('tb-f3 tb-kante', 'M102 84A16 9 0 0 0 134 84Z'),
      rechteck('tb-w tb-kante', 110, 68, 16, 16, 2),
      linie('tb-zeile', 113, 74, 123, 74),
    ].join(''), 'translate(-1 -11)'),
    kreis('tb-gold', 80, 47, 5.5),
    funken(14),
  ].join(''),

  /** Vorgänge und Risiken: Warndreieck vor der Vorgangsliste. */
  vorgaenge: () => [
    schatten(46),
    gruppe('', [0, 1, 2].map((i) => rechteck('tb-w tb-kante', 30, 36 + i * 16, 70, 12, 3)
      + kreis(i === 0 ? 'tb-f1' : i === 1 ? 'tb-f2' : 'tb-f3', 38, 42 + i * 16, 3)
      + linie('tb-zeile', 46, 42 + i * 16, 88 - i * 8, 42 + i * 16)).join(''), 'rotate(-4 65 60)'),
    pfad('tb-f1 tb-rund', 'M98 58L128 112H68Z'),
    pfad('tb-f2 tb-rund-fein', 'M98 58L128 112H98Z'),
    rechteck('tb-w', 95, 74, 6, 22, 3),
    kreis('tb-w', 98, 103, 3.6),
    funken(15),
  ].join(''),

  /** Takt und Bericht: Kalenderblatt mit Monatssäulen und Uhr. */
  takt: () => [
    schatten(44),
    rechteck('tb-w tb-kante', 38, 42, 80, 80, 6),
    pfad('tb-f1', 'M38 48a6 6 0 0 1 6-6h68a6 6 0 0 1 6 6v12H38Z'),
    rechteck('tb-n', 54, 34, 6, 15, 3), rechteck('tb-n', 96, 34, 6, 15, 3),
    ...[12, 22, 16, 30].map((hh, i) => rechteck(i === 3 ? 'tb-f1' : 'tb-f2', 50 + i * 13, 110 - hh, 8, hh, 2)),
    linie('tb-basis-fein', 46, 110, 104, 110),
    kreis('tb-gold', 116, 112, 16),
    kreis('tb-w', 116, 112, 12),
    pfad('tb-zeiger', 'M116 104V112L122 115'),
    funken(16),
  ].join(''),
};

/** Themen mit eigener Illustration (Kennung `thema` der Themen, dazu „uebersicht“ für das Inhaltsverzeichnis). */
export const THEMEN_BILDER: readonly string[] = Object.keys(BILDER);

/** Illustration eines Themas; unbekannte Themen bekommen das Buch des Inhaltsverzeichnisses. */
export function themaBild(thema: string, klasse = ''): string {
  const bild = BILDER[thema] ?? BILDER['uebersicht'];
  return `<svg class="${['themen-bild', klasse].filter(Boolean).join(' ')}" data-bild="${thema in BILDER ? thema : 'uebersicht'}" viewBox="0 0 160 160" aria-hidden="true" focusable="false">${scheibe()}${bild?.() ?? ''}</svg>`;
}

// ------------------------------------------------------------------------------------------- Bauplan-Motive
/* Zeichenfläche eines Motivs 320 × 240; der Kopf setzt es rechts in 800 × 260 Rasterpapier. */

/** Schraffur (45°) in einem Rechteck – als einzelne Striche, ohne Muster-Kennung. */
function schraffur(x: number, y: number, b: number, h: number, abstand: number): string {
  const d: string[] = [];
  for (let s = abstand; s < b + h; s += abstand) {
    const x1 = x + Math.max(0, s - h);
    const y1 = y + Math.min(h, s);
    const x2 = x + Math.min(b, s);
    const y2 = y + Math.max(0, s - b);
    d.push(`M${r1(x1)} ${r1(y1)}L${r1(x2)} ${r1(y2)}`);
  }
  return pfad('km-schraffur', d.join(''));
}

/** Maßkette mit Endstrichen (waagerecht oder senkrecht) und Zwischenmarken. */
function masskette(x1: number, y1: number, x2: number, y2: number, marken: readonly number[] = []): string {
  const waag = y1 === y2;
  const strich = (x: number, y: number): string => (waag ? `M${r1(x - 3)} ${r1(y + 3)}L${r1(x + 3)} ${r1(y - 3)}M${r1(x)} ${r1(y - 6)}V${r1(y + 6)}` : `M${r1(x - 3)} ${r1(y + 3)}L${r1(x + 3)} ${r1(y - 3)}M${r1(x - 6)} ${r1(y)}H${r1(x + 6)}`);
  const pkte = [0, ...marken, 1].map((t) => [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t] as const);
  return pfad('km-mass', `M${x1} ${y1}L${x2} ${y2}${pkte.map(([x, y]) => strich(x, y)).join('')}`);
}

/** Achse mit Kreis (Achsbezeichnung ohne Schrift). */
const achse = (x: number, y1: number, y2: number): string => linie('km-achse', x, y1, x, y2 - 9) + kreis('km-fein', x, y2, 8);

/** I Grundlagen: Grundriss mit Wandstärken, Türen, Fenstern, Achsen, Maßketten und Fundamentschnitt. */
function motivGrundriss(): string {
  const aus: string[] = [];
  for (const x of [20, 120, 200, 290]) aus.push(achse(x, 18, 236));
  aus.push(masskette(20, 10, 290, 10, [100 / 270, 180 / 270]));
  aus.push(masskette(306, 30, 306, 180, [70 / 150]));
  // Außenwände doppelt, Innenwände
  aus.push(pfad('km-linie', 'M20 30H290V180H20ZM28 38H282V172H28Z'));
  aus.push(pfad('km-linie', 'M120 38V92M128 38V92M120 112V172M128 112V172M128 100H200M200 38V172M208 38V172M28 100H96'));
  // Türen mit Aufschlag
  aus.push(pfad('km-fein', 'M120 92A20 20 0 0 1 100 112M96 100A16 16 0 0 0 112 116M208 120A22 22 0 0 1 230 142'));
  // Fenster in den Außenwänden
  for (const x of [48, 76, 150, 176, 232, 260]) aus.push(pfad('km-fein', `M${x} 30V38M${x + 14} 30V38M${x} 34H${x + 14}`));
  for (const x of [48, 150, 232]) aus.push(pfad('km-fein', `M${x} 172V180M${x + 16} 172V180M${x} 176H${x + 16}`));
  // Treppe
  for (let i = 0; i < 7; i++) aus.push(linie('km-fein', 216 + i * 9, 46, 216 + i * 9, 90));
  aus.push(pfad('km-fein', 'M216 68H275M268 62L275 68L268 74'));
  // Fundamentschnitt unter dem Grundriss
  aus.push(pfad('km-linie', 'M20 198H290M44 198V214H96V198M204 198V214H256V198'));
  aus.push(schraffur(44, 198, 52, 16, 6), schraffur(204, 198, 52, 16, 6));
  aus.push(pfad('km-fein', 'M8 222H302'));
  return aus.join('');
}

/** II Führungsmodell: Tragwerk mit Fachwerkdach, Riegeln, Aussteifung und Gerüst. */
function motivTragwerk(): string {
  const aus: string[] = [];
  const stuetzen = [30, 110, 190, 270];
  const ebenen = [70, 128, 186];
  for (const x of stuetzen) aus.push(linie('km-linie', x, 70, x, 214));
  for (const y of ebenen) aus.push(linie('km-linie', 24, y, 276, y));
  // Aussteifung im mittleren Feld
  for (let i = 0; i < 2; i++) aus.push(pfad('km-fein', `M110 ${ebenen[i]}L190 ${ebenen[i + 1]}M190 ${ebenen[i]}L110 ${ebenen[i + 1]}`));
  aus.push(pfad('km-fein', 'M110 186L190 214M190 186L110 214'));
  // Knoten
  for (const x of stuetzen) for (const y of ebenen) aus.push(kreis('km-knoten', x, y, 2.6));
  // Fachwerkdach
  aus.push(pfad('km-linie', 'M24 70L150 18L276 70'));
  for (let i = 1; i < 6; i++) {
    const x = 24 + i * 21;
    const yo = 70 - (52 * (x - 24)) / 126;
    aus.push(pfad('km-fein', `M${r1(x)} 70V${r1(yo)}`));
    const xr = 276 - i * 21;
    aus.push(pfad('km-fein', `M${r1(xr)} 70V${r1(yo)}`));
    if (i < 5) aus.push(pfad('km-fein', `M${r1(x)} 70L${r1(x + 21)} ${r1(70 - (52 * (x + 21 - 24)) / 126)}M${r1(xr)} 70L${r1(xr - 21)} ${r1(70 - (52 * (x + 21 - 24)) / 126)}`));
  }
  // Fundamente und Gelände
  for (const x of stuetzen) aus.push(pfad('km-linie', `M${x - 12} 214H${x + 12}V224H${x - 12}Z`));
  aus.push(linie('km-linie', 0, 214, 320, 214));
  aus.push(schraffur(0, 214, 320, 12, 9));
  // Gerüst rechts
  aus.push(pfad('km-fein', 'M286 214V40M312 214V40'));
  for (let y = 214; y > 40; y -= 29) aus.push(pfad('km-fein', `M286 ${y}H312M286 ${y}L312 ${y - 29}`));
  aus.push(masskette(30, 236, 270, 236, [1 / 3, 2 / 3]));
  return aus.join('');
}

/** III Anwendung: Baustelle mit Turmdrehkran, Rohbau und Last am Haken. */
function motivKran(): string {
  const aus: string[] = [];
  // Mast mit Gitter
  aus.push(pfad('km-linie', 'M168 230V44M184 230V44'));
  for (let y = 230; y > 48; y -= 16) aus.push(pfad('km-fein', `M168 ${y}L184 ${y - 16}M168 ${y - 16}H184`));
  // Ausleger und Gegenausleger
  aus.push(pfad('km-linie', 'M70 44H318M70 56H318'));
  for (let x = 70; x < 318; x += 12) aus.push(pfad('km-fein', `M${x} 56L${x + 6} 44L${x + 12} 56`));
  aus.push(pfad('km-linie', 'M176 8L176 44M176 8L318 44M176 8L70 44'));
  aus.push(pfad('km-linie', 'M74 56H104V76H74Z'), schraffur(74, 56, 30, 20, 5));
  aus.push(pfad('km-linie', 'M186 58H202V72H186Z'));
  // Laufkatze, Seil, Haken, Last
  aus.push(pfad('km-linie', 'M262 56H276V62H262Z'), pfad('km-fein', 'M266 62V128M272 62V128'));
  aus.push(pfad('km-linie', 'M269 128v6a4 4 0 1 1-4 4'));
  aus.push(pfad('km-fein', 'M269 142L240 156M269 142L298 156'), pfad('km-linie', 'M232 156H306V164H232Z'));
  // Rohbau
  aus.push(pfad('km-linie', 'M10 230V150H140V230M10 190H140'));
  for (const x of [10, 52, 96, 140]) aus.push(linie('km-linie', x, 150, x, 230));
  aus.push(pfad('km-fein km-gestrichelt', 'M10 150V112H140V150'));
  for (const x of [20, 62, 106]) aus.push(pfad('km-fein', `M${x} 162H${x + 22}V178H${x}ZM${x} 202H${x + 22}V218H${x}Z`));
  // Gelände
  aus.push(linie('km-linie', 0, 230, 320, 230));
  aus.push(schraffur(0, 230, 320, 10, 9));
  aus.push(masskette(10, 102, 140, 102));
  return aus.join('');
}

/** IV Werkzeuge: Planblatt mit Schriftfeld, Maßstab, Winkel und Zirkel. */
function motivWerkzeuge(): string {
  const aus: string[] = [];
  // Planblatt mit Schriftfeld
  aus.push(pfad('km-papier', 'M14 14H290V196H14Z'));
  aus.push(pfad('km-linie', 'M14 14H290V196H14ZM22 22H282V188H22Z'));
  aus.push(pfad('km-fein', 'M198 160H282M198 160V188M240 160V188M198 174H282'));
  // kleiner Grundriss auf dem Blatt
  aus.push(pfad('km-fein', 'M40 40H170V140H40ZM100 40V100M100 100H170M40 90H76'));
  aus.push(masskette(40, 32, 170, 32));
  // Geodreieck
  aus.push(pfad('km-linie', 'M70 220L230 220L150 140Z'));
  aus.push(pfad('km-fein', 'M120 208L180 208L150 178Z'));
  for (let i = 1; i < 16; i++) aus.push(linie('km-fein', 70 + i * 10, 220, 70 + i * 10, i % 5 === 0 ? 212 : 216));
  // Maßstab (schräg)
  aus.push(gruppe('', pfad('km-linie', 'M0 0H200V18H0Z') + Array.from({ length: 19 }, (_, i) => linie('km-fein', 10 + i * 10, 0, 10 + i * 10, i % 5 === 4 ? 10 : 6)).join(''), 'translate(132 132) rotate(-24)'));
  // Zirkel
  aus.push(pfad('km-linie', 'M262 64L238 150M262 64L290 148'));
  aus.push(kreis('km-knoten-gross', 262, 60, 5), pfad('km-linie', 'M262 54V44'));
  aus.push(pfad('km-fein km-gestrichelt', 'M200 150A52 52 0 0 1 238 112'));
  // Bleistift
  aus.push(gruppe('', pfad('km-linie', 'M0 0H96V10H0ZM96 0L110 5L96 10') + linie('km-fein', 16, 0, 16, 10), 'translate(190 206) rotate(-12)'));
  return aus.join('');
}

/** Anhang: Planschrank mit Rollen und Registerkarten. */
function motivRegister(): string {
  const aus: string[] = [];
  aus.push(pfad('km-linie', 'M20 220H300'));
  const ruecken = [[28, 120, 22], [52, 96, 26], [80, 132, 18], [100, 110, 24], [126, 90, 30]] as const;
  for (const [x, y, b] of ruecken) {
    aus.push(pfad('km-linie', `M${x} 220V${y}H${x + b}V220`));
    aus.push(pfad('km-fein', `M${x + 4} ${y + 14}H${x + b - 4}M${x + 4} ${y + 20}H${x + b - 4}M${x + 4} ${210}H${x + b - 4}`));
  }
  aus.push(pfad('km-linie', 'M160 220L194 100L214 106L180 220'));
  // Planrollen
  for (const [x, y] of [[230, 196], [262, 196], [246, 170]] as const) {
    aus.push(kreis('km-linie', x, y, 13), kreis('km-fein', x, y, 5));
  }
  // Registerkarten
  aus.push(pfad('km-fein', 'M214 60H300V140H214ZM222 52H250V60M256 46H284V60'));
  for (let i = 0; i < 5; i++) aus.push(linie('km-fein', 222, 76 + i * 12, 292 - (i % 2) * 20, 76 + i * 12));
  return aus.join('');
}

const MOTIVE: Readonly<Record<string, () => string>> = {
  '1': motivGrundriss,
  '2': motivTragwerk,
  '3': motivKran,
  '4': motivWerkzeuge,
  anhang: motivRegister,
};

/** Rasterpapier 800 × 260: feine Linien alle 20, kräftigere alle 100. */
function raster(): string {
  const fein: string[] = [];
  const grob: string[] = [];
  for (let x = 0; x <= 800; x += 20) (x % 100 === 0 ? grob : fein).push(`M${x} 0V260`);
  for (let y = 0; y <= 260; y += 20) (y % 100 === 0 ? grob : fein).push(`M0 ${y}H800`);
  return pfad('km-raster', fein.join('')) + pfad('km-raster-grob', grob.join(''));
}

/** Bauplan-Motiv eines Teils als Kopf-Hintergrund; „alle“ zeigt die vier Motive klein in Reihe, je in ihrer Farbe. */
export function kopfMotiv(teil: string): string {
  let inhalt: string;
  if (teil === 'alle') {
    inhalt = ['1', '2', '3', '4'].map((t, i) => gruppe(`km-motiv km-t${t}`, MOTIVE[t]?.() ?? '', `translate(${150 + i * 112} 166) scale(.3)`)).join('');
  } else {
    inhalt = gruppe('km-motiv', (MOTIVE[teil] ?? motivGrundriss)(), 'translate(470 12)');
  }
  return `<svg class="kopf-motiv" data-motiv="${teil in MOTIVE || teil === 'alle' ? teil : '1'}" viewBox="0 0 800 260" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" focusable="false">${raster()}${inhalt}</svg>`;
}
