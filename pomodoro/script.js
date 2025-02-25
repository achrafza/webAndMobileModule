document.addEventListener('DOMContentLoaded', () => {
    // Constants
    const WORK_TIME = 25 * 60;
    const SHORT_BREAK = 5 * 60;
    const LONG_BREAK = 15 * 60;
    const POMODOROS_UNTIL_LONG_BREAK = 4;

    // DOM Elements
    const timeDisplay = document.querySelector('.time-display');
    const startButton = document.getElementById('start');
    const resetButton = document.getElementById('reset');
    const sessionType = document.querySelector('.session-type');
    const sessionsCount = document.getElementById('sessions-count');
    const progressRing = document.querySelector('.progress-ring-circle');
    const taskInput = document.getElementById('task-input');
    const addTaskButton = document.getElementById('add-task');
    const taskList = document.getElementById('task-list');

    // Variables
    let timeLeft = WORK_TIME;
    let isRunning = false;
    let timer = null;
    let currentSession = 'work';
    let pomodorosCompleted = 0;

    // Calculate progress ring properties
    const radius = progressRing.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
    progressRing.style.strokeDashoffset = circumference;

    // Request notification permission
    if ("Notification" in window) {
        Notification.requestPermission();
    }

    // Timer Functions
    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update progress ring
        const progress = timeLeft / (currentSession === 'work' ? WORK_TIME : 
                                  currentSession === 'shortBreak' ? SHORT_BREAK : LONG_BREAK);
        const offset = circumference - (progress * circumference);
        progressRing.style.strokeDashoffset = offset;
    }

    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            startButton.textContent = 'Pause';
            timer = setInterval(() => {
                timeLeft--;
                updateDisplay();
                if (timeLeft === 0) {
                    handleSessionComplete();
                }
            }, 1000);
        } else {
            isRunning = false;
            startButton.textContent = 'Start';
            clearInterval(timer);
        }
    }

    function resetTimer() {
        clearInterval(timer);
        isRunning = false;
        startButton.textContent = 'Start';
        currentSession = 'work';
        timeLeft = WORK_TIME;
        sessionType.textContent = 'Work Session';
        updateDisplay();
    }

    function handleSessionComplete() {
        clearInterval(timer);
        isRunning = false;
        startButton.textContent = 'Start';

        // Show notification
        if (Notification.permission === "granted") {
            new Notification("Pomodoro Timer", {
                body: currentSession === 'work' ? "Time for a break!" : "Break is over!"
            });
        }

        if (currentSession === 'work') {
            pomodorosCompleted++;
            sessionsCount.textContent = pomodorosCompleted;
            
            if (pomodorosCompleted % POMODOROS_UNTIL_LONG_BREAK === 0) {
                currentSession = 'longBreak';
                timeLeft = LONG_BREAK;
                sessionType.textContent = 'Long Break';
            } else {
                currentSession = 'shortBreak';
                timeLeft = SHORT_BREAK;
                sessionType.textContent = 'Short Break';
            }
        } else {
            currentSession = 'work';
            timeLeft = WORK_TIME;
            sessionType.textContent = 'Work Session';
        }
        updateDisplay();
    }

    // Task Management Functions
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText) {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <div class="task-checkbox"></div>
                <span class="task-text">${taskText}</span>
                <button class="delete-task">×</button>
            `;
            taskList.appendChild(taskItem);
            taskInput.value = '';

            // Save tasks to local storage
            saveTasks();
        }
    }

    function toggleTask(taskItem) {
        taskItem.classList.toggle('completed');
        saveTasks();
    }

    function deleteTask(taskItem) {
        taskItem.remove();
        saveTasks();
    }

    function saveTasks() {
        const tasks = Array.from(taskList.children).map(task => ({
            text: task.querySelector('.task-text').textContent,
            completed: task.classList.contains('completed')
        }));
        localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('pomodoroTasks')) || [];
        tasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.innerHTML = `
                <div class="task-checkbox"></div>
                <span class="task-text">${task.text}</span>
                <button class="delete-task">×</button>
            `;
            taskList.appendChild(taskItem);
        });
    }

    // Event Listeners
    startButton.addEventListener('click', startTimer);
    resetButton.addEventListener('click', resetTimer);
    addTaskButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    taskList.addEventListener('click', (e) => {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;

        if (e.target.classList.contains('task-checkbox')) {
            toggleTask(taskItem);
        } else if (e.target.classList.contains('delete-task')) {
            deleteTask(taskItem);
        }
    });

    // Initialize
    updateDisplay();
    loadTasks();
});