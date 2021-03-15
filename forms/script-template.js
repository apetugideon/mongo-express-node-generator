const postOne = (formValues) => {
    { postFunction }(formValues, '/api/v1/{ tableNameLower }').then(response => {
        if (response.status) {
            alert(response.message);
            setTimeout(() => {
                window.location.href = '../../pages/{ tableNameLower }';
            }, 3000);
        }
    }).catch(error => logError(error));
}

const updateOne = (formValues) => {
    { putFunction }(formValues, `/api/v1/{ tableNameLower }/${formValues.id}`).then(response => {
        if (response.result.ok) {
            alert(response.message);
            setTimeout(() => {
                window.location.href = '../../pages/{ tableNameLower }';
            }, 3000);
        }
    }).catch(error => logError(error));
}

const submitForm = () => {
    { modelName }Form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formId = "{ modelName }Form";
        const [ valueWithFile, valueWithoutFile ] = extractFormData(formId);
        ({ formVlues }.id) ? updateOne({ formVlues }) : postOne({ formVlues });
    });
}

const deleteOne = (recId) => {
    if (confirm("Confirm Data Deletion ?")) {
        deleteData({}, `/api/v1/{ tableNameLower }/${recId}`).then(response => {
            if (response.result.ok) {
                setTimeout(() => document.querySelector(`#ug${recId}`).remove(), 0);
            }
        }).catch(error => logError(error));
    }
}

const fetchReports = (page=1, nameFilter="") => {
    let limit = 10;
    let nameFilterQuery = (nameFilter) ? `&names=${nameFilter}` : "";
    getData(`/api/v1/{ tableNameLower }?limit=${limit}&page=${page}${nameFilterQuery}`).then(response => {
        let { { tableNameLower }, currentPage, totalPages } = response;
        if ({ tableNameLower }.length) {
            paginator(currentPage, totalPages, "", nameFilter);
            let parentNode = document.querySelector("table tbody");
            parentNode.innerHTML = "";
            { tableNameLower }.forEach((item) => {
                let tabNode = new Table();
                { tdColumns }
                { rowLink };
                tabNode.tr.insertAdjacentHTML(
                    "beforeend", 
                    `<td class='repIcon'>
                        <a href="../../pages/{ tableNameLower }/create.html?{ tableNameSingular }=${item._id}">
                            <span class='mdi mdi-pencil-outline editIcon'></span>
                        </a>
                        <span onclick="deleteOne('${item._id}')" class='mdi mdi-delete delIcon'></span>
                    </td>`
                );
                tabNode.tr.id = `ug${item._id}`;
                parentNode.append(tabNode.tr);
            });
        }
    }).catch(error => logError(error));
}

const fetchOne = (recId) => {
    postData({}, `/api/v1/{ tableNameLower }/edit/${recId}`).then(response => {
        let { { tableNameLower } } = response;
        if (notEmptyArray({ tableNameLower })) {
            for(let field in { tableNameLower }) {
                if ({ modelName }Form.elements[field]) {
                    { modelName }Form.elements[field].value = { tableNameLower }[field];
                }
            }
            { modelName }Form.elements.id.value = recId;
        }
    }).catch(error => logError(error));
}

const initFormData = () => {
    postData({}, `/api/v1/{ tableNameLower }/create`).then(response => {
        { dropDownSelectString }
    }).catch(error => logError(error));
}

const postBatchOne = (formValues) => {
    { postFunction }({ batchValues }, '/api/v1/{ tableNameLower }').then(response => {
        if (response.status) {
            formValues.doUpload = false;
            let targetNode = document.querySelector(`#uploadData_${formValues.posId}`).querySelector(".repIcon .delIcon");
            targetNode.classList.replace("mdi-close", "mdi-checkbox-marked-circle");
            targetNode.classList.replace("delIcon", "passIcon");
        }
    }).catch(error => logError(error));
}

function processExcelFileUploaded(data) {
    let fieldArray = [{ uploadFields }];
    let { insertArray } = excelUploadDisplay(data, fieldArray);
    document.querySelector("#excelUploadButton").addEventListener('click', (event) => {
        if (insertArray.length > 0) {
            insertArray.forEach(inData => {
                if (inData.doUpload) {
                    postBatchOne(inData);
                }
            });
        }
    });

    document.querySelector("#excelUploadReset").addEventListener('click', (event) => {
        let targetNode = document.querySelectorAll("table tbody tr");
        let nodeCount = targetNode.length;
        for(let i=0; i < nodeCount; i++) {
            let currNode = targetNode[i];
            currNode.remove();
        }
        insertArray = null;
    });
}