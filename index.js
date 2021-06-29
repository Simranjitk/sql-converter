function downloadSample() {
    let prefix = "data:text/csv;charset=utf-8,";
    let header = "username,email,user_id,last_login";
    let csvContent = header + "\r\n";
    csvContent += "test1,test1@test.com,1,6/21/2021 13:01" + "\r\n";
    csvContent += "test2,test2@test.com,1,6/22/2021 13:01" + "\r\n";
    csvContent += "test3,test3@test.com,1,6/23/2021 13:01";

    var encodedUri = prefix + encodeURIComponent(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample.csv");
    document.body.appendChild(link);
    link.click();
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

$(".custom-file-input").on("change", function () {
    var fileName = $(this).val().split("\\").pop();
    $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
});

const form = document.getElementById('form');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    var tableName = document.getElementById("tableName").value;


    Papa.parse(document.getElementById('upload-csv').files[0], {
        download: true,
        header: true,
        complete: function (results) {
            var columns = results.meta.fields;
            var columnsJoined = columns.join();
            var rows = [];
            for (var j = 0; j < results.data.length; j++) {
                var currentRow = "";
                for (var i = 0; i < columns.length; i++) {
                    if (results.data[j][columns[i]]) {
                        currentRow += "'" + (results.data[j][columns[i]]) + "'" + ((i < columns.length - 1) ? "," : "");
                    } else {
                        currentRow += 'NULL' + ((i < columns.length - 1) ? "," : "");
                    }

                }
                rows.push(currentRow);
            }
            var batches = 10;
            var batchedRows = [];
            while (rows.length) {
                batchedRows.push(rows.splice(0, batches));
            }
            var batch;
            var sql = "";
            for(var i = 0; i < batchedRows.length; i++) {
                sql += "INSERT into " + tableName + " (" + columnsJoined + ") VALUES ";
                batch = "";
                for(var j = 0; j < batchedRows[i].length; j++) {
                    if(j == batchedRows[i].length - 1) {
                        batch += "(" + batchedRows[i][j] + ");";
                    } else {
                        batch += "(" + batchedRows[i][j] + "),";
                    }
                }
                sql += batch + "\r\n";
            }

            download('SQLGeneratorScripts_' + tableName + '.sql', sql);
        }
    });
});