import os from "os";

export function urlsNaRede(porta = 3000): string[] {
  const urls: string[] = [];
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const a of addrs ?? []) {
      const ipv4 = a.family === "IPv4" || a.family === 4;
      if (ipv4 && !a.internal) urls.push(`http://${a.address}:${porta}`);
    }
  }
  return urls;
}
