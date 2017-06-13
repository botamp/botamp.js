window.botamp = (function() {
  var api, api_key, api_base = 'https://app.botamp.com/api/v1/';

  var Botamp = function Botamp() {}

  Botamp.prototype.load = function(public_api_key) {
    api = new XMLHttpRequest();
    api_key = public_api_key;
  }

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

  function create_contact(attributes) {
    api.open('POST', api_url('contacts'));
    setRequestHeaders();
    api.onreadystatechange = function() {
      if(api.readyState == 4 && (api.status === 200 || api.status === 201)) {
        localStorage.setItem('botamp_contact_id', JSON.parse(api.responseText)['data']['id'])
      }
    }
    api.send(requestBody('contacts', attributes))
  }

  function update_contact(id, attributes) {
    api.open('PUT', api_url('contacts', id));
    setRequestHeaders();
    api.send(requestBody('contacts', attributes))
  }

  Botamp.prototype.identify = function() {
    if (arguments.length == 1) {
      var saved_id = localStorage.getItem('botamp_contact_id')
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
