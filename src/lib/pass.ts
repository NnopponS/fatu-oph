const PASS_KEY = "fatu26-pass";

export interface SavedPass {
  participantId: string;
  token: string;
  displayName: string;
}

export function loadPass(): SavedPass | null {
  try {
    const value = localStorage.getItem(PASS_KEY);
    return value ? (JSON.parse(value) as SavedPass) : null;
  } catch {
    return null;
  }
}

export function savePass(pass: SavedPass) {
  localStorage.setItem(PASS_KEY, JSON.stringify(pass));
}

export function clearPass() {
  localStorage.removeItem(PASS_KEY);
}
