document.addEventListener("DOMContentLoaded", function() {
    const taskForm = document.getElementById("taskForm");
    const newTaskInput = document.getElementById("newTask");
    const taskList = document.getElementById("taskList");
    const totalTasks = document.getElementById("totalTasks");
    const completedTasks = document.getElementById("completedTasks");
    const deletedTasks = document.getElementById("deletedTasks");
    const editedTasks = document.getElementById("editedTasks");
    const deleteBtn = document.getElementById("deleteSelected");
    const sortBtn = document.getElementById("sort");
    const originalOrder = document.getElementById("resetSort");
    let editTask = null;
    let originalTaskOrder = [];
    let sortDirection = "asc";

    sortBtn.textContent = "Sort (A-Z)";

    sortBtn.addEventListener("click", () => {
        const tasks = Array.from(document.querySelectorAll(".task-item"));
        
        tasks.sort((a, b) => {
            const textA = a.querySelector(".task-text").textContent.toLowerCase();
            const textB = b.querySelector(".task-text").textContent.toLowerCase();
            return sortDirection === "asc" ? 
                textA.localeCompare(textB) : 
                textB.localeCompare(textA);
        });
        
        sortDirection = sortDirection === "asc" ? "desc" : "asc";
        sortBtn.textContent = sortDirection === "asc" ? "Sort (A-Z)" : "Sort (Z-A)";
        
        taskList.innerHTML = "";
        tasks.forEach(task => taskList.appendChild(task));
        
        saveTasks();
    });

    function addTask(taskInput, isCompleted = false) {
        if (!taskInput.trim()) {
            window.alert("Task cannot be empty!");
            return;
        }
        if (isDuplicate(taskInput)) {
            window.alert("Task already exists!");
            return;
        }
    
        const li = document.createElement("li");
        li.classList.add("task-item");
        li.draggable = true;
    
        const checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkBox.classList.add("multi-select");
    
        const completeBtn = document.createElement("button");
        completeBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        completeBtn.classList.add("complete-btn");
        completeBtn.addEventListener("click", () => {
            li.classList.toggle("completed");
            saveTasks();
            updateTaskApp();
        });
    
        const span = document.createElement("span");
        span.classList.add("task-text");
        span.textContent = taskInput;
    
        span.addEventListener("dblclick", () => editTaskText(li, span));

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        deleteBtn.addEventListener("click", () => removeTask(li));
    
        if (isCompleted) { 
            li.classList.add("completed");
        }
    
        li.append(checkBox, span, completeBtn, deleteBtn);
        taskList.appendChild(li);
    
        saveTasks();
        updateTaskApp();
    }
    
    function isDuplicate(taskInput){
        return Array.from(document.querySelectorAll(".task-text")).some(task => 
            task.textContent.toLowerCase() === taskInput.toLowerCase());
    }

    function updateTaskApp(){
        const tasks = document.querySelectorAll(".task-item");
        totalTasks.textContent = tasks.length;
        completedTasks.textContent = document.querySelectorAll(".task-item.completed").length;
        deletedTasks.textContent = localStorage.getItem("deletedCount") || 0;
        editedTasks.textContent = localStorage.getItem("editedCount") || 0;
    }
    
    function editTaskText(li, span){
        if(editTask) return;
        editTask = span;
        const input = document.createElement("input");
        input.type = "text";
        input.value = span.textContent;
        input.addEventListener("blur", () => saveEdit(li, span, input));
        input.addEventListener("keydown", (e) => {
            if(e.key === "Enter") saveEdit(li, span, input);
        });
        li.replaceChild(input, span);
        input.focus();
    }

    function saveEdit(li, span, input){
        const newText = input.value.trim();
        if(!newText){
            window.alert("Task cannot be empty!");
            li.replaceChild(span, input);
            editTask = null;
            return;
        }
        if (newText !== span.textContent && isDuplicate(newText)) { 
            window.alert("Task already exists!");
            li.replaceChild(span, input); 
            editTask = null;
            return;
        }

        span.textContent = newText;
        li.replaceChild(span, input);
        editTask = null;

        let editedCount = parseInt(localStorage.getItem("editedCount"))|| 0;
        localStorage.setItem("editedCount", editedCount + 1);

        saveTasks();
        updateTaskApp();
    }
    
    function removeTask(task){
        if(editTask) return;
        const taskText = task.querySelector(".task-text").textContent;
        if(confirm(`Are you sure you want to delete "${taskText}"?`)){
            task.remove();

            let deletedCount = parseInt(localStorage.getItem("deletedCount")) || 0;
            localStorage.setItem("deletedCount", deletedCount + 1);

            saveTasks();
            updateTaskApp();
        }
    }

    deleteBtn.addEventListener("click", () => {
        const selectedTasks = document.querySelectorAll(".task-item input:checked");
        if(selectedTasks.length === 0) return;
        if(confirm(`Are you sure you want to delete ${selectedTasks.length} selected tasks?`)){
            selectedTasks.forEach(checkBox => checkBox.closest(".task-item").remove());

            let deletedCount = parseInt(localStorage.getItem("deletedCount")) || 0;
            localStorage.setItem("deletedCount", deletedCount + selectedTasks.length);

            saveTasks();
            updateTaskApp();
        }
    });

    function saveTasks() {
        const tasks = Array.from(document.querySelectorAll(".task-item")).map(task => ({
            text: task.querySelector(".task-text").textContent,
            completed: task.classList.contains("completed")
        }));
        localStorage.setItem("tasks", JSON.stringify(tasks));
        
        if (!document.querySelector(".dragging")) {
            updateOriginalOrder();
        }
    }

    function updateOriginalOrder() {
        const currentTaskTexts = Array.from(document.querySelectorAll(".task-item"))
            .map(task => task.querySelector(".task-text").textContent);
        
        let storedOrder = JSON.parse(localStorage.getItem("initialOrder")) || [];
        
        const newTasks = currentTaskTexts.filter(task => !storedOrder.includes(task));
        storedOrder = [...storedOrder, ...newTasks]; 
        
        storedOrder = storedOrder.filter(task => currentTaskTexts.includes(task));
        
        localStorage.setItem("initialOrder", JSON.stringify(storedOrder));
        originalTaskOrder = [...storedOrder];
    }

    function loadSavedTasks() {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        
        tasks.forEach(task => {
            addTask(task.text, task.completed);
        });
        
        const initialOrder = tasks.map(task => task.text);
        localStorage.setItem("initialOrder", JSON.stringify(initialOrder));
        
        originalTaskOrder = [...initialOrder];
    }
    
    originalOrder.addEventListener("click", () => {
        const savedOrder = JSON.parse(localStorage.getItem("initialOrder")) || [];
        if (savedOrder.length === 0) return;
        
        const currentTasks = Array.from(document.querySelectorAll(".task-item"));
        const taskMap = {};
        
        currentTasks.forEach(task => {
            const text = task.querySelector(".task-text").textContent;
            taskMap[text] = task;
        });
        
        taskList.innerHTML = "";
        
        savedOrder.forEach(taskText => {
            if (taskMap[taskText]) {
                taskList.appendChild(taskMap[taskText]);
            }
        });
        
        updateTaskApp();
    });

    taskList.addEventListener("dragstart", (event) => {
        event.target.classList.add("dragging");
    });

    taskList.addEventListener("dragend", (event) => {
        event.target.classList.remove("dragging");
        saveTasks(); 
    });
    
    taskList.addEventListener("dragover", (event) => {
        event.preventDefault();
        const draggingItem = document.querySelector(".dragging");
        const afterElement = getDragAfterElement(taskList, event.clientY);
        if (afterElement == null) {
            taskList.appendChild(draggingItem);
        } else {
            taskList.insertBefore(draggingItem, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll(".task-item:not(.dragging)")];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    taskForm.addEventListener("submit", (e) => {
        e.preventDefault();
        addTask(newTaskInput.value);
        newTaskInput.value = "";
    });
    
    loadSavedTasks();
    updateTaskApp();
});


const body = document.querySelector('body');
const button = document.querySelector('.button');
const icon = document.querySelector('.button__icon');

function store(value){
    localStorage.setItem('darkmode', value);
}

function load(){
    const darkmode = localStorage.getItem('darkmode');

    if(!darkmode){
        store(false);
    } else if (darkmode == 'true'){
        body.classList.add('darkmode');
        icon.classList.add('fa-moon');
    }
}

load();

button.addEventListener('click', () => {
    body.classList.toggle('darkmode');
    icon.classList.add('animated');

    store(body.classList.contains('darkmode'));

    if (body.classList.contains('darkmode')) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    setTimeout(() => {
        icon.classList.remove('animated');
    }, 500);
});

// ignore this
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js")
        .then(() => console.log("Service Worker Registered"))
        .catch((err) => console.log("Service Worker Failed:", err));
}