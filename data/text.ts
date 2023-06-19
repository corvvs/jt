export namespace JsonText {
  export function saveTextLocal(text: string) {
    localStorage.setItem("defaultJsonText", text);
  }

  export function loadTextLocal() {
    return localStorage.getItem("defaultJsonText");
  }
}
