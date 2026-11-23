/**
 * Public treasury rule for $CIRCLE.
 * 20% of proceeds are used to buy back $CIRCLE.
 */
export const TREASURY_AGENT_INSTRUCTION = {
  usePercentOfProceeds: 20,
  action: 'buy_back',
  asset: '$CIRCLE',
  source: 'proceeds',
  note: '20% of proceeds are used to buy back $CIRCLE.',
} as const;
