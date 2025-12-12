interface Task {

id: string;

deps: string[];

}

  

/*

web:deploy ------------------------------

| | |

v | v

web:test | web-client:test

| | |

v | v

web:build <------- web-client:build

*/

const allTasks: Task[] = [

{

id: "web:build",

deps: [],

},

{

id: "web:test",

deps: ["web:build"],

},

{

id: "web:deploy",

//id: "web:deploy",

// web test > web: build >

// "web:build

//"web-client:test

deps: ["web:test", "web:build", "web-client:test"],

},

{

id: "web-client:build",

deps: [],

},

{

id: "web-client:test",

deps: ["web-client:build"],

},

]

  

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

  

function getTasksToRun(allTasks: Task[], tasksToRun: string[]): string[] {

const output: string[] = [];

  

function recurse(allTasks: Task[], singleTask: string, output: string[]){

  

const taskObj = allTasks.find((task)=>task.id === singleTask);

if(!taskObj) return

  
  
  

for(const task of taskObj.deps){

recurse(allTasks, task, output)

}

  

if(taskObj){

output.push(taskObj.id);

}

}

  
  

// web: test

  

for(const task of tasksToRun){

recurse(allTasks, task, output)

}

  
  

return output;

}

  

//console.log(getTasksToRun(allTasks, ["web:test"])) // ["web:build", "web:test"]

console.log(getTasksToRun(allTasks, ["web:test", "web:build"])) // ["web:build", "web:test"]

  
  

//if(taskObj?.deps.length === 0){

// recurse(allTasks, taskObj.id, output);

//}
