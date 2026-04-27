const taskinput = document.getElementById('task-input');
const tasklist = document.getElementById("task-list");
const filters = document.querySelectorAll(".filters button");
const themeToggle = document.getElementById("theme-toggle");

/* counters */
const totalEl = document.getElementById("total");
const activeEl = document.getElementById("active");
const doneEl = document.getElementById("done");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");

/* local storage */
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

/*save tasks */
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* les filtres  */
function getActiveFilter() {
    const activeBtn = document.querySelector(".filters .active");
    return activeBtn ? activeBtn.dataset.filter : "all";
}

/*  bar de progression  */
function updateProgress() {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;// tasks terminés

    let percentage = 0;
    if (total > 0) {
        percentage = Math.round((done / total) * 100);// pourcentage de progression
    }

    progressFill.style.width = `${percentage}%`;

    if (total === 0 || percentage === 0) {
        progressText.textContent = 'No tasks yet 😕';
    } else if (percentage === 100) {
        progressText.textContent = 'Perfect! All done 🎉 ';
    } else {
        progressText.textContent = `Nice progress  ${percentage}%`;
    }
}

/* COUNTER UPDATE */
function updateCounter() {
    totalEl.textContent = tasks.length;// total tasks
    activeEl.textContent = tasks.filter(t => !t.completed).length;// tasks actifs
    doneEl.textContent = tasks.filter(t => t.completed).length;// tasks terminés

    updateProgress();
}

function renderTasks(filter = "all") {
    tasklist.innerHTML = "";

    let filtered = tasks;

    if (filter === "active") {
        filtered = tasks.filter(t => !t.completed);// tasks actifs
    } else if (filter === "completed") {
        filtered = tasks.filter(t => t.completed);// tasks terminés
    }

    if (filtered.length === 0) {
        tasklist.innerHTML = "<p style='text-align:center; opacity:0.6;'>No tasks found</p>";// message si aucune tache trouvee
        updateCounter();
        return;
    }

    filtered.forEach(task => createTask(task));// creer les taches

    updateCounter();
}

/* CREATE TASK */
function createTask(task) {
    const li = document.createElement('li');

    li.innerHTML = `
        <input type="checkbox" ${task.completed ? 'checked' : ''}>
        <span>${task.text}</span>
        <div class="task-buttons">
            <button class="edit">✏️</button>
            <button class="delete">🗑️</button>
        </div>
    `;

    const checkbox = li.querySelector("input");
    const edit = li.querySelector(".edit");
    const del = li.querySelector(".delete");

    /* CHECKBOX FIX */
    checkbox.addEventListener("change", () => {
        task.completed = checkbox.checked; // mettre a jour le statut de la tache

        li.classList.toggle("completed", task.completed);// ajouter ou supprimer la classe "completed" en fonction du statut de la tache

        saveTasks();
        renderTasks(getActiveFilter());
        updateCounter();
    });

    /* EDIT FIX */
    edit.addEventListener("click", () => {
        if (!task.completed) {
            taskinput.value = task.text;// remplir le champ de saisie avec le texte de la tache a editer

            tasks = tasks.filter(t => t.id !== task.id);// supprimer la tache de la liste

            saveTasks();
            renderTasks(getActiveFilter());
            updateCounter();
        }
    });

    /* DELETE FIX */
    del.addEventListener("click", () => {
        tasks = tasks.filter(t => t.id !== task.id);// supprimer la tache de la liste

        saveTasks();
        renderTasks(getActiveFilter());// re-render les taches apres suppression
        updateCounter();
    });

    if (task.completed) {
        li.classList.add("completed");
    }

    tasklist.appendChild(li);
}

/* ADD TASK */
function addtask(e) {// ajouter une nouvelle tache
    e.preventDefault();

    const text = taskinput.value.trim();
    if (!text) return;

    tasks.unshift({// ajouter la nouvelle tache au debut de la liste
        id: Date.now(),// id unique basé sur le timestamp
        text,// texte de la tache
        completed: false // statut de la tache
    });

    saveTasks();
    renderTasks(getActiveFilter());
    updateCounter();

    taskinput.value = "";
    taskinput.focus();// remettre le focus sur le champ de saisie apres l'ajout d'une tache
}

/* EVENTS */
document.querySelector("form").addEventListener("submit", addtask);

filters.forEach(btn => {
    btn.addEventListener("click", () => {
        filters.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderTasks(btn.dataset.filter);
    });
});

/* THEME */
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.innerHTML = "☀️";
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    themeToggle.innerHTML = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
});

/* INIT */
renderTasks();
updateCounter();