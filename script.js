
/* =========================================
   TASKFLOW - JAVASCRIPT
========================================= */

// 1. SELECT HTML ELEMENTS

const taskModal = document.getElementById("taskModal");
const taskForm = document.getElementById("taskForm");

const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskCategory = document.getElementById("taskCategory");
const taskPriority = document.getElementById("taskPriority");
const taskDate = document.getElementById("taskDate");

const modalTitle = document.getElementById("modalTitle");
const submitTaskBtn = document.getElementById("submitTaskBtn");

const headerAddBtn = document.getElementById("headerAddBtn");
const closeModalBtn = document.getElementById("closeModal");
const cancelModalBtn = document.getElementById("cancelModal");

const taskSearch = document.getElementById("taskSearch");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");


// 2. DATE HELPER FUNCTIONS

function getLocalDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

const today = getLocalDate();

document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });




// 3. SAMPLE TASKS

function createSampleTasks() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const afterTomorrow = new Date();
    afterTomorrow.setDate(afterTomorrow.getDate() + 2);

    return [
        {
            id: "sample-1",
            title: "Complete JavaScript Assignment",
            description: "Finish the final JavaScript practice exercises.",
            category: "Study",
            priority: "High",
            dueDate: today,
            completed: false,
            createdAt: Date.now() - 3000
        },
        {
            id: "sample-2",
            title: "Prepare Project Documentation",
            description: "Write the README and project documentation.",
            category: "Work",
            priority: "Medium",
            dueDate: getLocalDate(tomorrow),
            completed: false,
            createdAt: Date.now() - 2000
        },
        {
            id: "sample-3",
            title: "Organize Weekly Goals",
            description: "Plan tasks and personal goals for this week.",
            category: "Personal",
            priority: "Low",
            dueDate: getLocalDate(afterTomorrow),
            completed: true,
            createdAt: Date.now() - 1000
        }
    ];
}


// 4. LOAD TASKS FROM LOCAL STORAGE

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem("taskflow_tasks");

        if (savedTasks !== null) {
            const parsedTasks = JSON.parse(savedTasks);

            if (Array.isArray(parsedTasks)) {
                return parsedTasks;
            }
        }
    } catch (error) {
        console.error("Unable to load tasks:", error);
    }

    const samples = createSampleTasks();

    localStorage.setItem("taskflow_tasks", JSON.stringify(samples));

    return samples;
}

let tasks = loadTasks();

let editingTaskId = null;
let toastTimer = null;


// 5. SAVE TASKS

function saveTasks() {
    localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
}


// 6. SHOW NOTIFICATION

function showToast(message) {
    toastMessage.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


// 7. ESCAPE HTML TO PROTECT USER CONTENT

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}


// 8. OPEN TASK MODAL

function openModal(task = null) {
    taskForm.reset();

    editingTaskId = task ? task.id : null;

    if (task) {
        modalTitle.textContent = "Edit Task";
        submitTaskBtn.textContent = "Save Changes";

        taskTitle.value = task.title;
        taskDescription.value = task.description;
        taskCategory.value = task.category;
        taskPriority.value = task.priority;
        taskDate.value = task.dueDate;

    } else {
        modalTitle.textContent = "Create New Task";
        submitTaskBtn.textContent = "Create Task";

        taskDate.value = today;
    }

    taskModal.classList.add("show");
    document.body.style.overflow = "hidden";

    taskTitle.focus();
}


// 9. CLOSE TASK MODAL

function closeModal() {
    taskModal.classList.remove("show");
    document.body.style.overflow = "";

    taskForm.reset();

    editingTaskId = null;
}


// 10. ADD OR UPDATE TASK

taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const category = taskCategory.value;
    const priority = taskPriority.value;
    const dueDate = taskDate.value;

    // Form validation

    if (!title) {
        showToast("Please enter a task title.");
        taskTitle.focus();
        return;
    }

    if (!dueDate) {
        showToast("Please select a due date.");
        taskDate.focus();
        return;
    }

    const taskData = {
        title,
        description,
        category,
        priority,
        dueDate
    };

    if (editingTaskId) {

        const taskIndex = tasks.findIndex(
            task => task.id === editingTaskId
        );

        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                ...taskData
            };
        }

        showToast("Task updated successfully!");

    } else {

        const newTask = {
            id: typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : String(Date.now()) + Math.random().toString(16).slice(2),

            ...taskData,
            completed: false,
            createdAt: Date.now()
        };

        tasks.unshift(newTask);

        showToast("New task created successfully!");
    }

    saveTasks();
    closeModal();
    renderApp();
});


// 11. DELETE TASK

function deleteTask(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderApp();

    showToast("Task deleted successfully!");
}


// 12. MARK TASK AS COMPLETED

function toggleTask(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) return;

    task.completed = !task.completed;

    saveTasks();
    renderApp();

    showToast(
        task.completed
            ? "Congratulations! Task completed."
            : "Task marked as pending."
    );
}


// 13. EDIT TASK

function editTask(id) {
    const task = tasks.find(task => task.id === id);

    if (task) {
        openModal(task);
    }
}


// 14. CHECK OVERDUE TASKS

function isOverdue(task) {
    return !task.completed && task.dueDate < getLocalDate();
}


// 15. CREATE TASK HTML

function createTaskHTML(task) {

    const safeId = escapeHTML(task.id);

    const priorityClass = {
        High: "priority-high",
        Medium: "priority-medium",
        Low: "priority-low"
    }[task.priority] || "priority-medium";

    const description = task.description
        ? escapeHTML(task.description)
        : "No description provided.";

    const overdueLabel = isOverdue(task)
        ? '<span class="task-badge priority-high">Overdue</span>'
        : "";

    return `
        <article class="task-item ${task.completed ? "is-completed" : ""}">

            <input
                type="checkbox"
                class="task-check"
                data-action="toggle"
                data-id="${safeId}"
                ${task.completed ? "checked" : ""}
                aria-label="Mark task as completed"
            >

            <div class="task-info">
                <h3>${escapeHTML(task.title)}</h3>
                <p>${description}</p>
            </div>

            <div class="task-meta">
                <span class="task-badge category-badge">
                    ${escapeHTML(task.category)}
                </span>

                <span class="task-badge ${priorityClass}">
                    ${escapeHTML(task.priority)}
                </span>

                ${overdueLabel}

                <span class="task-date">
                    <i class="fa-regular fa-calendar"></i>
                    ${formatDate(task.dueDate)}
                </span>
            </div>

            <div class="task-actions">

                <button
                    class="action-btn"
                    data-action="edit"
                    data-id="${safeId}"
                    aria-label="Edit task"
                    title="Edit task"
                >
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button
                    class="action-btn delete"
                    data-action="delete"
                    data-id="${safeId}"
                    aria-label="Delete task"
                    title="Delete task"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>

        </article>
    `;
}


// 16. RENDER TASK LIST

function renderTaskList(containerId, taskArray, emptyTitle, emptyMessage) {

    const container = document.getElementById(containerId);

    if (!container) return;

    if (taskArray.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-clipboard-check"></i>
                <h3>${escapeHTML(emptyTitle)}</h3>
                <p>${escapeHTML(emptyMessage)}</p>
            </div>
        `;

        return;
    }

    container.innerHTML = taskArray
        .map(task => createTaskHTML(task))
        .join("");
}


// 17. UPDATE DASHBOARD STATISTICS

function updateStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    const overdue = tasks.filter(
        task => isOverdue(task)
    ).length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("totalTasks").textContent = total;

    document.getElementById("completedTasks").textContent = completed;

    document.getElementById("pendingTasks").textContent = pending;

    document.getElementById("overdueTasks").textContent = overdue;

    document.getElementById("progressPercentage").textContent =
        percentage + "%";

    document.getElementById("progressFill").style.width =
        percentage + "%";

    document.getElementById("progressCount").textContent =
        `${completed} of ${total} completed`;

    const message = total === 0
        ? "Let's get started!"
        : percentage === 100
            ? "Amazing! All tasks completed!"
            : "Keep going! You're making progress.";

    document.getElementById("progressMessage").textContent = message;


    // Analytics summary

    document.getElementById("analyticsTotal").textContent = total;

    document.getElementById("analyticsCompleted").textContent = completed;

    document.getElementById("analyticsPending").textContent = pending;

    document.getElementById("analyticsOverdue").textContent = overdue;


    // Donut chart

    document.getElementById("chartPercentage").textContent =
        percentage + "%";

    document.getElementById("donutChart").style.background = `
        conic-gradient(
            var(--green) ${percentage * 3.6}deg,
            #EEEFF4 ${percentage * 3.6}deg
        )
    `;
}


// 18. RENDER DASHBOARD

function renderDashboard() {

    const recentTasks = [...tasks]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 4);

    renderTaskList(
        "recentTaskList",
        recentTasks,
        "No tasks yet",
        "Click Add New Task to create your first task."
    );
}


// 19. SEARCH AND FILTER TASKS

function getFilteredTasks() {

    const searchValue = taskSearch.value
        .trim()
        .toLowerCase();

    const categoryValue = categoryFilter.value;
    const statusValue = statusFilter.value;

    return tasks.filter(task => {

        const matchesSearch =
            task.title.toLowerCase().includes(searchValue) ||
            task.description.toLowerCase().includes(searchValue);

        const matchesCategory =
            categoryValue === "all" ||
            task.category === categoryValue;

        const matchesStatus =
            statusValue === "all" ||
            (statusValue === "completed" && task.completed) ||
            (statusValue === "pending" && !task.completed);

        return matchesSearch && matchesCategory && matchesStatus;

    });
}


// 20. RENDER ALL TASKS

function renderAllTasks() {

    const filteredTasks = getFilteredTasks();

    renderTaskList(
        "allTaskList",
        filteredTasks,
        "No matching tasks",
        "Try changing your search or filters."
    );
}


// 21. RENDER TODAY'S TASKS

function renderTodayTasks() {

    const todayTasks = tasks.filter(
        task => task.dueDate === getLocalDate() && !task.completed
    );

    renderTaskList(
        "todayTaskList",
        todayTasks,
        "No tasks for today",
        "Enjoy your free time or add a new task."
    );
}


// 22. RENDER UPCOMING TASKS

function renderUpcomingTasks() {

    const upcomingTasks = tasks
        .filter(task => task.dueDate > getLocalDate() && !task.completed)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    renderTaskList(
        "upcomingTaskList",
        upcomingTasks,
        "Nothing upcoming",
        "You have no future tasks at the moment."
    );
}


// 23. RENDER COMPLETED TASKS

function renderCompletedTasks() {

    const completedTasks = tasks.filter(
        task => task.completed
    );

    renderTaskList(
        "completedTaskList",
        completedTasks,
        "No completed tasks",
        "Complete a task and it will appear here."
    );
}


// 24. RENDER COMPLETE APPLICATION

function renderApp() {

    updateStatistics();

    renderDashboard();

    renderAllTasks();

    renderTodayTasks();

    renderUpcomingTasks();

    renderCompletedTasks();
}


// 25. NAVIGATION BETWEEN PAGES

const pageTitles = {
    dashboard: "Dashboard",
    tasks: "My Tasks",
    today: "Today's Tasks",
    upcoming: "Upcoming Tasks",
    completed: "Completed Tasks",
    analytics: "Analytics"
};

function showPage(pageName) {

    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.remove("active");
    });

    const targetPage = document.getElementById(
        pageName + "Page"
    );

    if (!targetPage) return;

    targetPage.classList.add("active");

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.page === pageName
        );
    });

    document.getElementById("pageTitle").textContent =
        pageTitles[pageName];

    closeSidebar();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// 26. SIDEBAR NAVIGATION EVENTS

document.querySelectorAll(".nav-link").forEach(link => {

    link.addEventListener("click", function() {

        showPage(this.dataset.page);

    });

});


// 27. VIEW ALL BUTTON

document.querySelectorAll("[data-go]").forEach(button => {

    button.addEventListener("click", function() {

        showPage(this.dataset.go);

    });

});


// 28. SEARCH EVENT

taskSearch.addEventListener("input", renderAllTasks);


// 29. FILTER EVENTS

categoryFilter.addEventListener("change", renderAllTasks);

statusFilter.addEventListener("change", renderAllTasks);


// 30. OPEN MODAL BUTTONS

headerAddBtn.addEventListener("click", function() {
    openModal();
});

closeModalBtn.addEventListener("click", closeModal);

cancelModalBtn.addEventListener("click", closeModal);


// 31. CLOSE MODAL BY CLICKING OUTSIDE

taskModal.addEventListener("click", function(event) {

    if (event.target === taskModal) {
        closeModal();
    }

});


// 32. CLOSE MODAL WITH ESCAPE KEY

document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {
        closeModal();
        closeSidebar();
    }

});


// 33. TASK ACTION EVENTS

document.addEventListener("change", function(event) {

    const target = event.target;

    if (target.matches('[data-action="toggle"]')) {
        toggleTask(target.dataset.id);
    }

});

document.addEventListener("click", function(event) {

    const button = event.target.closest("[data-action]");

    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id;

    if (action === "edit") {
        editTask(id);
    }

    if (action === "delete") {
        deleteTask(id);
    }

});


// 34. MOBILE SIDEBAR

function openSidebar() {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("show");
    document.body.style.overflow = "";
}

menuToggle.addEventListener("click", openSidebar);

sidebarOverlay.addEventListener("click", closeSidebar);


// 35. INITIALIZE APPLICATION

renderApp();

console.log("TaskFlow application loaded successfully!");
console.log("Total tasks:", tasks.length);
