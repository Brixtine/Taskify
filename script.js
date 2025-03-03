document.addEventListener("DOMContentLoaded", function() {
    const taskForm = document.getElementById("taskForm");
    const newTaskInput = document.getElementById("newTask");
    const taskList = document.getElementById("taskList");
    const totalTasks = document.getElementById("totalTasks");
    const completedTasks = document.getElementById("completedTasks");
    const deleteBtn = document.getElementById("deleteSelected");
    let editTask = null;

    function addTask(taskInput){
        if(!taskInput.trim()){
            window.alert("Task cannot be empty!");
            return;
        }
        if(isDuplicate(taskInput)){
            window.alert("Task already exists!");
            return;
        }
    
        const li = document.createElement("li");
        li.classList.add("task-item");
        li.draggable = true; // joseph added
    
        // Checkbox to mark as completed
        const checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkBox.addEventListener("change", () => {
            li.classList.toggle("completed", checkBox.checked);  // Toggle completed class
            updateTaskApp();
        });
    
        const span = document.createElement("span");
        span.classList.add("task-text");
        span.textContent = taskInput;
        //span.addEventListener("dblclick", () => editTaskText(li, span));
        taskList.addEventListener("dblclick", function (e) {
            if (e.target.classList.contains("task-text")) {
                editTaskText(e.target.closest(".task-item"), e.target);
            }
        });
        
    
        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        deleteBtn.addEventListener("click", () => removeTask(li));
    
        li.append(checkBox, span, deleteBtn);
        taskList.appendChild(li);
    
        saveTasks();
        updateTaskApp();
    }
    
    function isDuplicate(taskInput){
        return Array.from(document.querySelectorAll(".task-text")).some(task => task.textContent.toLowerCase() === taskInput.toLowerCase());
    }

    function updateTaskApp(){
        const tasks = document.querySelectorAll(".task-item");
        totalTasks.textContent = tasks.length;
        completedTasks.textContent = document.querySelectorAll(".task-item.completed").length;
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
        if (isDuplicate(newText)) { 
            //window.alert("Task already exists!");
            return;
        }

        span.textContent = newText;
        li.replaceChild(span, input);
        editTask = null;
        saveTasks();
    }
    
    function removeTask(task){
        if(editTask) return;
        const taskText = task.querySelector(".task-text").textContent;
        if(confirm(`Are you sure you want to delete "${taskText}"?`)){
            task.remove();
            saveTasks();
            updateTaskApp();
        }
    }

    deleteBtn.addEventListener("click", () => {
        const selectedTasks = document.querySelectorAll(".task-item input:checked");
        if(selectedTasks.length === 0) return;
        if(confirm(`Are you sure you want to delete ${selectedTasks.length} selected tasks?`)){
            selectedTasks.forEach(checkBox => checkBox.closest(".task-item").remove());
            saveTasks();
            updateTaskApp();
        }
    });

    function saveTasks(){
        const tasks = Array.from(document.querySelectorAll(".task-item")).map(task => ({
            text: task.querySelector(".task-text").textContent,
            completed: task.classList.contains("completed")
        }));
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function loadSavedTasks(){
        const tasks = JSON.parse(localStorage.getItem("tasks"))||[];
        tasks.forEach(task => {
            addTask(task.text);
            if(task.completed){
                const taskItem = document.querySelector(".task-item:last-child");
                taskItem.classList.add("completed");
                taskItem.querySelector("input").checked = true;
            }
        });
    }

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

    taskForm.addEventListener("submit", (e) =>{
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