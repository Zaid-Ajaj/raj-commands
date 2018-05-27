const Cmd = require('../index')
const Chai = require('chai')

describe("Cmd.none", () => {
    it("doesn't run anything", () => {
        var value = 'Initial'
        const dispatch = function (msg) {
          value = 'Modified'
        }
      
        var effect = Cmd.none()
        effect(dispatch)
        Chai.expect(value).to.equal('Initial')
    })
})

describe("Cmd.ofMsg", () => {
    it("Dispatches the given message", () =>{
        var value = 'Initial'
        const dispatch = function (msg) {
          if (msg === 'Incr') value = 'Modified'
        }

        const effect = Cmd.ofMsg('Decr');
        effect(dispatch);
        Chai.expect(value).to.equal('Initial');

        const anotherEffect = Cmd.ofMsg('Incr');
        anotherEffect(dispatch);
        Chai.expect(value).to.equal('Modified');
    })
})


describe("Cmd.promise", () => {

    it("Runs the resolved handler when resolved", () => {
        var value = 0
        const dispatch = function (msg) {
          if (msg === 'Incr') {
            value = 1
          } else if (msg === 'Decr') {
            value = -1
          } else {
              value = 0;
          }
        }

        const effect = Cmd.promise({
            value: new Promise((res, rej) => res("value")),
            resolved: x => 'Incr',
            rejected: x => 'Decr'
        });

        return effect(dispatch).then(result => {
            Chai.expect(value).to.equal(1);
        })
    })

    it("Runs the rejected handler when rejected", () => {

        var value = 0
        const dispatch = function (msg) {
          if (msg === 'Incr') {
            value = 1
          } else if (msg === 'Decr') {
            value = -1
          } else {
              value = 0;
          }
        }

        const effect = Cmd.promise({
            value: new Promise((res, rej) => rej('error')),
            resolved: x => 'Incr',
            rejected: errMsg => 'Decr'
        });

        return effect(dispatch).then(result => {
            Chai.expect(value).to.equal(-1);
        })
    })
})

describe("Cmd.batch", () => {
    it("runs all given commands to dispatch messages", () => {
        var value = 0;
        const dispatch = function(msg) {
            if (msg === 'Incr') {
                value = value + 1;
            } else if (msg === 'Decr') {
                value = value - 1;
            } else {
                // do nothing
            }
        }

        var effect = Cmd.batch([ 
            Cmd.ofMsg('Incr'),  
            Cmd.ofMsg('Incr'),  
            Cmd.ofMsg('Decr'),
            Cmd.ofMsg('Incr')
        ]); 

        effect(dispatch);

        Chai.expect(value).to.equal(2);
    })
});