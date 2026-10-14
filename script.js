const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("tasks");

const tasks = [];

taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const taskInput = document.getElementById("taskInput");
  const taskDate = document.getElementById("taskDate");

  const taskName = taskInput.value.trim();
  const deadline = taskDate.value;

  if (taskName === "" || deadline === "") {
    return;
  }

  const task = {
    name: taskName,
    deadline: deadline,
  };

  tasks.push(task);

  displayTasks();

  taskForm.reset();
});

function displayTasks() {
  taskList.innerHTML = "";

  document.getElementById("totalTask").textContent = tasks.length;

  tasks.forEach(function (task) {
    const listItem = document.createElement("li");

    listItem.textContent = task.name + " - Deadline: " + task.deadline;

    taskList.appendChild(listItem);
  });
}
