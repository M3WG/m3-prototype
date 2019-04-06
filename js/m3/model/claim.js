'use strict'

m3.model.claim = {}

m3.model.claim.prototype = (
  (undefined) => {
    const _prototype = m3.model.base.prototype

    function construct(...args) {
      _prototype.construct.call(this, ...args)

      this.type = this.config.type

      _claimCells.call(this);

      return this
    }

    function destruct() {
      return this
    }

    function getCells() {
      return utility.array.copy(this.config.cell)
    }

    function getFogShape() {
      const radius = this.type.getLineOfSight()

      return this.getCells().reduce((shape, cell) => {
        const cx = cell.getX(),
          cy = cell.getY(),
          map = cell.map,
          slice = map.createSlice(cx - radius, cy - radius, radius * 2 + 1, radius * 2 + 1)

        // XXX: Distance formula
        const isWithinRadius = (cell) => {
          // XXX: Issue within mapSlice where getCells() returns undefined cells when out-of-bounds
          if (cell === undefined) {
            return false
          }

          return Math.sqrt(Math.pow(cx - cell.getX(), 2) + Math.pow(cy - cell.getY(), 2)) <= radius
        }

        slice.getCells()
          .filter(isWithinRadius)
          .forEach((cell) => {
            if (!shape.includes(cell)) {
              shape.push(cell)
            }
          })

        return shape
      }, [])
    }

    function getPlayer() {
      return this.config.player
    }

    function _claimCells() {
      const setClaim = (cell) => cell.setClaim(this)
      this.getCells().forEach(setClaim)
    }

    // Player

    return Object.setPrototypeOf({
      construct,
      destruct,
      getCells,
      getFogShape,
      getPlayer,
    }, _prototype)
  }
)()

m3.model.claim.create = function(...args) {
  const instance = Object.create(this.prototype)
  return instance.construct(...args)
}
