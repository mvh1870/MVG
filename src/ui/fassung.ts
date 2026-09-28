/*
 * Fassung der Anwendung: die Story-Version kommt beim Bau aus package.json (`__MVG_VERSION__`,
 * esbuild define); ohne Bau (Tests unter Node) gilt „0.0“.
 */

import { W } from './woerter.ts';

declare const __MVG_VERSION__: string | undefined;

export const STORY_VERSION = (typeof __MVG_VERSION__ === 'string' ? __MVG_VERSION__ : '0.0').split('.').slice(0, 2).join('.');

/** „Whitepaper V1.2 · Story 0.1“ */
export const fassungText = (whitepaper: string): string => W.version(whitepaper, STORY_VERSION);
