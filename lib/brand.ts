/**
 * One Circle mark everywhere — homepage, sidebar, favicon, $CIRCLE coin.
 * Source asset: assets/images/coin/avatar.jpg (cyan network sphere).
 */
export const CIRCLE_MARK = require('../assets/images/coin/avatar.jpg');

/** Solana mint (Pump.fun). */
export const CIRCLE_MINT = 'GXwtDpQrxRYVmYxhjWYbHwtb8wMhsJ6m8kqTtYffpump';

export const CIRCLE_LINKS = {
  pump: `https://pump.fun/coin/${CIRCLE_MINT}`,
  dexscreener: `https://dexscreener.com/solana/${CIRCLE_MINT}`,
  solscan: `https://solscan.io/token/${CIRCLE_MINT}`,
} as const;

export const BRAND = {
  name: 'CIRCLE',
  token: '$CIRCLE',
  mark: CIRCLE_MARK,
  mint: CIRCLE_MINT,
  links: CIRCLE_LINKS,
} as const;
