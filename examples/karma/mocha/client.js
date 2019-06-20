/*eslint-disable*/
var example = example || {}

;(function() {
  var localBaseUrl

  this.createClient = function(baseUrl) {
    localBaseUrl = baseUrl
    return this
  }

  this.sayHello = function() {
    //Makes a synchronous request
    var xhr = new XMLHttpRequest()
    xhr.open("GET", localBaseUrl + "/sayHello", false)
    xhr.send()

    return Promise.resolve(xhr)
  }

  this.findFriendsByAgeAndChildren = function(age, children) {
    var url =
      localBaseUrl +
      "/friends?age=" +
      age +
      children.reduce(function(acc, item) {
        return acc.concat("&children=" + item)
      }, "")
    var xhr = new XMLHttpRequest()
    xhr.open("GET", url, false)
    xhr.setRequestHeader("Accept", "application/json")
    xhr.send()

    return Promise.resolve(xhr)
  }

  this.unfriendMe = function() {
    //Makes an asynchronous request
    return new Promise(function(resolve, reject) {
      var xmlhttp = new XMLHttpRequest()

      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4) {
          if (xmlhttp.status === 200) {
            resolve(xmlhttp)
          } else if (xmlhttp.status === 404) {
            reject("No friends :(")
          } else {
            reject(xmlhttp)
          }
        }
      }

      xmlhttp.open("PUT", localBaseUrl + "/unfriendMe", true)
      xmlhttp.send()
    })
  }
}.apply(example))
