// Data
m3.model.claimType.data = {
  1: {
    lineOfSight: 3,
    multiplier: 1,
    name: 'city',
    priority: 1,
    score: 10,
    type: 1,
  },
  2: {
    lineOfSight: 3,
    multiplier: 1,
    name: 'farmstead',
    priority: 1,
    score: 10,
    type: 3,
  },
  3: {
    lineOfSight: 3,
    multiplier: 1,
    name: 'logging camp',
    priority: 1,
    score: 10,
    type: 4,
  },
  4: {
    lineOfSight: 3,
    multiplier: 1,
    name: 'quarry',
    score: 10,
    priority: 1,
    type: 5,
  },
  5: {
    lineOfSight: 3,
    multiplier: 1,
    name: 'mine',
    priority: 1,
    score: 100,
    type: 6,
  },
  6: {
    lineOfSight: 6,
    multiplier: 1,
    name: 'tower',
    priority: 1,
    score: 0,
    type: 7,
  },
}

m3.model.tile.data = {
  0: {
    color: '#4B0082',
    desc: 'void',
    icon: '🌀',
    picker: {
      active: true,
      position: 7,
    },
    randomWeight: 10,
  },
  1: {
    claimType: 1,
    color: '#FFFFFF',
    desc: 'house',
    icon: '👪',
    matchable: true,
    picker: {
      active: true,
      position: 0,
    },
    randomWeight: 196,
  },
  2: {
    color: '#5B60E1',
    desc: 'water',
    icon: '🌊',
    picker: {
      active: true,
      position: 4,
    },
    placeableInWater: true, // 🤣
    randomWeight: 196,
  },
  3: {
    claimType: 2,
    color: '#F0E48A',
    desc: 'field',
    icon: '🌻',
    matchable: true,
    picker: {
      active: true,
      position: 1,
    },
    randomWeight: 196,
  },
  4: {
    claimType: 3,
    color: '#287736',
    desc: 'forest',
    icon: '🌲',
    matchable: true,
    picker: {
      active: true,
      position: 2,
    },
    randomWeight: 196,
  },
  5: {
    claimType: 4,
    color: '#424242',
    desc: 'stone',
    icon: '⛰️',
    matchable: true,
    picker: {
      active: true,
      position: 3,
    },
    randomWeight: 196,
  },
  6: {
    claimType: 5,
    color: '#FF9900',
    desc: 'gold',
    icon: '💎',
    matchable: true,
    picker: {
      active: true,
      position: 5,
    },
    randomWeight: 5,
  },
  7: {
    claimType: 6,
    color: '#FF66FF',
    desc: 'magic',
    icon: '🧙',
    matchable: true,
    picker: {
      active: true,
      position: 6,
    },
    placeableInFog: true,
    placeableInWater: true,
    randomWeight: 5,
  },
}

// Create players
const playerColors = [
  '#FF0000',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
]

const playerCount = Math.min(parseInt(prompt('How many players?')) || 1, 4)
const players = Array(playerCount).fill().map((_, index) =>
  m3.model.player.create({
    color: playerColors[index],
    name: 'Player ' + (index + 1),
  })
)

const sharedFog = false

const claimStore = []
const playerViews = new Map(
  players.map((player) => [player, {}])
)

const startingInventory = [
  ['1', Infinity],
  ['3', Infinity],
  ['4', Infinity],
  ['5', Infinity],
  ['2', Infinity],
  ['6', 0],
  ['7', 1],
  ['0', 0],
]
const playerInventories = new Map(
  players.map((player) => [player, new Map(startingInventory)])
)

// Create game
const map = m3.model.map.create({
  height: 100,
  width: 100,
})

const game = m3.model.game.create({
  players,
})

game.createRound().createTurn({
  player: game.getPlayer(0),
})

// Map generation
m3.utility.map.randomize(map)

const createStartLocation = (player, x, y) => {
  const cell = map.getCell(x, y)

  const claim = m3.model.claim.create({
    cell: [cell],
    player,
    type: m3.model.claimType.get(6),
  })

  const tower = m3.model.tile.get(7)
  cell.setTile(tower).setClaim(claim)

  claimStore.push(claim)

  return claim
}

const startLocationCoordinates = [
  {x: 40, y: 40},
  {x: 60, y: 40},
  {x: 60, y: 60},
  {x: 40, y: 60},
]

const startLocations = players.map((player, index) => {
  const {x, y} = startLocationCoordinates[index]
  return createStartLocation(player, x, y)
})

// Create components
const mapComponent = m3.component.map.create({
  model: map,
}).attach(document.querySelector('.tf-o-map'))

mapComponent.getCells().forEach((component) => {
  component.on('click', () => doAction(component))
})

// TODO: Enable when complete
/*
const minimapComponent = m3.component.minimap.create({
  model: map,
}, document.querySelector('.tf-o-ui--minimap'))
*/

const scoreboardComponent = m3.component.scoreboard.create({
  players,
}).attach(document.querySelector('.tf-o-ui--scoreboard'))

const gameStatusComponent = m3.component.gameStatus.create({
  model: game,
}).attach(document.querySelector('.tf-o-ui--gameStatus'))

const tilePickerOptions = m3.model.tile.getAll().filter((tile) =>
  tile.data.picker && tile.data.picker.active
).sort((a, b) =>
  a.data.picker.position - b.data.picker.position
).map((tile) => ({
  tile,
}))

const tilePickerComponent = m3.component.tilePicker.create({
  option: tilePickerOptions,
}).attach(document.querySelector('.tf-o-ui--tilePicker'))

// Initialize player views
startLocations.forEach((claim) => {
  const cell = claim.getCells()[0],
    cellComponent = mapComponent.getCell(cell.getX(), cell.getY()),
    player = claim.getPlayer(),
    rect = cellComponent.getBoundingClientRect(),
    x = cellComponent.rootElement.offsetLeft - vw(50) + (0.5 * rect.width),
    y = cellComponent.rootElement.offsetTop - vh(50) + (0.5 * rect.height)

  const playerView = playerViews.get(player)

  playerView.tile = 0
  playerView.x = x
  playerView.y = y
})

// Set up first player view
transitionPlayerView(players[0])

if (sharedFog) {
  claimStore.forEach((claim) => drawClaimFog(claim, false))
}

// Action logic
function doAction(component) {
  const cell = component.getModel(),
    round = game.getCurrentRound(),
    tile = tilePickerComponent.getValue(),
    turn = round.getCurrentTurn(),
    turnPlayer = turn.getPlayer()

  const options = {
    cell,
    tile,
  }

  try {
    if (cell.getFog() && !tile.isPlaceableInFog()) {
      throw new Error('Tile type cannot be placed in fog')
    }

    if (getPlayerInventory(turnPlayer, tile) <= 0) {
      throw new Error('Inventory is zero')
    }

    validateAction(options)
  } catch (e) {
    console.error(e)
    alert('Invalid action: ' + e.message)
    return
  }

  modifyPlayerInventory(turnPlayer, tile, -1)
  modifyPlayerInventory(turnPlayer, cell.getTile(), +1)
  cell.setTile(tile)

  const match = testMatch(cell, turnPlayer)

  if (match) {
    handleMatch(match, turnPlayer)
  }

  const action = turn.createAction(options),
    isTurnEnd = turn.getActionCount() >= 4

  if (isTurnEnd) {
    const isRoundEnd = isTurnEnd && round.getTurnCount() >= game.getPlayerCount()
    const isGameEnd = isRoundEnd && m3.utility.map.getPercent(map, (cell) => cell.getClaim()) > (0.125 * playerCount)

    if (isGameEnd) {
      handleGameEnd()
    } else if (isRoundEnd) {
      const firstPlayer = game.getPlayer(0)

      game.createRound().createTurn({
        player: firstPlayer,
      })

      updateTurnScore(turnPlayer)
      updateRoundScores()
      transitionPlayerView(firstPlayer, turnPlayer)
    } else {
      const nextPlayer = game.getPlayer(round.getTurnCount())

      round.createTurn({
        player: nextPlayer,
      })

      updateTurnScore(turnPlayer)
      transitionPlayerView(nextPlayer, turnPlayer)
    }
  } else {
    updateTilePickerInventory(turnPlayer)
  }

  gameStatusComponent.update()
}

// Utility functions
function drawClaimFog(claim, state) {
  const drawCellFog = (cell) => cell.setFog(state)

  return claim.getFogShape().forEach(drawCellFog)
}

function drawPlayerFog(player, state) {
  const filterInPlayer = (claim) => claim.getPlayer() == player
  const drawFog = (claim) => drawClaimFog(claim, state)

  claimStore.filter(filterInPlayer)
    .forEach(drawFog)
}

function getAdjacentClaims(target) {
  if (!m3.model.cell.is(target)) {
    if (m3.model.claim.is(target)) {
      target = target.getCells()[0]
    } else {
      throw new Error('Please provide a valid target')
    }
  }

  // XXX: Hardcoded water
  const cellFilter = (cell) => cell.getClaim() || cell.getTile().getId() == 2

  const getClaims = (claims, cell) => {
    const claim = cell.getClaim()

    if (claim && !claims.includes(claim)) {
      claims.push(claim)
    }

    return claims
  }

  return m3.utility.adjacency.getPathsGreedy(target, cellFilter).reduce(getClaims, [])
}

function getAdjacentClaimsGreedy(target, claimFilter) {
  if (typeof claimFilter != 'function') {
    claimFilter = m3.utility.fn.identity()
  }

  const select = getAdjacentClaims
  const claims = select(target).filter(claimFilter),
    tested = []

  let more
  do {
    more = false
    claims.forEach((claim) => {
      if (tested.includes(claim)) {
        return
      }

      select(claim).forEach((claim) => {
        if (claimFilter(claim) && !claims.includes(claim)) {
          claims.push(claim)
          more = true
        }
      })
    })
  } while (more)

  return claims
}

function getPlayerInventory(player, tile) {
  const inventory = playerInventories.get(player),
    tileId = tile.getId()

  return inventory.get(tileId) || 0
}

function handleGameEnd() {
  mapComponent.getCells().forEach((cell) => cell.off('click'))
  map.getCells().forEach((cell) => cell.setFog(false))

  alert('Game Over')
}

function handleMatch(match, player) {
  const cells = match.cell,
    unclaimedCells = cells.filter((cell) => !cell.getClaim())

  cells.reduce((claims, cell) => {
    const claim = cell.getClaim()

    if (claim && !claims.includes(claim)) {
      claims.push(claim)
    }

    return claims
  }, []).forEach((claim) => {
    claim.destroy()
    claimStore.splice(claimStore.indexOf(claim), 1)
  })

  const claim = m3.model.claim.create({
    player,
    ...match,
  })

  claimStore.push(claim)

  const score = claim.getType().getScore() * unclaimedCells.length

  player.incrementScore(score)
  logScore(score, claim)

  drawClaimFog(claim, false)
}

function logScore(score, ...claims) {
  console.log('SCORE:', score, ...claims.map((claim) => {
    const cell = claim.getCells()[0],
      x = cell.getX(),
      y = cell.getY()

    return mapComponent.getCell(x, y).rootElement
  }), claims)
}

function modifyPlayerInventory(player, tile, amount) {
  const inventory = playerInventories.get(player),
    tileId = tile.getId(),
    value = inventory.get(tileId)

  inventory.set(tileId, value + amount || 0)
}

function testMatch(cell, player) {
  const tile = cell.getTile()

  if (!tile.isMatchable()) {
    return
  }

  // XXX: Hardcoded magic
  const minimumCells = tile.getId() == 7 ? 0 : 3

  // filter selects unclaimed or claims to merge
  const filter = (cell) => !cell.getClaim() || cell.getClaim().getPlayer() == player
  const cells = m3.utility.adjacency.getSimilarCellsGreedy(cell, filter)

  if (cells.length > minimumCells) {
    return {
      cell: cells,
      type: tile.getClaimType(),
    }
  }
}

function transitionPlayerView(nextPlayer, currentPlayer) {
  console.log('=== ROUND ' + game.getRoundCount() + ' - ' + nextPlayer.getName() + ' ===')

  updateTilePickerInventory(nextPlayer)

  if (nextPlayer === currentPlayer) {
    return
  }

  const currentView = playerViews.get(currentPlayer),
    nextView = playerViews.get(nextPlayer)

  if (currentView) {
    currentView.tile = tilePickerComponent.getSelectedIndex()
    currentView.x = window.scrollX
    currentView.y = window.scrollY

    alert('Up next: ' + nextPlayer.getName())
  }

  tilePickerComponent.setSelectedIndex(nextView.tile)

  if (!sharedFog) {
    if (currentPlayer) {
      drawPlayerFog(currentPlayer, true)
    }
    drawPlayerFog(nextPlayer, false)
  }

  window.scrollTo({
    left: nextView.x,
    top: nextView.y,
    behavior: 'smooth',
  })
}

function updateRoundScores() {
  // TODO
}

function updateTilePickerInventory(player) {
  const inventory = playerInventories.get(player)

  tilePickerComponent.getOptions().forEach((option) => {
    const tile = option.getValue(),
      tileId = tile.getId(),
      value = inventory.get(tileId)

    option.setInventory(value)
  })
}

function updateTurnScore(player) {
  // TODO: Change allowedClaims/isAllowedClaim to use a configuration value, e.g. claim.isEconomy()
  const allowedClaims = [1, 6],
    isAllowedClaim = (claim) => allowedClaims.includes(claim.getType().getId()),
    isPlayer = (test) => test === player,
    isPlayerOwned = (claim) => isPlayer(claim.getPlayer())

  const calculateClaimScore = (claim) => {
    const adjacencies = getAdjacentClaimsGreedy(claim),
      isClaim = (test) => test === claim

    const calculateAdjacencyScore = (adjacency) => {
      const claimMultiplier = adjacency.getType().getMultiplier(),
        ownerMultiplier = isPlayer(adjacency.getPlayer()) ? 1 : 0.5,
        sizeMultiplier = Math.min(adjacency.getSize(), claim.getSize())

      const score = claimMultiplier * ownerMultiplier * sizeMultiplier
      logScore(score, claim, adjacency)

      return score
    }

    return adjacencies.reduce((score, adjacency) => {
      if (isClaim(adjacency)) {
        return score
      }

      return score + calculateAdjacencyScore(adjacency)
    }, 0)
  }

  player.incrementScore(
    claimStore.reduce((score, claim) => {
      if (!isPlayerOwned(claim) || !isAllowedClaim(claim)) {
        return score
      }

      return score + calculateClaimScore(claim)
    }, 0)
  )
}

function validateAction({cell, tile}) {
  const cellTile = cell.getTile()

  if (cell.getClaim()) {
    throw new Error('Cell is claimed')
  }

  if (cellTile.getId() == 2 && !tile.isPlaceableInWater()) {
    throw new Error('Cell contains water')
  }

  if (cellTile.getId() == tile.getId()) {
    throw new Error('Cell cannot be changed to itself')
  }

  return true
}

function vh(value) {
  return window.innerHeight / 100 * value
}

function vw(value) {
  return window.innerWidth / 100 * value
}
