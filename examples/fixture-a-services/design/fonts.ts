/**
 * Polices auto-hébergées des deux pistes de direction (licence SIL OFL 1.1,
 * fichiers issus des paquets @fontsource verrouillés dans package-lock.json ;
 * texte de licence dans node_modules/<paquet>/LICENSE et docs/licences-polices.md).
 * Sous-ensembles latin + latin-ext : français (œ, «»), anglais.
 * Une fois la piste choisie, les familles de l'autre piste sont retirées.
 */
import { fontProviders } from 'astro/config';

const LATIN: [string, ...string[]] = ['U+0000-00FF', 'U+0131', 'U+0152-0153', 'U+02BB-02BC', 'U+02C6', 'U+02DA', 'U+02DC', 'U+0304', 'U+0308', 'U+0329', 'U+2000-206F', 'U+20AC', 'U+2122', 'U+2191', 'U+2193', 'U+2212', 'U+2215', 'U+FEFF', 'U+FFFD'];
const LATIN_EXT: [string, ...string[]] = ['U+0100-02BA', 'U+02BD-02C5', 'U+02C7-02CC', 'U+02CE-02D7', 'U+02DD-02FF', 'U+0304', 'U+0308', 'U+0329', 'U+1D00-1DBF', 'U+1E00-1E9F', 'U+1EF2-1EFF', 'U+2020', 'U+20A0-20AB', 'U+20AD-20C0', 'U+2113', 'U+2C60-2C7F', 'U+A720-A7FF'];


export const fonts = [
  // Piste A « Registre » : serif éditoriale + sans de labeur.
  {
    provider: fontProviders.local(),
    name: 'Newsreader',
    cssVariable: '--font-newsreader',
    fallbacks: ['Georgia', 'serif'],
    options: {
      variants: [
        { src: ['@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2'], weight: '200 800', style: 'normal', unicodeRange: [...LATIN] },
        { src: ['@fontsource-variable/newsreader/files/newsreader-latin-ext-wght-normal.woff2'], weight: '200 800', style: 'normal', unicodeRange: [...LATIN_EXT] },
        { src: ['@fontsource-variable/newsreader/files/newsreader-latin-wght-italic.woff2'], weight: '200 800', style: 'italic', unicodeRange: [...LATIN] },
      ],
    },
  },
  {
    provider: fontProviders.local(),
    name: 'Public Sans',
    cssVariable: '--font-public-sans',
    fallbacks: ['Arial', 'sans-serif'],
    options: {
      variants: [
        { src: ['@fontsource-variable/public-sans/files/public-sans-latin-wght-normal.woff2'], weight: '100 900', style: 'normal', unicodeRange: [...LATIN] },
        { src: ['@fontsource-variable/public-sans/files/public-sans-latin-ext-wght-normal.woff2'], weight: '100 900', style: 'normal', unicodeRange: [...LATIN_EXT] },
      ],
    },
  },
  // Piste B « Plan d'atelier » : grotesque condensée + mono technique.
  {
    provider: fontProviders.local(),
    name: 'IBM Plex Sans Condensed',
    cssVariable: '--font-plex-condensed',
    fallbacks: ['Arial Narrow', 'Arial', 'sans-serif'],
    options: {
      variants: [
        { src: ['@fontsource/ibm-plex-sans-condensed/files/ibm-plex-sans-condensed-latin-400-normal.woff2'], weight: 400, style: 'normal', unicodeRange: [...LATIN] },
        { src: ['@fontsource/ibm-plex-sans-condensed/files/ibm-plex-sans-condensed-latin-ext-400-normal.woff2'], weight: 400, style: 'normal', unicodeRange: [...LATIN_EXT] },
        { src: ['@fontsource/ibm-plex-sans-condensed/files/ibm-plex-sans-condensed-latin-500-normal.woff2'], weight: 500, style: 'normal', unicodeRange: [...LATIN] },
        { src: ['@fontsource/ibm-plex-sans-condensed/files/ibm-plex-sans-condensed-latin-ext-500-normal.woff2'], weight: 500, style: 'normal', unicodeRange: [...LATIN_EXT] },
        { src: ['@fontsource/ibm-plex-sans-condensed/files/ibm-plex-sans-condensed-latin-600-normal.woff2'], weight: 600, style: 'normal', unicodeRange: [...LATIN] },
        { src: ['@fontsource/ibm-plex-sans-condensed/files/ibm-plex-sans-condensed-latin-ext-600-normal.woff2'], weight: 600, style: 'normal', unicodeRange: [...LATIN_EXT] },
      ],
    },
  },
  {
    provider: fontProviders.local(),
    name: 'IBM Plex Mono',
    cssVariable: '--font-plex-mono',
    fallbacks: ['Courier New', 'monospace'],
    options: {
      variants: [
        { src: ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2'], weight: 400, style: 'normal', unicodeRange: [...LATIN] },
        { src: ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-ext-400-normal.woff2'], weight: 400, style: 'normal', unicodeRange: [...LATIN_EXT] },
      ],
    },
  },
];
