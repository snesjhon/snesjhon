// Given a list of requested tasks to run, output a list of all necessary tasks
// to run, in a proper order.

// Input:
// allTasks: a list of all task configurations
// tasksToRun: ids of requested tasks to run

// Output: a list of task ids to run, in a proper order

// Requirements:
// - Must be correct
// - Must be performant on large graphs
// - Code should be easy to read

interface Task {
  id: string;
  deps: string[];
}

function getTasksToRun(allTasks: Task[], tasksToRun: string[]): string[] {
  // TODO: Implement this function
  return [];
}

// Test Cases

function testGetTasksToRun() {
  console.log("Running tests...\n");

  // Test 1: Simple linear dependency
  const test1: Task[] = [
    { id: "A", deps: [] },
    { id: "B", deps: ["A"] },
    { id: "C", deps: ["B"] },
  ];
  const result1 = getTasksToRun(test1, ["C"]);
  console.log("Test 1 - Linear dependency:");
  console.log("Input: tasksToRun = ['C']");
  console.log("Expected: ['A', 'B', 'C']");
  console.log("Got:", result1);
  console.log("Pass:", JSON.stringify(result1) === JSON.stringify(["A", "B", "C"]), "\n");

  // Test 2: Multiple dependencies
  const test2: Task[] = [
    { id: "A", deps: [] },
    { id: "B", deps: [] },
    { id: "C", deps: ["A", "B"] },
    { id: "D", deps: ["C"] },
  ];
  const result2 = getTasksToRun(test2, ["D"]);
  console.log("Test 2 - Multiple dependencies:");
  console.log("Input: tasksToRun = ['D']");
  console.log("Expected: A and B before C, C before D");
  console.log("Got:", result2);
  const validOrders2 = [
    ["A", "B", "C", "D"],
    ["B", "A", "C", "D"],
  ];
  const pass2 = validOrders2.some(order => JSON.stringify(result2) === JSON.stringify(order));
  console.log("Pass:", pass2, "\n");

  // Test 3: Diamond dependency
  const test3: Task[] = [
    { id: "A", deps: [] },
    { id: "B", deps: ["A"] },
    { id: "C", deps: ["A"] },
    { id: "D", deps: ["B", "C"] },
  ];
  const result3 = getTasksToRun(test3, ["D"]);
  console.log("Test 3 - Diamond dependency:");
  console.log("Input: tasksToRun = ['D']");
  console.log("Expected: A first, then B and C (any order), then D");
  console.log("Got:", result3);
  const validOrders3 = [
    ["A", "B", "C", "D"],
    ["A", "C", "B", "D"],
  ];
  const pass3 = validOrders3.some(order => JSON.stringify(result3) === JSON.stringify(order));
  console.log("Pass:", pass3, "\n");

  // Test 4: Multiple requested tasks
  const test4: Task[] = [
    { id: "A", deps: [] },
    { id: "B", deps: ["A"] },
    { id: "C", deps: [] },
    { id: "D", deps: ["C"] },
  ];
  const result4 = getTasksToRun(test4, ["B", "D"]);
  console.log("Test 4 - Multiple requested tasks:");
  console.log("Input: tasksToRun = ['B', 'D']");
  console.log("Expected: A before B, C before D");
  console.log("Got:", result4);
  const validOrders4 = [
    ["A", "B", "C", "D"],
    ["A", "C", "B", "D"],
    ["A", "C", "D", "B"],
    ["C", "A", "B", "D"],
    ["C", "A", "D", "B"],
    ["C", "D", "A", "B"],
  ];
  const pass4 = validOrders4.some(order => JSON.stringify(result4) === JSON.stringify(order));
  console.log("Pass:", pass4, "\n");

  // Test 5: Complex graph
  const test5: Task[] = [
    { id: "A", deps: [] },
    { id: "B", deps: [] },
    { id: "C", deps: ["A"] },
    { id: "D", deps: ["B"] },
    { id: "E", deps: ["C", "D"] },
    { id: "F", deps: ["E"] },
  ];
  const result5 = getTasksToRun(test5, ["F"]);
  console.log("Test 5 - Complex graph:");
  console.log("Input: tasksToRun = ['F']");
  console.log("Expected: A and B first, then C and D, then E, then F");
  console.log("Got:", result5);
  // Validate ordering constraints
  const indexA5 = result5.indexOf("A");
  const indexB5 = result5.indexOf("B");
  const indexC5 = result5.indexOf("C");
  const indexD5 = result5.indexOf("D");
  const indexE5 = result5.indexOf("E");
  const indexF5 = result5.indexOf("F");
  const pass5 =
    indexA5 < indexC5 &&
    indexB5 < indexD5 &&
    indexC5 < indexE5 &&
    indexD5 < indexE5 &&
    indexE5 < indexF5 &&
    result5.length === 6;
  console.log("Pass:", pass5, "\n");

  // Test 6: Task with no dependencies requested
  const test6: Task[] = [
    { id: "A", deps: [] },
    { id: "B", deps: [] },
    { id: "C", deps: ["A"] },
  ];
  const result6 = getTasksToRun(test6, ["A"]);
  console.log("Test 6 - No dependencies:");
  console.log("Input: tasksToRun = ['A']");
  console.log("Expected: ['A']");
  console.log("Got:", result6);
  console.log("Pass:", JSON.stringify(result6) === JSON.stringify(["A"]), "\n");

  // Test 7: Shared dependencies
  const test7: Task[] = [
    { id: "A", deps: [] },
    { id: "B", deps: ["A"] },
    { id: "C", deps: ["A"] },
    { id: "D", deps: ["B"] },
    { id: "E", deps: ["C"] },
  ];
  const result7 = getTasksToRun(test7, ["D", "E"]);
  console.log("Test 7 - Shared dependencies:");
  console.log("Input: tasksToRun = ['D', 'E']");
  console.log("Expected: A first, then B and C, then D and E");
  console.log("Got:", result7);
  // Check that all tasks are included and dependencies are respected
  const indexA7 = result7.indexOf("A");
  const indexB7 = result7.indexOf("B");
  const indexC7 = result7.indexOf("C");
  const indexD7 = result7.indexOf("D");
  const indexE7 = result7.indexOf("E");
  const pass7 =
    indexA7 < indexB7 &&
    indexA7 < indexC7 &&
    indexB7 < indexD7 &&
    indexC7 < indexE7 &&
    result7.length === 5;
  console.log("Pass:", pass7, "\n");
}

// Run tests
testGetTasksToRun();