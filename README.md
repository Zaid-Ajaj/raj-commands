# raj-commands

A set of commonly used commands/effects for [raj](https://github.com/andrejewski/raj) programs. 

```
npm install --save raj-commands
```

# Available commands

```js
import * as Cmd from 'raj-commands' 

Cmd.none()

Cmd.ofMsg(nextMessage)

Cmd.promise({ 
    value: somePromise,
    resolved: value => nextMessageA
    rejected: error => nextMessageB
})

Cmd.batch([ cmdA, cmdB, cmdC ]);

Cmd.fetchJson({
    url: '/end-point',
    success: deserializedJsonResponse => nextMessageA
    error: fetchError => nextMessageB
})

Cmd.postJson({
    url: '/post-end-point',
    data: { some: "data" },
    success: deserializedJsonResult => nextMessageA,
    error: fetchError => nextMessageB
})
``` 

`Cmd.none()` the command that does nothing, although commands are optional in raj, this makes the return type explicit and consistent with the type of the `update` function.

```js
import * as Cmd from 'raj-commands'

const init = function() {
    let intialState = { count: 0 }
    let initialCmd = Cmd.none()
    return [initialState, initialCmd];
}
```

`Cmd.ofMsg(nextMessage)`: a command that dispatches the given message directly to the dispatch loop. Although you could just use recursion to call the `update` directly with your next message, this personally feels a natural way to jump to a different state using the given message/transition:

```js
import * as Cmd from 'raj-commands'

const update = function (msg, state) {
    return AppMsg.match(msg, {

        SubmitSaveChanges: () => {
            if (validate(state)) {
                return [state, Cmd.ofMsg(AppMsg.SaveChanges())];
            } else {
                return [state, Cmd.none()];
            }
        }, 

        SaveChanges: () => {
            /* ... */
        }, 

        DataSaved: saveResult => {
            /* ... */
        }, 

        DoNothing: () => [state, Cmd.none()]
    })
}
```
`Cmd.promise(options)` dispatches messages that result from a promise being resolved or rejected:

```js
const nextCmd = Cmd.promise({
    value: new Promise((res, rej) => res(5)), 
    resolved: value => AppMsg.ReceivedValue(value),
    rejected: ex => AppMsg.ValueError(ex)
})  

return [state, nextCmd];
```
`Cmd.postJson(options)` and `Cmd.fetchJson(options)` are commands that issue POST and GET requests, respectively, using the fetch API:

```js
// GET request
const loadData = Cmd.fetchJson({
    url: "/where-my-data-is", 
    success: data => AppMsg.DataLoaded(data),
    error: err => AppMsg.DataLoadError(err)
})

// POST request
const sendData = Cmd.postJson({
    url: "/secure-endpoint",
    data: { SecurityToken: "..." },
    success: result => {
        // result is the deserialized JSON data from server
        if (result.Successful) {
            return AppMsg.SentDataWithResult(result);
        } else {
            return AppMsg.SentDataWithErrors(result.ErrorMessage)
        }
    }, 
    error: err => AppMsg.SentDataWithErrors(err.Message)
})
```