let sliders = document.getElementsByClassName("slider");
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
    for (let i = 0; i < sliders.length; i++) {
        pg[i].innerHTML = "50";
        vg[i].innerHTML = "50";
        sliders[i].addEventListener("input", getSliderVal);
        sliders[i].addEventListener("input", inputHandler);
    }
    for (let j = 0; j < inputs.length; j++) {
        inputs[j].addEventListener("focusout", fillCheck);
        inputs[j].addEventListener('focusout', inputHandler);
    }
    nicotineGroup.addEventListener("click", openGroup);
    diluentGroup.addEventListener("click", openGroup);
    mlTab.addEventListener("click", changeUnits);
    addFlavourBtn.addEventListener("click", addFlavour);
});

function getSliderVal() {
    let currentPg = this.parentNode.querySelector(".pg-value");
    let currentVg = this.parentNode.querySelector(".vg-value");

    currentPg.innerHTML = (100 - this.value);
    currentVg.innerHTML = this.value;
}

// Check the filling of the inputs
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
        case "diluent-amount":
            recipe["diluent-amount-ml"] = Math.round((totalAmount / 100) * this.value);
            break;
    }

    // Calculating flavour amount both in ml and percents
    if (this.id.match(/flavour.\d{1,2}.amount.ml$/)) {
        let keyName = this.id.slice(0, -3);
        recipe[keyName] = toPercents(parseFloat(this.value).toFixed(1));
    } else if (this.id.match(/flavour.\d{1,2}.amount$/)) {
        recipe[this.id+"_ml"] = parseFloat((totalAmount / 100) * this.value).toFixed(1);
    }

    calculateNicBase();
    calculateRecipe()
    writeResult();
}

// Open and close additives groups
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

// Show the hidden row in the result table that corresponds to opened group
function showHiddenResult(group) {
    let groupName = group.querySelector(".group-name").textContent.toLowerCase();
    let hiddenRows = document.querySelectorAll(`.${groupName}-table-row`);

    hiddenRows.forEach((elem) => {
        elem.style.display = "inherit";
    });
}

// Change units for flavours
function changeUnits() {
    changeTabStyle(this);
    let addedFlavours = document.querySelectorAll(".flavour-amount")

    for (let i=0; i < addedFlavours.length; i++) {
        let elem = addedFlavours[i];
        let elemClass = elem.classList;
        if (elemClass.contains("ml") == true) {
            elemClass.remove("ml");
            elemClass.add("percents");
            elem.id = `flavour_${i+1}_amount`;
            percentsTab.removeEventListener("click", changeUnits);
            mlTab.addEventListener("click", changeUnits);
        } else {
            elemClass.remove("percents");
            elemClass.add("ml");
            elem.id = `flavour_${i+1}_amount_ml`;
            mlTab.removeEventListener("click", changeUnits);
            percentsTab.addEventListener("click", changeUnits);
        }
    }
}

// Change appearence of the flavour unit switcher
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
    let units = null;
    
    // Insert cloned inputs, clear the values of these elements and assign ids
    flavoursList.insertBefore(newFlavourField, addFlavourBtn);  
    newFlavourName.value = "";
    newFlavourAmount.value = "0";
    newFlavourName.setAttribute("placeholder", `Flavour ${++counter}`);
    newFlavourName.setAttribute("id", `flavour_${counter}`);
    
    if (newFlavourAmount.classList.contains("ml")) {
        newFlavourAmount.setAttribute("id", `flavour_${counter}_amount_ml`);
        units = "ml";
    } else {
        newFlavourAmount.setAttribute("id", `flavour_${counter}_amount`);
        units = "percents";
    }
    
    // Add remove button to the each manually added flavour
    for (i = 1; i < rmFlavourBtn.length; i++) {
        rmFlavourBtn[i].style.visibility = "visible";
        rmFlavourBtn[i].addEventListener("click", removeBtn);
    }

    // Add eventlisteners for the flavour field
    newFlavourName.addEventListener("focusout", inputHandler);
    newFlavourAmount.addEventListener("focusout", inputHandler);

    addFlavourResult(newFlavourName.placeholder, newFlavourAmount.value, units, counter);
}

// Add new flavour to the result table
function addFlavourResult(name, amount, units, counter) {
    let resultTable = document.querySelector(".result-grid-table");
    let flavourName = document.createElement("div");
    let flavourAmountMl = document.createElement("div");
    let flavourAmount = document.createElement("div");
    let flavour = null;

    flavourName.classList.add("grid-item", "grid-row-name", `flavour_${counter}`);
    flavourAmount.classList.add("grid-item", "grid-amount-percents", `flavour_${counter}_amount`);
    flavourAmountMl.classList.add("grid-item", `flavour_${counter}_amount_ml`);
    flavourName.innerHTML = name;
    if (units === "ml") {
        flavourAmountMl.innerHTML = amount;
        flavourAmount.innerHTML = (toPercents(amount) ? toPercents(amount) : 0);
    } else {
        flavourAmountMl.innerHTML = (totalAmount / 100) * amount;
        flavourAmount.innerHTML = (toPercents(amount) ? toPercents(amount) : 0);
    }
    
    flavour = [flavourName, flavourAmount, flavourAmountMl];
    for (let i = 0; i < flavour.length; i++) {
        resultTable.appendChild(flavour[i]);
    }
}

// Remove selected flavour both in flavour group and result table
function removeBtn() {
    this.parentNode.remove();
    removeFlavourResult(this.nextElementSibling.id);
}

function removeFlavourResult(flavourNumber) {
    let resultTable = document.querySelectorAll(".grid-item");
    resultTable.forEach(function(el) {
        if (el.classList.contains(flavourNumber) || el.classList.contains(`${flavourNumber}_amount_ml`) || el.classList.contains(`${flavourNumber}_amount`)) {
            el.parentNode.removeChild(el);
        }
    });
    delete recipe[flavourNumber];
    delete recipe[flavourNumber + "_amount_ml"];
    delete recipe[flavourNumber + "_amount"];
}

// Calculate nicotine base amount
function calculateNicBase() {
    let baseNic = parseInt(recipe["base-strenght"], 10);
    let finalNic = parseInt(recipe["output-nicotine"], 10);
    let baseAmount = null;
    totalAmount = recipe["output-amount"];
    if (finalNic && baseNic && totalAmount) {
        baseAmount = (finalNic * totalAmount) / baseNic;
        recipe["base-amount-ml"] = parseInt(baseAmount, 10);
        recipe["base-amount"] = toPercents(baseAmount);
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
    let amountWithDiluent = null;
    let flavours = null;
    
    // Calculate required amount of PG and VG
    let outputPg = parseFloat(outputPgPercents * (totalAmount / 100)).toFixed(1);
    let outputVg = parseFloat(outputVgPercents * (totalAmount / 100)).toFixed(1);

    // Get overall volume of the flavours
    for (let i = 1; (`flavour_${i}_amount_ml` in recipe); i++) {
        flavours += parseFloat(recipe[`flavour_${i}_amount_ml`]);
    }

    if (diluent) {
        amountWithDiluent = totalAmount - diluent;
        outputPg = parseFloat(outputPgPercents * (amountWithDiluent / 100)).toFixed(1);
        outputVg = parseFloat(outputVgPercents * (amountWithDiluent / 100)).toFixed(1);
    }

    if (baseAmount) {
        // Calculate content of PG and VG in the base liquid
        let nicotinePg = parseFloat((baseAmount / 100) * nicotinePgPercents).toFixed(1);
        let nicotineVg = parseFloat((baseAmount / 100) * nicotineVgPercents).toFixed(1);

        // Calculate how much of additional PG and VG required
        let requiredPg = parseFloat(outputPg - nicotinePg - flavours).toFixed(1);
        let requiredVg = parseFloat(outputVg - nicotineVg).toFixed(1);
        
        recipe["required-pg-ml"] = requiredPg;
        recipe["required-vg-ml"] = requiredVg;
        recipe["required-pg"] = toPercents(requiredPg);
        recipe["required-vg"] = toPercents(requiredVg);
    } else {
        outputPg = flavours ? (outputPg -= flavours) : outputPg;
        recipe["required-pg-ml"] = parseFloat(outputPg).toFixed(1);
        recipe["required-vg-ml"] = parseFloat(outputVg).toFixed(1);
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
        }
    }
}

function toPercents(target) {
    let result = (target * 100) / totalAmount;
    return (!isNaN(result) && result > 0) ? parseInt(result, 10) : "0";
}