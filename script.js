const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("tasks");
const searchInput = document.getElementById("searchInput");
const cancelEditButton = document.getElementById("cancelEdit");
let tasks = [];

try {
  const savedTasks = localStorage.getItem("studentTasks");
  tasks = savedTasks ? JSON.parse(savedTasks) : [];

  if (!Array.isArray(tasks)) {
    tasks = [];
  }
} catch (error) {
  console.error("Could not load saved tasks:", error);
  tasks = [];
}
let currentSort = "default";
let currentFilter = "all";
let editingIndex = null;

taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const taskInput = document.getElementById("taskInput");
  const taskDate = document.getElementById("taskDate");

  const taskName = taskInput.value.trim();
  const deadline = taskDate.value;
  const taskPriority = document.getElementById("taskPriority");
  const priority = taskPriority.value;

  if (taskName === "" || deadline === "") {
    return;
  }

  const task = {
    name: taskName,
    deadline: deadline,
    priority: priority,
    completed: false,
  };

  if (editingIndex === null) {
    // Add a new task
    tasks.push(task);
  } else {
    // Update an existing task
    tasks[editingIndex].name = taskName;
    tasks[editingIndex].deadline = deadline;
    tasks[editingIndex].priority = priority;

    editingIndex = null;
    taskForm.querySelector('[type="submit"]').textContent = "Add Task";
    cancelEditButton.hidden = true;
  }

  saveTasks();
  taskForm.reset();
  displayTasks();
});

cancelEditButton.addEventListener("click", function () {
  editingIndex = null;
  taskForm.reset();

  taskForm.querySelector('[type="submit"]').textContent = "Add Task";
  cancelEditButton.hidden = true;
});

function saveTasks() {
  localStorage.setItem("studentTasks", JSON.stringify(tasks));
}
function getDeadlineStatus(task) {
  if (task.completed) {
    return "Completed";
  }
  //get today's date in local time
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  //convert the task deadline into a local date
  const deadline = new Date(task.deadline + "T00:00:00");
  if (deadline < today) {
    return "Overdue";
  }
  if (deadline.getTime() === today.getTime()) {
    return "Due Today";
  }
  return "Upcoming";
}

function displayTasks() {
  taskList.innerHTML = "";

  const total = tasks.length;

  const completed = tasks.filter(function (task) {
    return task.completed;
  }).length;

  const pending = total - completed;

  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("totalTask").textContent = total;
  document.getElementById("pendingTask").textContent = pending;
  document.getElementById("completedTask").textContent = completed;
  document.getElementById("completionPercentage").textContent =
    percentage + "%";

  document.getElementById("progressBar").style.width = percentage + "%";

  const searchText = searchInput.value.trim().toLowerCase();

  const filteredTasks = tasks
    .map(function (task, index) {
      return { task: task, index: index };
    })
    .filter(function (item) {
      const matchesSearch = item.task.name.toLowerCase().includes(searchText);

      const matchesFilter =
        currentFilter === "all" ||
        (currentFilter === "pending" && !item.task.completed) ||
        (currentFilter === "completed" && item.task.completed);

      return matchesSearch && matchesFilter;
    })
    .sort(function (a, b) {
      if (currentSort === "deadline") {
        return a.task.deadline.localeCompare(b.task.deadline);
      }

      if (currentSort === "priority") {
        const priorityOrder = {
          high: 1,
          medium: 2,
          low: 3,
        };

        const priorityA = priorityOrder[a.task.priority?.toLowerCase()] ?? 4;

        const priorityB = priorityOrder[b.task.priority?.toLowerCase()] ?? 4;

        return priorityA - priorityB;
      }

      return a.index - b.index;
    });

  filteredTasks.forEach(function (item) {
    const task = item.task;
    const index = item.index;

    const listItem = document.createElement("li");

    const taskText = document.createElement("span");
    const status = getDeadlineStatus(task);
    taskText.textContent =
      task.name +
      " - Priority: " +
      (task.priority || "medium").toUpperCase() +
      " - Deadline: " +
      task.deadline +
      " - " +
      status;
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

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";

    editButton.addEventListener("click", function () {
      document.getElementById("taskInput").value = task.name;
      document.getElementById("taskDate").value = task.deadline;
      document.getElementById("taskPriority").value = task.priority || "medium";

      editingIndex = index;

      taskForm.querySelector('[type="submit"]').textContent = "Update Task";

      cancelEditButton.hidden = false;
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function () {
      tasks.splice(index, 1);
      saveTasks();
      displayTasks();
    });

    listItem.appendChild(taskText);
    listItem.appendChild(editButton);
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

searchInput.addEventListener("input", function () {
  displayTasks();
});

const sortTasks = document.getElementById("sortTasks");

sortTasks.addEventListener("change", function () {
  currentSort = sortTasks.value;
  displayTasks();
});

displayTasks();
