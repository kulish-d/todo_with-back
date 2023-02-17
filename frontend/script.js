function main() {
    let taskList = [];
    let categorySwitcher = 'all';
    let currentNumberPage = 1;

    const TASKS_ON_PAGE = 5;
    const KEY_ENTER = 'Enter';
    const KEY_ESCAPE = 'Escape';
    const { _ } = window;

    const INPUT_LINE = document.querySelector('input');
    const INPUT_BUTTON = document.getElementById("add-button");
    const DELETE_COMPLETED_BUTTON = document.getElementById("delete-completed");
    const OUTPUT_DIV = document.getElementById("task-list");
    const INPUT_CHECKBOX = document.getElementById('select-all');
    const SWITCH_BUTTONS_DIV = document.getElementById('switchers');
    const ALL_TASKS_BUTTON = document.getElementById('all');
    const ACTIVE_TASKS_BUTTON = document.getElementById('active');
    const COMPLETED_TASKS_BUTTON = document.getElementById('completed');
    const PAGINATION_DIV_CONTAINER = document.getElementById('pagination');

    INPUT_LINE.focus();

    function textOnInputLineValidation(someInput) {
        return _.escape(someInput.value.replace(/\s+/g, ' ').trim());
    }

    function decreaseCurrentNumberPage() {
        if (Math.ceil(getCurrentTasks(taskList).length / TASKS_ON_PAGE) === currentNumberPage - 1) {
            currentNumberPage -= 1;
        }
        else {
            currentNumberPage = Math.ceil(getCurrentTasks(taskList).length / TASKS_ON_PAGE);
        }
    }

    function changeCurrentNumberPage() {
        if (Math.ceil(getCurrentTasks(taskList).length / TASKS_ON_PAGE) > currentNumberPage) {
            currentNumberPage = Math.ceil(getCurrentTasks(taskList).length / TASKS_ON_PAGE);
        }
    }

    function onPressEnterAddTask(event) {
        if(event.key === KEY_ENTER) {
            AddTask();
        }
    }

    function AddTask() {
        let taskText = textOnInputLineValidation(INPUT_LINE);
        if (taskText) {
            taskList.push({'id': Date.now(), 'text': taskText, 'isDone': false});
            changeCurrentNumberPage();
            renderFunction(); 
        }

        INPUT_LINE.value = "";
        INPUT_LINE.focus();
    }

    function changeStatusTask(event) {
        if (event.target.type === "checkbox") {
            let taskId = +event.target.dataset.id;
            taskList.forEach(task => {
                if (task.id === taskId){
                    task.isDone = !task.isDone;
                }
            })
            if (categorySwitcher != 'all') decreaseCurrentNumberPage();
        }
        renderFunction();
    }

    function deleteTask(event) {
        if (event.target.type === 'button') {
            let taskId = +event.target.dataset.id;
            taskList = taskList.filter(task => task.id !== taskId);
            decreaseCurrentNumberPage()
            renderFunction();
        }
    }

    function selectAllTasks(event) {
        if (event.target.type === "checkbox" && INPUT_CHECKBOX.checked) {
            taskList.forEach(task => task.isDone = INPUT_CHECKBOX.checked);
        }
        renderFunction();
    }

    function getCurrentTasks(array) {
            switch (categorySwitcher) {
                case 'all':
                    return array;
                case 'active':
                    return array.filter(task => !task.isDone);
                case 'completed':
                    return array.filter(task => task.isDone);
            }
    }

    function changeActualCategoryOfTasks(event) {
        if (event.target.type == 'button') {
            categorySwitcher = event.target.id;
            currentNumberPage = 1;
        }
        renderFunction();
    }

    function deleteDoneTasks() {
        taskList = taskList.filter(task => !task.isDone);
        decreaseCurrentNumberPage();
        renderFunction();
    }

    function editTask(event) {
        if (event.target.tagName === 'SPAN') {
            let taskId = +event.target.dataset.id;
            let currentSpan = document.querySelector(`span[data-id="${taskId}"]`);
            currentSpan.className = 'hidden';
            let currentInput = document.querySelectorAll(`input[data-id="${taskId}"]`)[1];
            currentInput.type = 'text';

            currentInput.focus();
            currentInput.selectionStart = currentInput.value.length;

            const checkButton = function(event) {
                if (event.key === KEY_ENTER) {
                    changeTextTask();
                }
                else if (event.key === KEY_ESCAPE) {
                    currentInput.removeEventListener("blur", changeTextTask);
                    renderFunction();
                }
            }

            const changeTextTask = function() {
                let text = textOnInputLineValidation(currentInput);
                if (text){
                taskList.forEach((task) => {
                    if (task.id === taskId) {
                        task.text = text
                    }
                })
                }
                renderFunction();
            }
            
            currentInput.addEventListener('keydown', checkButton);
            currentInput.addEventListener('blur', changeTextTask);

        }
    }

    function paginationButtonsRender(finalArray) {
        let buttonsCount = Math.ceil(finalArray.length / TASKS_ON_PAGE);
        let buttons = "";
        for (let i = 1; i <= buttonsCount; i++) {
            buttons += 
                `<button type="button" class='${(i === currentNumberPage) ? "btn btn-dark" : "btn btn-light"}' id='${i}'>${i}</button>`;
        }
        PAGINATION_DIV_CONTAINER.innerHTML = buttons;
    }

    function getNumberOfCurrentPage(event) {
        if (event.target.type === 'button') {
            currentNumberPage = +event.target.id;
            renderFunction();
        }
    }

    function getCurrentArray(arr) {
        return arr.slice((currentNumberPage-1)*TASKS_ON_PAGE, currentNumberPage*TASKS_ON_PAGE)
    }

    function drawCurrentTab() {
        switch(categorySwitcher) {
            case "all":
                ALL_TASKS_BUTTON.classList.add("btn-outline-primary", "btn-outline-dark");
                ACTIVE_TASKS_BUTTON.classList.remove("btn-outline-primary");
                COMPLETED_TASKS_BUTTON.classList.remove("btn-outline-primary");
                break;
            case "active":
                ALL_TASKS_BUTTON.classList.remove("btn-outline-primary");
                ACTIVE_TASKS_BUTTON.classList.add("btn-outline-primary");
                COMPLETED_TASKS_BUTTON.classList.remove("btn-outline-primary");
                break;
            case "completed":
                ALL_TASKS_BUTTON.classList.remove("btn-outline-primary");
                ACTIVE_TASKS_BUTTON.classList.remove("btn-outline-primary");
                COMPLETED_TASKS_BUTTON.classList.add("btn-outline-primary");
                break;
        }
    }

    function renderFunction() {
        let currentList = getCurrentTasks(taskList);
        paginationButtonsRender(currentList);
        let slicedList = getCurrentArray(currentList);

        let text = '';
        slicedList.forEach(task => {
            text += 
                `<div class="task">
                    <input type='checkbox' class="form-check-input" data-id='${task.id}' ${task.isDone ? 'checked' : ""}>
                    <span data-id='${task.id}'>${task.text}</span>
                    <input type='hidden' data-id='${task.id}' value='${task.text}'>
                    <button type='button' class="btn btn-outline-danger" data-id='${task.id}'>del</button>
                </div>`;
        })
        OUTPUT_DIV.innerHTML = text;

        ALL_TASKS_BUTTON.innerText = `ALL ${taskList.length}`;
        ACTIVE_TASKS_BUTTON.innerText = `ACTIVE ${taskList.filter(task => !task.isDone).length}`;
        COMPLETED_TASKS_BUTTON.innerText = `COMPLETED ${taskList.filter(task => task.isDone).length}`;

        drawCurrentTab();

        if (taskList.length) INPUT_CHECKBOX.checked = taskList.every(task => task.isDone)
    }

    OUTPUT_DIV.addEventListener('click', deleteTask);
    DELETE_COMPLETED_BUTTON.addEventListener('click', deleteDoneTasks);
    SWITCH_BUTTONS_DIV.addEventListener('click', changeActualCategoryOfTasks);
    PAGINATION_DIV_CONTAINER.addEventListener('click', getNumberOfCurrentPage);

    OUTPUT_DIV.addEventListener('dblclick', editTask);

    OUTPUT_DIV.addEventListener('change', changeStatusTask);
    INPUT_CHECKBOX.addEventListener('change', selectAllTasks);

    INPUT_LINE.addEventListener('keyup', onPressEnterAddTask);
    INPUT_BUTTON.addEventListener('click', AddTask)
}

main()