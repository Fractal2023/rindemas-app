"use client";

/**
 * Thin wrapper over the Web Speech API (SpeechRecognition / webkitSpeechRecognition).
 *
 * Important: most browsers transcribe speech on the vendor's servers (Google in
 * Chrome, Apple in Safari), which needs internet and sends the audio out of the
 * device. Newer Chrome versions can recognize on the device (`processLocally`)
 * once a language pack is installed — that mode is truly offline and private.
 * We prefer on-device whenever the browser reports it's available.
 */

export const VOICE_LANG = "es-MX";

// TypeScript's DOM lib has no SpeechRecognition types yet, so declare the parts we use.
interface RecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface RecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: RecognitionAlternative;
}
interface RecognitionEvent {
  readonly resultIndex: number;
  readonly results: { readonly length: number; [index: number]: RecognitionResult };
}
interface RecognitionErrorEvent {
  readonly error: string;
}
interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  processLocally?: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type AvailabilityStatus = "available" | "downloadable" | "downloading" | "unavailable";
interface RecognitionCtor {
  new (): Recognition;
  available?: (options: { langs: string[]; processLocally: boolean }) => Promise<AvailabilityStatus>;
  install?: (options: { langs: string[]; processLocally: boolean }) => Promise<boolean>;
}

function getCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechSupported() {
  return getCtor() !== null;
}

export type OnDeviceStatus = AvailabilityStatus | "unknown";

/** Whether this browser can recognize Spanish on the device (offline). */
export async function onDeviceStatus(lang = VOICE_LANG): Promise<OnDeviceStatus> {
  const ctor = getCtor();
  if (!ctor?.available) return "unknown";
  try {
    return await ctor.available({ langs: [lang], processLocally: true });
  } catch {
    return "unknown";
  }
}

/** Downloads the on-device language pack (Chrome). Resolves true when ready. */
export async function installOnDevice(lang = VOICE_LANG): Promise<boolean> {
  const ctor = getCtor();
  if (!ctor?.install) return false;
  try {
    return await ctor.install({ langs: [lang], processLocally: true });
  } catch {
    return false;
  }
}

export interface ListenOptions {
  processLocally: boolean;
  onInterim: (text: string) => void;
  /** Final alternatives, best first. */
  onResult: (alternatives: string[]) => void;
  onError: (code: string) => void;
  onEnd: () => void;
}

/** Starts one dictation. Returns a function that stops listening. */
export function listen({ processLocally, onInterim, onResult, onError, onEnd }: ListenOptions): () => void {
  const ctor = getCtor();
  if (!ctor) {
    onError("not-supported");
    onEnd();
    return () => {};
  }
  const rec = new ctor();
  rec.lang = VOICE_LANG;
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 3;
  if (processLocally) rec.processLocally = true;

  rec.onresult = (e) => {
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const result = e.results[i];
      if (result.isFinal) {
        const alternatives: string[] = [];
        for (let j = 0; j < result.length; j++) alternatives.push(result[j].transcript.trim());
        onResult(alternatives.filter(Boolean));
      } else {
        onInterim(result[0].transcript);
      }
    }
  };
  rec.onerror = (e) => onError(e.error);
  rec.onend = onEnd;

  try {
    rec.start();
  } catch {
    onError("start-failed");
    onEnd();
  }
  return () => {
    try {
      rec.stop();
    } catch {
      // already stopped
    }
  };
}

/** Friendly Spanish message for a SpeechRecognition error code. */
export function voiceErrorMessage(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "No tenemos permiso para usar el micrófono. Actívalo en la configuración de tu navegador y vuelve a intentar.";
    case "audio-capture":
      return "No encontramos un micrófono en este dispositivo.";
    case "no-speech":
      return "No te escuché. Toca el micrófono y vuelve a intentar.";
    case "network":
      return "En este navegador el dictado necesita internet. Escribe la compra con el teclado o intenta cuando tengas señal.";
    case "language-not-supported":
      return "Tu navegador no reconoce voz en español.";
    case "not-supported":
      return "Tu navegador no permite dictado por voz. Prueba con Chrome o Safari, o escribe la compra con el teclado.";
    case "aborted":
      return "";
    default:
      return "No se pudo usar el dictado. Escribe la compra con el teclado.";
  }
}
