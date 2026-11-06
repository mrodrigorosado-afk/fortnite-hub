// Cache em memória com expiração (TTL) e limite de entradas.
export class TtlCache {
  constructor(max = 200) { this.map = new Map(); this.max = max; }
  get(key) {
    const e = this.map.get(key);
    if (!e) return undefined;
    if (e.exp < Date.now()) { this.map.delete(key); return undefined; }
    return e.value;
  }
  set(key, value, ttlMs) {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.max) this.map.delete(this.map.keys().next().value);
    this.map.set(key, { value, exp: Date.now() + ttlMs });
  }
}
