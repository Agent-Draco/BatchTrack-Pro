export const CONSUMER_STEPS = [
  {
    id: 'consumer-1',
    title: 'Your consumer dashboard',
    route: '/trackly/dashboard',
    target: '.ui-statcard',
    tooltip:
      'Track key health metrics: everything you own, what needs attention, and recoverable value.',
  },
  {
    id: 'consumer-2',
    title: 'Scan My Pantry',
    route: '/trackly/pantry',
    target: 'button, .ui-btn',
    tooltip:
      'Turn your physical pantry into a digital inventory. Hit Scan Pantry to run a mock AI vision pass.',
  },
  {
    id: 'consumer-3',
    title: 'Smart Expiry',
    route: '/trackly/expiry',
    target: '.app-content',
    tooltip:
      'Items grouped into Urgent, Use Soon, Safe, Expired with an action hint next to every at-risk product.',
  },
  {
    id: 'consumer-4',
    title: 'Recipe engine',
    route: '/trackly/recipes',
    target: '.app-content',
    tooltip:
      'Get recipe suggestions that use ingredients closest to expiry first, minimizing waste.',
  },
  {
    id: 'consumer-5',
    title: 'Raise a service request',
    route: '/trackly/product/WADN-IND-2026-Q9R0S1T2',
    target: '.app-content',
    tooltip:
      "Warranty ending soon? One tap creates a verified service ticket that lands directly in the retailer's queue.",
  },
];

export const RETAILER_STEPS = [
  {
    id: 'retailer-1',
    title: 'Your retailer dashboard',
    route: '/avero/dashboard',
    target: '.ui-statcard',
    tooltip:
      'Monitor KPIs: today\u2019s sales, inventory value, expiring items, recoverable value, and service demand.',
  },
  {
    id: 'retailer-2',
    title: 'Inventory management',
    route: '/avero/inventory',
    target: '.ui-datatable, table',
    tooltip:
      'Full inventory table with filters, sort, and search. Click a row to open the WADN detail drawer.',
  },
  {
    id: 'retailer-3',
    title: 'Expiry salvage intelligence',
    route: '/avero/salvage',
    target: '.app-content',
    tooltip:
      'See products at risk: return-to-distributor deadlines, markdown opportunities, and one-click rescue actions.',
  },
  {
    id: 'retailer-4',
    title: 'Aztec POS checkout',
    route: '/avero/pos',
    target: '.app-content',
    tooltip:
      'Scan products, build a cart, capture payment, and issue digital change credits when loose change runs short.',
  },
  {
    id: 'retailer-5',
    title: 'Service queue',
    route: '/avero/service-queue',
    target: '.ui-datatable, table',
    tooltip:
      'Consumer-initiated service tickets land here. Accept, triage, and update status for full closed-loop visibility.',
  },
];

export const IDENTITY_STEPS = [
  {
    id: 'identity-1',
    title: 'What is a WADN?',
    route: '/identity',
    target: '.app-content',
    tooltip:
      'A WADN (Wide Area Digital Name) is a persistent, universal identity for every physical product \u2014 like a passport for things.',
  },
  {
    id: 'identity-2',
    title: 'Search a WADN',
    route: '/identity',
    target: 'input, .app-content',
    tooltip:
      'Paste any WADN (e.g. the seeded earbuds WADN) to pull the complete digital record from the identity layer.',
  },
  {
    id: 'identity-3',
    title: 'Digital passport',
    route: '/identity?wadn=WADN-IND-2026-Q9R0S1T2',
    target: '.app-content',
    tooltip:
      'Every WADN has a searchable passport: purchase details, warranty status, lifecycle events, and full service history.',
  },
  {
    id: 'identity-4',
    title: 'Cross-system link',
    route: '/identity?wadn=WADN-IND-2026-Q9R0S1T2',
    target: '.ui-btn, button',
    tooltip:
      'One WADN lives in every system \u2014 jump directly to the same product in Trackly (consumer) or Avero (retailer) context.',
  },
];

export const FLOWS = {
  consumer: {
    id: 'consumer',
    label: 'Consumer Demo',
    pillVariant: 'blue',
    description: '5-minute tour of Trackly for households',
    steps: CONSUMER_STEPS,
  },
  retailer: {
    id: 'retailer',
    label: 'Retailer Demo',
    pillVariant: 'green',
    description: '5-minute tour of Avero for store operations',
    steps: RETAILER_STEPS,
  },
  identity: {
    id: 'identity',
    label: 'Product Identity Demo',
    pillVariant: 'brand-accent',
    description: '4-minute tour of the WADN identity layer',
    steps: IDENTITY_STEPS,
  },
};

export function getFlow(flowId) {
  const key = String(flowId || 'consumer').toLowerCase();
  return FLOWS[key] || FLOWS.consumer;
}
