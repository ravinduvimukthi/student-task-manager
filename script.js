const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("tasks");

let tasks = JSON.parse(localStorage.getItem("studentTasks")) || [];

let currentFilter = "all";

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
  saveTasks();
  displayTasks();

  taskForm.reset();
});

function saveTasks() {
  localStorage.setItem("studentTasks", JSON.stringify(tasks));
}

function displayTasks() {
  taskList.innerHTML = "";

  document.getElementById("totalTask").textContent = tasks.length;

  const filteredTasks = tasks
    .map(function (task, index) {
      return { task: task, index: index };
    })
    .filter(function (item) {
      if (currentFilter === "pending") {
        return !item.task.completed;
      }

      if (currentFilter === "completed") {
        return item.task.completed;
      }

      return true;
    });

  filteredTasks.forEach(function (item) {
    const task = item.task;
    const index = item.index;

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
      saveTasks();
      displayTasks();
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function () {
      tasks.splice(index, 1);
      saveTasks();
      displayTasks();
    });

    listItem.appendChild(taskText);
    listItem.appendChild(completeButton);
    listItem.appendChild(deleteButton);

    taskList.appendChild(listItem);
  });
}

const filterButtons = document.querySelectorAll("[data-filter]");

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;
    displayTasks();
  });
});
