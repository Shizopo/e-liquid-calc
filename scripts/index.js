let slider = document.getElementsByClassName("slider");
let pg = document.getElementsByClassName("pg-value");
let vg = document.getElementsByClassName("vg-value");
const nicotineGroup = document.getElementsByClassName("nicotine")[0];
const diluentGroup = document.getElementsByClassName("diluent")[0];
let inputs = document.getElementsByClassName("input");
let addFlavourBtn = document.querySelector(".add-flavour");
let rmFlavourBtn = document.getElementsByClassName("remove-flavour");
let percentsTab = document.querySelector("#percents-tab");
let mlTab = document.querySelector("#ml-tab");
let recipe = {
    "output-amount": 30,
    "output-pg": 50,
    "output-vg": 50,
    "nicotine-vg": 50,
    "nicotine-pg": 50,
};
let totalAmount = recipe["output-amount"];

window.addEventListener("DOMContentLoaded", () => {
    for (let i = 0; i < slider.length; i++) {
        pg[i].innerHTML = "50";
        vg[i].innerHTML = "50";
        slider[i].addEventListener("input", getSliderVal);
        slider[i].addEventListener("input", inputHandler);
    }
    for (let j = 0; j < inputs.length; j++) {
        inputs[j].addEventListener("focusout", fillCheck);
        inputs[j].addEventListener('focusout', inputHandler);
    }
    nicotineGroup.addEventListener("click", openGroup);
    diluentGroup.addEventListener("click", openGroup);
    percentsTab.addEventListener("click", changeUnits);
    addFlavourBtn.addEventListener("click", addFlavour);
});

function getSliderVal() {
    let currentPg = this.parentNode.querySelector(".pg-value");
    let currentVg = this.parentNode.querySelector(".vg-value");
    currentPg.innerHTML = (100 - this.value);
    currentVg.innerHTML = this.value;
}

function fillCheck() {
    if (this.value.trim() == '') {
        this.classList.remove("filled");
    } else {
        this.classList.add("filled");
    }
}

function inputHandler() {
    recipe[this.id] = this.value;
    switch (this.id) {
        case "output-vg":
            recipe["output-pg"] = Math.round(100 - this.value);
            break;
        case "nicotine-vg":
            recipe["nicotine-pg"] = Math.round(100 - this.value);
            break;
        case "diluent-amount-percents":
            recipe["diluent-amount-ml"] = Math.round((totalAmount / 100) * this.value);
            break;
    }

    // Calculating flavour amount both in ml and percents
    if (this.id.match(/flavour.\d{1,2}.amount$/)) {
        recipe[this.id+"_percents"] = toPercents(parseFloat(this.value).toFixed(2));
    } else if (this.id.match(/flavour.\d{1,2}.amount.percents$/)) {
        let keyName = this.id.slice(0, -9);
        recipe[keyName] = parseFloat((totalAmount / 100) * this.value).toFixed(2);;
    }

    calculateNicBase();
    calculateRecipe()
    writeResult();
}

function openGroup() {
    let toggleIcon = this.childNodes[1];
    let displayedItem = this.nextElementSibling;    
    toggleIcon.parentNode.classList.remove("inactive");
    toggleIcon.parentNode.classList.add("active");
    toggleIcon.innerHTML = "remove_circle_outline";
    displayedItem.style.display = "inherit";
    this.removeEventListener("click", openGroup);
    this.addEventListener("click", closeGroup);
    showHiddenResult(this);
}

function closeGroup() {
    let toggleIcon = this.childNodes[1];
    let displayedItem = this.nextElementSibling;
    toggleIcon.parentNode.classList.remove("active");
    toggleIcon.parentNode.classList.add("inactive");
    toggleIcon.innerHTML = "add_circle_outline";
    displayedItem.style.display = "none";
    this.removeEventListener("click", closeGroup);
    this.addEventListener("click", openGroup);
}

// Show the corresponding hidden row in the result table
function showHiddenResult(group) {
    let groupName = group.querySelector(".group-name").textContent.toLowerCase();
    let hiddenRows = document.querySelectorAll(`.${groupName}-table-row`);
    hiddenRows.forEach((elem) => {
        elem.style.display = "inherit";
    });
}

function changeUnits() {
    changeTabStyle(this);
    let addedFlavours = document.querySelectorAll(".flavour-amount")
    for (let i=0; i < addedFlavours.length; i++) {
        let elem = addedFlavours[i];
        let elemClass = elem.classList;
        if (elemClass.contains("ml") == true) {
            elemClass.remove("ml");
            elemClass.add("percents");
            elem.id = `flavour_${i+1}_amount_percents`;
            percentsTab.removeEventListener("click", changeUnits);
            mlTab.addEventListener("click", changeUnits);
        } else {
            elemClass.remove("percents");
            elemClass.add("ml");
            elem.id = `flavour_${i+1}_amount`;
            mlTab.removeEventListener("click", changeUnits);
            percentsTab.addEventListener("click", changeUnits);
        }
    }
}

function changeTabStyle(el) {
    let parent = el.parentNode;
    for (let i = 0; i < parent.children.length; i++) {
        parent.children[i].classList.remove("selected");
    }    
    el.classList.add("selected");
}

function addFlavour() {
    let origFlavourField = document.querySelectorAll(".flavour-field");
    let flavoursList = document.querySelector(".flavours-list");
    let newFlavourField = origFlavourField[origFlavourField.length-1].cloneNode(true);
    let newFlavourName = newFlavourField.querySelector(".flavour-name");
    let newFlavourAmount = newFlavourField.querySelector(".flavour-amount");
    let counter = origFlavourField[origFlavourField.length-1].querySelector(".flavour-name").id.slice(-1); // get the last added flavour index
    
    // Insert cloned inputs, clear the values of these elements and assign ids
    flavoursList.insertBefore(newFlavourField, addFlavourBtn);  
    newFlavourName.value = "";
    newFlavourAmount.value = "0";
    newFlavourName.setAttribute("placeholder", `Flavour ${++counter}`);
    newFlavourName.setAttribute("id", `flavour_${counter}`);
    newFlavourAmount.classList.contains("ml") ? newFlavourAmount.setAttribute("id", `flavour_${counter}_amount`) : newFlavourAmount.setAttribute("id", `flavour_${counter}_amount_percents`);
    
    // Add remove button to the each manually added flavour
    for (i = 1; i < rmFlavourBtn.length; i++) {
        rmFlavourBtn[i].style.visibility = "visible";
        rmFlavourBtn[i].addEventListener("click", removeBtn);
    }

    // Add eventlisteners for the flavour field
    newFlavourName.addEventListener("focusout", inputHandler);
    newFlavourAmount.addEventListener("focusout", inputHandler);

    addFlavourResult(newFlavourName.placeholder, newFlavourAmount.value, counter);
}

function removeBtn() {
    this.parentNode.remove();
    removeFlavourResult(this.nextElementSibling.id);
}

function removeFlavourResult(flavourNumber) {
    let resultTable = document.querySelectorAll(".grid-item");
    resultTable.forEach(function(el) {
        if (el.classList.contains(flavourNumber) || el.classList.contains(`${flavourNumber}_amount`) || el.classList.contains(`${flavourNumber}_amount_percents`)) {
            el.parentNode.removeChild(el);
        }
    });
    delete recipe[flavourNumber];
    delete recipe[flavourNumber + "_amount"];
    delete recipe[flavourNumber + "_amount_percents"];
}

function addFlavourResult(name, amount, counter) {
    let resultTable = document.querySelector(".result-grid-table");
    let flavourName = document.createElement("div");
    let flavourAmount = document.createElement("div");
    let flavourAmountPercents = document.createElement("div");

    flavourName.classList.add("grid-item", "grid-row-name", `flavour_${counter}`);
    flavourAmountPercents.classList.add("grid-item", "grid-amount-percents", `flavour_${counter}_amount_percents`);
    flavourAmount.classList.add("grid-item", `flavour_${counter}_amount`);
    flavourName.innerHTML = name;
    flavourAmountPercents.innerHTML = (toPercents(amount) ? toPercents(amount) : 0);
    flavourAmount.innerHTML = amount;
    
    let flavour = [flavourName, flavourAmountPercents, flavourAmount];
    for (let i = 0; i < flavour.length; i++) {
        resultTable.appendChild(flavour[i]);
    }
}

// Calculate nicotine base amount
function calculateNicBase() {
    let baseNic = parseInt(recipe["base-strenght"]);
    let finalNic = parseInt(recipe["output-nicotine"]);
    let baseAmount = null;
    totalAmount = recipe["output-amount"];
    if (finalNic && baseNic && totalAmount) {
        baseAmount = (finalNic * totalAmount) / baseNic;
        recipe["base-amount-ml"] = parseInt(baseAmount);
        recipe["base-amount-percents"] = toPercents(baseAmount);
        writeResult();
    }
}

function calculateRecipe() {
    let baseAmount = recipe["base-amount-ml"];
    let outputPgPercents = recipe["output-pg"];
    let outputVgPercents = recipe["output-vg"];
    let nicotinePgPercents = recipe["nicotine-pg"];
    let nicotineVgPercents = recipe["nicotine-vg"];
    let diluent = recipe["diluent-amount-ml"];
    let flavours = null;
    
    // Calculate required amount of PG and VG
    let outputPg = parseFloat(outputPgPercents * (totalAmount / 100)).toFixed(2);
    let outputVg = parseFloat(outputVgPercents * (totalAmount / 100)).toFixed(2);

    // Get overall volume of the flavours
    for (let i = 1; (`flavour_${i}_amount` in recipe); i++) {
        flavours += parseFloat(recipe[`flavour_${i}_amount`]);
    }

    if (diluent) {
        let amountWithDiluent = totalAmount - diluent;
        outputPg = parseFloat(outputPgPercents * (amountWithDiluent / 100)).toFixed(2);
        outputVg = parseFloat(outputVgPercents * (amountWithDiluent / 100)).toFixed(2);
    }

    if (baseAmount) {
        // Calculate content of PG and VG in the base liquid
        let nicotinePg = parseFloat((baseAmount / 100) * nicotinePgPercents).toFixed(2);
        let nicotineVg = parseFloat((baseAmount / 100) * nicotineVgPercents).toFixed(2);

        // Calculate how much of additional PG and VG required
        let requiredPg = parseFloat(outputPg - nicotinePg - flavours).toFixed(2);
        let requiredVg = parseFloat(outputVg - nicotineVg).toFixed(2);
        
        recipe["required-pg-ml"] = requiredPg;
        recipe["required-vg-ml"] = requiredVg;
        recipe["required-pg"] = toPercents(requiredPg);
        recipe["required-vg"] = toPercents(requiredVg);
    } else {
        outputPg -= flavours;
        recipe["required-pg-ml"] = parseInt(outputPg);
        recipe["required-vg-ml"] = parseFloat(outputVg);
        recipe["required-pg"] = toPercents(outputPg);
        recipe["required-vg"] = toPercents(outputVg);
    }
    writeResult();
}

// Write data to the result table
function writeResult() {
    let resultTable = document.querySelector("#result");
    for (const i in recipe) {
        let target = resultTable.querySelector("." + i);
        if (i in recipe && recipe[i] != "" && target != null) {
            target.innerHTML = recipe[i];
            // (parseInt(recipe[i]) < 0) ? target.style.color = "red" : target.style.color = "black";  // Change element color to red when its value is less then zero
        }
    }
}

function toPercents(target) {
    let result = Math.round((target * 100) / totalAmount);
    return (!isNaN(result)) ? result : 0;
}