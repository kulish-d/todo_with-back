function main() {
    let categorySwitcher = 'all';
    let SERVER_URL = 'http://127.0.0.1:8000/api/tasks/';
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

    function onPressEnterAddTask(event) {
        if(event.key === KEY_ENTER) {
            AddTask();
        }
    }

    function AddTask() {
        let taskText = textOnInputLineValidation(INPUT_LINE);
        if (taskText) {
            fetch(SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({'text': taskText, 'status': false})
            })
            // .then(res => res.ok ? probablyIncreaseCurrentNumberPage(): console.log('error'))
            .then(res => res.ok ? renderFunction(): console.log('error'))
            .finally(clearInput())
        }
    }

    function clearInput() {
        INPUT_LINE.value = "";
        INPUT_LINE.focus();
    }

    function deleteTask(event) {
        if (event.target.type === 'button') {
            fetch(`${SERVER_URL}${+event.target.dataset.id}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
            })
            .then(res => res.ok ? renderFunction(currentNumberPage, true): console.log('error'))
        }
    }

    function changeStatusTask(event) {
        if (event.target.type === "checkbox") {
            fetch(`${SERVER_URL}${+event.target.dataset.id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({'status': event.target.checked})
            })
            .then(renderFunction);
        }
    }

    function selectAllTasks(event) {
            try {
                fetch(`${SERVER_URL}check_all/`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                        },
                        body: JSON.stringify({'status': INPUT_CHECKBOX.checked})
                    })
                    
            .then(res => res.ok ? renderFunction(): console.log('error'))
            } catch(err) {alert(err)};
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
                    fetch(`${SERVER_URL}${taskId}/`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8'
                        },
                        body: JSON.stringify({'text': text})
                    })
                    .then(renderFunction);
                }
            }

            currentInput.addEventListener('keydown', checkButton);
            currentInput.addEventListener('blur', changeTextTask);
        }
    }

    function changeActualCategoryOfTasks(event) {
        if (event.target.type == 'button') {
            categorySwitcher = event.target.id;
        }
        renderFunction();
    }

    function deleteDoneTasks() {
        try {
            fetch(`${SERVER_URL}delete_all_checked/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            })
            .then(res => res.ok ? renderFunction(): console.log('error'))
        } catch (e) {alert(e)}
    }

    function paginationButtonsRender(serverData) {
        let buttons = "";
        for (let i = 1; i <= serverData; i++) {
            buttons += 
                `<button type="button" class='${(i === currentNumberPage) ? "btn btn-dark" : "btn btn-light"}' id='${i}'>${i}</button>`;
        }
        PAGINATION_DIV_CONTAINER.innerHTML = buttons;
    }

    function setNumberOfCurrentPage(event) {
        if (event.target.type === 'button') {
            currentNumberPage = +event.target.id;
            renderFunction(currentNumberPage);
        }
    }

    // function probablyIncreaseCurrentNumberPage() {

    //     fetch(`${SERVER_URL}?task_category=${categorySwitcher}&number_page=${currentNumberPage}`)

    //     .then((response) => {
    //         if (response.status === 200) {
    //             return response.json()
    //         }
    //         else {
    //             alert(response.status, response.statusText)
    //         }})
        
    //     .then(result => {
    //         if (result.pagination.has_next) currentNumberPage++;
    //     })
    //     console.log(currentNumberPage);
    // }

    function drawCurrentTab() {
        switch(categorySwitcher) {
            case "all":
                ALL_TASKS_BUTTON.classList.add("btn-outline-dark");
                ACTIVE_TASKS_BUTTON.classList.remove("btn-outline-dark");
                COMPLETED_TASKS_BUTTON.classList.remove("btn-outline-dark");
                break;
            case "active":
                ALL_TASKS_BUTTON.classList.remove("btn-outline-dark");
                ACTIVE_TASKS_BUTTON.classList.add("btn-outline-dark");
                COMPLETED_TASKS_BUTTON.classList.remove("btn-outline-dark");
                break;
            case "completed":
                ALL_TASKS_BUTTON.classList.remove("btn-outline-dark");
                ACTIVE_TASKS_BUTTON.classList.remove("btn-outline-dark");
                COMPLETED_TASKS_BUTTON.classList.add("btn-outline-dark");
                break;
        }
    }

    function drawTasks(someArray) {
        let text = '';
        someArray.forEach(task => {
            text += 
                `<div class="task">
                    <input type='checkbox' class="form-check-input" data-id='${task.id}' ${task.status ? 'checked' : ""}>
                    <span data-id='${task.id}'>${task.text}</span>
                    <input type='hidden' data-id='${task.id}' value='${task.text}'>
                    <button type='button' class="btn btn-outline-danger" data-id='${task.id}'>del</button>
                </div>`;
        })
        OUTPUT_DIV.innerHTML = text;
        return someArray;
    }

    function drawTabs(serverData) {
        ALL_TASKS_BUTTON.innerText = `ALL ${serverData.all_tasks_count}`;
        ACTIVE_TASKS_BUTTON.innerText = `ACTIVE ${serverData.active_tasks_count}`;
        COMPLETED_TASKS_BUTTON.innerText = `COMPLETED ${serverData.completed_tasks_count}`;
    }

    function checkAll(serverParam) {
        INPUT_CHECKBOX.checked = serverParam;
    }

    function renderFunction(page, flag) {

        fetch(`${SERVER_URL}?task_category=${categorySwitcher}&number_page=${page}`)

        .then((response) => {
            if (response.status === 200) {
                return response.json()
            }
            else {
                alert(response.status, response.statusText)
            }})
        
        .then(result => {
            console.log(result);
            if (!flag) currentNumberPage = result.pagination.page
            else if (currentNumberPage > result.pagination.count_pages) currentNumberPage--;
            drawTasks(result.data);
            checkAll(result.checkbox_all_status);
            drawTabs(result.tasks_data);
            drawCurrentTab();
            
            // changeCurrentNumberPage(result.pagination.count_elements);

            paginationButtonsRender(result.pagination.count_pages);

            
        })

    }

    document.addEventListener('DOMContentLoaded', renderFunction);

    OUTPUT_DIV.addEventListener('click', deleteTask);
    DELETE_COMPLETED_BUTTON.addEventListener('click', deleteDoneTasks);
    SWITCH_BUTTONS_DIV.addEventListener('click', changeActualCategoryOfTasks);
    PAGINATION_DIV_CONTAINER.addEventListener('click', setNumberOfCurrentPage);

    OUTPUT_DIV.addEventListener('dblclick', editTask);

    OUTPUT_DIV.addEventListener('change', changeStatusTask);
    INPUT_CHECKBOX.addEventListener('change', selectAllTasks);

    INPUT_LINE.addEventListener('keyup', onPressEnterAddTask);
    INPUT_BUTTON.addEventListener('click', AddTask)
}

main()