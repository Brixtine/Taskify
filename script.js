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
        
        const checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkBox.addEventListener("change", () => {
            li.classList.toggle("completed", checkBox.checked);
            updateTaskApp();
        });

        const span = document.createElement("span");
        span.classList.add("task-text");
        span.textContent = taskInput;
        span.addEventListener("dblclick", () => editTaskText(li, span));
        
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "X";
        deleteBtn.addEventListener("click", () => removeTask(li));

        li.append(checkBox, span, deleteBtn);
        taskList.appendChild(li);

        saveTasks();
        updateTaskApp();
    }
    //need pa ni palitan/analyze since dai pa na-encounter dati
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
    //need pa ni palitan/analyze since dai pa na-encounter dati
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

    if(body.classList.contains('darkmode')){
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    setTimeout( () => {
        icon.classList.remove('animated');
    }, 500)

    })