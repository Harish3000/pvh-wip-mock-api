export const planData = {
  project: "PVH WIP Integration API",
  version: "1.0.0",
  schedule: "Contract & Scaffolding Day - Friday, Feb 27",
  roles:[
    { dev: "Danutha", role: "Nexus API & Ingestion", contract: "nexus-raw", type: "Producer" },
    { dev: "Sandani", role: "Alchemy Data & DB Loader", contract: "alchemy-raw", type: "Producer" },
    { dev: "Harish", role: "Mapping Engine (Prep)", contract: "mapped-data", type: "Producer" },
    { dev: "Rashmika", role: "Mapping Engine (Match)", contract: "mapped-data", type: "Producer" },
    { dev: "Sri", role: "Calculation (Date Math)", contract: "calculated-output", type: "Producer" },
    { dev: "Jamzee", role: "Calculation (Rules)", contract: "calculated-output", type: "Producer" },
    { dev: "Harsha", role: "Excel I/O Builder", contract: "calculated-output", type: "Consumer" },
    { dev: "Dahami", role: "Validation Engine", contract: "validated-output", type: "Producer" },
    { dev: "Samitha", role: "Frontend, Auth & Submit", contract: "validated-output", type: "Consumer" }
  ]
};