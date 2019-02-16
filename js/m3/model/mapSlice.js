'use strict'

m3.model.mapSlice = {}

m3.model.mapSlice.create = function(...args) {
  const instance = Object.create(this.prototype)
  return instance.construct(...args)
}

m3.model.mapSlice.prototype = (
  function prototypeIIFE(undefined) {
    const _prototype = m3.model.base.prototype

    function construct(...args) {
      _prototype.construct.call(this, ...args)

      this.cell = _getCells.call(this)
      this.map = this.config.map

      return this
    }

    function getCell(x, y) {
      return this.cell[y][x]
    }

    function getCells() {
      return this.cell.reduce((cells, row) => {
        cells.push(...row)
        return cells
      }, [])
    }

    function getHeight() {
      return this.config.height
    }

    function getWidth() {
      return this.config.width
    }

    function getX() {
      return this.config.x
    }

    function getY() {
      return this.config.y
    }

    function _getCells() {
      const cells = cell = [],
        height = this.config.height,
        left = this.config.x,
        map = this.config.map,
        top = this.config.y,
        width = this.config.width

      for (let y = top; y < top + height; y++) {
        for (let x = left; x < left + width; x++) {
          if (!this.cell[y]) {
            this.cell[y] = []
          }

          this.cell[y][x] = map.getCell(x, y)
        }
      }

      return cells
    }

    return Object.setPrototypeOf({
      construct,
      getCell,
      getCells,
      getHeight,
      getWidth,
      getX,
      getY,
    }, _prototype)
  }
)()