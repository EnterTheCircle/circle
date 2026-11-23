/**
 * Instruction for a future treasury agent.
 * Nothing in this file is connected, signed, or sent.
 * No wallet, no swap, no execution. Publishing the rule is the point.
 */
export const TREASURY_AGENT_INSTRUCTION = {
  connected: false,
  imposed: false,
  whenConnected: {
    /** Share of proceeds the agent is told to use. */
    usePercentOfProceeds: 20,
    action: 'buy_back',
    asset: '$CIRCLE',
    source: 'proceeds',
    note: 'When a treasury agent is connected, it is told to use 20% of proceeds to buy back $CIRCLE.',
  },
} as const;
