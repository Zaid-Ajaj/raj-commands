/*

    This module provide a default set of effects that can be used
    in a raj program, Elm-style
*/

const none = function () {
  return function (dispatch) {
     // does nothing;
  }
}
 
// A command that dispaches messages on demand
const ofMsg = function (msg) {
 return function (dispatch) {
   dispatch(msg)
 }
}
 
// props : { value: Promise<'T>, success: 'T -> Msg, error: exception -> Msg }
const promise = function (props) {
 return function (dispatch) {
   return props.value
     .then(function(result) { return dispatch(props.resolved(result)); })
     .catch(function(ex)  { return dispatch(props.rejected(ex)); })
 }
}
 
// props : { url: string, success: obj -> Msg, error: exception -> Msg }
const fetchJson = function (props) {
 return promise({
   value: fetch(props.url).then(function(response) { return response.json(); }),
   resolved: props.success,
   rejected: props.error
 })
}
 
// props : { url: string, data: any success: obj -> Msg, error: exception -> Msg }
const postJson = function (props) {
 return promise({
   value: fetch(props.url, { 
     method: 'POST', 
     body: JSON.stringify(props.data) 
   }).then(function(response) { return response.json(); }),
   resolved: props.success,
   rejected: props.error
 })
}

// Dispatches a message after the given ammount of milliseconds
const timeout = function (timeInMilliseconds, msg) {
 return function (dispatch) {
   setTimeout(function() { return dispatch(msg); }, timeInMilliseconds)
 }
}
 
const batch = function(commands) {
 return function(dispatch) {
   for(var i = 0; i < commands.length; i++) {
     const effect = commands[i];
     effect(dispatch);
   }
 }
}


// adapted from mapEffect from raj-compose
// https://github.com/andrejewski/raj-compose#mapeffect
const map = function(cmd, f) {
 return function(dispatch) {
   const outerDispatch = function(msg) {
     const transformed = f(msg)
     dispatch(transformed)
   }

   cmd(outerDispatch)
 }
}

module.exports = {
 none,
 ofMsg,
 promise,
 fetchJson,
 postJson,
 timeout,
 batch,
 map
}