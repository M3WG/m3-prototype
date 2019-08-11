'use strict'

m3.utility.component = {}

m3.utility.component.factory = (prototype, mixin = {}) => ({
  create: function (config, ...args) {
    config = {...this.defaults, ...config}
    return Object.create(this.prototype).construct(config, ...args)
  },
  defaults: {},
  extend: function (mixin = {}) {
    return {...this.prototype, ...mixin}
  },
  is: function (x) {
    return this.prototype.isPrototypeOf(x)
  },
  prototype,
  ...mixin,
})

m3.utility.component.invent = (definition) => Object.setPrototypeOf({...definition}, m3.component.base.prototype)
m3.utility.component.inventFactory = (definition, mixin) => m3.utility.component.factory(m3.utility.component.invent(definition), mixin)
