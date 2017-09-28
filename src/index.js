import 'core-js/es6/promise'

const apiBase = 'https://app.botamp.com/api/v1/'
let api, apiKey, pageId, promise

function apiUrl (resource, id, subResource) {
  let url = apiBase + resource

  if (id) {
    url += ('/' + id)
  }

  if (subResource) {
    url += ('/' + subResource)
  }

  return url
}

function setRequestHeaders () {
  api.setRequestHeader('Content-Type', 'application/vnd.api+json')
  api.setRequestHeader('Authorization', 'Basic ' + btoa(apiKey + ':'))
  api.withCredentials = true
}

function requestBody (resource, attributes) {
  let body = {
    data: {
      type: resource,
      attributes: attributes
    }
  }

  return JSON.stringify(body)
}

function contactIdKey () {
  return 'botamp_' + pageId + '_contact_id'
}

function savedContactId () {
  return localStorage.getItem(contactIdKey())
}

function createContact (attributes) {
  promise = promise.then(function () {
    api.open('POST', apiUrl('contacts'))

    api.onload = function () {
      if (api.status === 201) {
        localStorage.setItem(contactIdKey(), JSON.parse(api.responseText)['data']['id'])
      }
    }

    setRequestHeaders()
    api.send(requestBody('contacts', attributes))
  })
}

function updateContact (id, attributes) {
  promise = promise.then(function () {
    api.open('PUT', apiUrl('contacts', id))

    setRequestHeaders()
    api.send(requestBody('contacts', attributes))
  })
}

function redirectToTaggedHref (e) {
  let href = e.target.getAttribute('href')

  if (!(e.target.tagName.toLowerCase() === 'a' && href.includes('m.me/'))) {
    return
  }

  let savedId = savedContactId()

  if (!savedId) {
    return
  }

  e.preventDefault()

  document.location.href = href + '?ref=' + encodeURIComponent('botamp?btp_cid=' + savedId)
}

class Botamp {
  constructor () {
    let botamp = window.botamp || []

    while (botamp.length) {
      this.push(botamp.shift())
    }

    window.addEventListener('click', redirectToTaggedHref, false)
  }

  push (param) {
    if (this[param[0]]) {
      this[param[0]].apply(this, param[1])
    } else {
      throw new Error(`Function '${param[0]}' does not exist.'`)
    }
  }

  load (publicApiKey) {
    apiKey = publicApiKey

    api = new XMLHttpRequest()

    promise = new Promise(function (resolve, reject) {
      api.open('GET', apiUrl('me'), true)

      api.onload = function () {
        if (api.status === 200) {
          pageId = JSON.parse(api.responseText)['data']['id']

          let matchContactId = window.location.href.match(/btp_cid=(\d+)/)

          if (matchContactId) {
            api.open('GET', apiUrl('contacts', matchContactId[1]), true)

            api.onload = function () {
              if (api.status === 200) {
                localStorage.setItem(contactIdKey(), matchContactId[1])
              }
            }

            setRequestHeaders()
            api.send()
          }

          resolve()
        } else {
          reject(api.responseText)
        }
      }

      api.onerror = function () {
        reject()
      }

      setRequestHeaders()
      api.send()
    })

    promise = promise.catch(function (error) {
      if (error) {
        console.log(error)
      }
    })
  }

  identify () {
    if (arguments.length === 1) {
      let savedId = savedContactId()

      if (savedId) {
        updateContact(savedId, arguments[0])
      } else {
        createContact(arguments[0])
      }
    } else if (arguments.length === 2) {
      updateContact(arguments[0], arguments[1])
    }
  }

  track (name, properties) {
    promise = promise.then(function () {
      api.open('POST', apiUrl('contacts', savedContactId(), 'events'))

      setRequestHeaders()
      api.send(requestBody('events', {name: name, properties: properties}))
    })
  }
}

window.botamp = new Botamp()
