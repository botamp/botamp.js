window.botamp = (function() {
  var api, api_key, page_id, api_base = 'https://app.botamp.com/api/v1/';

  var Botamp = function Botamp() {}

  function api_url(resource, id) {
    url = api_base + resource;
    if (id != undefined)
      url += ('/' + id);
    return url;
  }

  function setRequestHeaders() {
    api.setRequestHeader('Content-Type', 'application/vnd.api+json');
    api.setRequestHeader('Authorization', "Basic " + btoa(api_key + ':'));
    api.withCredentials = true;
  }

  function requestBody(resource, attributes) {
    body = {
      'data': {
        'type': resource,
        'attributes': attributes,
      }
    }

    return JSON.stringify(body);
  }

  function contact_id_key() {
    return 'botamp_' + page_id + '_contact_id';
  }

  function create_contact(attributes) {
    api.open('POST', api_url('contacts'));
    setRequestHeaders();
    api.onreadystatechange = function() {
      if(api.readyState == 4 && (api.status === 200 || api.status === 201)) {
        localStorage.setItem(contact_id_key(), JSON.parse(api.responseText)['data']['id'])
      }
    }
    api.send(requestBody('contacts', attributes))
  }

  function update_contact(id, attributes) {
    api.open('PUT', api_url('contacts', id));
    setRequestHeaders();
    api.send(requestBody('contacts', attributes))
  }

  Botamp.prototype.load = function(public_api_key) {
    api_key = public_api_key;

    api = new XMLHttpRequest();

    api.open('GET', api_url('me'), true);
    api.onreadystatechange = function() {
      if(api.readyState == 4 && api.status == 200) {
        page_id = JSON.parse(api.responseText)['data']['id'];
      }
    }
    setRequestHeaders();
    api.send();
  }

  Botamp.prototype.identify = function() {
    if (arguments.length == 1) {
      var saved_id = localStorage.getItem(contact_id_key())
      if (saved_id == null)
        create_contact(arguments[0])
      else
        update_contact(saved_id, arguments[0])
    } else if (arguments.length == 2) {
      update_contact(arguments[0], arguments[1])
    }
  }

  return new Botamp();
}());
