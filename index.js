/* eslint-disable strict */
const store = {
  items: [
    { id: cuid(), name: 'apples', checked: false, edit: { editting: false, currentText: 'apples' } },
    { id: cuid(), name: 'oranges', checked: false, edit: { editting: false, currentText: 'oranges' } },
    { id: cuid(), name: 'milk', checked: true, edit: { editting: false, currentText: 'milk' } },
    { id: cuid(), name: 'bread', checked: false, edit: { editting: false, currentText: 'bread' } }
  ],
  hideCheckedItems: false
};

const generateItemElement = function (item) {
  let itemTitle = '';
  let itemChecked = ' shopping-item__checked\'';
  let itemTitleClass = 'class=\'shopping-item';
  let itemInputClass = 'class=\'js-item-edit-text';

  // Add a checked class if item is checked, otherwise close the single quote
  item.checked ? itemTitleClass += itemChecked : itemTitleClass += '\'';
  item.checked ? itemInputClass += itemChecked : itemInputClass += '\'';

  // Add a textbox if item is being editted.
  if (!item.edit.editting) {
    itemTitle = `<span ${itemTitleClass}>${item.name}</span>`;
  } else {
    itemTitle =
      `<form class='shopping-item' action='/some-server-endpoint' method='get'>
      <label for='item-title'>Item Name:</label>
      <input type='text' ${itemInputClass} name='item-title' value='${item.edit.currentText}' required />
      <input type='submit' class='shopping-item-edit js-item-edit-submit' value='submit'>
    </form>`;
  }

  return `
    <li class='js-item-element' data-item-id='${item.id}'>
      ${itemTitle}
      <div class='shopping-item-controls'>
        <button class='shopping-item-toggle js-item-toggle'>
          <span class='button-label'>check</span>
        </button>
        <button class='shopping-item-delete js-item-delete'>
          <span class='button-label'>delete</span>
        </button>
        <button class='shopping-item-edit js-item-edit'>
          <span class='button-label'>edit</span>
        </button>
      </div>
    </li>`;
};

const generateShoppingItemsString = function (shoppingList) {
  const items = shoppingList.map((item) => generateItemElement(item));
  return items.join('');
};

/**
 * Get current texts in textboxes of currently 
 * editting items, and store them.
 */
const storeItemsCurrentTexts = function () {
  store.items.forEach(function (item, index) {
    if (item.edit.editting) {
      let currentText = $(`li[data-item-id='${item.id}']`).find('input.js-item-edit-text').val();
      if (currentText) store.items[index].edit.currentText = currentText;
    }
  });
};

/**
 * Render the shopping list in the DOM
 */
const render = function () {
  // Set up a copy of the store's items in a local 
  // variable 'items' that we will reassign to a new
  // version if any filtering of the list occurs.
  let items = [...store.items];
  // If the `hideCheckedItems` property is true, 
  // then we want to reassign filteredItems to a 
  // version where ONLY items with a "checked" 
  // property of false are included.
  if (store.hideCheckedItems) {
    items = items.filter(item => !item.checked);
  }

  /**
   * At this point, all filtering work has been 
   * done (or not done, if that's the current settings), 
   * so we send our 'items' into our HTML generation function
   */
  const shoppingListItemsString = generateShoppingItemsString(items);

  // insert that HTML into the DOM
  $('.js-shopping-list').html(shoppingListItemsString);
};

const addItemToShoppingList = function (itemName) {
  store.items.push({ id: cuid(), name: itemName, checked: false, edit: { editting: false, currentText: itemName } });
};

const handleNewItemSubmit = function () {
  $('#js-shopping-list-form').submit(function (event) {
    event.preventDefault();
    const newItemName = $('.js-shopping-list-entry').val();
    $('.js-shopping-list-entry').val('');
    addItemToShoppingList(newItemName);
    storeItemsCurrentTexts();
    render();
  });
};

const toggleCheckedForListItem = function (id) {
  const foundItem = store.items.find(item => item.id === id);
  foundItem.checked = !foundItem.checked;
};

const handleItemCheckClicked = function () {
  $('.js-shopping-list').on('click', '.js-item-toggle', event => {
    const id = getItemIdFromElement(event.currentTarget);
    toggleCheckedForListItem(id);
    storeItemsCurrentTexts();
    render();
  });
};

const getItemIdFromElement = function (item) {
  return $(item)
    .closest('.js-item-element')
    .data('item-id');
};

const getItemIndexFromElement = function (item) {
  const id = getItemIdFromElement(item);
  return store.items.findIndex(item => item.id === id);
};

/**
 * Responsible for deleting a list item.
 * @param {string} index 
 */
const deleteListItem = function (index) {
  // As with 'addItemToShoppingLIst', this 
  // function also has the side effect of
  // mutating the global store value.
  //
  // We call `.splice` at the index of 
  // the list item we want to remove, with 
  // a removeCount of 1.
  store.items.splice(index, 1);
};

const handleDeleteItemClicked = function () {
  // Like in `handleItemCheckClicked`, 
  // we use event delegation.
  $('.js-shopping-list').on('click', '.js-item-delete', event => {
    // Get the index of the item in store.items.
    const index = getItemIndexFromElement(event.currentTarget);
    // Delete the item.
    deleteListItem(index);
    // Update the store with current text in editting titles.
    storeItemsCurrentTexts();
    // Render the updated shopping list.
    render();
  });
};

/**
 * Toggles the store.hideCheckedItems property
 */
const toggleCheckedItemsFilter = function () {
  store.hideCheckedItems = !store.hideCheckedItems;
};

/**
 * Places an event listener on the checkbox 
 * for hiding completed items.
 */
const handleToggleFilterClick = function () {
  $('.js-filter-checked').click(() => {
    toggleCheckedItemsFilter();
    storeItemsCurrentTexts();
    render();
  });
};

/**
 * Update the item's title and editting status
 */
const submitEditItem = function (item) {
  const title = $(item).closest('.js-item-element').find('.js-item-edit-text').val();
  const index = getItemIndexFromElement(item);

  let storeItem = store.items[index];

  storeItem.name = title;
  // Turn off item's edit
  storeItem.edit.editting = false;
  storeItem.edit.currentText = title;
};

/**
 * Places an event listener on the submit button
 * for edits to title.
 */
const handleSubmitEditItem = function () {
  $('.js-shopping-list').on('click', '.js-item-edit-submit', event => {
    event.preventDefault();
    submitEditItem(event.currentTarget);
    storeItemsCurrentTexts();
    render();
  });
};

/**
 * Toggles whether to create a text form to 
 * enter the new title.
 */
const toggleEditItem = function (index) {
  store.items[index].edit.editting = !store.items[index].edit.editting;
};

/**
 * Places an event listener on the edit button
 * to begin editting the title.
 */
const handleEditTitleClick = function () {
  $('.js-shopping-list').on('click', '.js-item-edit', event => {
    const index = getItemIndexFromElement(event.currentTarget);
    toggleEditItem(index);
    storeItemsCurrentTexts();
    render();
  });
};

/**
 * This function will be our callback when the
 * page loads. It is responsible for initially 
 * rendering the shopping list, then calling 
 * our individual functions that handle new 
 * item submission and user clicks on the 
 * "check" and "delete" buttons for individual 
 * shopping list items.
 */
const handleShoppingList = function () {
  render();
  handleNewItemSubmit();
  handleItemCheckClicked();
  handleDeleteItemClicked();
  handleToggleFilterClick();
  handleEditTitleClick();
  handleSubmitEditItem();
};

// when the page loads, call `handleShoppingList`
$(handleShoppingList);