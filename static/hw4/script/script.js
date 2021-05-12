const words = ["\"Consuetudo est altera natura\"", "\"Nota bene\"", "\"Nulla calamitas sola\"", "\"Per aspera ad astra\""];
const translations = ["\"Привычка - вторая натура\"", "\"Заметьте хорошо!\"", "\"Беда не приходит одна\"", "\"Через тернии к звёздам\""];
let words_cnt = 4;
let pCount = 0;
let asideCount = 0;
let class1 = "class1";
let class2 = "class2";

let createButton = document.getElementById("create");
let changeButton = document.getElementById("change");

function addTableRow() {
    let table = document.getElementById("myTable"),
        rowsCount = table.rows.length,
        newRowNumber = rowsCount + 1,
        newRow = table.insertRow(),
        newCell1 = newRow.insertCell(0),
        newCell2 = newRow.insertCell(1);

    if (newRowNumber % 2 === 0){
        newCell1.className = class1;
        newCell2.className = class1;
    }
    else{
        newCell1.className = class2;
        newCell2.className = class2;
    }

    newCell1.textContent = words[newRowNumber - 2];
    newCell2.textContent = translations[newRowNumber - 2];
}

function addTagText() {
    if (pCount > 3){
        return
    }
    let rand = document.getElementById("rand");
    let newP = document.createElement("p");
    if (pCount % 2 === 0){
        newP.innerHTML = "<p class=" + class1 + " id=" + pCount + ">" + "<u>n=" + pCount + "</u> <em>" + words[pCount] + "</em> " + translations[pCount] + "</p>";
    }
    else{
        newP.innerHTML = "<p class=" + class2 + " id=" + pCount + ">" + "<u>n=" + pCount + "</u> <em>" + words[pCount] + "</em> " + translations[pCount] + "</p>";
    }
    pCount += 1;
    rand.appendChild(newP);

}

function addAsideText() {
    if (asideCount > 3){
        return
    }
    let aside = document.getElementById("aside");
    let newOl = document.createElement("li");
    if (asideCount % 2 === 0){
        newOl.className = class1;
    }
    else{
        newOl.className = class2;
    }

    asideCount += 1;
    newOl.innerHTML = words[asideCount-1] + "<ul><li>" + translations[asideCount-1] + "</li></ul></p>";
    aside.appendChild(newOl);

}

createButton.onclick = function () {
    words_cnt -= 1;
    if (words_cnt === -1){
        alert("Фразы закончились");
    }
    if (words_cnt < 0){
        return
    }
    addTableRow();
    addTagText();
    addAsideText();
}

changeButton.onclick = function () {

}

