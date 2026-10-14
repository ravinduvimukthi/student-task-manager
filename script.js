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
    completed: false,
  };

  tasks.push(task);

  displayTasks();

  taskForm.reset();
});

function displayTasks() {
  taskList.innerHTML = "";

  document.getElementById("totalTask").textContent = tasks.length;

  tasks.forEach(function (task, index) {
    const listItem = document.createElement("li");

    const taskText = document.createElement("span");
    taskText.textContent = task.name + " - Deadline: " + task.deadline;

    if (task.completed) {
      taskText.style.textDecoration = "line-through";
      taskText.style.color = "gray";
    }

    const completeButton = document.createElement("button");

    completeButton.textContent = task.completed ? "Undo" : "Complete";

    completeButton.addEventListener("click", function () {
      task.completed = !task.completed;
      displayTasks();
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function () {
      tasks.splice(index, 1);
      displayTasks();
    });

    listItem.appendChild(taskText);
    listItem.appendChild(completeButton);
    listItem.appendChild(deleteButton);

    taskList.appendChild(listItem);
  });
}
