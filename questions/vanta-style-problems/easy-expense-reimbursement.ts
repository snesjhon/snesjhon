// ============================================================================
// VANTA-STYLE PROBLEM 1: Employee Expense Reimbursement (EASIER)
// ============================================================================

// PART ONE: Expense Eligibility Check (15-20 minutes max - TIME TRAP!)
// ----------------------------------------------------------------------------
// You are building an expense management system for a company. The finance
// team has specific rules about which expenses are automatically approved
// for reimbursement.
//
// Scenario: An employee submits an expense report. The system needs to
// determine if the expense is "auto-approved" based on the following policy:
//
//  type -- condition -- amount
//
// - Travel expenses under $500 are auto-approved if the trip was domestic
// - Technology expenses under $1000 are auto-approved if they have manager pre-approval
//
//
//  type -- no-condition -- amount
//
// - Meal expenses under $75 are auto-approved
// - Office supplies under $200 are auto-approved
//
//  needs review
//
// - All other expenses require manual review
//
// This part is intentionally wordy but ultimately boils down to 3-4 if statements.
// Don't overthink it!

interface Expense {
  amount: number;
  category: "meals" | "travel" | "office_supplies" | "technology" | "other";
  is_domestic?: boolean;
  has_manager_approval?: boolean;
  employee_id: string;
}

interface EligibilityResult {
  auto_approved: boolean;
  reason: string;
}

// TODO: Implement this function (should take ~10-15 minutes)
function checkExpenseEligibility(expense: Expense): EligibilityResult {
  // Your code here
  // throw new Error("Not implemented");

  //  type -- condition -- amount
  //
  // - Travel expenses under $500 are auto-approved if the trip was domestic
  // - Technology expenses under $1000 are auto-approved if they have manager pre-approval
  // console.log({ expense });
  if (
    expense.category === "travel" &&
    expense.amount < 500 &&
    expense.is_domestic
  ) {
    return {
      auto_approved: true,
      reason: "Travel expense under $500 for domestic trip",
    };
  }

  if (expense.category === "technology" && expense.amount < 1000) {
    return {
      auto_approved: true,
      reason: "Travel expense under $500 for domestic trip",
    };
  }

  //  type -- no-condition -- amount
  //
  // - Meal expenses under $75 are auto-approved
  // - Office supplies under $200 are auto-approved
  //
  if (expense.category === "meals" && expense.amount < 75) {
    return {
      auto_approved: true,
      reason: "Meal expenses under $75 are auto-approved",
    };
  }

  if (expense.category === "office_supplies" && expense.amount < 200) {
    return {
      auto_approved: true,
      reason: "Meal expenses under $75 are auto-approved",
    };
  }

  return {
    auto_approved: false,
    reason: "Unknown expenses needs reviews",
  };
}

// Test cases for Part One
const testExpenses: Expense[] = [
  {
    amount: 50,
    category: "meals",
    is_domestic: true,
    has_manager_approval: false,
    employee_id: "emp_123",
  },
  // Expected: { auto_approved: true, reason: "Meal expense under $75" }

  {
    amount: 450,
    category: "travel",
    is_domestic: true,
    has_manager_approval: false,
    employee_id: "emp_124",
  },
  // Expected: { auto_approved: true, reason: "Travel expense under $500 for domestic trip" }

  {
    amount: 450,
    category: "travel",
    is_domestic: false,
    has_manager_approval: false,
    employee_id: "emp_125",
  },
  // Expected: { auto_approved: false, reason: "Travel expense requires manual review" }

  {
    amount: 900,
    category: "technology",
    is_domestic: true,
    has_manager_approval: true,
    employee_id: "emp_126",
  },
  // Expected: { auto_approved: true, reason: "Technology expense under $1000 with manager approval" }

  {
    amount: 150,
    category: "office_supplies",
    is_domestic: true,
    has_manager_approval: false,
    employee_id: "emp_127",
  },
  // Expected: { auto_approved: true, reason: "Office supplies under $200" }
];

const eligible = testExpenses.map((expense) =>
  checkExpenseEligibility(expense),
);

// console.log({ eligible });

// ============================================================================
// PART TWO: Department Expense Aggregation (MAIN EVALUATION - DFS/Recursion)
// ============================================================================
// Now, you need to calculate total auto-approved expenses across an entire
// department hierarchy.
//
// You're given nested Department objects with parent/child relationships.
// Task: Traverse the hierarchy and aggregate expenses using the eligibility
// function from Part One.

interface Employee {
  id: string;
  name: string;
  expenses: Expense[];
}

interface Department {
  name: string;
  employees: Employee[];
  subdepartments: Department[];
}

interface DepartmentExpenses {
  [departmentName: string]: number;
}

const aggregator = [];
// TODO: Implement this recursive function (this is the main challenge!)
// Hint: Use DFS to traverse all subdepartments
// For each employee in each department, check all their expenses using checkExpenseEligibility()
function calculateDepartmentExpenses(
  department: Department,
): DepartmentExpenses {
  // brute force
  let result: DepartmentExpenses = {};

  for (const employee of department.employees) {
    for (const expense of employee.expenses) {
      const eligibility = checkExpenseEligibility(expense);
      if (eligibility.auto_approved) {
        const currentAmount = result[department.name];
        result[department.name] = currentAmount
          ? currentAmount + expense.amount
          : expense.amount;
      }
    }
  }

  for (const subdepartment of department.subdepartments) {
    const subresult = calculateDepartmentExpenses(subdepartment);
    result[department.name] =
      result[department.name] + subresult[subdepartment.name];
    Object.assign(result, subresult);
  }

  return result;
}

// Test case for Part Two
const engineeringDept: Department = {
  name: "Engineering",
  employees: [
    {
      id: "emp_1",
      name: "Alice",
      expenses: [
        {
          amount: 50,
          category: "meals",
          is_domestic: true,
          has_manager_approval: false,
          employee_id: "emp_1",
        },
        {
          amount: 1200,
          category: "technology",
          is_domestic: true,
          has_manager_approval: true,
          employee_id: "emp_1",
        },
        // Note: $1200 tech expense is over $1000 limit, should not be auto-approved
      ],
    },
    {
      id: "emp_2",
      name: "Bob",
      expenses: [
        {
          amount: 300,
          category: "travel",
          is_domestic: true,
          has_manager_approval: false,
          employee_id: "emp_2",
        },
      ],
    },
  ],
  subdepartments: [
    {
      name: "Frontend",
      employees: [
        {
          id: "emp_3",
          name: "Charlie",
          expenses: [
            {
              amount: 150,
              category: "office_supplies",
              is_domestic: true,
              has_manager_approval: false,
              employee_id: "emp_3",
            },
          ],
        },
      ],
      subdepartments: [
        {
          name: "Design",
          employees: [
            {
              id: "emp_4",
              name: "Diana",
              expenses: [
                {
                  amount: 60,
                  category: "meals",
                  is_domestic: true,
                  has_manager_approval: false,
                  employee_id: "emp_4",
                },
              ],
            },
          ],
          subdepartments: [],
        },
      ],
    },
  ],
};

console.log(calculateDepartmentExpenses(engineeringDept));

// Expected output:
// {
//   "Engineering": 560,    // Alice: $50, Bob: $300, Charlie: $150, Diana: $60
//   "Frontend": 210,       // Charlie: $150, Diana: $60
//   "Design": 60           // Diana: $60
// }

// ============================================================================
// INTERVIEW TIPS:
// ============================================================================
// 1. Don't spend more than 15-20 minutes on Part One - it's a trap!
// 2. Part Two is where you're evaluated - focus on clean recursive traversal
// 3. Ask the interviewer if you can start with Part Two first
// 4. Think about the recursive structure before coding
// 5. Don't add extra tests unless you have time
// ============================================================================
