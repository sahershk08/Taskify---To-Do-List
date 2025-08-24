        class TodoApp {
            constructor() {
                this.tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
                this.currentFilter = 'all';
                this.init();
            }

            init() {
                this.bindEvents();
                this.render();
                this.updateStats();
            }

            bindEvents() {
                const taskInput = document.getElementById('taskInput');
                const addBtn = document.getElementById('addBtn');
                const filterBtns = document.querySelectorAll('.filter-btn');

                // Add task events
                addBtn.addEventListener('click', () => this.addTask());
                taskInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.addTask();
                });

                // Filter events
                filterBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        this.setFilter(e.target.dataset.filter);
                    });
                });
            }

            addTask() {
                const taskInput = document.getElementById('taskInput');
                const text = taskInput.value.trim();

                if (text === '') {
                    this.showNotification('Please enter a task!', 'error');
                    return;
                }

                const task = {
                    id: Date.now(),
                    text: text,
                    completed: false,
                    createdAt: new Date().toISOString()
                };

                this.tasks.unshift(task);
                this.saveTasks();
                this.render();
                this.updateStats();
                
                taskInput.value = '';
                this.showNotification('Task added successfully!', 'success');
            }

            toggleTask(id) {
                const task = this.tasks.find(t => t.id === id);
                if (task) {
                    task.completed = !task.completed;
                    this.saveTasks();
                    this.render();
                    this.updateStats();
                    
                    const message = task.completed ? 'Task completed! 🎉' : 'Task marked as pending';
                    this.showNotification(message, 'success');
                }
            }

            deleteTask(id) {
                if (confirm('Are you sure you want to delete this task?')) {
                    this.tasks = this.tasks.filter(t => t.id !== id);
                    this.saveTasks();
                    this.render();
                    this.updateStats();
                    this.showNotification('Task deleted', 'success');
                }
            }

            setFilter(filter) {
                this.currentFilter = filter;
                
                // Update active filter button
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
                
                this.render();
            }

            getFilteredTasks() {
                switch (this.currentFilter) {
                    case 'completed':
                        return this.tasks.filter(task => task.completed);
                    case 'pending':
                        return this.tasks.filter(task => !task.completed);
                    default:
                        return this.tasks;
                }
            }

            render() {
                const todoList = document.getElementById('todoList');
                const emptyState = document.getElementById('emptyState');
                const filteredTasks = this.getFilteredTasks();

                if (filteredTasks.length === 0) {
                    todoList.innerHTML = '';
                    todoList.appendChild(emptyState);
                    return;
                }

                todoList.innerHTML = '';
                
                filteredTasks.forEach(task => {
                    const taskElement = this.createTaskElement(task);
                    todoList.appendChild(taskElement);
                });
            }

            createTaskElement(task) {
                const div = document.createElement('div');
                div.className = `todo-item ${task.completed ? 'completed' : ''}`;
                
                div.innerHTML = `
                    <div class="todo-checkbox ${task.completed ? 'checked' : ''}" onclick="todoApp.toggleTask(${task.id})"></div>
                    <span class="todo-text ${task.completed ? 'completed' : ''}">${this.escapeHtml(task.text)}</span>
                    <button class="delete-btn" onclick="todoApp.deleteTask(${task.id})">Delete</button>
                `;

                return div;
            }

            updateStats() {
                const total = this.tasks.length;
                const completed = this.tasks.filter(t => t.completed).length;
                const pending = total - completed;

                document.getElementById('totalTasks').textContent = total;
                document.getElementById('completedTasks').textContent = completed;
                document.getElementById('pendingTasks').textContent = pending;
            }

            saveTasks() {
                localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
            }

            showNotification(message, type) {
                // Create notification element
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    background: ${type === 'error' ? '#ff4757' : '#2ed573'};
                    color: white;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    z-index: 1000;
                    animation: slideInRight 0.3s ease-out;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                `;
                notification.textContent = message;

                // Add animation keyframes
                if (!document.querySelector('#notification-styles')) {
                    const style = document.createElement('style');
                    style.id = 'notification-styles';
                    style.textContent = `
                        @keyframes slideInRight {
                            from { transform: translateX(100%); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
                        }
                        @keyframes slideOutRight {
                            from { transform: translateX(0); opacity: 1; }
                            to { transform: translateX(100%); opacity: 0; }
                        }
                    `;
                    document.head.appendChild(style);
                }

                document.body.appendChild(notification);

                // Remove notification after 3 seconds
                setTimeout(() => {
                    notification.style.animation = 'slideOutRight 0.3s ease-out';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 300);
                }, 3000);
            }

            escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
        }

        // Initialize the app
        const todoApp = new TodoApp();
        