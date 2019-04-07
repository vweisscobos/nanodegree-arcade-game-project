/*
 * In order to avoid global scope,
 * All game globals are accessed through just one object
 */
const GLOBALS = {

  numberOfEnemies: 8, //  number of enemies in the screen at the same time

  availableTime: 150, //  available initial time for player get the higher score as possible

  columnWidth: 101,

  lineHeight: 83,

  heightAjust: 53, // fix the difference between the entities and the ground blocks vertical position

  charWidthAjust: 30, //  fix the empty space between the char and the png canvas border

  numOfEnemyLanes: 4,

  numOfEnemyColumns: 5,

  possibleGems: ['Blue','Green'],

  maxDelayToNewGem: 15000, // max interval between gems availability

  minDelayToNewGem: 3001, // min interval between gems availability

  messageSprites: new Map([
    ['OUCH', 'images/Ouch.png'],
    ['AWESOME', 'images/Awesome.png']
  ]),

  ctx: {},

  enemySprite: 'images/enemy-bug.png',

  isEnemySpeedReduced: false,

  enemySpeedMultiplier: 2, // higher speed of the enemies in px/frame,

  //  all type of game events
  eventTypes: {

    CROSS_COMPLETED: 'CROSS_COMPLETED',

    NEGATIVE_SCORE_REACHED: 'NEGATIVE_SCORE_REACHED',

    BLUE_GEM_COLLECTED: 'BLUE_GEM_COLLECTED',

    GREEN_GEM_COLLECTED: 'GREEN_GEM_COLLECTED',

    CALL_TO_UPDATE: 'CALL_TO_UPDATE',

    CALL_TO_RENDER: 'CALL_TO_RENDER',

    TIMEOUT_REACH_ZERO: 'TIMEOUT_REACH_ZERO'

  }
};