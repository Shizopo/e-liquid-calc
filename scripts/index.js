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
let recipe = {};

window.addEventListener("DOMContentLoaded", () => {
    for (let i = 0; i < slider.length; i++) {
        pg[i].innerHTML = "50";
        vg[i].innerHTML = "50";
        slider[i].addEventListener("input", sliderVal);
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

function sliderVal() {
    let currentPosition = this.value;
    let currentPg = this.parentNode.querySelector(".pg-value");
    let currentVg = this.parentNode.querySelector(".vg-value");
    currentPg.innerHTML = (100 - currentPosition);
    currentVg.innerHTML = (currentPosition);
}

function fillCheck() {
    if (this.value.trim() == '') {
        this.classList.remove("filled");
    } else {
        this.classList.add("filled");
    }
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
    flavoursList.insertBefore(newFlavourField, addFlavourBtn);

    let newFlavourName = newFlavourField.querySelector(".flavour-name");
    newFlavourName.setAttribute("placeholder", `Flavour #${++flavourCounter}`);
    newFlavourName.id = newFlavourName.getAttribute("placeholder").toLowerCase();
    newFlavourName.addEventListener('focusout', inputHandler)

    for (i = 1; i < rmFlavourBtn.length; i++) {
        rmFlavourBtn[i].style.visibility = "visible";
        rmFlavourBtn[i].addEventListener("click", removeBtn);
    }
}

function removeBtn() {
    this.parentNode.remove();
}

function inputHandler() {
    recipe[this.id] = this.value;
    writeResult();
}

// Write data to the result table

function writeResult() {
    let result = document.querySelector(".result");
    for (const i in recipe) {
        let target = result.querySelector("."+i);
        if (recipe[i] != undefined && target != null) {
            target.innerHTML = recipe[i];
        }
    }
}