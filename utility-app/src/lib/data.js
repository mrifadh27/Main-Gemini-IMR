// Utilities Configuration
export const UTILITY_TYPES = {
  ELEC: { id: 1, name: 'Electricity', unit: 'kWh', color: 'text-yellow-500', bg: 'bg-yellow-100' },
  WATER: { id: 2, name: 'Water', unit: 'm³', color: 'text-blue-500', bg: 'bg-blue-100' },
  GAS: { id: 3, name: 'Gas', unit: 'units', color: 'text-red-500', bg: 'bg-red-100' },
};

export const INITIAL_TARIFFS = [
  { id: 1, typeId: 1, rate: 0.15, fixed: 10.00 },
  { id: 2, typeId: 2, rate: 0.05, fixed: 5.00 },
  { id: 3, typeId: 3, rate: 0.10, fixed: 8.00 }, 
];

// Helper to generate initial data
export const generateSeedData = () => {
  const customers = [
    { id: 'C001', name: 'John Doe', address: '123 Maple St', phone: '555-0101' },
    { id: 'C002', name: 'Jane Smith', address: '456 Oak Ave', phone: '555-0102' },
    { id: 'C003', name: 'Acme Corp', address: '789 Ind. Park', phone: '555-0999' },
  ];

  const meters = [
    { id: 'M-E-001', customerId: 'C001', typeId: 1, lastReading: 1200, status: 'Active' },
    { id: 'M-W-001', customerId: 'C001', typeId: 2, lastReading: 450, status: 'Active' },
    { id: 'M-E-002', customerId: 'C002', typeId: 1, lastReading: 3400, status: 'Active' },
    { id: 'M-G-003', customerId: 'C003', typeId: 3, lastReading: 800, status: 'Maintenance' },
  ];

  // Start with empty transaction tables
  return { customers, meters, readings: [], bills: [], payments: [], tariffs: INITIAL_TARIFFS };
};