export const planData = {
  project: "PVH WIP Integration API",
  version: "1.0.0",
  roles:[
    { dev: "Dev 1", role: "Nexus API & Ingestion", contract: "nexus-raw", type: "Producer" },
    { dev: "Dev 2", role: "Alchemy & DB Loader", contract: "alchemy-raw", type: "Producer" },
    { dev: "Dev 3", role: "Mapping Engine (Prep)", contract: "mapped-data", type: "Producer" },
    { dev: "Dev 4", role: "Mapping Engine (Match)", contract: "mapped-data", type: "Producer" },
    { dev: "Dev 5", role: "Calculation (Date Math)", contract: "calculated-output", type: "Producer" },
    { dev: "Dev 6", role: "Calculation (Rules)", contract: "calculated-output", type: "Producer" },
    { dev: "Dev 7", role: "Excel I/O Builder", contract: "calculated-output", type: "Consumer" },
    { dev: "Dev 8", role: "Validation & Submit", contract: "validated-output", type: "Producer" },
    { dev: "Dev 9", role: "Frontend & Auth", contract: "validated-output", type: "Consumer" }
  ]
};