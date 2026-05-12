import "./styles.css";
import {
  createOnlineRoom,
  ensureFirebase,
  getFirebaseProjectId,
  hasFirebaseConfig,
  joinOnlineRoom,
  saveOnlineRoom,
  watchOnlineRoom
} from "./firebaseClient.js";

const SUITS = [
  { id: "S", label: "黑桃", symbol: "♠", color: "black" },
  { id: "H", label: "紅心", symbol: "♥", color: "red" },
  { id: "D", label: "方塊", symbol: "♦", color: "red" },
  { id: "C", label: "梅花", symbol: "♣", color: "black" }
];

const RANKS = [
  { id: "A", value: 14, head: true },
  { id: "K", value: 13, head: true },
  { id: "Q", value: 12, head: true },
  { id: "J", value: 11, head: true },
  { id: "10", value: 10 },
  { id: "9", value: 9 },
  { id: "8", value: 8 },
  { id: "7", value: 7 },
  { id: "6", value: 6 },
  { id: "5", value: 5 },
  { id: "4", value: 4 },
  { id: "3", value: 3 },
  { id: "2", value: 2 }
];

const THEMES = [
  ["ocean", "海洋風"],
  ["eye", "護眼風"],
  ["epaper", "電子紙風"],
  ["twilight", "暮光風"],
  ["sakura", "櫻花風"],
  ["forest", "森林風"],
  ["sand", "海灘風"],
  ["midnight", "深海夜航"]
];

const SOUND_PACKS = [
  ["bubble", "泡泡"],
  ["wave", "浪花"],
  ["wood", "木質"],
  ["glass", "玻璃"],
  ["retro", "復古電子"]
];

const BOT_NAMES = ["海豚 AI", "海龜 AI", "飛魚 AI", "鯨魚 AI", "海星 AI"];
const STORAGE_KEY = "napoleon-complete-prefs-v1";

const defaultPrefs = {
  name: "玩家",
  theme: "ocean",
  sound: true,
  soundPack: "bubble",
  difficulty: 8,
  turnSeconds: 30,
  weakJokerFinal3: false,
  openDiscardHeads: true
};

const client = {
  mode: "setup",
  uid: null,
  seat: 0,
  roomId: "",
  onlineRoom: null,
  localRoom: null,
  unsubscribe: null,
  selectedDiscards: new Set(),
  pendingJokerCardId: null,
  autoKey: "",
  audioContext: null
};

let prefs = loadPrefs();

function loadPrefs() {
  try {
    return { ...defaultPrefs, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return { ...defaultPrefs };
  }
}

function savePrefs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function now() {
  return Date.now();
}

function fullDeck() {
  const cards = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        id: `${suit.id}-${rank.id}`,
        suit: suit.id,
        suitLabel: suit.label,
        symbol: suit.symbol,
        color: suit.color,
        rank: rank.id,
        rankValue: rank.value,
        head: Boolean(rank.head),
        joker: false
      });
    }
  }
  cards.push({ id: "JOKER-BIG", joker: true, bigJoker: true, label: "大鬼", rankValue: 16, head: false });
  cards.push({ id: "JOKER-SMALL", joker: true, smallJoker: true, label: "小鬼", rankValue: 15, head: false });
  return cards;
}

const CARD_LOOKUP = Object.fromEntries(fullDeck().map((card) => [card.id, card]));

function shuffledDeck() {
  const cards = fullDeck();
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function sortHand(hand) {
  const order = { S: 0, H: 1, D: 2, C: 3 };
  return [...hand].sort((a, b) => {
    if (a.joker && b.joker) return b.rankValue - a.rankValue;
    if (a.joker) return -1;
    if (b.joker) return 1;
    if (a.suit !== b.suit) return order[a.suit] - order[b.suit];
    return b.rankValue - a.rankValue;
  });
}

function cardName(cardOrId) {
  const card = typeof cardOrId === "string" ? CARD_LOOKUP[cardOrId] : cardOrId;
  if (!card) return "";
  if (card.joker) return card.label;
  return `${card.suitLabel}${card.rank}`;
}

function suitLabel(suitId) {
  return SUITS.find((suit) => suit.id === suitId)?.label || "";
}

function makeEmptyPlayers() {
  return Array.from({ length: 5 }, (_, seat) => ({
    seat,
    uid: null,
    name: `座位 ${seat + 1}`,
    kind: "empty",
    score: 0,
    online: false
  }));
}

function makeRoom({ online = false, hostUid = null } = {}) {
  const players = makeEmptyPlayers();
  if (!online) {
    players[0] = { seat: 0, uid: "local-human", name: prefs.name || "玩家", kind: "human", score: 0, online: true };
    for (let i = 1; i < 5; i += 1) {
      players[i] = { seat: i, uid: `bot-${i}`, name: BOT_NAMES[i - 1], kind: "bot", score: 0, online: true };
    }
  } else {
    players[0] = { seat: 0, uid: hostUid, name: prefs.name || "房主", kind: "human", score: 0, online: true };
  }

  return {
    appVersion: "1.0.0",
    roomId: online ? "" : "LOCAL",
    hostUid,
    allowedUids: hostUid ? [hostUid] : ["local-human"],
    status: online ? "lobby" : "playing",
    settings: {
      difficulty: Number(prefs.difficulty),
      turnSeconds: Number(prefs.turnSeconds),
      weakJokerFinal3: Boolean(prefs.weakJokerFinal3),
      openDiscardHeads: Boolean(prefs.openDiscardHeads)
    },
    players,
    logs: [],
    round: 0,
    game: null,
    updatedAtLocal: now()
  };
}

function getRoom() {
  return client.mode === "online" ? client.onlineRoom : client.localRoom;
}

function isHost(room = getRoom()) {
  if (!room) return false;
  if (client.mode === "local") return true;
  return room.hostUid === client.uid;
}

function isMySeat(seat, room = getRoom()) {
  if (!room) return false;
  if (client.mode === "local") return seat === 0;
  return room.players[seat]?.uid === client.uid;
}

function addLog(room, text) {
  room.logs = [
    {
      time: new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      text
    },
    ...(room.logs || [])
  ].slice(0, 100);
}

function setTurnTimer(room, game) {
  const seconds = Math.max(5, Number(room.settings.turnSeconds || 30));
  game.turnStartedAt = now();
  game.turnEndsAt = now() + seconds * 1000;
}

function startFreshGame(room) {
  const deck = shuffledDeck();
  const hands = Array.from({ length: 5 }, (_, seat) => sortHand(deck.slice(seat * 10, seat * 10 + 10)));

  room.status = "playing";
  room.round = (room.round || 0) + 1;
  room.game = {
    phase: "bidding",
    hands,
    kitty: deck.slice(50),
    wonCards: [[], [], [], [], []],
    discards: [],
    napoleon: null,
    secretaryCardId: null,
    secretaryHolder: null,
    secretaryRevealed: false,
    trump: null,
    contract: null,
    currentBidder: 0,
    currentBid: 8,
    passed: [],
    bidHistory: [],
    leadIndex: null,
    currentTurn: null,
    trick: [],
    trickNumber: 0,
    ledSuit: null,
    forcedJokerId: null,
    roundScores: null,
    turnStartedAt: now(),
    turnEndsAt: now()
  };

  client.selectedDiscards = new Set();
  client.pendingJokerCardId = null;
  setTurnTimer(room, room.game);
  addLog(room, `第 ${room.round} 局開始。每人 10 張，底牌 4 張，從 ${room.players[0].name} 開始叫牌。`);
}

async function commit(mutator, { sound = "click" } = {}) {
  const room = deepClone(getRoom());
  if (!room) return;
  mutator(room);
  room.updatedAtLocal = now();

  playSound(sound);

  if (client.mode === "online") {
    await saveOnlineRoom(client.roomId, room);
  } else {
    client.localRoom = room;
    render();
  }
}

function activeHumanCount(room) {
  return room.players.filter((player) => player.kind === "human").length;
}

function fillEmptySeatsWithBots(room) {
  for (let seat = 0; seat < 5; seat += 1) {
    if (room.players[seat].kind === "empty") {
      room.players[seat] = {
        seat,
        uid: `bot-${seat}-${Math.random().toString(36).slice(2, 8)}`,
        name: BOT_NAMES[seat] || `AI ${seat + 1}`,
        kind: "bot",
        score: room.players[seat]?.score || 0,
        online: true
      };
    }
  }
}

function handStrength(hand, settings) {
  let strength = 0;
  const suitCounts = { S: 0, H: 0, D: 0, C: 0 };

  for (const card of hand) {
    if (card.joker) {
      strength += card.bigJoker ? 5.2 : 4.1;
    } else {
      suitCounts[card.suit] += 1;
      if (card.head) strength += 1.3;
      if (card.rank === "A") strength += 1.4;
      if (card.rank === "K") strength += 0.8;
      if (card.rank === "Q") strength += 0.35;
      if (card.rank === "2" || card.rank === "3") strength += 0.2;
    }
  }

  strength += Math.max(...Object.values(suitCounts)) * 0.42;
  strength += Number(settings.difficulty || 1) * 0.12;
  return strength;
}

function botMaxBid(hand, settings) {
  const difficulty = Number(settings.difficulty || 1);
  const strength = handStrength(hand, settings);
  const strategicBoost = difficulty >= 15 ? 1 : difficulty >= 10 ? 0.5 : 0;
  return Math.max(8, Math.min(16, Math.floor(8 + strength / 2.15 + strategicBoost)));
}

function shouldBotTakeRisk(settings) {
  const difficulty = Number(settings.difficulty || 1);
  return Math.random() < 0.2 + difficulty * 0.025;
}

function bid(seat, value) {
  const room = getRoom();
  const game = room?.game;
  if (!game || game.phase !== "bidding" || game.currentBidder !== seat) return;
  if (!isMySeat(seat) && !(isHost(room) && room.players[seat].kind === "bot")) return;

  commit((draft) => {
    const g = draft.game;
    if (value === "pass") {
      if (!g.passed.includes(seat)) g.passed.push(seat);
      g.bidHistory.push({ seat, bid: "Pass" });
      addLog(draft, `${draft.players[seat].name} Pass。`);
    } else {
      const numeric = Number(value);
      if (numeric <= g.currentBid) return;
      g.currentBid = numeric;
      g.napoleon = seat;
      g.contract = numeric;
      g.bidHistory.push({ seat, bid: numeric });
      addLog(draft, `${draft.players[seat].name} 叫 ${numeric} 頭。`);
    }
    advanceBidding(draft);
  }, { sound: value === "pass" ? "tap" : "bid" });
}

function advanceBidding(room) {
  const game = room.game;
  const activeSeats = [0, 1, 2, 3, 4].filter((seat) => !game.passed.includes(seat));
  if (activeSeats.length <= 1 || game.currentBid >= 16 || game.bidHistory.length >= 20) {
    finishBidding(room);
    return;
  }

  for (let step = 1; step <= 5; step += 1) {
    const nextSeat = (game.currentBidder + step) % 5;
    if (!game.passed.includes(nextSeat)) {
      game.currentBidder = nextSeat;
      setTurnTimer(room, game);
      return;
    }
  }

  finishBidding(room);
}

function finishBidding(room) {
  const game = room.game;
  if (game.napoleon === null) {
    const activeSeats = [0, 1, 2, 3, 4].filter((seat) => !game.passed.includes(seat));
    const chosen = activeSeats[0] ?? strongestSeat(game, room.settings);
    game.napoleon = chosen;
    game.contract = 9;
    game.currentBid = 9;
    addLog(room, `沒有人成約，${room.players[chosen].name} 以 9 頭成為拿破崙。`);
  }

  addLog(room, `${room.players[game.napoleon].name} 成為拿破崙，合約 ${game.contract} 頭。`);

  if (room.players[game.napoleon].kind === "bot") {
    botNapoleonSetup(room);
  } else {
    game.phase = "chooseTrump";
    setTurnTimer(room, game);
  }
}

function strongestSeat(game, settings) {
  const strengths = game.hands.map((hand) => handStrength(hand, settings));
  return strengths.indexOf(Math.max(...strengths));
}

function chooseTrump(seat, suit) {
  const room = getRoom();
  const game = room?.game;
  if (!game || game.phase !== "chooseTrump" || game.napoleon !== seat || !isMySeat(seat)) return;

  commit((draft) => {
    const g = draft.game;
    g.trump = suit;
    g.phase = "discard";
    g.hands[seat] = sortHand([...g.hands[seat], ...g.kitty]);
    addLog(draft, `${draft.players[seat].name} 指定 ${suitLabel(suit)} 為王牌，拿起底牌。`);
    setTurnTimer(draft, g);
  }, { sound: "deal" });
}

function toggleDiscard(cardId) {
  if (client.selectedDiscards.has(cardId)) client.selectedDiscards.delete(cardId);
  else if (client.selectedDiscards.size < 4) client.selectedDiscards.add(cardId);
  playSound("tap");
  render();
}

function confirmDiscard(seat) {
  const room = getRoom();
  const game = room?.game;
  if (!game || game.phase !== "discard" || game.napoleon !== seat || !isMySeat(seat)) return;
  if (client.selectedDiscards.size !== 4) return;

  const selected = new Set(client.selectedDiscards);

  commit((draft) => {
    const g = draft.game;
    const kept = [];
    const discarded = [];
    for (const card of g.hands[seat]) {
      if (selected.has(card.id)) discarded.push(card);
      else kept.push(card);
    }
    g.hands[seat] = sortHand(kept);
    g.discards = discarded;
    g.phase = "chooseSecretary";

    const heads = discarded.filter((card) => card.head);
    if (heads.length && draft.settings.openDiscardHeads) {
      addLog(draft, `${draft.players[seat].name} 棄牌，公開頭牌：${heads.map(cardName).join("、")}。`);
    } else {
      addLog(draft, `${draft.players[seat].name} 完成棄牌。`);
    }

    setTurnTimer(draft, g);
  }, { sound: "card" });

  client.selectedDiscards = new Set();
}

function chooseSecretary(seat, cardId) {
  const room = getRoom();
  const game = room?.game;
  if (!game || game.phase !== "chooseSecretary" || game.napoleon !== seat || !isMySeat(seat)) return;

  commit((draft) => {
    const g = draft.game;
    g.secretaryCardId = cardId;
    g.secretaryHolder = findCardHolder(g, cardId);
    g.secretaryRevealed = false;
    if (g.secretaryHolder === seat) {
      addLog(draft, `${draft.players[seat].name} 喊 ${cardName(cardId)} 為秘書牌：獨裁局。`);
    } else {
      addLog(draft, `${draft.players[seat].name} 喊了一張秘書牌，秘書暫時隱藏。`);
    }
    startPlay(draft);
  }, { sound: "bid" });
}

function botNapoleonSetup(room) {
  const game = room.game;
  const seat = game.napoleon;

  game.trump = botBestTrump(game.hands[seat]);
  game.hands[seat] = sortHand([...game.hands[seat], ...game.kitty]);

  const discards = [...game.hands[seat]].sort((a, b) => botDiscardValue(a, game.trump) - botDiscardValue(b, game.trump)).slice(0, 4);
  const discardIds = new Set(discards.map((card) => card.id));
  game.discards = discards;
  game.hands[seat] = sortHand(game.hands[seat].filter((card) => !discardIds.has(card.id)));

  const candidateIds = fullDeck()
    .map((card) => card.id)
    .filter((id) => !discardIds.has(id))
    .filter((id) => !game.hands[seat].some((card) => card.id === id));

  const chosen = candidateIds.sort((a, b) => secretaryValue(CARD_LOOKUP[b], game.trump) - secretaryValue(CARD_LOOKUP[a], game.trump))[0] || game.hands[seat][0].id;
  game.secretaryCardId = chosen;
  game.secretaryHolder = findCardHolder(game, chosen);
  game.secretaryRevealed = false;

  addLog(room, `${room.players[seat].name} 指定 ${suitLabel(game.trump)} 為王牌，換底牌後喊了一張秘書牌。`);
  startPlay(room);
}

function botBestTrump(hand) {
  const scores = { S: 0, H: 0, D: 0, C: 0 };
  for (const card of hand) {
    if (!card.joker) scores[card.suit] += 1 + (card.head ? 1.2 : 0) + (card.rank === "A" ? 1 : 0);
  }
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function botDiscardValue(card, trump) {
  if (card.joker) return 120;
  let value = card.rankValue;
  if (card.head) value += 22;
  if (card.suit === trump) value += 13;
  return value;
}

function secretaryValue(card, trump) {
  if (!card) return 0;
  if (card.joker) return card.bigJoker ? 100 : 94;
  return card.rankValue + (card.suit === trump ? 12 : 0) + (card.head ? 8 : 0);
}

function startPlay(room) {
  const game = room.game;
  game.phase = "play";
  game.leadIndex = (game.napoleon + 1) % 5;
  game.currentTurn = game.leadIndex;
  game.trick = [];
  game.trickNumber = 0;
  game.ledSuit = null;
  game.forcedJokerId = null;
  setTurnTimer(room, game);
  addLog(room, `開始打牌：拿破崙下家 ${room.players[game.leadIndex].name} 首攻。`);
}

function findCardHolder(game, cardId) {
  for (let seat = 0; seat < 5; seat += 1) {
    if (game.hands[seat].some((card) => card.id === cardId)) return seat;
  }
  return null;
}

function isNapoleonSide(game, seat) {
  if (seat === game.napoleon) return true;
  if (game.secretaryHolder === game.napoleon) return false;
  return seat === game.secretaryHolder;
}

function legalCards(game, seat) {
  const hand = game.hands[seat] || [];
  if (game.phase !== "play" || game.currentTurn !== seat) return [];

  if (game.forcedJokerId) {
    const forced = hand.find((card) => card.id === game.forcedJokerId);
    if (forced) return [forced];
  }

  if (game.trick.length === 0) return hand;

  const follow = game.ledSuit ? hand.filter((card) => !card.joker && card.suit === game.ledSuit) : [];
  if (!follow.length) return hand;

  const secret = hand.find((card) => card.id === game.secretaryCardId);
  if (secret && !follow.some((card) => card.id === secret.id)) {
    return [...follow, secret];
  }
  return follow;
}

function requestPlayCard(seat, cardId) {
  const room = getRoom();
  const game = room?.game;
  if (!game || game.phase !== "play" || game.currentTurn !== seat || !isMySeat(seat)) return;

  const card = game.hands[seat].find((item) => item.id === cardId);
  if (!card || !legalCards(game, seat).some((item) => item.id === cardId)) return;

  if (game.trick.length === 0 && card.joker) {
    client.pendingJokerCardId = cardId;
    playSound("tap");
    render();
    return;
  }

  commit((draft) => {
    playCard(draft, seat, cardId);
  }, { sound: "card" });
}

function confirmJokerSuit(seat, suit) {
  const cardId = client.pendingJokerCardId;
  if (!cardId) return;
  client.pendingJokerCardId = null;

  commit((draft) => {
    playCard(draft, seat, cardId, { calledSuit: suit });
  }, { sound: "card" });
}

function playCard(room, seat, cardId, options = {}) {
  const game = room.game;
  const cardIndex = game.hands[seat].findIndex((card) => card.id === cardId);
  if (cardIndex < 0) return;

  const card = game.hands[seat][cardIndex];
  game.hands[seat].splice(cardIndex, 1);

  let calledSuit = null;

  if (game.trick.length === 0) {
    if (card.joker) {
      calledSuit = options.calledSuit || botCalledSuit(game, seat);
      game.ledSuit = calledSuit;
      addLog(room, `${room.players[seat].name} 首引 ${cardName(card)}，指定本墩跟 ${suitLabel(calledSuit)}。`);
    } else {
      game.ledSuit = card.suit;
      addLog(room, `${room.players[seat].name} 首引 ${cardName(card)}。`);
      maybeCallJoker(room, card, seat);
    }
  } else {
    addLog(room, `${room.players[seat].name} 出 ${cardName(card)}。`);
  }

  if (card.id === game.secretaryCardId && !game.secretaryRevealed) {
    game.secretaryRevealed = true;
    addLog(room, `${room.players[seat].name} 打出秘書牌 ${cardName(card)}，秘書身份揭露。`);
  }

  game.trick.push({ seat, card, calledSuit });

  if (game.trick.length === 5) {
    resolveTrick(room);
    return;
  }

  game.currentTurn = (seat + 1) % 5;
  setTurnTimer(room, game);
}

function maybeCallJoker(room, leadCard, seat) {
  const game = room.game;
  if (game.trickNumber >= 3) return;
  if (!leadCard || leadCard.joker || leadCard.suit !== game.trump) return;

  if (leadCard.rank === "2") {
    const holder = findCardHolder(game, "JOKER-BIG");
    if (holder !== null && holder !== seat) {
      game.forcedJokerId = "JOKER-BIG";
      addLog(room, "王牌 2 首引：請大鬼。持有者本墩必須出大鬼。");
    }
  }

  if (leadCard.rank === "3") {
    const holder = findCardHolder(game, "JOKER-SMALL");
    if (holder !== null && holder !== seat) {
      game.forcedJokerId = "JOKER-SMALL";
      addLog(room, "王牌 3 首引：請小鬼。持有者本墩必須出小鬼。");
    }
  }
}

function botCalledSuit(game, seat) {
  const counts = { S: 0, H: 0, D: 0, C: 0 };
  for (const card of game.hands[seat]) {
    if (!card.joker) counts[card.suit] += 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function resolveTrick(room) {
  const game = room.game;
  const winner = game.trick.reduce((best, play) => (compareCards(game, play, best, room.settings) > 0 ? play : best), game.trick[0]);
  const cards = game.trick.map((play) => play.card);
  const heads = cards.filter((card) => card.head).length;
  game.wonCards[winner.seat].push(...cards);

  addLog(room, `${room.players[winner.seat].name} 吃下第 ${game.trickNumber + 1} 墩${heads ? `，拿到 ${heads} 張頭` : ""}。`);

  game.trick = [];
  game.ledSuit = null;
  game.forcedJokerId = null;
  game.trickNumber += 1;

  if (game.trickNumber >= 10) {
    finishGame(room);
    return;
  }

  game.leadIndex = winner.seat;
  game.currentTurn = winner.seat;
  setTurnTimer(room, game);
}

function compareCards(game, a, b, settings) {
  return cardPower(game, a.card, settings) - cardPower(game, b.card, settings);
}

function cardPower(game, card, settings) {
  const final3 = settings.weakJokerFinal3 && game.trickNumber >= 7;

  if (card.id === game.secretaryCardId) return 10000;

  if (card.joker) {
    if (final3) return card.bigJoker ? 1.6 : 1.5;
    return card.bigJoker ? 9000 : 8500;
  }

  if (card.suit === game.trump) return 5000 + card.rankValue;
  if (game.ledSuit && card.suit === game.ledSuit) return 2000 + card.rankValue;
  return card.rankValue;
}

function countSeatHeads(game, seat) {
  return (game.wonCards[seat] || []).filter((card) => card.head).length;
}

function countNapoleonSideHeads(game) {
  let total = 0;
  for (let seat = 0; seat < 5; seat += 1) {
    if (isNapoleonSide(game, seat)) total += countSeatHeads(game, seat);
  }
  return total;
}

function finishGame(room) {
  const game = room.game;
  game.phase = "gameOver";

  const heads = countNapoleonSideHeads(game);
  const success = heads >= game.contract;
  const dictator = game.secretaryHolder === game.napoleon;
  const delta = Math.abs(heads - game.contract);
  const scores = [0, 0, 0, 0, 0];

  if (dictator) {
    if (success) {
      scores[game.napoleon] += 400 + delta * 40;
      for (let seat = 0; seat < 5; seat += 1) if (seat !== game.napoleon) scores[seat] -= 100 + delta * 10;
    } else {
      scores[game.napoleon] -= 160 + delta * 80;
      for (let seat = 0; seat < 5; seat += 1) if (seat !== game.napoleon) scores[seat] += 40 + delta * 20;
    }
  } else if (success) {
    scores[game.napoleon] += 100 + delta * 20;
    scores[game.secretaryHolder] += 50 + delta * 10;
    for (let seat = 0; seat < 5; seat += 1) {
      if (!isNapoleonSide(game, seat)) scores[seat] -= 50 + delta * 10;
    }
  } else {
    scores[game.napoleon] -= delta * 40;
    scores[game.secretaryHolder] -= delta * 20;
    for (let seat = 0; seat < 5; seat += 1) {
      if (!isNapoleonSide(game, seat)) scores[seat] += delta * 20;
    }
  }

  for (let seat = 0; seat < 5; seat += 1) {
    room.players[seat].score = Number(room.players[seat].score || 0) + scores[seat];
  }

  game.roundScores = scores;
  const secretText = dictator ? "獨裁局" : `${room.players[game.secretaryHolder].name} 是秘書`;
  addLog(room, `局末：${secretText}。拿破崙方 ${heads}/${game.contract} 頭，${success ? "成功" : "倒約"}。`);
}

function chooseBotCard(room, seat) {
  const game = room.game;
  const legal = legalCards(game, seat);
  const difficulty = Number(room.settings.difficulty || 1);
  const randomChance = Math.max(0.02, 0.32 - difficulty * 0.014);

  if (legal.length <= 1) return legal[0]?.id;
  if (Math.random() < randomChance) return legal[Math.floor(Math.random() * legal.length)].id;

  if (game.trick.length === 0) {
    return chooseBotLead(room, seat, legal).id;
  }

  const currentWinner = game.trick.reduce((best, play) => (compareCards(game, play, best, room.settings) > 0 ? play : best), game.trick[0]);
  const headsOnTable = game.trick.some((play) => play.card.head);
  const winningCards = legal.filter((card) => compareCards(game, { seat, card }, currentWinner, room.settings) > 0);
  const botSide = isNapoleonSide(game, seat);
  const winnerSide = isNapoleonSide(game, currentWinner.seat);

  if (headsOnTable && winningCards.length) {
    if ((botSide && !winnerSide) || (!botSide && winnerSide) || difficulty >= 16) {
      return lowestPower(game, winningCards, room.settings).id;
    }
  }

  const safeCards = legal.filter((card) => !card.head && !isPowerCard(game, card));
  if (safeCards.length) return lowestPower(game, safeCards, room.settings).id;
  return lowestPower(game, legal, room.settings).id;
}

function chooseBotLead(room, seat, legal) {
  const game = room.game;
  const botSide = isNapoleonSide(game, seat);
  const difficulty = Number(room.settings.difficulty || 1);

  if (botSide || difficulty >= 15) {
    const highTrumpHead = legal
      .filter((card) => !card.joker && card.suit === game.trump && card.head)
      .sort((a, b) => b.rankValue - a.rankValue)[0];
    if (highTrumpHead) return highTrumpHead;
  }

  const lowNonHead = legal
    .filter((card) => !card.head && !isPowerCard(game, card))
    .sort((a, b) => cardPower(game, a, room.settings) - cardPower(game, b, room.settings))[0];

  return lowNonHead || lowestPower(game, legal, room.settings);
}

function lowestPower(game, cards, settings) {
  return [...cards].sort((a, b) => cardPower(game, a, settings) - cardPower(game, b, settings))[0];
}

function isPowerCard(game, card) {
  if (card.id === game.secretaryCardId) return true;
  if (card.joker) return true;
  return card.suit === game.trump && card.rankValue >= 11;
}

function autoAction(reason = "auto") {
  const room = getRoom();
  const game = room?.game;
  if (!room || !game || !isHost(room)) return;

  if (game.phase === "bidding") {
    const seat = game.currentBidder;
    const player = room.players[seat];

    if (player.kind !== "bot" && reason === "timeout") {
      commit((draft) => {
        const g = draft.game;
        if (!g.passed.includes(seat)) g.passed.push(seat);
        g.bidHistory.push({ seat, bid: "Pass" });
        addLog(draft, `${draft.players[seat].name} 超時，系統代為 Pass。`);
        advanceBidding(draft);
      }, { sound: "tap" });
      return;
    }

    if (player.kind !== "bot") return;

    const max = botMaxBid(game.hands[seat], room.settings);
    const canBid = game.currentBid < max && shouldBotTakeRisk(room.settings);
    if (canBid) bid(seat, Math.min(game.currentBid + 1, max));
    else bid(seat, "pass");
    return;
  }

  if (game.phase === "chooseTrump" && room.players[game.napoleon].kind === "bot") {
    commit((draft) => botNapoleonSetup(draft), { sound: "deal" });
    return;
  }

  if (game.phase === "play") {
    const seat = game.currentTurn;
    const player = room.players[seat];
    if (player.kind !== "bot" && reason !== "timeout") return;

    const cardId = chooseBotCard(room, seat);
    if (!cardId) return;

    commit((draft) => {
      const calledSuit = CARD_LOOKUP[cardId]?.joker ? botCalledSuit(draft.game, seat) : undefined;
      playCard(draft, seat, cardId, { calledSuit });
      if (reason === "timeout" && player.kind === "human") {
        addLog(draft, `${draft.players[seat].name} 超時，系統代出一張牌。`);
      }
    }, { sound: "card" });
  }
}

function scheduleAutomation() {
  const room = getRoom();
  const game = room?.game;
  if (!room || !game || !isHost(room)) return;

  const key = `${client.mode}-${room.roomId}-${room.updatedAtLocal || ""}-${game.phase}-${game.currentBidder}-${game.currentTurn}-${game.trick.length}-${game.trickNumber}`;
  if (client.autoKey === key) return;
  client.autoKey = key;

  const seat = game.phase === "bidding" ? game.currentBidder : game.currentTurn;
  const player = room.players[seat];

  if (player?.kind === "bot") {
    window.setTimeout(() => {
      const live = getRoom();
      const liveGame = live?.game;
      if (!live || !liveGame) return;
      const liveSeat = liveGame.phase === "bidding" ? liveGame.currentBidder : liveGame.currentTurn;
      if (live.players[liveSeat]?.kind === "bot") autoAction("auto");
    }, 650);
  }
}

function timerTick() {
  const room = getRoom();
  const game = room?.game;
  if (!room || !game) return;

  const timerNode = document.querySelector("[data-timer]");
  if (timerNode) timerNode.textContent = formatRemaining(game.turnEndsAt);

  if (isHost(room) && ["bidding", "play"].includes(game.phase) && now() > game.turnEndsAt) {
    autoAction("timeout");
  }
}

function formatRemaining(endAt) {
  const remain = Math.max(0, Math.ceil((Number(endAt || 0) - now()) / 1000));
  return `${remain}s`;
}

function render() {
  const room = getRoom();
  document.body.dataset.theme = prefs.theme;

  if (!room) {
    renderSetup();
    return;
  }

  if (room.status === "lobby") {
    renderLobby(room);
    return;
  }

  renderGame(room);
  scheduleAutomation();
}

function renderSetup() {
  const app = document.querySelector("#app");
  const firebaseOk = hasFirebaseConfig();
  const firebaseText = firebaseOk
    ? `已偵測 Firebase 設定：${esc(getFirebaseProjectId())}`
    : "尚未設定 Firebase；本機 AI 可玩，線上多人需先填 .env.local。";

  app.innerHTML = `
    <div class="shell">
      ${topBarHtml()}
      <main class="hero-grid">
        <section class="card hero-card">
          <div class="eyebrow">Taiwan Napoleon Card Game</div>
          <h1>拿破崙與秘書</h1>
          <p>簡約清爽海洋風，支援手機、平板、電腦。本機 1 人打 AI，也可用 Firebase 開 2～5 人線上房，不足 5 人自動補 AI。</p>
          <div class="hero-actions">
            <button class="primary big" data-action="start-local">開始本機 1 人局</button>
            <button class="ghost big" data-action="show-tutorial">看教學</button>
          </div>
        </section>

        <section class="card setup-card">
          <h2>遊戲設定</h2>
          ${settingsHtml()}
        </section>

        <section class="card online-card">
          <h2>線上多人</h2>
          <p class="muted">${firebaseText}</p>
          <div class="stack">
            <button class="primary" data-action="create-room" ${firebaseOk ? "" : "disabled"}>建立 Firebase 房間</button>
            <div class="join-row">
              <input id="roomCodeInput" maxlength="6" placeholder="輸入 6 碼房號" />
              <button data-action="join-room" ${firebaseOk ? "" : "disabled"}>加入</button>
            </div>
          </div>
          <details class="tiny-details">
            <summary>線上模式說明</summary>
            <p>線上模式使用 Firestore 同步整個房間狀態。這份專案適合朋友房與學習展示，並非防作弊競技伺服器。</p>
          </details>
        </section>

        ${tutorialHtml()}
      </main>
    </div>
  `;
}

function topBarHtml() {
  return `
    <header class="topbar">
      <div class="brand">
        <span class="logo">♠</span>
        <div>
          <strong>拿破崙與秘書</strong>
          <small>Ocean Minimal Edition</small>
        </div>
      </div>
      <div class="top-actions">
        <select id="themeSelect" aria-label="選擇風格">
          ${THEMES.map(([value, label]) => `<option value="${value}" ${prefs.theme === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
        <button class="ghost" data-action="show-tutorial">教學</button>
        <button class="ghost" data-action="back-home">首頁</button>
      </div>
    </header>
  `;
}

function settingsHtml({ compact = false } = {}) {
  return `
    <div class="form-grid ${compact ? "compact" : ""}">
      <label>
        <span>你的名稱</span>
        <input id="nameInput" value="${esc(prefs.name)}" maxlength="16" placeholder="玩家名稱" />
      </label>
      <label>
        <span>難易度：<b id="difficultyText">${prefs.difficulty}</b> / 20</span>
        <input id="difficultyInput" type="range" min="1" max="20" value="${prefs.difficulty}" />
      </label>
      <label>
        <span>每回合計時</span>
        <select id="timerSelect">
          ${[10, 15, 20, 30, 45, 60, 90].map((sec) => `<option value="${sec}" ${Number(prefs.turnSeconds) === sec ? "selected" : ""}>${sec} 秒</option>`).join("")}
        </select>
      </label>
      <label>
        <span>音效包</span>
        <select id="soundPackSelect">
          ${SOUND_PACKS.map(([value, label]) => `<option value="${value}" ${prefs.soundPack === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </label>
      <label class="check">
        <input id="soundToggle" type="checkbox" ${prefs.sound ? "checked" : ""} />
        <span>開啟音效</span>
      </label>
      <label class="check">
        <input id="weakJokerToggle" type="checkbox" ${prefs.weakJokerFinal3 ? "checked" : ""} />
        <span>末三輪鬼牌變小</span>
      </label>
      <label class="check">
        <input id="openDiscardHeadsToggle" type="checkbox" ${prefs.openDiscardHeads ? "checked" : ""} />
        <span>拿破崙棄頭公開</span>
      </label>
    </div>
  `;
}

function tutorialHtml() {
  return `
    <section class="card tutorial" id="tutorial">
      <h2>教學說明</h2>
      <div class="tutorial-grid">
        <article>
          <h3>1. 叫牌</h3>
          <p>每人 10 張，底牌 4 張。從 9 頭起叫，最高 16 頭。A/K/Q/J 都算 1 頭，共 16 頭。</p>
        </article>
        <article>
          <h3>2. 拿破崙</h3>
          <p>叫最高者成為拿破崙，選王牌，拿底牌後棄 4 張，再喊一張秘書牌。</p>
        </article>
        <article>
          <h3>3. 秘書</h3>
          <p>持有秘書牌的人暗中幫拿破崙。秘書牌最大，打出後身份揭露。喊自己手上的牌就是獨裁。</p>
        </article>
        <article>
          <h3>4. 打牌</h3>
          <p>拿破崙下家首攻。有首引花色時必須跟花色；沒花色可墊牌或出王牌。</p>
        </article>
        <article>
          <h3>5. 大小鬼</h3>
          <p>大小鬼首引時可指定本墩跟牌花色。王牌 2 首引請大鬼，王牌 3 首引請小鬼，前三墩有效。</p>
        </article>
        <article>
          <h3>6. 勝負與分數</h3>
          <p>最後數拿破崙方吃到幾張頭。達成合約則拿破崙方加分，倒約則防守方加分。</p>
        </article>
      </div>
    </section>
  `;
}

function renderLobby(room) {
  const app = document.querySelector("#app");
  const host = isHost(room);
  const canStart = host && activeHumanCount(room) >= 1;

  app.innerHTML = `
    <div class="shell">
      ${topBarHtml()}
      <main class="game-layout lobby-layout">
        <section class="card lobby-main">
          <div class="section-head">
            <div>
              <div class="eyebrow">Firebase Room</div>
              <h1>房間 ${esc(room.roomId)}</h1>
              <p class="muted">分享房號給朋友。開始後不足 5 人會自動補 AI。</p>
            </div>
            <button class="primary" data-action="copy-room">複製房號</button>
          </div>

          <div class="seat-grid">
            ${room.players.map((player) => seatCardHtml(player, room)).join("")}
          </div>

          <div class="lobby-actions">
            <button class="primary big" data-action="start-online-game" ${canStart ? "" : "disabled"}>開始遊戲</button>
            <button class="ghost" data-action="leave-room">離開房間</button>
          </div>
          <p class="muted small">${activeHumanCount(room) < 2 ? "提醒：正式線上局建議至少 2 位真人；房主也可以先單人測試。" : "真人人數已足夠，可開始。"} 目前你是第 ${client.seat + 1} 位。</p>
        </section>

        <aside class="card">
          <h2>房主設定</h2>
          ${settingsHtml({ compact: true })}
          <p class="muted small">房主按開始時，難易度與計時會套用到這一局。</p>
        </aside>
      </main>
    </div>
  `;
}

function seatCardHtml(player, room) {
  const mine = player.uid && player.uid === client.uid;
  const tag = player.kind === "empty" ? "空位" : player.kind === "bot" ? "AI" : mine ? "你" : "玩家";
  return `
    <div class="seat-card ${mine ? "mine" : ""}">
      <span class="pill">${tag}</span>
      <strong>${esc(player.name)}</strong>
      <small>座位 ${player.seat + 1} · 總分 ${player.score || 0}</small>
    </div>
  `;
}

function renderGame(room) {
  const game = room.game;
  const app = document.querySelector("#app");
  if (!game) {
    renderSetup();
    return;
  }

  const mySeat = client.mode === "local" ? 0 : client.seat;
  const hand = game.hands?.[mySeat] || [];
  const legalSet = new Set(legalCards(game, mySeat).map((card) => card.id));
  const status = statusHtml(room);
  const controls = controlsHtml(room, mySeat);
  const handHtml = sortHand(hand).map((card) => cardHtml(card, {
    playable: game.phase === "play" && game.currentTurn === mySeat && legalSet.has(card.id),
    disabled: game.phase === "play" && game.currentTurn === mySeat && !legalSet.has(card.id),
    selected: client.selectedDiscards.has(card.id),
    selectableDiscard: game.phase === "discard" && game.napoleon === mySeat
  })).join("");

  app.innerHTML = `
    <div class="shell game-shell">
      ${topBarHtml()}
      <main class="game-layout">
        <section class="card status-card">${status}</section>

        <section class="card table-card">
          <div class="player-ring">
            ${room.players.map((player) => playerPanelHtml(player, room)).join("")}
          </div>
          <div class="table-center">
            <div class="trick-grid">
              ${room.players.map((player) => trickSlotHtml(player, game)).join("")}
            </div>
            <div class="message-area">
              ${controls}
            </div>
          </div>
        </section>

        <section class="card hand-card">
          <div class="section-head">
            <div>
              <h2>你的手牌</h2>
              <p class="muted">${handHint(room, mySeat)}</p>
            </div>
            <div class="pill timer">剩餘 <span data-timer>${formatRemaining(game.turnEndsAt)}</span></div>
          </div>
          <div class="hand-scroll">${handHtml}</div>
        </section>

        <aside class="side-column">
          <section class="card">
            <h2>分數排名</h2>
            ${rankingHtml(room)}
          </section>
          <section class="card log-card">
            <h2>紀錄</h2>
            <div class="log-list">${(room.logs || []).map((item) => `<div class="log-item"><b>${esc(item.time)}</b>${esc(item.text)}</div>`).join("")}</div>
          </section>
        </aside>
      </main>
    </div>
  `;
}

function statusHtml(room) {
  const game = room.game;
  const trump = game.trump ? suitLabel(game.trump) : "未定";
  const napoleon = game.napoleon === null ? "未定" : room.players[game.napoleon].name;
  const secretary = secretaryText(room);
  const heads = game.napoleon === null ? 0 : countNapoleonSideHeads(game);
  const phaseLabel = {
    bidding: "叫牌",
    chooseTrump: "選王牌",
    discard: "換底牌",
    chooseSecretary: "喊秘書",
    play: `第 ${game.trickNumber + 1} 墩`,
    gameOver: "本局結束"
  }[game.phase] || game.phase;

  return `
    <div class="stat-grid">
      <div class="stat"><span>階段</span><strong>${esc(phaseLabel)}</strong></div>
      <div class="stat"><span>拿破崙</span><strong>${esc(napoleon)}</strong></div>
      <div class="stat"><span>秘書</span><strong>${esc(secretary)}</strong></div>
      <div class="stat"><span>王牌 / 合約</span><strong>${esc(trump)} / ${game.contract || "-"}</strong></div>
      <div class="stat"><span>拿方頭數</span><strong>${heads} / 16</strong></div>
      <div class="stat"><span>難度 / 計時</span><strong>${room.settings.difficulty} / ${room.settings.turnSeconds}s</strong></div>
    </div>
  `;
}

function secretaryText(room) {
  const game = room.game;
  if (!game.secretaryCardId) return "未定";
  if (game.phase === "gameOver" || game.secretaryRevealed) {
    if (game.secretaryHolder === game.napoleon) return `獨裁（${cardName(game.secretaryCardId)}）`;
    return `${room.players[game.secretaryHolder]?.name || "未知"}（${cardName(game.secretaryCardId)}）`;
  }
  const mySeat = client.mode === "local" ? 0 : client.seat;
  if (game.secretaryHolder === mySeat) return `你持有（${cardName(game.secretaryCardId)}）`;
  return "尚未揭露";
}

function playerPanelHtml(player, room) {
  const game = room.game;
  const active = game.currentTurn === player.seat || game.currentBidder === player.seat;
  const role = [];
  if (game.napoleon === player.seat) role.push("拿破崙");
  if ((game.secretaryRevealed || game.phase === "gameOver" || player.seat === (client.mode === "local" ? 0 : client.seat)) && game.secretaryHolder === player.seat && game.secretaryHolder !== game.napoleon) role.push("秘書");
  if (player.kind === "bot") role.push("AI");
  const mini = Array.from({ length: game.hands[player.seat]?.length || 0 }).map(() => `<span></span>`).join("");

  return `
    <div class="player-panel ${active ? "active" : ""}">
      <div>
        <strong>${esc(player.name)}</strong>
        <small>頭 ${countSeatHeads(game, player.seat)} · 分 ${player.score || 0}</small>
      </div>
      <div class="role-row">${role.map((item) => `<em>${esc(item)}</em>`).join("")}</div>
      <div class="mini-hand">${mini}</div>
    </div>
  `;
}

function trickSlotHtml(player, game) {
  const play = game.trick.find((item) => item.seat === player.seat);
  return `
    <div class="trick-slot">
      ${play ? cardHtml(play.card, { compact: true }) : `<div class="empty-card"></div>`}
      <small>${esc(player.name)}</small>
    </div>
  `;
}

function controlsHtml(room, mySeat) {
  const game = room.game;

  if (game.phase === "bidding") {
    const currentName = room.players[game.currentBidder].name;
    const myTurn = game.currentBidder === mySeat && isMySeat(mySeat, room);
    const bidButtons = Array.from({ length: 16 - Math.max(9, game.currentBid + 1) + 1 }, (_, i) => i + Math.max(9, game.currentBid + 1))
      .filter((value) => value <= 16)
      .map((value) => `<button data-action="bid" data-bid="${value}">${value} 頭</button>`)
      .join("");

    return `
      <div>
        <h2>叫牌階段</h2>
        <p>目前最高：<b>${game.currentBid === 8 ? "尚無" : `${game.currentBid} 頭`}</b>。輪到 <b>${esc(currentName)}</b>。</p>
        <div class="action-row">
          ${myTurn ? `${bidButtons}<button class="ghost" data-action="bid" data-bid="pass">Pass</button>` : `<button disabled>等待 ${esc(currentName)}...</button>`}
        </div>
      </div>
    `;
  }

  if (game.phase === "chooseTrump") {
    const myTurn = game.napoleon === mySeat && isMySeat(mySeat, room);
    return `
      <div>
        <h2>選擇王牌</h2>
        <p>${esc(room.players[game.napoleon].name)} 是拿破崙，請選王牌花色。</p>
        <div class="action-row">
          ${myTurn ? SUITS.map((suit) => `<button data-action="choose-trump" data-suit="${suit.id}">${suit.symbol} ${suit.label}</button>`).join("") : "<button disabled>等待拿破崙選王牌...</button>"}
        </div>
      </div>
    `;
  }

  if (game.phase === "discard") {
    const myTurn = game.napoleon === mySeat && isMySeat(mySeat, room);
    return `
      <div>
        <h2>棄牌</h2>
        <p>拿破崙拿起 4 張底牌後，要棄掉 4 張。</p>
        <div class="action-row">
          ${myTurn ? `<button class="primary" data-action="confirm-discard" ${client.selectedDiscards.size === 4 ? "" : "disabled"}>確認棄牌（${client.selectedDiscards.size}/4）</button>` : "<button disabled>等待拿破崙棄牌...</button>"}
        </div>
      </div>
    `;
  }

  if (game.phase === "chooseSecretary") {
    const myTurn = game.napoleon === mySeat && isMySeat(mySeat, room);
    const discardIds = new Set((game.discards || []).map((card) => card.id));
    const options = fullDeck()
      .filter((card) => !discardIds.has(card.id))
      .map((card) => {
        const inHand = game.hands[mySeat]?.some((item) => item.id === card.id);
        return `<option value="${card.id}">${cardName(card)}${inHand ? "（在你手上／獨裁）" : ""}</option>`;
      })
      .join("");

    return `
      <div>
        <h2>喊秘書</h2>
        <p>選一張牌當秘書牌；持有者會暗中成為你的隊友。</p>
        <div class="action-row">
          ${myTurn ? `<select id="secretarySelect">${options}</select><button class="primary" data-action="choose-secretary">喊秘書</button>` : "<button disabled>等待拿破崙喊秘書...</button>"}
        </div>
      </div>
    `;
  }

  if (game.phase === "play") {
    const myTurn = game.currentTurn === mySeat && isMySeat(mySeat, room);
    if (client.pendingJokerCardId && myTurn) {
      return `
        <div>
          <h2>鬼牌首引</h2>
          <p>你首引 ${cardName(client.pendingJokerCardId)}，請指定本墩要跟的花色。</p>
          <div class="action-row">
            ${SUITS.map((suit) => `<button data-action="confirm-joker-suit" data-suit="${suit.id}">${suit.symbol} ${suit.label}</button>`).join("")}
            <button class="ghost" data-action="cancel-joker-suit">取消</button>
          </div>
        </div>
      `;
    }

    const currentName = room.players[game.currentTurn].name;
    return `
      <div>
        <h2>出牌</h2>
        <p>${game.ledSuit ? `本墩須跟 <b>${suitLabel(game.ledSuit)}</b>` : "本墩尚未首引"}。輪到 <b>${esc(currentName)}</b>。</p>
        <div class="action-row">
          ${game.forcedJokerId ? `<span class="pill danger">請鬼：${cardName(game.forcedJokerId)}</span>` : ""}
          ${myTurn ? `<span class="pill">點選手牌中亮起的牌出牌</span>` : `<button disabled>等待 ${esc(currentName)}...</button>`}
        </div>
      </div>
    `;
  }

  if (game.phase === "gameOver") {
    const heads = countNapoleonSideHeads(game);
    const success = heads >= game.contract;
    return `
      <div class="result ${success ? "success" : "fail"}">
        <h2>${success ? "拿破崙方成功！" : "拿破崙方倒約！"}</h2>
        <p>拿破崙方吃到 <b>${heads}</b> 頭，合約 <b>${game.contract}</b> 頭。</p>
        <div class="action-row">
          <button class="primary" data-action="next-round">再來一局</button>
          <button class="ghost" data-action="back-home">回首頁</button>
        </div>
      </div>
    `;
  }

  return "";
}

function handHint(room, mySeat) {
  const game = room.game;
  if (game.phase === "discard" && game.napoleon === mySeat) return "點選 4 張牌作為棄牌。";
  if (game.phase === "play" && game.currentTurn === mySeat) return "綠框牌是合法牌；手機可左右滑動手牌。";
  if (game.secretaryHolder === mySeat && !game.secretaryRevealed && game.secretaryCardId) return `你是隱藏秘書，秘書牌是 ${cardName(game.secretaryCardId)}。`;
  return "手機觸控已優化，可水平滑動查看手牌。";
}

function cardHtml(card, options = {}) {
  const classes = ["play-card"];
  if (card.joker) classes.push("joker");
  if (card.color === "red") classes.push("red");
  if (card.color === "black") classes.push("black");
  if (options.playable) classes.push("playable");
  if (options.disabled) classes.push("disabled");
  if (options.selected) classes.push("selected");
  if (options.compact) classes.push("compact");

  const game = getRoom()?.game;
  if (game?.trump && card.suit === game.trump) classes.push("trump");
  if (game?.secretaryCardId === card.id) classes.push("secret");
  if (card.head) classes.push("head");

  const attrs = [];
  if (options.playable || options.selectableDiscard) {
    attrs.push(`data-card-id="${card.id}"`);
    attrs.push(`data-action="${options.selectableDiscard ? "toggle-discard" : "play-card"}"`);
  }

  if (card.joker) {
    return `
      <button class="${classes.join(" ")}" ${attrs.join(" ")} aria-label="${cardName(card)}">
        <span class="corner">${card.bigJoker ? "大" : "小"}</span>
        <span class="symbol">鬼</span>
        <span class="caption">${card.label}</span>
      </button>
    `;
  }

  return `
    <button class="${classes.join(" ")}" ${attrs.join(" ")} aria-label="${cardName(card)}">
      <span class="corner">${card.rank}</span>
      <span class="symbol">${card.symbol}</span>
      <span class="caption">${card.suitLabel}</span>
    </button>
  `;
}

function rankingHtml(room) {
  return `
    <div class="ranking">
      ${[...room.players]
        .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
        .map((player, index) => `
          <div class="rank-row">
            <span>${index + 1}</span>
            <strong>${esc(player.name)}</strong>
            <em>${player.score || 0}</em>
          </div>
        `)
        .join("")}
    </div>
  `;
}

function applyPrefsFromInputs() {
  const name = document.querySelector("#nameInput")?.value?.trim();
  const difficulty = document.querySelector("#difficultyInput")?.value;
  const turnSeconds = document.querySelector("#timerSelect")?.value;
  const soundPack = document.querySelector("#soundPackSelect")?.value;

  if (name !== undefined) prefs.name = name || "玩家";
  if (difficulty !== undefined) prefs.difficulty = Number(difficulty);
  if (turnSeconds !== undefined) prefs.turnSeconds = Number(turnSeconds);
  if (soundPack !== undefined) prefs.soundPack = soundPack;

  prefs.sound = Boolean(document.querySelector("#soundToggle")?.checked);
  prefs.weakJokerFinal3 = Boolean(document.querySelector("#weakJokerToggle")?.checked);
  prefs.openDiscardHeads = Boolean(document.querySelector("#openDiscardHeadsToggle")?.checked);
  savePrefs();
}

async function startLocal() {
  applyPrefsFromInputs();
  client.mode = "local";
  client.uid = "local-human";
  client.seat = 0;
  client.roomId = "LOCAL";
  client.localRoom = makeRoom({ online: false });
  startFreshGame(client.localRoom);
  playSound("deal");
  render();
}

async function createRoomAction() {
  applyPrefsFromInputs();
  try {
    const { user } = await ensureFirebase();
    const room = makeRoom({ online: true, hostUid: user.uid });
    const result = await createOnlineRoom(room);
    client.mode = "online";
    client.uid = result.uid;
    client.seat = 0;
    client.roomId = result.roomId;
    await watchRoom(result.roomId);
    playSound("bid");
  } catch (error) {
    alert(error.message);
  }
}

async function joinRoomAction() {
  applyPrefsFromInputs();
  const code = document.querySelector("#roomCodeInput")?.value?.trim().toUpperCase();
  if (!code) return alert("請輸入房號。");

  try {
    const { user } = await ensureFirebase();
    const result = await joinOnlineRoom(code, prefs.name);
    client.mode = "online";
    client.uid = user.uid;
    client.seat = result.seat;
    client.roomId = code;
    await watchRoom(code);
    playSound("bid");
  } catch (error) {
    alert(error.message);
  }
}

async function watchRoom(roomId) {
  if (client.unsubscribe) client.unsubscribe();
  client.unsubscribe = await watchOnlineRoom(
    roomId,
    (room, uid) => {
      client.uid = uid;
      client.onlineRoom = room;
      if (room) {
        const seat = room.players.findIndex((player) => player.uid === uid);
        if (seat >= 0) client.seat = seat;
      }
      render();
    },
    (error) => alert(error.message)
  );
}

async function startOnlineGame() {
  const room = getRoom();
  if (!room || !isHost(room)) return;
  applyPrefsFromInputs();

  await commit((draft) => {
    draft.settings = {
      difficulty: Number(prefs.difficulty),
      turnSeconds: Number(prefs.turnSeconds),
      weakJokerFinal3: Boolean(prefs.weakJokerFinal3),
      openDiscardHeads: Boolean(prefs.openDiscardHeads)
    };
    fillEmptySeatsWithBots(draft);
    startFreshGame(draft);
  }, { sound: "deal" });
}

function leaveRoom() {
  if (client.unsubscribe) client.unsubscribe();
  client.mode = "setup";
  client.onlineRoom = null;
  client.localRoom = null;
  client.roomId = "";
  client.seat = 0;
  render();
}

function backHome() {
  leaveRoom();
}

function copyRoom() {
  if (!client.roomId) return;
  navigator.clipboard?.writeText(client.roomId);
  playSound("tap");
  alert(`已複製房號：${client.roomId}`);
}

function playSound(kind) {
  if (!prefs.sound) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!client.audioContext) client.audioContext = new AudioContextClass();
    const ctx = client.audioContext;
    const pack = prefs.soundPack;

    const gain = ctx.createGain();
    gain.gain.value = 0.045;
    gain.connect(ctx.destination);

    const playTone = (frequency, duration, type = "sine", offset = 0) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = frequency;
      osc.connect(gain);
      const start = ctx.currentTime + offset;
      osc.start(start);
      osc.stop(start + duration);
    };

    const baseMap = {
      tap: [360, 0.05],
      click: [420, 0.05],
      bid: [520, 0.08],
      deal: [260, 0.08],
      card: [330, 0.06],
      win: [520, 0.12],
      fail: [180, 0.16]
    };

    const [baseFreq, baseDur] = baseMap[kind] || baseMap.click;
    const type = pack === "retro" ? "square" : pack === "wood" ? "triangle" : pack === "glass" ? "sine" : "sine";

    if (pack === "wave") {
      playTone(baseFreq * 0.8, baseDur, "sine", 0);
      playTone(baseFreq * 1.1, baseDur, "sine", 0.04);
    } else if (pack === "bubble") {
      playTone(baseFreq, baseDur, "sine", 0);
      playTone(baseFreq * 1.35, baseDur * 0.7, "sine", 0.045);
    } else if (kind === "win") {
      playTone(420, 0.09, type, 0);
      playTone(560, 0.09, type, 0.1);
      playTone(720, 0.12, type, 0.2);
    } else if (kind === "fail") {
      playTone(240, 0.11, type, 0);
      playTone(160, 0.16, type, 0.12);
    } else {
      playTone(baseFreq, baseDur, type, 0);
    }
  } catch {
    // 音效失敗不影響遊戲。
  }
}

document.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const action = target.dataset.action;
  const room = getRoom();
  const game = room?.game;
  const mySeat = client.mode === "local" ? 0 : client.seat;

  if (action === "start-local") return startLocal();
  if (action === "create-room") return createRoomAction();
  if (action === "join-room") return joinRoomAction();
  if (action === "copy-room") return copyRoom();
  if (action === "leave-room") return leaveRoom();
  if (action === "back-home") return backHome();
  if (action === "show-tutorial") {
    document.querySelector("#tutorial")?.scrollIntoView({ behavior: "smooth" });
    return playSound("tap");
  }
  if (action === "start-online-game") return startOnlineGame();
  if (action === "bid") return bid(mySeat, target.dataset.bid);
  if (action === "choose-trump") return chooseTrump(mySeat, target.dataset.suit);
  if (action === "toggle-discard") return toggleDiscard(target.dataset.cardId);
  if (action === "confirm-discard") return confirmDiscard(mySeat);
  if (action === "choose-secretary") {
    const cardId = document.querySelector("#secretarySelect")?.value;
    return chooseSecretary(mySeat, cardId);
  }
  if (action === "play-card") return requestPlayCard(mySeat, target.dataset.cardId);
  if (action === "confirm-joker-suit") return confirmJokerSuit(mySeat, target.dataset.suit);
  if (action === "cancel-joker-suit") {
    client.pendingJokerCardId = null;
    return render();
  }
  if (action === "next-round") {
    if (!room || !isHost(room)) return alert("只有房主或本機玩家可以開下一局。");
    return commit((draft) => startFreshGame(draft), { sound: "deal" });
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "difficultyInput") {
    document.querySelector("#difficultyText").textContent = event.target.value;
  }
  if (["nameInput", "difficultyInput"].includes(event.target.id)) {
    applyPrefsFromInputs();
  }
});

document.addEventListener("change", (event) => {
  const id = event.target.id;
  if (id === "themeSelect") {
    prefs.theme = event.target.value;
    savePrefs();
    render();
    return;
  }

  if (["timerSelect", "soundPackSelect", "soundToggle", "weakJokerToggle", "openDiscardHeadsToggle"].includes(id)) {
    applyPrefsFromInputs();
    render();
  }
});

window.setInterval(timerTick, 1000);

render();
