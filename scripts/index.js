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
let flavourCounter = 1;
let recipe = {
    "output-amount": 0,
    "output-pg": 50,
    "output-vg": 50,
    "nicotine-vg": 0,
    "nicotine-pg": 0,
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
    if (this.id === "output-vg") {
        recipe["output-pg"] = 100 - this.value;
    } else if (this.id === "nicotine-vg") {
        recipe["nicotine-pg"] = 100 - this.value;
    }
    writeResult();
    calculateNicBase();
    calculateRecipe()
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

function changeUnits() {
    changeTabStyle(this);
    let addedFlavours = document.querySelectorAll(".flavour-amount")
    for (let i=0; i < addedFlavours.length; i++) {
        let currentClass = addedFlavours[i].classList;
        if (currentClass.contains("ml") == true) {
            currentClass.remove("ml");
            currentClass.add("percents");
            percentsTab.removeEventListener("click", changeUnits);
            mlTab.addEventListener("click", changeUnits);
        } else {
            currentClass.remove("percents");
            currentClass.add("ml");
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
    flavoursList.insertBefore(newFlavourField, addFlavourBtn);  // insert cloned input

    let newFlavourName = newFlavourField.querySelector(".flavour-name");
    let newFlavourAmount = newFlavourField.querySelector(".flavour-amount");
    newFlavourName.value = "";  // clean cloned input
    newFlavourName.setAttribute("placeholder", `Flavour ${++flavourCounter}`);
    newFlavourName.setAttribute("id", `flavour_${flavourCounter}`);
    newFlavourAmount.setAttribute("id", `flavour_${flavourCounter}_amount`);
    newFlavourAmount.value = "0";

    for (i = 1; i < rmFlavourBtn.length; i++) {
        rmFlavourBtn[i].style.visibility = "visible";
        rmFlavourBtn[i].addEventListener("click", removeBtn);
    }
    newFlavourName.addEventListener("focusout", inputHandler);
    newFlavourAmount.addEventListener("focusout", inputHandler);
    addFlavourResult(newFlavourName.placeholder, newFlavourAmount.value);
}

function removeBtn() {
    this.parentNode.remove();
}

function addFlavourResult(name, amount) {
    let resultTable = document.querySelector(".result-grid-table");
    let flavourName = document.createElement("div");
    let flavourAmount = document.createElement("div");
    let flavourAmountPercents = document.createElement("div");
    flavourName.classList.add("grid-item", "grid-row-name", `flavour_${flavourCounter}`);
    flavourAmountPercents.classList.add("grid-item", "grid-amount-percents", `flavour_${flavourCounter}_amount_percents`);
    flavourAmount.classList.add("grid-item", `flavour_${flavourCounter}_amount`);
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
    totalAmount = parseInt(recipe["output-amount"]);
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
    let flavours = null;
    
    // Calculate required amount of PG and VG
    let outputPg = parseInt(outputPgPercents * (totalAmount / 100));
    let outputVg = parseInt(outputVgPercents * (totalAmount / 100));

    // Get overall volume of the flavours
    for (let i = 1; (recipe[`flavour_${i}_amount`]); i++) {
        flavours += (parseInt(recipe[`flavour_${i}_amount`]));
    }

    if (baseAmount) {
        // Calculate content of PG and VG in the base liquid
        let nicotinePg = parseInt((baseAmount / 100) * nicotinePgPercents + flavours);
        let nicotineVg = parseInt((baseAmount / 100) * nicotineVgPercents);

        // Calculate how much of additional PG and VG required
        let requiredPg = parseInt(outputPg - nicotinePg);
        let requiredVg = parseInt(outputVg - nicotineVg);
        
        recipe["required-pg-ml"] = requiredPg;
        recipe["required-vg-ml"] = requiredVg;
        recipe["required-pg"] = toPercents(requiredPg);
        recipe["required-vg"] = toPercents(requiredVg);
    } else {
        recipe["required-pg-ml"] = outputPg;
        recipe["required-vg-ml"] = outputVg;
        recipe["required-pg"] = toPercents(outputPg);
        recipe["required-vg"] = toPercents(outputVg);
    }
    writeResult();
}

// Write data to the result table
function writeResult() {
    let resultTable = document.querySelector(".result");
    for (const i in recipe) {
        let target = resultTable.querySelector("." + i);
        if (i in recipe && recipe[i] != "" && target != null) {
            target.innerHTML = recipe[i];
        }
    }
}

function toPercents(target) {
    let result = parseInt(target * 100 / totalAmount);
    return (!isNaN(result)) ? result : 0;
}