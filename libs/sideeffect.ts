
export namespace ClipboardAccess {
  export async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
  }

  export async function pasteText() {
    return navigator.clipboard.readText();
  }
}

export namespace FileDownload {
  export function downloadAsJson(data: any, filename: string = 'filtered-result.json') {
    const jsonText = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}
