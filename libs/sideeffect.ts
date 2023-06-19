
export namespace ClipboardAccess {
  export async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
  }
}
