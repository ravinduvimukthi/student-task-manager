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

  tasks = tasks.map(function (task) {
    if (!task.id) {
      task.id = crypto.randomUUID();
    }

    return task;
  });

  localStorage.setItem("studentTasks", JSON.stringify(tasks));
} catch (error) {
  console.error("Could not load saved tasks:", error);
  tasks = [];
}

let currentSort = "default";
let currentFilter = "all";
let editingTaskId = null;

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
    id: crypto.randomUUID(),
    name: taskName,
    deadline: deadline,
    priority: priority,
    completed: false,
  };

  if (editingTaskId === null) {
    tasks.push(task);
  } else {
    const taskToUpdate = tasks.find(function (item) {
      return item.id === editingTaskId;
    });

    if (taskToUpdate) {
      taskToUpdate.name = taskName;
      taskToUpdate.deadline = deadline;
      taskToUpdate.priority = priority;
    }

    editingTaskId = null;
    taskForm.querySelector('[type="submit"]').textContent = "Add Task";
    cancelEditButton.hidden = true;
  }

  saveTasks();
  taskForm.reset();
  displayTasks();
});

cancelEditButton.addEventListener("click", function () {
  editingTaskId = null;
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

  if (filteredTasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-state";

    if (tasks.length === 0) {
      emptyMessage.textContent =
        "You haven't added any tasks yet. Add your first task to get started!";
    } else if (searchText !== "") {
      emptyMessage.textContent =
        "No tasks match your search. Try another keyword.";
    } else if (currentFilter === "pending") {
      emptyMessage.textContent = "No pending tasks found.";
    } else if (currentFilter === "completed") {
      emptyMessage.textContent = "No completed tasks yet.";
    } else {
      emptyMessage.textContent = "No tasks found.";
    }

    taskList.appendChild(emptyMessage);
    return;
  }

  filteredTasks.forEach(function (item) {
    const task = item.task;
    const index = item.index;

    const listItem = document.createElement("li");
    listItem.className = "task-card";

    const taskInfo = document.createElement("div");
    taskInfo.className = "task-info";

    const taskName = document.createElement("h3");
    taskName.className = "task-name";
    taskName.textContent = task.name;

    if (task.completed) {
      taskName.classList.add("completed-task");
    }

    const taskDetails = document.createElement("div");
    taskDetails.className = "task-details";

    const priorityBadge = document.createElement("span");
    const priority = (task.priority || "medium").toLowerCase();
    priorityBadge.className = "priority-badge priority-" + priority;
    priorityBadge.textContent = priority.toUpperCase();

    const deadlineText = document.createElement("span");
    deadlineText.className = "task-deadline";
    deadlineText.textContent = "Deadline: " + task.deadline;

    const statusBadge = document.createElement("span");
    const status = getDeadlineStatus(task);
    statusBadge.className =
      "status-badge status-" + status.toLowerCase().replaceAll(" ", "-");
    statusBadge.textContent = status;

    taskDetails.appendChild(priorityBadge);
    taskDetails.appendChild(deadlineText);
    taskDetails.appendChild(statusBadge);

    taskInfo.appendChild(taskName);
    taskInfo.appendChild(taskDetails);

    const taskActions = document.createElement("div");
    taskActions.className = "task-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-button";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", function () {
      document.getElementById("taskInput").value = task.name;
      document.getElementById("taskDate").value = task.deadline;
      document.getElementById("taskPriority").value = task.priority || "medium";

      editingTaskId = task.id;
      taskForm.querySelector('[type="submit"]').textContent = "Update Task";
      cancelEditButton.hidden = false;
    });

    const completeButton = document.createElement("button");
    completeButton.type = "button";
    completeButton.className = "complete-button";
    completeButton.textContent = task.completed ? "Undo" : "Complete";

    completeButton.addEventListener("click", function () {
      task.completed = !task.completed;
      saveTasks();
      displayTasks();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function () {
      tasks = tasks.filter(function (item) {
        return item.id !== task.id;
      });

      if (editingTaskId === task.id) {
        editingTaskId = null;
        taskForm.reset();
        taskForm.querySelector('[type="submit"]').textContent = "Add Task";
        cancelEditButton.hidden = true;
      }

      saveTasks();
      displayTasks();
    });

    taskActions.appendChild(editButton);
    taskActions.appendChild(completeButton);
    taskActions.appendChild(deleteButton);

    listItem.appendChild(taskInfo);
    listItem.appendChild(taskActions);
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
