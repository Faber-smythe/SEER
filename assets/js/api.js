/**
 *  Create parent function for fetch() with default option: credentials
 */
function fetchJson(url, options={}) {
  return fetch(url, Object.assign({
    credentials: 'same-origin',
  }, options))
  .then(response => {
    return response.json();
  });
}

// ====================================================
// DATA RETRIEVING FUNCTIONS (NOT CHANGING DATABASE)
// ====================================================

/**
 * Returns a Promise with the Sight metaInfo (user Id, world Id, game Id)
 * @return {Promise<Response>}
 */
export function getMetaInfo() {
  var path = (window.location.pathname) + '/data/meta-info';
  return fetchJson(path);
}

/**
 * Returns a Promise with the text Items data
 * @return {Promise<Response>}
 */
export function getTexts() {
  var path = (window.location.pathname) + '/data/texts';
  return fetchJson(path);
}


  // ====================================================
  // CRUD FUNCTIONS FOR ITEM MANAGEMENT (CHANGING DATABASE)
  // ====================================================

export function createItem(type, item) {
  var path = (window.location.pathname) + '/new-item/' + type;
  return fetchJson(path, {
    method: 'POST',
    body: JSON.stringify(item),
    headers: {
        'Content-Type': 'application/json'
    }
  });
}

export function updateItem(type, id, updatedItem) {
  var path = (window.location.pathname) + '/edit-item/' + type + '/' + id;
  var body = JSON.stringify(updatedItem);
  return fetchJson(path, {
    method: 'POST',
    body: body,
    headers: {
        'Content-Type': 'application/json'
    }
  });
}

export function deleteItem(type, id) {

  var path = (window.location.pathname) + '/delete-item/' + type + '/' + id;
  return fetchJson(path, {method: 'DELETE'});
}

export function pinItem(type, id) {
  var path = (window.location.pathname) + '/pin/' + type + '/' + id;
  return fetchJson(path);
}
