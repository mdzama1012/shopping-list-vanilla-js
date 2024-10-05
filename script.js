const form = document.getElementById('item-form');
const list = document.getElementById('item-list');
const searchBar = document.querySelector('.filter');
const searchBarInput = document.querySelector('.form-input-filter');
const clearAllButton = document.getElementById('clear');
let isEditMode = false;

// function to add item to the local storage (if not present already)
function addItemToLS(itemName) {
	itemName = beautifyName(itemName).toLowerCase();
	const itemsFromLS = getItemsFromLS();
	if (itemsFromLS.includes(itemName)) {
		// the item is already present.
		return false;
	}
	itemsFromLS.push(itemName);
	localStorage.setItem('items', JSON.stringify(itemsFromLS));
	// new item is added to local storage.
	return true;
}

// fetch item form local storage and return them in form of array.
function getItemsFromLS() {
	return localStorage.getItem('items')
		? JSON.parse(localStorage.getItem('items'))
		: [];
}

function removeItemFromLS(itemName) {
	// itemName is already beautify as it is fetched from DOM.
	itemName = itemName.toLowerCase();
	const remainingItems = getItemsFromLS().filter(item => item !== itemName);
	remainingItems.length
		? localStorage.setItem('items', JSON.stringify(remainingItems))
		: localStorage.clear();
}

// function to add/remove the search-bar & clear all button if there is not item.
function resetUI() {
	if (list.firstElementChild) {
		searchBar.classList.remove('hidden');
		clearAllButton.classList.remove('hidden');
	} else {
		searchBar.classList.add('hidden');
		clearAllButton.classList.add('hidden');
	}
}

// function display items by fetching from local storage.
function displayItems() {
	getItemsFromLS().forEach(item => addItemToDOM(item));
	resetUI();
}

// function to create a delete button for list item.
function getDeleteButton() {
	const button = document.createElement('button');
	button.className = 'remove-item btn-link text-red';
	const icon = document.createElement('i');
	icon.className = 'fa-solid fa-xmark';
	button.appendChild(icon);
	return button;
}

// function to beautify item name before inserting it to list.
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

// this function handle the submission of item form (mini form).
function addItem(event) {
	event.preventDefault();
	// console.log(event.target);
	// console.log(event.currentTarget);
	const formData = new FormData(event.currentTarget);
	const itemName = formData.get('item');
	if (itemName.trim().length < 1) {
		alert('Please Provide Valid Item Name!');
		return;
	}

	if (isEditMode) {
		const editingItem = document.querySelector('.edit-mode');
		removeListItem(editingItem);
		addItemToLS(itemName);
		addItemToDOM(itemName);
		editingItem.classList.remove('edit-mode');
		// console.log('exit edit mode!');
		isEditMode = false;
		const itemInputField = document.querySelector('.form-control input');
		const submitButton = document.querySelector('.btn');
		itemInputField.value = '';
		itemInputField.blur();
		// item.classList.remove('edit-mode');
		submitButton.innerHTML = `<i class="fa-solid fa-plus"></i> Add Item`;
		submitButton.style.backgroundColor = '#333';
		return;
	}

	// item name is valid.
	if (addItemToLS(itemName)) {
		addItemToDOM(itemName);
		resetUI();
	}
	document.querySelector('.form-control input').value = '';
}

function setEditMode(item) {
	isEditMode = true;
	Array.from(list.children).forEach(listItem =>
		listItem.classList.remove('edit-mode')
	);
	const itemInputField = document.querySelector('.form-control input');
	const submitButton = document.querySelector('.btn');
	itemInputField.value = item.textContent;
	itemInputField.focus();
	item.classList.add('edit-mode');
	submitButton.innerHTML = `<i class="fa-solid fa-pen"></i> Update Item`;
	submitButton.style.backgroundColor = '#00c04b';
}

// remove item helper
function removeListItem(item) {
	removeItemFromLS(item.textContent);
	item.remove();
}

// remove single item from the list.
function removeItem(event) {
	const target = event.target;
	if (
		target.tagName === 'I' &&
		!target.parentElement.parentElement.classList.contains('edit-mode')
	) {
		removeListItem(target.parentElement.parentElement);
	} else if (target.tagName === 'LI') {
		setEditMode(target);
	}
	resetUI();
}

// removes all items from the list.
function removeItems() {
	if (isEditMode) {
		return;
	}
	if (confirm('Are you sure, this will clear all list items.')) {
		while (list.firstElementChild) {
			list.firstElementChild.remove();
		}
		localStorage.clear();
	}
	resetUI();
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
form.addEventListener('submit', addItem);
clearAllButton.addEventListener('click', removeItems);
list.addEventListener('click', removeItem);
list.addEventListener('mouseover', highlightForRemoval);
list.addEventListener('mouseout', removeHighlight);
searchBarInput.addEventListener('input', searchItem);
document.addEventListener('DOMContentLoaded', displayItems);
