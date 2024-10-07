const form = document.getElementById('item-form');
const list = document.getElementById('item-list');
const searchBar = document.querySelector('.filter');
const searchBarInput = document.querySelector('.form-input-filter');
const itemInputField = document.querySelector('.form-control input');
const submitButton = document.querySelector('.btn');
const cancelEditButton = document.querySelector('.cancel-edit');
const clearAllButton = document.getElementById('clear');
let isEditMode = false;

// function display items by fetching from local storage.
function displayItems() {
	getItemsFromLS().forEach(item => addItemToDOM(item));
	resetUI();
}

// function to add/remove the search-bar & clear all button if there is not item.
function resetUI() {
	if (isEditMode) {
		isEditMode = false;
		cancelEditButton.classList.add('hidden');
		submitButton.innerHTML = `<i class="fa-solid fa-plus"></i> Add Item`;
		submitButton.style.backgroundColor = '#333';
	}
	// general rests.
	if (list.firstElementChild) {
		searchBar.classList.remove('hidden');
		clearAllButton.classList.remove('hidden');
	} else {
		searchBar.classList.add('hidden');
		clearAllButton.classList.add('hidden');
	}
	searchBarInput.value = '';
	itemInputField.value = '';
	itemInputField.blur();
	searchBarInput.blur();
	let listItem = list.firstElementChild;
	while (listItem) {
		listItem.classList.contains('edit-mode') &&
			listItem.classList.remove('edit-mode');
		listItem.classList.contains('hidden') &&
			listItem.classList.remove('hidden');
		listItem = listItem.nextElementSibling;
	}
}

// function to add item to the local storage (if not present already)
function addItemToLS(itemName) {
	itemName = beautifyName(itemName).toLowerCase();
	const itemsFromLS = getItemsFromLS();
	if (itemsFromLS.includes(itemName)) {
		return false;
	}
	itemsFromLS.push(itemName);
	localStorage.setItem('items', JSON.stringify(itemsFromLS));
	return true;
}

// fetch item form local storage and return them in form of array.
function getItemsFromLS() {
	return localStorage.getItem('items')
		? JSON.parse(localStorage.getItem('items'))
		: [];
}

function removeItemFromLS(element) {
	// itemName is already beautify as it is fetched from DOM.
	itemName = element.textContent.toLowerCase();
	const remainingItems = getItemsFromLS().filter(item => item !== itemName);
	remainingItems.length
		? localStorage.setItem('items', JSON.stringify(remainingItems))
		: localStorage.clear();
}

function getDeleteButton() {
	const button = document.createElement('button');
	button.className = 'remove-item btn-link text-red';
	const icon = document.createElement('i');
	icon.className = 'fa-solid fa-xmark';
	button.appendChild(icon);
	return button;
}

function beautifyName(itemName) {
	const accumulate = [];
	itemName
		.split(' ')
		.forEach(
			word =>
				word.length &&
				accumulate.push(word[0].toUpperCase() + word.slice(1).toLowerCase())
		);
	return accumulate.join(' ');
}

function addItemToDOM(itemName) {
	const newItem = document.createElement('li');
	newItem.insertAdjacentText('afterbegin', beautifyName(itemName));
	newItem.appendChild(getDeleteButton());
	list.appendChild(newItem);
}

function onSubmitAddItem(event) {
	event.preventDefault();
	// console.log(event.target);
	// console.log(event.currentTarget);
	const formData = new FormData(event.currentTarget);
	const itemName = formData.get('item');
	if (itemName.trim().length < 1) {
		alert('Please Provide Valid Item Name!');
		return false;
	}
	if (isEditMode) {
		const editingItem = document.querySelector('.edit-mode');
		removeItemFromLS(editingItem);
		editingItem.remove();
	}
	if (addItemToLS(itemName)) {
		addItemToDOM(itemName);
	}
	return resetUI();
}

function setEditMode(item) {
	resetUI();
	isEditMode = true;
	cancelEditButton.classList.remove('hidden');
	item.classList.add('edit-mode');
	submitButton.innerHTML = '<i class="fa-solid fa-pen"></i> Update Item';
	submitButton.style.backgroundColor = '#00c04b';
	itemInputField.value = item.textContent;
	itemInputField.focus();
}

function removeItem(event) {
	const targetElement = event.target;
	const removeElement = targetElement.parentElement.parentElement;
	if (
		targetElement.tagName === 'I' &&
		!removeElement.classList.contains('edit-mode')
	) {
		removeItemFromLS(removeElement);
		removeElement.remove();
		!isEditMode && resetUI();
	} else if (targetElement.tagName === 'LI') {
		setEditMode(targetElement);
	}
}

function removeItems() {
	if (confirm('Are you sure, this will clear all list items.')) {
		isEditMode && resetUI();
		while (list.firstElementChild) {
			list.firstElementChild.remove();
		}
		localStorage.clear();
		resetUI();
	}
}

// Applies a danger highlight effect to the list item to indicate it may be removed.
function highlightForRemoval(event) {
	const targetElement = event.target;
	targetElement.parentElement.classList.contains('remove-item') &&
		targetElement.parentElement.parentElement.classList.add('item-danger');
}

// Removes the danger highlight effect from the list item to indicate it's no longer in danger of removal.
function removeHighlight(event) {
	const targetElement = event.target;
	targetElement.parentElement.classList.contains('remove-item') &&
		targetElement.parentElement.parentElement.classList.remove('item-danger');
}

// functions to search a item in the item list.
function searchPattern(pattern, text) {
	if (pattern.length > text.length) return false;
	return text.slice(0, pattern.length) === pattern;
}
function searchItem(event) {
	clearAllButton.classList.add('hidden');
	const searchBy = event.target.value.toLowerCase();
	const listItems = list.querySelectorAll('li');
	listItems.forEach(item =>
		searchPattern(searchBy, item.firstChild.textContent.trim().toLowerCase())
			? item.classList.remove('hidden')
			: item.classList.add('hidden')
	);
	searchBy === '' && clearAllButton.classList.remove('hidden');
}

// Event Listeners
form.addEventListener('submit', onSubmitAddItem);
clearAllButton.addEventListener('click', removeItems);
list.addEventListener('click', removeItem);
list.addEventListener('mouseover', highlightForRemoval);
list.addEventListener('mouseout', removeHighlight);
searchBarInput.addEventListener('input', searchItem);
cancelEditButton.addEventListener('click', resetUI);
document.addEventListener('DOMContentLoaded', displayItems);
