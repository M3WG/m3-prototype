'use strict'

m3.model.round = {}

m3.model.round.prototype = (
  (undefined) => {
    const _prototype = m3.model.base.prototype

    function construct(...args) {
      _prototype.construct.call(this, ...args)

      this.game = this.config.game
      this.turn = []

      this.createTurn()

      return this
    }

    function destruct() {
      return this
    }

    function createTurn() {
      const turn = m3.model.turn.create({
        // TODO: Inject current player
        player: this.game.player[0],
        round: this,
      })

      turn.on('end', _onTurnEnd.bind(this))
      this.turn.push(turn)

      this.emit('change')

      return turn
    }

    function getCurrentTurn() {
      return this.turn[this.turn.length - 1]
    }

    function getTurnCount() {
      return this.turn.length
    }

    function _onTurnEnd() {
      const isRoundEnd = this.getTurnCount() >= this.game.getPlayerCount()

      if (isRoundEnd) {
        this.emit('end')
      } else {
        this.createTurn()
      }

      return this
    }

    return Object.setPrototypeOf({
      construct,
      destruct,
      createTurn,
      getCurrentTurn,
      getTurnCount,
    }, _prototype)
  }
)()

m3.model.round.create = function(...args) {
  const instance = Object.create(this.prototype)
  return instance.construct(...args)
}
