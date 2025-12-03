// ============================================================================
// VANTA-STYLE PROBLEM 2: Cloud Security Compliance (HARDER)
// ============================================================================

// PART ONE: Resource Compliance Check (15-20 minutes max - TIME TRAP!)
// ----------------------------------------------------------------------------
// You are building a cloud security compliance system. The security team needs
// to classify resources as "compliant" or "non-compliant" based on company
// security policies.
//
// Scenario: A cloud resource (database, storage bucket, VM, etc.) must meet
// specific criteria to be considered compliant with company policy.
//
// Compliance Rules:
// - Database resources must be encrypted AND must have had a security audit
//   within the last 90 days
// - Storage resources must be encrypted if they contain "sensitive" or
//   "confidential" data classification (public data doesn't need encryption)
// - Compute resources must be in approved regions (us-east-1, us-west-2,
//   eu-west-1) AND must have encryption enabled if running production workloads
// - Network resources must have audit logs enabled AND must not be publicly
//   accessible
// - Any resource that doesn't match the above categories is automatically
//   compliant (legacy exception)
//
// This is intentionally complex but boils down to 4-5 if statements.
// Don't spend too much time here!

interface CloudResource {
  type: "database" | "storage" | "compute" | "network" | "other";
  encrypted?: boolean;
  last_audit_days_ago?: number;
  data_classification?: "public" | "sensitive" | "confidential";
  region?: string;
  is_production?: boolean;
  publicly_accessible?: boolean;
  audit_logs_enabled?: boolean;
}

interface ComplianceResult {
  compliant: boolean;
  reason: string;
}

// TODO: Implement this function (should take ~15-20 minutes)
function checkResourceCompliance(resource: CloudResource): ComplianceResult {
  // Your code here
  throw new Error("Not implemented");
}

// Test cases for Part One
const testResources: CloudResource[] = [
  {
    type: "database",
    encrypted: true,
    last_audit_days_ago: 45,
    data_classification: "sensitive",
    region: "us-east-1",
    is_production: true,
    publicly_accessible: false,
    audit_logs_enabled: true,
  },
  // Expected: { compliant: true, reason: "Database is encrypted and audited within 90 days" }

  {
    type: "database",
    encrypted: true,
    last_audit_days_ago: 120,
    data_classification: "confidential",
    region: "us-east-1",
    is_production: true,
    publicly_accessible: false,
    audit_logs_enabled: true,
  },
  // Expected: { compliant: false, reason: "Database audit is older than 90 days" }

  {
    type: "storage",
    encrypted: false,
    data_classification: "public",
    region: "us-west-2",
    is_production: true,
    publicly_accessible: true,
    audit_logs_enabled: true,
  },
  // Expected: { compliant: true, reason: "Storage with public data does not require encryption" }

  {
    type: "storage",
    encrypted: false,
    data_classification: "sensitive",
    region: "us-west-2",
    is_production: true,
    publicly_accessible: false,
    audit_logs_enabled: true,
  },
  // Expected: { compliant: false, reason: "Storage with sensitive data must be encrypted" }

  {
    type: "compute",
    encrypted: true,
    region: "us-east-1",
    is_production: true,
    publicly_accessible: false,
    audit_logs_enabled: true,
  },
  // Expected: { compliant: true, reason: "Compute resource in approved region with encryption enabled" }

  {
    type: "compute",
    encrypted: false,
    region: "ap-south-1",
    is_production: true,
    publicly_accessible: false,
    audit_logs_enabled: true,
  },
  // Expected: { compliant: false, reason: "Compute resource not in approved region or missing encryption" }

  {
    type: "network",
    encrypted: true,
    region: "us-east-1",
    is_production: true,
    publicly_accessible: false,
    audit_logs_enabled: true,
  },
  // Expected: { compliant: true, reason: "Network resource has audit logs and is not publicly accessible" }

  {
    type: "network",
    encrypted: true,
    region: "us-east-1",
    is_production: true,
    publicly_accessible: true,
    audit_logs_enabled: true,
  },
  // Expected: { compliant: false, reason: "Network resource cannot be publicly accessible" }
];

// ============================================================================
// PART TWO: Infrastructure Compliance Scoring (MAIN EVALUATION - DFS/Recursion)
// ============================================================================
// Now you need to calculate compliance scores across an entire cloud
// infrastructure hierarchy with nested ResourceGroups.
//
// Task: Traverse the hierarchy using DFS/recursion and:
// 1. Use checkResourceCompliance() on each resource
// 2. Calculate compliance percentage: (compliant_resources / total_resources) * 100
// 3. Return nested structure showing scores at each level

interface ResourceGroup {
  name: string;
  resources: CloudResource[];
  child_groups: ResourceGroup[];
}

interface ComplianceScore {
  name: string;
  compliance_score: number;
  total_resources: number;
  compliant_resources: number;
  child_groups: ComplianceScore[];
}

// TODO: Implement this recursive function (this is the main challenge!)
// Hint: Use DFS to traverse all child_groups
// For each resource in each group, use checkResourceCompliance()
// Calculate total_resources and compliant_resources including all descendants
function calculateComplianceScore(group: ResourceGroup): ComplianceScore {
  // Your code here - should use recursion to handle child_groups
  throw new Error("Not implemented");
}

// Test case for Part Two
const infrastructure: ResourceGroup = {
  name: "Production",
  resources: [
    {
      type: "database",
      encrypted: true,
      last_audit_days_ago: 30,
      data_classification: "sensitive",
      region: "us-east-1",
      is_production: true,
      publicly_accessible: false,
      audit_logs_enabled: true,
    },
    {
      type: "storage",
      encrypted: false,
      data_classification: "public",
      region: "us-west-2",
      is_production: true,
      publicly_accessible: true,
      audit_logs_enabled: true,
    },
  ],
  child_groups: [
    {
      name: "Databases",
      resources: [
        {
          type: "database",
          encrypted: true,
          last_audit_days_ago: 120,
          data_classification: "confidential",
          region: "ap-south-1",
          is_production: true,
          publicly_accessible: false,
          audit_logs_enabled: true,
        },
      ],
      child_groups: [
        {
          name: "Analytics",
          resources: [
            {
              type: "compute",
              encrypted: true,
              region: "us-east-1",
              is_production: true,
              publicly_accessible: false,
              audit_logs_enabled: true,
            },
          ],
          child_groups: [],
        },
      ],
    },
    {
      name: "Storage",
      resources: [
        {
          type: "storage",
          encrypted: true,
          data_classification: "confidential",
          region: "us-west-2",
          is_production: true,
          publicly_accessible: false,
          audit_logs_enabled: true,
        },
        {
          type: "network",
          encrypted: true,
          region: "eu-west-1",
          is_production: true,
          publicly_accessible: false,
          audit_logs_enabled: true,
        },
      ],
      child_groups: [],
    },
  ],
};

// Expected output:
// {
//   name: "Production",
//   compliance_score: 83.33,  // 5 out of 6 total resources compliant
//   total_resources: 6,
//   compliant_resources: 5,
//   child_groups: [
//     {
//       name: "Databases",
//       compliance_score: 50.0,  // 1 out of 2 compliant (including Analytics)
//       total_resources: 2,
//       compliant_resources: 1,
//       child_groups: [
//         {
//           name: "Analytics",
//           compliance_score: 100.0,
//           total_resources: 1,
//           compliant_resources: 1,
//           child_groups: []
//         }
//       ]
//     },
//     {
//       name: "Storage",
//       compliance_score: 100.0,
//       total_resources: 2,
//       compliant_resources: 2,
//       child_groups: []
//     }
//   ]
// }

// ============================================================================
// BONUS CHALLENGE (if you finish early):
// ============================================================================
// Find the resource group with the lowest compliance score in the entire hierarchy

function findLowestComplianceGroup(score: ComplianceScore): {
  name: string;
  compliance_score: number;
} {
  // Your code here
  throw new Error("Not implemented");
}

// Expected output for the test case:
// { name: "Databases", compliance_score: 50.0 }

// ============================================================================
// INTERVIEW TIPS:
// ============================================================================
// 1. Don't spend more than 15-20 minutes on Part One - it's intentionally wordy!
// 2. Part Two is the real evaluation - focus on clean recursive DFS traversal
// 3. Ask if you can tackle Part Two first (some interviewers allow this)
// 4. Think through the recursive structure before coding
// 5. Test incrementally, don't add extra tests unless time permits
// 6. The bonus challenge is truly optional - only attempt if you finish Part Two
// ============================================================================
