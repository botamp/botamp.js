window.botamp = (function() {
  var api, api_key, page_id, promise, api_base = 'https://app.botamp.com/api/v1/';

  window.onclick = function(e) {
    href = e.target.getAttribute('href')

    if (!(e.target.tagName.toLowerCase() == 'a' && href.includes('m.me/')))
      return;

    var saved_id = saved_contact_id();
    if (saved_id == null)
      return;

    e.preventDefault();
    document.location.href = href + '?ref=' + encodeURIComponent('botamp?btp_cid=' + saved_id);
  }

  var Botamp = function Botamp() {}

  function api_url(resource, id, sub_resource) {
    url = api_base + resource;
    if (id != undefined)
      url += ('/' + id);
    if (sub_resource != undefined)
      url += ('/' + sub_resource)
    return url;
  }

  function set_request_headers() {
    api.setRequestHeader('Content-Type', 'application/vnd.api+json');
    api.setRequestHeader('Authorization', "Basic " + btoa(api_key + ':'));
    api.withCredentials = true;
  }

  function request_body(resource, attributes) {
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

  function saved_contact_id() {
    return localStorage.getItem(contact_id_key());
  }

  function create_contact(attributes) {
    promise.then(function() {
      api.open('POST', api_url('contacts'));
      set_request_headers();
      api.onload = function() {
        if(api.status === 201) {
          localStorage.setItem(contact_id_key(), JSON.parse(api.responseText)['data']['id'])
        }
      }
      api.send(request_body('contacts', attributes))
    })
  }

  function update_contact(id, attributes) {
    promise.then(function(){
      api.open('PUT', api_url('contacts', id));
      set_request_headers();
      api.send(request_body('contacts', attributes))
    })
  }

  Botamp.prototype.load = function(public_api_key) {
    api_key = public_api_key;

    api = new XMLHttpRequest();

    promise = new Promise(function(resolve, reject){
      api.open('GET', api_url('me'), true);
      api.onload = function() {
        if(api.status == 200) {
          page_id = JSON.parse(api.responseText)['data']['id'];

          match_contact_id = window.location.href.match(/btp_cid=(\d+)/);
          if (match_contact_id != null) {
            api.open('GET', api_url('contacts',match_contact_id[1]), true);
            api.onload = function() {
              if(api.status == 200)
                localStorage.setItem(contact_id_key(), match_contact_id[1]);
            }
            set_request_headers();
            api.send();
          }

          resolve();
        }
        else {
          reject();
        }
      }

      api.onerror = function() {
        reject();
      }
      set_request_headers();
      api.send();
    })

    promise.catch(function(error) {
      throw error;
    })
  }

  Botamp.prototype.identify = function() {
    if (arguments.length == 1) {
      var saved_id = saved_contact_id();
      if (saved_id == null)
        create_contact(arguments[0])
      else
        update_contact(saved_id, arguments[0])
    } else if (arguments.length == 2) {
      update_contact(arguments[0], arguments[1])
    }
  }

  Botamp.prototype.track = function(name, properties) {
    var attributes = {name: name};
    if (properties != undefined)
      attributes.properties = properties;

    promise.then(function() {
      api.open('POST', api_url('contacts', saved_contact_id(), 'events'));
      set_request_headers();
      api.send(request_body('events', attributes))
    })
  }

  return new Botamp();
}());
