let data = {}
let stringifitedData = "";

window.addEventListener('beforeunload', function(e) {
	// Cancel the event
	e.preventDefault();
	// Chrome requires returnValue to be set
	e.returnValue = '';

	// Prompt the confirmation dialog
	var confirmationMessage = 'Are you sure you want to leave this page?';
	(e || window.event).returnValue = confirmationMessage; // Cross-browser support

	// Return the confirmation message
	return confirmationMessage;
});

function removeButtonClickHandler(event) {
	var category = event.target.getAttribute("data-category");
	var assignmentName = event.target.getAttribute("data-assignment");
	removeAssignment(category, assignmentName);
}

function removeCategoryButtonClickHandler(event) {
	var category = event.target.getAttribute("data-category");
	removeCategory(category);
}

function removeCategory(category) {
	delete data[category];
	populateNest();
	updateCategoryDropdown();
}

function populateNest() {

	var categoryContainer = document.getElementById("categoryContainer");
	categoryContainer.innerHTML = ""; // Clear previous content

	for (var category in data) {
		var categoryElement = document.createElement("div");
		categoryElement.classList.add("category");

		var categoryNameElement = document.createElement("h3");
		categoryNameElement.textContent = category + " (" + data[category]["weight"] * 100 + "%)";
		categoryElement.classList.add("boxed")

		var removeCategoryButtonElement = document.createElement("button");
		removeCategoryButtonElement.textContent = "Remove Category";
		removeCategoryButtonElement.classList.add("remove-category-button");
		removeCategoryButtonElement.setAttribute("data-category", category);
		removeCategoryButtonElement.addEventListener("click", removeCategoryButtonClickHandler);

		categoryElement.appendChild(removeCategoryButtonElement);


		categoryElement.appendChild(categoryNameElement);

		var assignmentsContainer = document.createElement("ul");
		assignmentsContainer.classList.add("assignments");

		var assignments = data[category]["assignments"];
		for (var assignmentName in assignments) {
			var assignment = assignments[assignmentName];
			var assignmentElement = document.createElement("li");

			var assignmentNameElement = document.createElement("span");
			assignmentNameElement.textContent = assignmentName + " ";
			assignmentElement.appendChild(assignmentNameElement);

			var scoreElement = document.createElement("span");
			scoreElement.textContent = assignment.score;
			assignmentElement.appendChild(scoreElement);

			var maxScoreElement = document.createElement("span");
			maxScoreElement.textContent = "/" + assignment.maxScore;
			assignmentElement.appendChild(maxScoreElement);

			var percentScoreElement = document.createElement("span");
			percentScoreElement.textContent = " || " + assignment.percentScore.toFixed(2) + "%";
			assignmentElement.appendChild(percentScoreElement);

			var removeButtonElement = document.createElement("button");
			removeButtonElement.textContent = "Remove";
			removeButtonElement.classList.add("remove-button");
			removeButtonElement.setAttribute("data-category", category);
			removeButtonElement.setAttribute("data-assignment", assignmentName);
			removeButtonElement.addEventListener("click", removeButtonClickHandler);
			assignmentElement.appendChild(removeButtonElement);


			assignmentElement.classList.add('assignment-list')
			assignmentsContainer.appendChild(assignmentElement);
		}

		categoryElement.appendChild(assignmentsContainer);
		categoryContainer.appendChild(categoryElement);
	}
	calculateGrade();
	updateJString();
}


// Call the function to populate the table 

function updateJString() {
	stringifitedData = JSON.stringify(data);
}
function importJString() {
	var jsonImport = document.getElementById("jsonImport").value;
	data = JSON.parse(jsonImport);
	populateNest();
	updateCategoryDropdown();

}

function removeAssignment(category, assignmentName) {
	delete data[category]["assignments"][assignmentName];
	populateNest();
}

function updateCategoryDropdown() {
	var categoryDropdown = document.getElementById("categoryDropdown");
	categoryDropdown.innerHTML = "";

	for (var category in data) {
		var option = document.createElement('option');
		option.value = category;
		option.textContent = category;
		categoryDropdown.appendChild(option);
	}

}


function copyJsonExport() {

	navigator.clipboard.writeText(stringifitedData);
	alert("Copied!");
}
function addCategory() {
	const categoryName = document.getElementById('categoryName');
	const categoryWeight = parseFloat(document.getElementById('categoryWeight').value) / 100;
	data[categoryName.value] = {};
	data[categoryName.value]["weight"] = categoryWeight;
	data[categoryName.value]["assignments"] = {};
	populateNest();
	updateCategoryDropdown();



}

function calculateGrade() {
	var categoryContainer = document.getElementById("final-grade");
	categoryContainer.innerHTML = ""; // Clear previous content

	var scoredPoints = 0
	var maxPoints = 0
	for (var category in data) {
		for (var assignmentName in data[category]["assignments"]) {
			let assignment = data[category]["assignments"][assignmentName]
			scoredPoints += assignment.score * data[category].weight
			maxPoints += assignment.maxScore * data[category].weight

		}
	}
	var gradeElement = document.createElement("p");
	var pointGrade = (scoredPoints / maxPoints) * 100;
	var letterConversion = {
		"F": [0, 59.99],
		"D-": [60, 62.99],
		"D": [63, 66.99],
		"D+": [67, 69.99],
		"C-": [70, 72.99],
		"C": [73, 76.99],
		"C+": [77, 79.99],
		"B-": [80, 82.99],
		"B": [83, 86.99],
		"B+": [87, 89.99],
		"A-": [90, 92.99],
		"A": [93, 99.99],
	}
	let letterGrade;

	for (let letter in letterConversion) {
		if (pointGrade >= letterConversion[letter][0] &&
			pointGrade <= letterConversion[letter][1]) {
			letterGrade = letter;
			break;
		}
	}
	if (pointGrade >= 100) letterGrade = "A+";
	gradeElement.textContent = pointGrade.toFixed(2) + "% " + letterGrade;


	categoryContainer.appendChild(gradeElement);
}


function addAssignment() {
	const assignmentName = document.getElementById('assignmentName');
	const assignmentScore = document.getElementById('assignmentScore');
	const assignmentMaxScore = document.getElementById('assignmentMaxScore')
	const categoryDropdown = document.getElementById('categoryDropdown');


	const score = parseFloat(assignmentScore.value);
	const maxScore = parseFloat(assignmentMaxScore.value);

	data[categoryDropdown.value]["assignments"][assignmentName.value] = {};
	data[categoryDropdown.value]["assignments"][assignmentName.value]["score"] = score;
	data[categoryDropdown.value]["assignments"][assignmentName.value]["maxScore"] = maxScore;
	data[categoryDropdown.value]["assignments"][assignmentName.value]["percentScore"] =
		assignmentScore.value / assignmentMaxScore.value * 100;
	data[categoryDropdown.value]["assignments"][assignmentName.value]["weightedScore"] = assignmentScore.value * data[categoryDropdown.value]["weight"];

	populateNest();


}
