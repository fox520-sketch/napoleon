let initializeApp;
let getAuth;
let signInAnonymously;
let getDatabase;
let ref;
let set;
let get;
let update;
let push;
let remove;
let onValue;
let onChildAdded;
let off;
let runTransaction;
let onDisconnect;
let serverTimestamp;

async function loadFirebaseSdk() {
  if (initializeApp) return;
  const [appMod, authMod, dbMod] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js")
  ]);
  initializeApp = appMod.initializeApp;
  getAuth = authMod.getAuth;
  signInAnonymously = authMod.signInAnonymously;
  getDatabase = dbMod.getDatabase;
  ref = dbMod.ref;
  set = dbMod.set;
  get = dbMod.get;
  update = dbMod.update;
  push = dbMod.push;
  remove = dbMod.remove;
  onValue = dbMod.onValue;
  onChildAdded = dbMod.onChildAdded;
  off = dbMod.off;
  runTransaction = dbMod.runTransaction;
  onDisconnect = dbMod.onDisconnect;
  serverTimestamp = dbMod.serverTimestamp;
}

const APP_VERSION = "AI V40｜拿破崙軍頭數顯示修正";
const APP_BUILD = "2026-05-22-v40-nap-team-heads";
const ROOM_TTL_MS = 1000 * 60 * 60 * 24;
const ROOM_STALE_MS = 1000 * 60 * 60 * 12;
const DEFAULT_PUBLIC_URL = "https://fox520-sketch.github.io/napoleon3/";
const FOX_HOME_URL = "https://fox520-sketch.github.io/fox/";
const $ = (id) => document.getElementById(id);
const SUITS = {
  S: { sym: "♠", name: "黑桃", color: "black", order: 4 },
  H: { sym: "♥", name: "紅心", color: "red", order: 3 },
  D: { sym: "♦", name: "方塊", color: "red", order: 2 },
  C: { sym: "♣", name: "梅花", color: "black", order: 1 },
  NT: { sym: "無王", name: "無王", color: "black", order: 5 }
};
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const RANK_VALUE = Object.fromEntries(RANKS.map((r, i) => [r, i + 2]));
const POINT_RANKS = new Set(["A", "K", "Q", "J"]);
const BOT_NAMES = ["海豚", "燈塔", "浪花", "信風", "海鷗", "珊瑚"];
const PHASE = {
  BIDDING: "bidding",
  TRUMP: "trump",
  EXCHANGE: "exchange",
  SECRETARY: "secretary",
  PLAY: "play",
  ROUND_END: "round_end"
};
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDbOGwdYNY4mFG8Sgy8w_QdJpziWVoNx10",
  authDomain: "napoleon-secretary-3.firebaseapp.com",
  databaseURL: "https://napoleon-secretary-3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "napoleon-secretary-3",
  storageBucket: "napoleon-secretary-3.firebasestorage.app",
  messagingSenderId: "189925612153",
  appId: "1:189925612153:web:a6db7ea4dc1e8945c152a8"
};

const STORAGE = {
  name: "napoleon.player.name.v1",
  logVisible: "napoleon.log.visible.v1",
  theme: "napoleon.theme.v1",
  playerHints: "napoleon.player.hints.v1",
  sound: "napoleon.sound.enabled.v1",
  vibration: "napoleon.vibration.enabled.v1",
  localStats: "napoleon.local.stats.v1",
  errorLog: "napoleon.error.log.v1",
  lastRoom: "napoleon.last.room.v1",
  lastRoomAt: "napoleon.last.room.at.v1",
  onboardingSeen: "napoleon.onboarding.seen.v1",
  releaseChecklist: "napoleon.release.checklist.v38",
  achievementsSeen: "napoleon.achievements.seen.v1",
  touchComfort: "napoleon.touch.comfort.v1",
  soundProfile: "napoleon.sound.profile.v1"
};
const THEME_OPTIONS = ["auto", "ocean", "eye-care", "e-ink", "forest", "grassland", "sakura", "twilight"];
const THEME_PALETTE = THEME_OPTIONS.filter((theme) => theme !== "auto");
const SETTING_PRESETS = {
  standard: { label: "標準台式", difficulty: 12, aiStyle: "expert", buriedMode: "addContract", leadMode: "next", trumpMode: "suitOnly", jokerLowLast3: true, summonJokers: true, allowSelfSecretary: false, showAiThoughts: true, balanceTarget: "normal" },
  beginner: { label: "新手休閒", difficulty: 7, aiStyle: "balanced", buriedMode: "addContract", leadMode: "next", trumpMode: "suitOnly", jokerLowLast3: true, summonJokers: true, allowSelfSecretary: false, showAiThoughts: false, balanceTarget: "easy-nap" },
  challenge: { label: "高手挑戰", difficulty: 18, aiStyle: "expert", buriedMode: "addContract", leadMode: "next", trumpMode: "allowNoTrump", jokerLowLast3: true, summonJokers: true, allowSelfSecretary: false, showAiThoughts: true, balanceTarget: "normal" },
  napFriendly: { label: "拿破崙友善", difficulty: 12, aiStyle: "aggressive", buriedMode: "addContract", leadMode: "napoleon", trumpMode: "suitOnly", jokerLowLast3: true, summonJokers: true, allowSelfSecretary: true, showAiThoughts: true, balanceTarget: "easy-nap" },
  defStrong: { label: "聯合國強化", difficulty: 16, aiStyle: "blocker", buriedMode: "addContract", leadMode: "next", trumpMode: "suitOnly", jokerLowLast3: true, summonJokers: true, allowSelfSecretary: false, showAiThoughts: true, balanceTarget: "hard-nap" },
  test: { label: "AI 測試用", difficulty: 20, aiStyle: "expert", buriedMode: "addContract", leadMode: "next", trumpMode: "allowNoTrump", jokerLowLast3: true, summonJokers: true, allowSelfSecretary: false, showAiThoughts: true, balanceTarget: "normal" }
};

const appState = {
  firebaseApp: null,
  auth: null,
  db: null,
  uid: null,
  firebaseUid: null,
  roomCode: null,
  room: null,
  roomUnsub: null,
  autoJoinCode: null,
  actionsAttached: false,
  actionQueue: [],
  processingActions: false,
  botTimer: null,
  presenceKey: null,
  selectedExchange: new Set(),
  connected: false,
  offline: false,
  offlineTimer: null,
  currentRoundResultKey: null,
  dismissedRoundResultKey: null,
  waitingWorker: null,
  lastTurnNoticeKey: null,
  audioContext: null,
  recordedRoundKeys: new Set(),
  spectator: false,
  lastReplayText: ""
};

function init() {
  applyTheme(loadTheme());
  watchSystemTheme();
  const savedName = localStorage.getItem(STORAGE.name);
  $("playerName").value = savedName || randomGuestName();
  const params = new URLSearchParams(location.search);
  const roomFromUrl = params.get("room");
  if (roomFromUrl) {
    appState.autoJoinCode = roomFromUrl.toUpperCase();
    $("roomCode").value = appState.autoJoinCode;
  } else {
    const lastRoom = localStorage.getItem(STORAGE.lastRoom);
    const lastAt = Number(localStorage.getItem(STORAGE.lastRoomAt) || 0);
    if (lastRoom && Date.now() - lastAt < 1000 * 60 * 60 * 12) {
      $("roomCode").placeholder = `上次房號 ${lastRoom}，可直接輸入加入`;
    }
  }

  $("btnStartOffline").addEventListener("click", startOfflineGame);
  $("offlinePreset")?.addEventListener("change", () => applyOfflinePresetFromUI(true));
  $("btnRunAiTest")?.addEventListener("click", runAiHealthCheck);
  $("btnRunDiagnostics")?.addEventListener("click", runDiagnostics);
  $("btnShowLocalStats")?.addEventListener("click", renderLocalStatsSummary);
  $("btnShareStats")?.addEventListener("click", shareLocalStats);
  $("btnShareAchievements")?.addEventListener("click", shareAchievements);
  $("btnExportLocalData")?.addEventListener("click", exportLocalData);
  $("btnImportLocalData")?.addEventListener("click", openImportDataDialog);
  $("btnCopyErrorReport")?.addEventListener("click", copyErrorReport);
  $("btnCopySupportBundle")?.addEventListener("click", copySupportBundle);
  $("btnCopyPublicLink")?.addEventListener("click", copyPublicGameLink);
  $("btnCopyPublicIntro")?.addEventListener("click", copyPublicIntroText);
  $("btnOpenPublicStatus")?.addEventListener("click", openPublicStatusDialog);
  $("btnOpenPublicStatusTop")?.addEventListener("click", openPublicStatusDialog);
  $("btnCopyPublicLinkInDialog")?.addEventListener("click", copyPublicGameLink);
  $("btnClearPwaCachePublic")?.addEventListener("click", clearPwaCachesAndReload);
  $("btnCopyPublicStatus")?.addEventListener("click", copyPublicStatusReport);
  $("closePublicStatus")?.addEventListener("click", () => $("publicStatusDialog")?.close());
  $("btnCopySupportBundleInDialog")?.addEventListener("click", copySupportBundle);
  $("btnClearPwaCache")?.addEventListener("click", clearPwaCachesAndReload);
  $("btnClearPwaCacheInDialog")?.addEventListener("click", clearPwaCachesAndReload);
  $("btnResetLocalData")?.addEventListener("click", resetLocalData);
  $("btnConnect").addEventListener("click", connectFirebase);
  $("btnCreateRoom").addEventListener("click", createRoom);
  $("btnJoinRoom").addEventListener("click", joinRoomFromInput);
  $("btnJoinSpectator")?.addEventListener("click", joinAsSpectatorFromInput);
  $("btnLeave").addEventListener("click", leaveRoom);
  $("btnGameExit").addEventListener("click", leaveRoom);
  $("btnCopyLink").addEventListener("click", copyInviteLink);
  $("btnToggleLog").addEventListener("click", toggleLogVisibility);
  applyLogVisibility(getLogVisible());
  $("btnAddBot").addEventListener("click", () => hostAddBot());
  $("btnRemoveBot").addEventListener("click", () => hostRemoveBot());
  $("btnTakeOverOfflineLobby")?.addEventListener("click", hostTakeOverOfflinePlayers);
  $("btnTakeOverOfflineGame")?.addEventListener("click", hostTakeOverOfflinePlayers);
  $("btnExtendRoomLobby")?.addEventListener("click", hostExtendRoom);
  $("btnExtendRoomGame")?.addEventListener("click", hostExtendRoom);
  $("btnCopyRoomMaintenanceLobby")?.addEventListener("click", copyRoomMaintenanceSummary);
  $("btnCopyRoomMaintenanceGame")?.addEventListener("click", copyRoomMaintenanceSummary);
  $("btnCloseRoomLobby")?.addEventListener("click", hostCloseRoom);
  $("btnCloseRoomGame")?.addEventListener("click", hostCloseRoom);
  $("btnStartGame").addEventListener("click", hostStartGame);
  $("btnOnboarding")?.addEventListener("click", () => showOnboardingDialog(true));
  $("btnOpenReleaseNotes")?.addEventListener("click", openReleaseNotesDialog);
  $("closeReleaseNotes")?.addEventListener("click", () => $("releaseNotesDialog")?.close());
  $("btnOpenTutorialFromRelease")?.addEventListener("click", () => { $("releaseNotesDialog")?.close(); openTutorialDialog(); });
  $("btnOpenReleaseChecklist")?.addEventListener("click", openReleaseChecklistDialog);
  $("btnOpenReleaseChecklist2")?.addEventListener("click", openReleaseChecklistDialog);
  $("closeReleaseChecklist")?.addEventListener("click", () => $("releaseChecklistDialog")?.close());
  $("btnCopyChecklistResult")?.addEventListener("click", copyReleaseChecklistResult);
  $("btnResetChecklist")?.addEventListener("click", resetReleaseChecklist);
  $("btnChecklistDiagnostics")?.addEventListener("click", () => { runDiagnostics(); renderReleaseChecklist(); });
  $("btnOpenTutorial")?.addEventListener("click", openTutorialDialog);
  $("btnOpenTutorial2")?.addEventListener("click", openTutorialDialog);
  $("closeTutorial")?.addEventListener("click", () => $("tutorialDialog")?.close());
  $("btnTutorialEnableHints")?.addEventListener("click", () => { setPlayerHintsVisible(true); toast("已開啟玩家提示"); });
  $("btnTutorialOpenRules")?.addEventListener("click", () => { $("tutorialDialog")?.close(); $("rulesDialog")?.showModal(); });
  $("btnQuickBeginner")?.addEventListener("click", quickStartBeginner);
  $("btnQuickStandard")?.addEventListener("click", quickStartStandard);
  $("btnQuickMultiplayer")?.addEventListener("click", scrollToMultiplayerStart);
  $("closeOnboarding")?.addEventListener("click", () => finishOnboarding(false));
  $("btnStartAfterGuide")?.addEventListener("click", () => finishOnboarding(false));
  $("btnEnableHintsFromGuide")?.addEventListener("click", () => { setPlayerHintsVisible(true); finishOnboarding(false); });
  $("closeImportData")?.addEventListener("click", () => $("importDataDialog")?.close());
  $("btnApplyImportData")?.addEventListener("click", restoreLocalDataFromDialog);
  $("btnPasteCurrentBackup")?.addEventListener("click", () => { const ta = $("importDataText"); if (ta) ta.value = JSON.stringify(collectLocalData(), null, 2); });
  $("btnRules").addEventListener("click", () => $("rulesDialog").showModal());
  $("closeRules").addEventListener("click", () => $("rulesDialog").close());
  $("themeSelect").addEventListener("change", (event) => applyTheme(event.target.value, true));
  $("hintToggle")?.addEventListener("change", (event) => setPlayerHintsVisible(event.target.checked));
  applyPlayerHintsVisible(getPlayerHintsVisible());
  $("soundToggle")?.addEventListener("change", (event) => setSoundEnabled(event.target.checked));
  $("vibrationToggle")?.addEventListener("change", (event) => setVibrationEnabled(event.target.checked));
  $("touchComfortToggle")?.addEventListener("change", (event) => setTouchComfortEnabled(event.target.checked));
  $("soundProfile")?.addEventListener("change", (event) => setSoundProfile(event.target.value));
  $("btnTestSound")?.addEventListener("click", () => { setSoundEnabled(true); playSfx("turn"); toast("音效測試"); });
  $("btnTestVibration")?.addEventListener("click", () => { setVibrationEnabled(true); vibrate([24, 35, 24]); toast("震動測試"); });
  $("btnOpenShareKit")?.addEventListener("click", openShareKitDialog);
  $("closeShareKit")?.addEventListener("click", () => $("shareKitDialog")?.close());
  document.querySelectorAll("[data-share-copy]").forEach((btn) => btn.addEventListener("click", () => copyShareKitText(btn.dataset.shareCopy)));
  applyFeedbackSettings();
  applyTouchComfort();
  $("closeReplay")?.addEventListener("click", () => $("replayDialog")?.close());
  $("btnShareReplay")?.addEventListener("click", shareReplay);
  $("resultReplay")?.addEventListener("click", () => openReplayDialog(appState.room?.game));
  $("btnReloadUpdate")?.addEventListener("click", reloadForUpdate);
  $("btnDismissUpdate")?.addEventListener("click", () => $("updateBanner")?.classList.add("hidden"));
  $("resultClose").addEventListener("click", hideRoundResultOverlay);
  $("difficulty").addEventListener("input", () => {
    $("difficultyLabel").textContent = $("difficulty").value;
    syncLobbySettingsSoon();
  });
  $("lobbyPreset")?.addEventListener("change", () => applyLobbyPresetFromUI(true));
  for (const id of ["buriedMode", "leadMode", "trumpMode", "aiStyle", "jokerLowLast3", "summonJokers", "allowSelfSecretary", "showAiThoughts"]) {
    $(id).addEventListener("change", syncLobbySettingsSoon);
  }
  renderConnectState();
  renderVersionInfo();
  renderLocalStatsSummary();
  renderAchievementSummary();
  renderReleaseChecklistStatus();
  installErrorCapture();
  installKeyboardShortcuts();
  maybeShowFirstRunGuide();
  if (appState.autoJoinCode) {
    window.setTimeout(() => connectFirebase(), 250);
  }
}

function loadTheme() {
  const stored = localStorage.getItem(STORAGE.theme);
  return THEME_OPTIONS.includes(stored) ? stored : "ocean";
}

function resolveTheme(theme) {
  const safeTheme = THEME_OPTIONS.includes(theme) ? theme : "ocean";
  if (safeTheme !== "auto") return safeTheme;
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "twilight" : "ocean";
}

function applyTheme(theme, persist = false) {
  const safeTheme = THEME_OPTIONS.includes(theme) ? theme : "ocean";
  const actualTheme = resolveTheme(safeTheme);
  document.body.dataset.themeChoice = safeTheme;
  document.body.dataset.theme = actualTheme;
  const select = $("themeSelect");
  if (select) select.value = safeTheme;
  if (persist) localStorage.setItem(STORAGE.theme, safeTheme);
}

function watchSystemTheme() {
  if (!window.matchMedia) return;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const refresh = () => {
    if (loadTheme() === "auto") applyTheme("auto", false);
  };
  if (media.addEventListener) media.addEventListener("change", refresh);
  else if (media.addListener) media.addListener(refresh);
}

function randomGuestName() {
  return `旅人${Math.floor(100 + Math.random() * 900)}`;
}

function sanitizeName(name) {
  const cleaned = String(name || "").trim().replace(/[<>]/g, "").slice(0, 12);
  return cleaned || randomGuestName();
}

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.remove("hidden");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.add("hidden"), 2200);
}

function setStatus(message) {
  $("connectStatus").textContent = message;
}

function parseFirebaseConfig() {
  const config = { ...FIREBASE_CONFIG };
  for (const key of ["apiKey", "authDomain", "databaseURL", "projectId", "appId"]) {
    if (!config[key]) throw new Error(`Firebase 設定缺少 ${key}。`);
  }
  return config;
}

async function connectFirebase() {
  try {
    await loadFirebaseSdk();
    const config = parseFirebaseConfig();
    const name = sanitizeName($("playerName").value);
    $("playerName").value = name;
    localStorage.setItem(STORAGE.name, name);
    setStatus("連線中...");
    if (!appState.firebaseApp) {
      appState.firebaseApp = initializeApp(config);
      appState.auth = getAuth(appState.firebaseApp);
      appState.db = getDatabase(appState.firebaseApp);
    }
    const credential = await signInAnonymously(appState.auth);
    appState.firebaseUid = credential.user.uid;
    if (!appState.offline) appState.uid = appState.firebaseUid;
    appState.connected = true;
    renderConnectState();
    $("btnConnect").textContent = "已連線 Firebase";
    setStatus(`已連線：${name}`);
    toast("Firebase 已連線");
    if (appState.autoJoinCode && !appState.roomCode) {
      const code = appState.autoJoinCode;
      appState.autoJoinCode = null;
      $("roomCode").value = code;
      setStatus(`已連線，正在加入房間 ${code}...`);
      await joinRoom(code);
    }
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Firebase 連線失敗。");
    toast("連線失敗，請檢查設定與網路");
  }
}

function renderConnectState() {
  $("btnCreateRoom").disabled = !appState.connected;
  $("btnJoinRoom").disabled = !appState.connected;
  $("btnJoinSpectator") && ($("btnJoinSpectator").disabled = !appState.connected);
  $("btnStartOffline").disabled = false;
}

function roomRef(path = "") {
  return ref(appState.db, `rooms/${appState.roomCode}${path ? "/" + path : ""}`);
}

function generateRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}


function aiHealthSettingsFromUI() {
  return {
    ...defaultSettings(),
    difficulty: Number($("offlineDifficulty")?.value || 16),
    aiStyle: $("offlineAiStyle")?.value || "expert",
    healthRounds: Number($("aiTestRounds")?.value || 6),
    balanceTarget: $("aiBalanceTarget")?.value || "normal",
    showAiThoughts: false
  };
}

async function runAiHealthCheck() {
  const button = $("btnRunAiTest");
  const status = $("aiTestStatus");
  if (!button || !status) return;
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "測試中...";
  status.textContent = "正在模擬全電腦對戰，請稍候。";
  try {
    await new Promise((resolve) => setTimeout(resolve, 30));
    const settings = aiHealthSettingsFromUI();
    const rounds = Math.max(6, Math.min(36, Number(settings.healthRounds || 6)));
    const summary = aiRunHealthSimulation(settings, rounds);
    status.innerHTML = aiHealthSummaryHtml(summary);
    toast(`AI 健康檢查完成：${summary.healthScore} 分`);
  } catch (error) {
    console.error(error);
    status.textContent = `AI 測試失敗：${error?.message || error}`;
    toast("AI 測試失敗");
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

function aiRunHealthSimulation(settings, rounds = 6) {
  const aggregate = {
    rounds,
    completed: 0,
    failed: 0,
    napMade: 0,
    totalContract: 0,
    totalNapHeads: 0,
    headGifts: 0,
    controlWaste: 0,
    forcedHeadGifts: 0,
    avoidableHeadGifts: 0,
    safeFeeds: 0,
    unsafeFeeds: 0,
    blockStops: 0,
    lowCostBlocks: 0,
    overbid: 0,
    noBid: 0,
    loops: 0,
    samples: [],
    swingRounds: 0,
    closeRounds: 0,
    healthVersion: "AI V27"
  };
  let scores = [0, 0, 0, 0, 0];
  for (let round = 0; round < rounds; round += 1) {
    const players = Array.from({ length: 5 }, (_, seat) => ({ ...makeBotSeat(seat, seat + round), uid: `test-bot-${round}-${seat}` }));
    const game = createGame(players, settings, round % 5, scores);
    game.settings = { ...settings, showAiThoughts: false };
    let guard = 0;
    while (game.phase !== PHASE.ROUND_END && guard < 900) {
      guard += 1;
      if (game.pendingClear) {
        game.pendingClear.until = 0;
        clearPendingTrickIfReady(game);
        continue;
      }
      const action = getBotAction(game);
      if (!action || !applyAction(game, action)) break;
    }
    aggregate.loops += guard;
    if (game.phase !== PHASE.ROUND_END) {
      aggregate.failed += 1;
      aggregate.samples.push(`第 ${round + 1} 局未能完成，停在 ${game.phase || "未知階段"}。`);
      continue;
    }
    scores = game.players.map((p) => p.score || 0);
    aggregate.completed += 1;
    const totals = calculateHeadTotals(game);
    aggregate.napMade += game.roundResult?.made ? 1 : 0;
    aggregate.totalContract += totals.contract || 0;
    aggregate.totalNapHeads += totals.teamHeads || 0;
    if (Math.abs((totals.teamHeads || 0) - (totals.contract || 0)) <= 1) aggregate.closeRounds += 1;
    if ((totals.teamHeads || 0) >= (totals.contract || 0) - 1 && (totals.teamHeads || 0) <= (totals.contract || 0) + 1) aggregate.swingRounds += 1;
    if (!game.bidding?.highest) aggregate.noBid += 1;
    if ((game.bid?.amount || game.bidAmount || 0) >= 13 && totals.teamHeads < (totals.contract || 0) - 2) aggregate.overbid += 1;
    const audit = aiAuditRoundTactics(game);
    aggregate.headGifts += audit.headGifts;
    aggregate.controlWaste += audit.controlWaste;
    aggregate.forcedHeadGifts += audit.forcedHeadGifts || 0;
    aggregate.avoidableHeadGifts += audit.avoidableHeadGifts || 0;
    aggregate.safeFeeds += audit.safeFeeds || 0;
    aggregate.unsafeFeeds += audit.unsafeFeeds || 0;
    aggregate.blockStops += audit.blockStops || 0;
    aggregate.lowCostBlocks += audit.lowCostBlocks || 0;
    if (aggregate.samples.length < 4) aggregate.samples.push(audit.summary);
  }
  const completed = Math.max(1, aggregate.completed);
  aggregate.madeRate = aggregate.napMade / completed;
  const targetRange = aiHealthTargetRange(settings.balanceTarget || "normal");
  aggregate.targetLow = targetRange.low;
  aggregate.targetHigh = targetRange.high;
  aggregate.targetLabel = targetRange.label;
  const balancePenalty = aggregate.madeRate > targetRange.high + 0.08
    ? (aggregate.madeRate - targetRange.high - 0.08) * 18
    : (aggregate.madeRate < targetRange.low - 0.10 ? (targetRange.low - 0.10 - aggregate.madeRate) * 12 : 0);
  const penalty = aggregate.failed * 12
    + aggregate.avoidableHeadGifts * 2.4
    + aggregate.forcedHeadGifts * 0.45
    + aggregate.controlWaste * 2.4
    + aggregate.overbid * 5
    + aggregate.noBid * 2
    + balancePenalty * completed;
  aggregate.avgContract = aggregate.totalContract / completed;
  aggregate.avgNapHeads = aggregate.totalNapHeads / completed;
  aggregate.closeRate = aggregate.closeRounds / completed;
  const balanceGap = aggregate.madeRate < targetRange.low ? targetRange.low - aggregate.madeRate : (aggregate.madeRate > targetRange.high ? aggregate.madeRate - targetRange.high : 0);
  const balanceScorePenalty = balanceGap * (aggregate.closeRate >= 0.35 ? 10 : 16);
  aggregate.healthScore = Math.max(45, Math.min(99, Math.round(100 - penalty / completed - balanceScorePenalty + Math.min(4, aggregate.blockStops / completed))));
  aggregate.confidenceLabel = rounds >= 30 ? "高信度" : (rounds >= 18 ? "穩定" : (rounds >= 12 ? "標準" : "快速"));
  aggregate.balanceNote = aiV27BalanceNote(aggregate.madeRate, targetRange, aggregate);
  aggregate.attackDefenseNote = aiV27AttackDefenseNote(aggregate, targetRange);
  aggregate.autoSuggestion = aiV27TuningSuggestion(aggregate, targetRange);
  aggregate.overbidNote = aiV27OverbidNote(aggregate);
  aggregate.suspiciousHeadGifts = (aggregate.avoidableHeadGifts || 0) + (aggregate.forcedHeadGifts || 0);
  aggregate.preventableRatio = aggregate.suspiciousHeadGifts ? (aggregate.avoidableHeadGifts || 0) / aggregate.suspiciousHeadGifts : 0;
  aggregate.reportNote = aggregate.avoidableHeadGifts <= 12
    ? "可避免送頭低，主要剩被迫跟牌或局勢交換。"
    : (aggregate.avoidableHeadGifts <= 24 ? "可避免送頭中等，仍可觀察後手風險。" : "可避免送頭偏高，建議提高防守與保守度。" );
  return aggregate;
}

function aiHealthTargetRange(mode = "normal") {
  if (mode === "hard-nap") return { low: 0.35, high: 0.50, label: "拿破崙挑戰 35–50%" };
  if (mode === "easy-nap") return { low: 0.55, high: 0.70, label: "拿破崙友善 55–70%" };
  return { low: 0.45, high: 0.60, label: "標準 45–60%" };
}

function aiV22BalanceNote(madeRate, target) {
  if (madeRate < target.low - 0.08) return "聯合國明顯偏強，拿破崙需要更多進攻窗口";
  if (madeRate < target.low) return "聯合國略強，拿破崙接近但偏難";
  if (madeRate > target.high + 0.08) return "拿破崙明顯偏強，聯合國需提升擋約";
  if (madeRate > target.high) return "拿破崙略強，防守仍可加強";
  return "攻防分布正常";
}

function aiV22TuningSuggestion(summary, target) {
  const madeRate = summary.madeRate || 0;
  const avoidable = summary.avoidableHeadGifts || 0;
  const controlWaste = summary.controlWaste || 0;
  if (madeRate < target.low) {
    if ((summary.avgContract || 0) - (summary.avgNapHeads || 0) <= 1.3) return "拿破崙常差一點，建議保留 V21/V22 進攻補強並提高秘書救局權重。";
    return "拿破崙偏難，建議降低防家非關鍵擋約，讓拿破崙軍更敢兌現控制牌。";
  }
  if (madeRate > target.high) {
    return avoidable > 10 ? "拿破崙偏強且可避免送頭偏高，建議提高後手風險與防守權重。" : "拿破崙偏強但送頭不高，建議提高聯合國低成本擋約。";
  }
  if (controlWaste > Math.max(3, summary.rounds * 0.8)) return "攻防平衡，但控制牌浪費偏多，建議保留鬼牌/秘書牌到關鍵墩。";
  if ((summary.closeRate || 0) >= 0.45) return "多數局接近成敗線，節奏良好，可維持目前參數。";
  return "攻防落在目標區間，可再用 24 或 36 局高信度測試確認。";
}


function aiV24BalanceNote(madeRate, target, summary = {}) {
  const diff = (summary.avgNapHeads || 0) - (summary.avgContract || 0);
  if (madeRate < target.low - 0.08) return "聯合國明顯偏強，拿破崙需要更多主動進攻與秘書救局";
  if (madeRate < target.low) return diff >= -1.4 ? "聯合國略強，拿破崙多數局只差一兩頭" : "聯合國略強，拿破崙進攻窗口不足";
  if (madeRate > target.high + 0.08) return "拿破崙明顯偏強，聯合國需提升後手風險與擋約";
  if (madeRate > target.high) return "拿破崙略強，防守仍可微調";
  return (summary.closeRate || 0) >= 0.35 ? "攻防分布正常，且多數局接近成敗線" : "攻防分布正常";
}

function aiV24AttackDefenseNote(summary, target) {
  const madeRate = summary.madeRate || 0;
  const diff = (summary.avgNapHeads || 0) - (summary.avgContract || 0);
  if (madeRate < target.low) {
    return diff >= -1.4
      ? "拿破崙只偏難一點：V24 會更主動搶頭、抽王牌並提高秘書救局。"
      : "拿破崙偏難：V24 會提高拿破崙中後盤追頭、控制牌兌現與抽王牌權重。";
  }
  if (madeRate > target.high) return "拿破崙偏強：V24 已保留聯合國關鍵擋約，避免拿破崙過強。";
  return "攻防落在目標區間：V24 維持拿破崙主動進攻與聯合國關鍵擋約平衡。";
}

function aiV24TuningSuggestion(summary, target) {
  const madeRate = summary.madeRate || 0;
  const closeRate = summary.closeRate || 0;
  const safeFeeds = summary.safeFeeds || 0;
  const rounds = Math.max(1, summary.completed || summary.rounds || 1);
  if (madeRate < target.low) {
    if (closeRate >= 0.35) return "拿破崙常差一點，V24 已提高拿破崙追頭、王牌控制與秘書救局權重。";
    return "拿破崙偏難且接近局不多，建議提高拿破崙搶頭與王牌抽牌權重。";
  }
  if (madeRate > target.high) return "拿破崙偏強，建議提高聯合國關鍵墩低成本擋約與後手風險判斷。";
  if (safeFeeds / rounds > 8) return "安全餵隊友偏多但攻防平衡，建議只在關鍵墩保留高餵頭權重。";
  return "攻防與送頭指標穩定，可用 24 或 36 局再確認。";
}

function aiAuditRoundTactics(game) {
  const team = (seat) => seat === game.napoleon || seat === game.secretaryOwner ? "nap" : "def";
  let headGifts = 0;
  let forcedHeadGifts = 0;
  let avoidableHeadGifts = 0;
  let safeFeeds = 0;
  let blockStops = 0;
  let controlWaste = 0;
  let unsafeFeeds = 0;
  let lowCostBlocks = 0;
  const details = [];
  for (const trick of game.trickHistory || []) {
    const plays = trick.plays || [];
    const winnerTeam = team(trick.winner);
    const heads = plays.filter((p) => isHeadCard(p.card)).length;
    const leadSuit = aiLeadSuitFromPlays(plays);
    let leader = null;
    let leaderBeforePlay = null;
    for (let index = 0; index < plays.length; index += 1) {
      const play = plays[index];
      const card = play.card;
      if (!card) continue;
      leaderBeforePlay = leader;
      const playTeam = team(play.seat);
      const sameTeam = playTeam === winnerTeam;
      const isPoint = isHeadCard(card);
      const isControl = card.joker || card.id === game.secretaryCardId || (game.trump && game.trump !== "NT" && card.suit === game.trump && card.value >= 12);
      const beforeTeam = leaderBeforePlay === null ? null : team(leaderBeforePlay.seat);
      const playedIntoEnemy = beforeTeam && beforeTeam !== playTeam;
      const leading = index === 0;
      const followedLeadSuit = !leading && leadSuit && !card.joker && card.suit === leadSuit;
      const offSuitPoint = !leading && isPoint && leadSuit && !card.joker && card.suit !== leadSuit;
      const lateForced = (trick.trickNo || 0) >= 7 && isPoint;

      if (!sameTeam && isPoint) {
        const likelyForced = followedLeadSuit || lateForced;
        let giftWeight = likelyForced ? 0.28 : 0.9;
        if (playedIntoEnemy) giftWeight += 0.35;
        if (leading) giftWeight += 0.28;
        if (offSuitPoint) giftWeight += 0.55;
        if (heads >= 3) giftWeight += 0.22;
        if (winnerTeam === "nap") giftWeight += 0.18;
        headGifts += Math.max(0.12, giftWeight);
        if (likelyForced) forcedHeadGifts += 1;
        else avoidableHeadGifts += 1;
      }

      if (sameTeam && isPoint && !leading) {
        const allyWasWinning = leaderBeforePlay && team(leaderBeforePlay.seat) === playTeam;
        if (allyWasWinning || play.seat === trick.winner) safeFeeds += 1;
      }
      if (!sameTeam && isPoint && !leading && playedIntoEnemy && !followedLeadSuit) {
        unsafeFeeds += 1;
      }

      if (!sameTeam && isControl && heads <= 1) {
        let wasteWeight = 0.75;
        if ((trick.trickNo || 0) >= 7) wasteWeight -= 0.25;
        if (card.id === game.secretaryCardId || card.joker) wasteWeight += 0.3;
        controlWaste += Math.max(0.25, wasteWeight);
      }

      if (leader === null || cardBeats(card, leader.card, game, leadSuit)) leader = play;
    }
    if (winnerTeam === "def" && heads >= 2) blockStops += 1;
    if (winnerTeam === "def" && heads >= 2 && plays.some((p) => p.card && !p.card.joker && !(game.trump && game.trump !== "NT" && p.card.suit === game.trump))) lowCostBlocks += 1;
    if (heads >= 3) details.push(`第 ${Number(trick.trickNo) + 1} 墩 ${game.players[trick.winner]?.name || "某玩家"} 收 ${heads} 頭。`);
  }
  headGifts = Math.round(headGifts);
  controlWaste = Math.round(controlWaste);
  const result = game.roundResult || {};
  const bidText = formatBid(game.bid || game.bidding?.highest);
  const summary = `${bidText}，拿破崙軍 ${result.teamHeads ?? "?"}/${result.contract ?? "?"} 頭；可避免送頭 ${avoidableHeadGifts}，被迫送頭 ${forcedHeadGifts}，安全餵隊友 ${safeFeeds}，擋約/攔頭 ${blockStops}。`;
  return { headGifts, forcedHeadGifts, avoidableHeadGifts, safeFeeds, unsafeFeeds, blockStops, lowCostBlocks, controlWaste, summary, details };
}

function aiHealthSummaryHtml(summary) {
  const rows = [
    ["健康分數", `${summary.healthScore} / 100`],
    ["完成局數", `${summary.completed}/${summary.rounds}`],
    ["拿破崙達標率", `${Math.round(summary.madeRate * 100)}%`],
    ["平均成約", `${summary.avgContract.toFixed(1)} 頭`],
    ["平均拿破崙軍頭數", `${summary.avgNapHeads.toFixed(1)} 頭`],
    ["測試信度", `${summary.confidenceLabel || "快速"}（${summary.rounds}局）`],
    ["平衡目標", summary.targetLabel || "標準 45–60%"],
    ["攻防平衡", summary.balanceNote || "-"],
    ["可疑送頭總數", `${summary.suspiciousHeadGifts || 0}`],
    ["可避免送頭", `${summary.avoidableHeadGifts || 0}`],
    ["被迫送頭", `${summary.forcedHeadGifts || 0}`],
    ["安全餵隊友", `${summary.safeFeeds || 0}`],
    ["擋約/攔頭", `${summary.blockStops || 0}`],
    ["低成本擋約", `${summary.lowCostBlocks || 0}`],
    ["接近成敗線", `${summary.closeRounds || 0} 局`],
    ["控制牌浪費警示", `${summary.controlWaste}`],
    ["叫牌過高警示", `${summary.overbid || 0}`],
    ["叫牌判讀", summary.overbidNote || "-"],
    ["送頭判讀", summary.reportNote || "-"],
    ["攻防建議", summary.attackDefenseNote || "-"],
    ["自動建議", summary.autoSuggestion || "-"]
  ];
  const detail = summary.samples.filter(Boolean).slice(0, 3).map((line) => `<li>${escapeHtml(line)}</li>`).join("");
  return `
    <span class="ai-health-score ${summary.healthScore >= 85 ? "good" : summary.healthScore >= 70 ? "ok" : "warn"}">${summary.healthScore} 分</span>
    <div class="ai-health-grid">${rows.map(([k, v]) => `<span>${escapeHtml(k)}</span><b>${escapeHtml(v)}</b>`).join("")}</div>
    <ul class="ai-health-notes">${detail}</ul>
  `;
}

function applyOfflinePresetFromUI(notify = false) {
  const presetId = $("offlinePreset")?.value || "standard";
  const preset = SETTING_PRESETS[presetId] || SETTING_PRESETS.standard;
  if ($("offlineDifficulty")) $("offlineDifficulty").value = String(preset.difficulty);
  if ($("offlineAiStyle")) $("offlineAiStyle").value = preset.aiStyle;
  if ($("aiBalanceTarget")) $("aiBalanceTarget").value = preset.balanceTarget || "normal";
  if (notify) toast(`已套用：${preset.label}`);
}

function applyLobbyPresetFromUI(notify = false) {
  const presetId = $("lobbyPreset")?.value || "standard";
  const preset = SETTING_PRESETS[presetId] || SETTING_PRESETS.standard;
  if ($("difficulty")) $("difficulty").value = String(preset.difficulty);
  if ($("difficultyLabel")) $("difficultyLabel").textContent = String(preset.difficulty);
  for (const [id, value] of Object.entries({ buriedMode: preset.buriedMode, leadMode: preset.leadMode, trumpMode: preset.trumpMode, aiStyle: preset.aiStyle })) {
    if ($(id)) $(id).value = value;
  }
  for (const [id, value] of Object.entries({ jokerLowLast3: preset.jokerLowLast3, summonJokers: preset.summonJokers, allowSelfSecretary: preset.allowSelfSecretary, showAiThoughts: preset.showAiThoughts })) {
    if ($(id)) $(id).checked = Boolean(value);
  }
  if (notify) toast(`已套用：${preset.label}`);
  syncLobbySettingsSoon();
}

function isSoundEnabled() {
  return localStorage.getItem(STORAGE.sound) === "1";
}

function isVibrationEnabled() {
  return localStorage.getItem(STORAGE.vibration) === "1";
}

function setSoundEnabled(enabled) {
  localStorage.setItem(STORAGE.sound, enabled ? "1" : "0");
  applyFeedbackSettings();
  if (enabled) playSfx("click");
}

function setVibrationEnabled(enabled) {
  localStorage.setItem(STORAGE.vibration, enabled ? "1" : "0");
  applyFeedbackSettings();
  if (enabled) vibrate([18]);
}

function applyFeedbackSettings() {
  if ($("soundToggle")) $("soundToggle").checked = isSoundEnabled();
  if ($("vibrationToggle")) $("vibrationToggle").checked = isVibrationEnabled();
  if ($("soundProfile")) $("soundProfile").value = getSoundProfile();
}

function getSoundProfile() {
  const profile = localStorage.getItem(STORAGE.soundProfile) || "soft";
  return ["soft", "classic", "arcade"].includes(profile) ? profile : "soft";
}

function setSoundProfile(profile) {
  const safe = ["soft", "classic", "arcade"].includes(profile) ? profile : "soft";
  localStorage.setItem(STORAGE.soundProfile, safe);
  applyFeedbackSettings();
  if (isSoundEnabled()) playSfx("click");
  toast(`音效風格：${safe === "soft" ? "柔和" : safe === "classic" ? "經典" : "遊戲感"}`);
}

function isTouchComfortEnabled() {
  return localStorage.getItem(STORAGE.touchComfort) === "1";
}

function setTouchComfortEnabled(enabled) {
  localStorage.setItem(STORAGE.touchComfort, enabled ? "1" : "0");
  applyTouchComfort();
  toast(enabled ? "已開啟手機大牌模式" : "已關閉手機大牌模式");
}

function applyTouchComfort() {
  const enabled = isTouchComfortEnabled();
  document.body.classList.toggle("touch-comfort", enabled);
  if ($("touchComfortToggle")) $("touchComfortToggle").checked = enabled;
}

function playSfx(type = "click") {
  if (!isSoundEnabled()) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = appState.audioContext || new AudioContext();
    appState.audioContext = ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const profile = getSoundProfile();
    const base = type === "turn" ? 880 : type === "win" ? 1046 : type === "lose" ? 196 : 520;
    const freq = profile === "arcade" ? base * 1.18 : profile === "classic" ? base * 0.94 : base;
    osc.type = type === "lose" ? "sawtooth" : profile === "arcade" ? "square" : "sine";
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(profile === "soft" ? 0.028 : type === "turn" ? 0.052 : 0.04, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (profile === "arcade" ? 0.16 : type === "turn" ? 0.2 : 0.14));
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  } catch (error) {
    console.warn("Sound effect failed", error);
  }
}

function vibrate(pattern = [24]) {
  if (!isVibrationEnabled() || !navigator.vibrate) return;
  try { navigator.vibrate(pattern); } catch {}
}

function maybeNotifyMyTurn(game) {
  const seat = myGameSeat(game);
  if (seat === null || game.phase === PHASE.ROUND_END || game.pendingClear) return;
  const isMine = Number(game.currentPlayer) === Number(seat);
  const key = isMine ? `${game.phase}:${game.trickNo || 0}:${game.currentPlayer}:${(game.trick || []).length}` : null;
  if (!isMine || !key || appState.lastTurnNoticeKey === key) return;
  appState.lastTurnNoticeKey = key;
  playSfx("turn");
  vibrate([40, 30, 40]);
}


function getEmptyLocalStats() {
  return {
    version: 1,
    games: 0,
    wins: 0,
    losses: 0,
    napGames: 0,
    napWins: 0,
    defGames: 0,
    defWins: 0,
    totalScoreDelta: 0,
    teamHeadsTotal: 0,
    contractTotal: 0,
    closeGames: 0,
    offlineGames: 0,
    onlineGames: 0,
    recent: [],
    keys: []
  };
}

function loadLocalStats() {
  try {
    return { ...getEmptyLocalStats(), ...(JSON.parse(localStorage.getItem(STORAGE.localStats) || "{}") || {}) };
  } catch {
    return getEmptyLocalStats();
  }
}

function saveLocalStats(stats) {
  localStorage.setItem(STORAGE.localStats, JSON.stringify(stats));
}

function deltaFromResult(result, seat) {
  return result?.scoreDeltas?.[seat] ?? 0;
}

function recordRoundStats(key, game, result, seat, playerTeam, playerWon, delta) {
  if (!key || appState.recordedRoundKeys.has(key)) return;
  const stats = loadLocalStats();
  if ((stats.keys || []).includes(key)) {
    appState.recordedRoundKeys.add(key);
    return;
  }
  const isNap = playerTeam === "nap";
  const diff = Math.abs((result.teamHeads || 0) - (result.contract || 0));
  stats.games += 1;
  stats.wins += playerWon ? 1 : 0;
  stats.losses += playerWon ? 0 : 1;
  stats.napGames += isNap ? 1 : 0;
  stats.napWins += isNap && playerWon ? 1 : 0;
  stats.defGames += !isNap ? 1 : 0;
  stats.defWins += !isNap && playerWon ? 1 : 0;
  stats.totalScoreDelta += Number(delta || 0);
  stats.teamHeadsTotal += Number(result.teamHeads || 0);
  stats.contractTotal += Number(result.contract || 0);
  stats.closeGames += diff <= 1 ? 1 : 0;
  if (appState.offline || appState.room?.meta?.mode === "offline") stats.offlineGames += 1;
  else stats.onlineGames += 1;
  stats.recent = [{
    at: Date.now(),
    mode: appState.offline ? "單人" : "多人",
    team: isNap ? "拿破崙軍" : "聯合國",
    result: playerWon ? "勝" : "敗",
    delta: Number(delta || 0),
    heads: `${result.teamHeads}/${result.contract}`,
    winner: result.winningTeam === "nap" ? "拿破崙軍" : "聯合國"
  }, ...(stats.recent || [])].slice(0, 20);
  stats.keys = [key, ...(stats.keys || [])].slice(0, 80);
  saveLocalStats(stats);
  appState.recordedRoundKeys.add(key);
  renderLocalStatsSummary();
  renderAchievementSummary();
}

function renderLocalStatsSummary() {
  const el = $("localStatsSummary");
  if (!el) return;
  const stats = loadLocalStats();
  if (!stats.games) {
    el.innerHTML = `<div class="stats-empty">尚無已完成牌局。完成一局後，這裡會自動累積本機統計。</div>`;
    return;
  }
  const winRate = Math.round((stats.wins / Math.max(1, stats.games)) * 100);
  const napRate = Math.round((stats.napWins / Math.max(1, stats.napGames || 0)) * 100) || 0;
  const defRate = Math.round((stats.defWins / Math.max(1, stats.defGames || 0)) * 100) || 0;
  const avgHeads = (stats.teamHeadsTotal / Math.max(1, stats.games)).toFixed(1);
  const avgContract = (stats.contractTotal / Math.max(1, stats.games)).toFixed(1);
  const recent = (stats.recent || []).slice(0, 3).map((r) => `<li>${escapeHtml(r.mode)}・${escapeHtml(r.team)}・${escapeHtml(r.result)}・${escapeHtml(r.heads)} 頭・${r.delta >= 0 ? "+" : ""}${r.delta}</li>`).join("");
  el.innerHTML = `
    <div class="stats-grid">
      <div><span>總局數</span><b>${stats.games}</b></div>
      <div><span>勝率</span><b>${winRate}%</b></div>
      <div><span>總分差</span><b>${stats.totalScoreDelta >= 0 ? "+" : ""}${stats.totalScoreDelta}</b></div>
      <div><span>接近成敗線</span><b>${stats.closeGames}</b></div>
      <div><span>拿破崙勝率</span><b>${stats.napGames ? `${napRate}%` : "-"}</b></div>
      <div><span>聯合國勝率</span><b>${stats.defGames ? `${defRate}%` : "-"}</b></div>
      <div><span>平均頭數</span><b>${avgHeads}</b></div>
      <div><span>平均成約</span><b>${avgContract}</b></div>
    </div>
    ${recent ? `<ul class="stats-recent">${recent}</ul>` : ""}
  `;
}


function computeAchievements(stats = loadLocalStats()) {
  const winRate = stats.games ? Math.round((stats.wins / Math.max(1, stats.games)) * 100) : 0;
  const napRate = stats.napGames ? Math.round((stats.napWins / Math.max(1, stats.napGames)) * 100) : 0;
  const defRate = stats.defGames ? Math.round((stats.defWins / Math.max(1, stats.defGames)) * 100) : 0;
  return [
    { id: "first-game", title: "初次上桌", desc: "完成 1 局", unlocked: stats.games >= 1 },
    { id: "five-games", title: "牌桌常客", desc: "完成 5 局", unlocked: stats.games >= 5 },
    { id: "twenty-games", title: "老練玩家", desc: "完成 20 局", unlocked: stats.games >= 20 },
    { id: "first-win", title: "首勝", desc: "拿下第 1 場勝利", unlocked: stats.wins >= 1 },
    { id: "nap-win", title: "拿破崙達標", desc: "以拿破崙軍獲勝 1 次", unlocked: stats.napWins >= 1 },
    { id: "def-win", title: "聯合國守成", desc: "以聯合國獲勝 1 次", unlocked: stats.defWins >= 1 },
    { id: "close-master", title: "關鍵一頭", desc: "完成 3 局接近成敗線牌局", unlocked: stats.closeGames >= 3 },
    { id: "balanced-player", title: "攻守兼備", desc: "拿破崙與聯合國各勝 1 次", unlocked: stats.napWins >= 1 && stats.defWins >= 1 },
    { id: "winrate", title: "勝率達人", desc: "至少 10 局且勝率 60% 以上", unlocked: stats.games >= 10 && winRate >= 60 },
    { id: "nap-specialist", title: "拿破崙專家", desc: "至少 5 局拿破崙軍且勝率 50% 以上", unlocked: stats.napGames >= 5 && napRate >= 50 },
    { id: "def-specialist", title: "防守專家", desc: "至少 5 局聯合國且勝率 50% 以上", unlocked: stats.defGames >= 5 && defRate >= 50 }
  ];
}

function renderAchievementSummary() {
  const el = $("achievementSummary");
  if (!el) return;
  const stats = loadLocalStats();
  const achievements = computeAchievements(stats);
  const unlocked = achievements.filter((a) => a.unlocked);
  const recent = achievements.slice(0, 11).map((a) => `<div class="achievement ${a.unlocked ? "unlocked" : "locked"}"><b>${a.unlocked ? "🏅" : "🔒"} ${escapeHtml(a.title)}</b><span>${escapeHtml(a.desc)}</span></div>`).join("");
  el.innerHTML = `<div class="achievement-head"><b>${unlocked.length}/${achievements.length} 成就已解鎖</b><span>${stats.games ? "繼續完成牌局可解鎖更多成就。" : "完成一局後開始解鎖成就。"}</span></div><div class="achievement-grid">${recent}</div>`;
}

async function shareAchievements() {
  const stats = loadLocalStats();
  const achievements = computeAchievements(stats);
  const unlocked = achievements.filter((a) => a.unlocked);
  const text = [
    "拿破崙與秘書｜本機成就",
    `版本：${APP_VERSION}`,
    `已解鎖：${unlocked.length}/${achievements.length}`,
    `總局數：${stats.games || 0}`,
    `勝率：${stats.games ? Math.round((stats.wins / Math.max(1, stats.games)) * 100) + "%" : "-"}`,
    unlocked.length ? `成就：${unlocked.map((a) => a.title).join("、")}` : "成就：尚未解鎖"
  ].join("\n");
  try {
    if (navigator.share) await navigator.share({ title: "拿破崙與秘書成就", text });
    else await navigator.clipboard.writeText(text);
    toast(navigator.share ? "已開啟分享" : "成就已複製");
  } catch {
    await navigator.clipboard.writeText(text).catch(() => {});
    toast("成就已複製");
  }
}

function collectLocalData() {
  return {
    appVersion: APP_VERSION,
    appBuild: APP_BUILD,
    exportedAt: new Date().toISOString(),
    settings: {
      theme: localStorage.getItem(STORAGE.theme) || "ocean",
      playerHints: getPlayerHintsVisible(),
      sound: isSoundEnabled(),
      vibration: isVibrationEnabled(),
      touchComfort: isTouchComfortEnabled(),
      soundProfile: getSoundProfile(),
      playerName: localStorage.getItem(STORAGE.name) || ""
    },
    stats: loadLocalStats(),
    achievements: computeAchievements(loadLocalStats()).filter((a) => a.unlocked).map((a) => a.id),
    lastRoom: localStorage.getItem(STORAGE.lastRoom) || "",
    errors: loadErrorLog()
  };
}

async function copyText(text, successMessage = "已複製") {
  try {
    await navigator.clipboard.writeText(text);
    toast(successMessage);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    toast(successMessage);
  }
}

async function exportLocalData() {
  await copyText(JSON.stringify(collectLocalData(), null, 2), "已複製本機資料 JSON");
}

function resetLocalData() {
  const ok = window.confirm("確定要清除本機統計、偏好、上次房號與錯誤紀錄？不會刪除 Firebase 房間資料。");
  if (!ok) return;
  for (const key of [STORAGE.localStats, STORAGE.errorLog, STORAGE.lastRoom, STORAGE.lastRoomAt, STORAGE.logVisible, STORAGE.playerHints, STORAGE.sound, STORAGE.vibration, STORAGE.touchComfort, STORAGE.soundProfile, STORAGE.theme, STORAGE.onboardingSeen]) {
    localStorage.removeItem(key);
  }
  appState.recordedRoundKeys.clear();
  applyPlayerHintsVisible(false);
  applyFeedbackSettings();
  applyTouchComfort();
  renderLocalStatsSummary();
  toast("已重設本機資料");
}

function loadErrorLog() {
  try { return JSON.parse(localStorage.getItem(STORAGE.errorLog) || "[]") || []; }
  catch { return []; }
}

function saveErrorLog(list) {
  localStorage.setItem(STORAGE.errorLog, JSON.stringify((list || []).slice(0, 12)));
}

function logClientError(message, detail = "") {
  const entry = {
    at: new Date().toISOString(),
    version: APP_VERSION,
    build: APP_BUILD,
    message: String(message || "未知錯誤").slice(0, 220),
    detail: String(detail || "").slice(0, 600),
    url: location.href,
    userAgent: navigator.userAgent
  };
  saveErrorLog([entry, ...loadErrorLog()]);
}

function installErrorCapture() {
  if (window.__napoleonErrorCaptureInstalled) return;
  window.__napoleonErrorCaptureInstalled = true;
  window.addEventListener("error", (event) => logClientError(event.message, `${event.filename || ""}:${event.lineno || 0}:${event.colno || 0}`));
  window.addEventListener("unhandledrejection", (event) => logClientError("Unhandled promise rejection", event.reason?.stack || event.reason?.message || event.reason));
}

async function copyErrorReport() {
  const data = collectLocalData();
  const room = appState.room;
  const text = [
    "拿破崙與秘書錯誤回報",
    `版本：${APP_VERSION}（${APP_BUILD}）`,
    `網址：${location.href}`,
    `瀏覽器：${navigator.userAgent}`,
    `Firebase：${appState.connected ? "已連線" : "未連線"}`,
    `房間：${appState.roomCode || "無"}／${room?.meta?.status || "無"}`,
    `統計局數：${data.stats.games || 0}`,
    "最近錯誤：",
    ...(data.errors.length ? data.errors.map((e, i) => `${i + 1}. ${e.at} ${e.message} ${e.detail || ""}`) : ["無紀錄"])
  ].join("\n");
  await copyText(text, "已複製錯誤回報");
}

function installKeyboardShortcuts() {
  if (window.__napoleonShortcutsInstalled) return;
  window.__napoleonShortcutsInstalled = true;
  window.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const tag = String(event.target?.tagName || "").toLowerCase();
    if (["input", "select", "textarea", "button"].includes(tag)) return;
    const key = event.key.toLowerCase();
    if (key === "h") {
      const next = !getPlayerHintsVisible();
      setPlayerHintsVisible(next);
      toast(next ? "已開啟玩家提示" : "已關閉玩家提示");
    } else if (key === "l") {
      toggleLogVisibility();
    } else if (key === "r" && appState.room?.game?.phase === PHASE.ROUND_END) {
      openReplayDialog(appState.room.game);
    } else if (key === "t") {
      cycleTheme();
    }
  });
}

function cycleTheme() {
  const current = localStorage.getItem(STORAGE.theme) || "ocean";
  const i = THEME_OPTIONS.indexOf(current);
  const next = THEME_OPTIONS[(i + 1) % THEME_OPTIONS.length] || "ocean";
  applyTheme(next, true);
  toast(`主題：${$("themeSelect")?.selectedOptions?.[0]?.textContent || next}`);
}


function maybeShowFirstRunGuide() {
  const seen = localStorage.getItem(STORAGE.onboardingSeen) === "1";
  const hasStats = (loadLocalStats().games || 0) > 0;
  if (seen || hasStats || appState.autoJoinCode) return;
  window.setTimeout(() => showOnboardingDialog(false), 650);
}

function showOnboardingDialog(force = false) {
  const dialog = $("onboardingDialog");
  if (!dialog) return;
  if (!force && localStorage.getItem(STORAGE.onboardingSeen) === "1") return;
  try { dialog.showModal(); }
  catch { dialog.setAttribute("open", ""); }
}

function finishOnboarding() {
  localStorage.setItem(STORAGE.onboardingSeen, "1");
  const dialog = $("onboardingDialog");
  if (dialog?.open) dialog.close();
  toast("導覽已完成");
}

function buildStatsShareText() {
  const stats = loadLocalStats();
  const winRate = stats.games ? Math.round((stats.wins / Math.max(1, stats.games)) * 100) : 0;
  const napRate = stats.napGames ? Math.round((stats.napWins / Math.max(1, stats.napGames)) * 100) : 0;
  const defRate = stats.defGames ? Math.round((stats.defWins / Math.max(1, stats.defGames)) * 100) : 0;
  const avgHeads = stats.games ? (stats.teamHeadsTotal / Math.max(1, stats.games)).toFixed(1) : "-";
  const avgContract = stats.games ? (stats.contractTotal / Math.max(1, stats.games)).toFixed(1) : "-";
  const recent = (stats.recent || []).slice(0, 5).map((r, i) => `${i + 1}. ${r.mode} ${r.team} ${r.result} ${r.heads} 頭 ${r.delta >= 0 ? "+" : ""}${r.delta}`).join("\n");
  return [
    "🦊 拿破崙與秘書｜我的本機戰績",
    `版本：${APP_VERSION}`,
    `總局數：${stats.games || 0}`,
    `勝率：${winRate}%` ,
    `總分差：${stats.totalScoreDelta >= 0 ? "+" : ""}${stats.totalScoreDelta || 0}`,
    `拿破崙勝率：${stats.napGames ? `${napRate}%` : "-"}`,
    `聯合國勝率：${stats.defGames ? `${defRate}%` : "-"}`,
    `平均頭數 / 成約：${avgHeads} / ${avgContract}`,
    recent ? "最近戰績：\n" + recent : "最近戰績：尚無",
    "https://fox520-sketch.github.io/fox/"
  ].join("\n");
}

async function shareLocalStats() {
  const text = buildStatsShareText();
  if (navigator.share) {
    try {
      await navigator.share({ title: "拿破崙與秘書戰績", text });
      toast("已開啟分享");
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }
  await copyText(text, "已複製戰績摘要");
}

function openImportDataDialog() {
  const ta = $("importDataText");
  if (ta) ta.value = "";
  const dialog = $("importDataDialog");
  if (!dialog) return;
  try { dialog.showModal(); }
  catch { dialog.setAttribute("open", ""); }
}

function restoreLocalDataFromDialog() {
  const raw = $("importDataText")?.value || "";
  if (!raw.trim()) return toast("請先貼上 JSON");
  let data;
  try { data = JSON.parse(raw); }
  catch { return toast("JSON 格式錯誤"); }
  if (!data || typeof data !== "object") return toast("資料格式不正確");
  const settings = data.settings || {};
  if (settings.theme && THEME_OPTIONS.includes(settings.theme)) localStorage.setItem(STORAGE.theme, settings.theme);
  if (typeof settings.playerHints === "boolean") localStorage.setItem(STORAGE.playerHints, settings.playerHints ? "1" : "0");
  if (typeof settings.sound === "boolean") localStorage.setItem(STORAGE.sound, settings.sound ? "1" : "0");
  if (typeof settings.vibration === "boolean") localStorage.setItem(STORAGE.vibration, settings.vibration ? "1" : "0");
  if (typeof settings.touchComfort === "boolean") localStorage.setItem(STORAGE.touchComfort, settings.touchComfort ? "1" : "0");
  if (settings.soundProfile) localStorage.setItem(STORAGE.soundProfile, ["soft", "classic", "arcade"].includes(settings.soundProfile) ? settings.soundProfile : "soft");
  if (settings.playerName) localStorage.setItem(STORAGE.name, String(settings.playerName).slice(0, 12));
  if (data.stats && typeof data.stats === "object") saveLocalStats({ ...getEmptyLocalStats(), ...data.stats });
  if (Array.isArray(data.errors)) saveErrorLog(data.errors);
  if (data.lastRoom) localStorage.setItem(STORAGE.lastRoom, String(data.lastRoom).slice(0, 8));
  applyTheme(loadTheme());
  applyPlayerHintsVisible(getPlayerHintsVisible());
  applyFeedbackSettings();
  applyTouchComfort();
  renderLocalStatsSummary();
  const name = localStorage.getItem(STORAGE.name);
  if (name && $("playerName")) $("playerName").value = name;
  $("importDataDialog")?.close();
  toast("已還原本機資料");
}

const RELEASE_CHECKLIST_ITEMS = [
  { id: "offline", group: "單人", text: "單人離線可以從首頁開始，並完整玩完一局。" },
  { id: "bidding", group: "規則", text: "叫牌、換底牌、選秘書流程正常，王牌與成約顯示正確。" },
  { id: "hints", group: "提示", text: "玩家提示可開關，並在叫牌、換底牌、選秘書、出牌時顯示建議。" },
  { id: "replay", group: "回放", text: "本局結束後可打開牌局回放，且有分析標籤。" },
  { id: "ai-health", group: "AI", text: "AI 健康檢查能跑完，健康分數與攻防建議正常顯示。" },
  { id: "firebase", group: "多人", text: "Firebase 可連線，建立房間、加入房間與 QR Code 邀請正常。" },
  { id: "host-tools", group: "多人", text: "房主工具可顯示房間狀態，必要時能接管離線玩家或關閉房間。" },
  { id: "mobile", group: "手機", text: "手機直向/橫向可看見牌桌、手牌與主要操作。" },
  { id: "pwa", group: "PWA", text: "安裝、快取、清除舊快取與更新提示正常。" },
  { id: "support", group: "維護", text: "維護包、錯誤回報、本機資料匯出/還原可以複製。" }
];

function loadReleaseChecklist() {
  try { return JSON.parse(localStorage.getItem(STORAGE.releaseChecklist) || "{}"); }
  catch { return {}; }
}

function saveReleaseChecklist(data) {
  localStorage.setItem(STORAGE.releaseChecklist, JSON.stringify(data || {}));
  renderReleaseChecklistStatus();
}

function renderReleaseChecklistStatus() {
  const el = $("releaseChecklistStatus");
  if (!el) return;
  const data = loadReleaseChecklist();
  const done = RELEASE_CHECKLIST_ITEMS.filter((item) => data[item.id]).length;
  el.textContent = `已完成 ${done}/${RELEASE_CHECKLIST_ITEMS.length} 項；部署後建議全部檢查。`;
}

function renderReleaseChecklist() {
  const list = $("releaseChecklist");
  if (!list) return;
  const data = loadReleaseChecklist();
  const groups = new Map();
  for (const item of RELEASE_CHECKLIST_ITEMS) {
    if (!groups.has(item.group)) groups.set(item.group, []);
    groups.get(item.group).push(item);
  }
  list.innerHTML = Array.from(groups.entries()).map(([group, items]) => `
    <section class="checklist-group">
      <h3>${escapeHtml(group)}</h3>
      ${items.map((item) => `
        <label class="checklist-item">
          <input type="checkbox" data-check-id="${escapeHtml(item.id)}" ${data[item.id] ? "checked" : ""} />
          <span>${escapeHtml(item.text)}</span>
        </label>
      `).join("")}
    </section>
  `).join("");
  list.querySelectorAll("input[data-check-id]").forEach((input) => {
    input.addEventListener("change", () => {
      const next = loadReleaseChecklist();
      next[input.dataset.checkId] = input.checked;
      saveReleaseChecklist(next);
    });
  });
  renderReleaseChecklistStatus();
}

function openReleaseChecklistDialog() {
  renderReleaseChecklist();
  $("releaseChecklistDialog")?.showModal();
}

function resetReleaseChecklist() {
  saveReleaseChecklist({});
  renderReleaseChecklist();
  toast("測試清單已重設");
}

async function copyReleaseChecklistResult() {
  const data = loadReleaseChecklist();
  const done = RELEASE_CHECKLIST_ITEMS.filter((item) => data[item.id]).length;
  const lines = [
    `正式版測試清單｜${APP_VERSION}（${APP_BUILD}）`,
    `完成：${done}/${RELEASE_CHECKLIST_ITEMS.length}`,
    `網址：${location.href}`,
    ""
  ];
  for (const item of RELEASE_CHECKLIST_ITEMS) {
    lines.push(`${data[item.id] ? "[x]" : "[ ]"} ${item.group}｜${item.text}`);
  }
  await copyText(lines.join("\n"));
  toast("已複製測試結果");
}

function openTutorialDialog() {
  $("tutorialDialog")?.showModal();
}

function openReleaseNotesDialog() {
  const dialog = $("releaseNotesDialog");
  if (!dialog) return;
  try { dialog.showModal(); }
  catch { dialog.setAttribute("open", ""); }
}

function quickStartBeginner() {
  if ($("offlinePreset")) $("offlinePreset").value = "beginner";
  applyOfflinePresetFromUI(false);
  setPlayerHintsVisible(true);
  toast("已套用新手休閒與玩家提示");
  startOfflineGame();
}

function quickStartStandard() {
  if ($("offlinePreset")) $("offlinePreset").value = "standard";
  applyOfflinePresetFromUI(false);
  toast("已套用標準台式");
  startOfflineGame();
}

function scrollToMultiplayerStart() {
  $("playerName")?.scrollIntoView({ behavior: "smooth", block: "center" });
  setStatus("多人模式：先連線 Firebase，再建立新房或輸入房號加入。建立後可複製邀請連結或掃描 QR Code。");
  toast("已跳到多人設定");
}


function openShareKitDialog() {
  const dialog = $("shareKitDialog");
  if (!dialog) return;
  for (const kind of ["short", "long", "fox"] ) {
    const el = $(`shareKit${kind[0].toUpperCase()}${kind.slice(1)}`);
    if (el) el.value = buildShareKitText(kind);
  }
  try { dialog.showModal(); }
  catch { dialog.setAttribute("open", ""); }
}

function buildShareKitText(kind = "short") {
  const url = getPublicGameUrl();
  if (kind === "long") {
    return [
      "拿破崙與秘書｜台式玩法網頁版",
      "",
      "支援單人離線、Firebase 多人房間、QR Code 邀請、觀戰、牌局回放、玩家提示、AI 健康檢查與多種主題。",
      "手機可安裝成 PWA，也能從狐狸網路遊戲之家進入。",
      "",
      `遊戲網址：${url}`,
      `狐狸網路遊戲之家：${FOX_HOME_URL}`
    ].join("\n");
  }
  if (kind === "fox") {
    return `<a href="${url}">拿破崙與秘書</a>｜台式拿破崙與秘書，支援單人離線、多人房間、QR Code 邀請與牌局回放。`;
  }
  return `來玩拿破崙與秘書：${url}`;
}

async function copyShareKitText(kind) {
  await copyText(buildShareKitText(kind), kind === "fox" ? "已複製首頁素材" : "已複製分享文字");
}

function buildSupportBundle() {
  const stats = loadLocalStats();
  const errors = loadErrorLog().slice(0, 8);
  const maintenance = currentRoomMaintenanceStatus();
  const bundle = {
    app: "拿破崙與秘書",
    version: APP_VERSION,
    build: APP_BUILD,
    url: location.href,
    time: new Date().toISOString(),
    userAgent: navigator.userAgent,
    theme: localStorage.getItem(STORAGE.theme) || "ocean",
    playerHints: getPlayerHintsVisible(),
    sound: isSoundEnabled(),
    vibration: isVibrationEnabled(),
    touchComfort: isTouchComfortEnabled(),
    soundProfile: getSoundProfile(),
    online: navigator.onLine,
    firebaseConnected: appState.connected,
    room: appState.roomCode ? {
      code: appState.roomCode,
      status: appState.room?.meta?.status || null,
      isHost: isHost(),
      maintenance: maintenance.detail
    } : null,
    localStats: {
      games: stats.games || 0,
      wins: stats.wins || 0,
      losses: stats.losses || 0,
      napGames: stats.napGames || 0,
      napWins: stats.napWins || 0,
      defGames: stats.defGames || 0,
      defWins: stats.defWins || 0,
      totalScoreDelta: stats.totalScoreDelta || 0,
      recent: (stats.recent || []).slice(0, 5)
    },
    recentErrors: errors
  };
  return JSON.stringify(bundle, null, 2);
}

async function copySupportBundle() {
  await copyText(buildSupportBundle(), "已複製維護包");
}

function getPublicGameUrl() {
  const isHosted = location.protocol.startsWith("http") && !/localhost|127\.0\.0\.1/.test(location.hostname);
  if (isHosted) return `${location.origin}${location.pathname}`.replace(/index\.html$/i, "");
  return DEFAULT_PUBLIC_URL;
}

function getCurrentPublicStatusRows() {
  let localStorageOk = false;
  try {
    const key = "napoleon.public.status.test";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    localStorageOk = true;
  } catch {
    localStorageOk = false;
  }
  const httpsOk = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const swOk = "serviceWorker" in navigator;
  const cacheOk = "caches" in window;
  const shareOk = "share" in navigator;
  const installedLike = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
  const firebaseState = appState.connected ? "已連線" : "尚未連線";
  const roomState = appState.roomCode ? `${appState.roomCode}${appState.spectator ? "（觀戰）" : ""}` : "未在房間";
  return [
    { label: "公開網址", ok: true, value: getPublicGameUrl() },
    { label: "版本", ok: true, value: `${APP_VERSION}（${APP_BUILD}）` },
    { label: "HTTPS / Pages", ok: httpsOk, value: httpsOk ? "可用" : "建議部署到 GitHub Pages HTTPS" },
    { label: "PWA Service Worker", ok: swOk, value: swOk ? "瀏覽器支援" : "此瀏覽器不支援" },
    { label: "快取 API", ok: cacheOk, value: cacheOk ? "瀏覽器支援" : "此瀏覽器不支援" },
    { label: "本機儲存", ok: localStorageOk, value: localStorageOk ? "可用" : "不可用或被封鎖" },
    { label: "系統分享", ok: shareOk, value: shareOk ? "可用" : "不可用，會改用複製" },
    { label: "安裝狀態", ok: true, value: installedLike ? "類 App 模式" : "瀏覽器模式" },
    { label: "Firebase", ok: appState.connected, value: firebaseState },
    { label: "房間", ok: true, value: roomState }
  ];
}

function renderPublicStatus() {
  const el = $("publicStatusList");
  if (!el) return;
  const rows = getCurrentPublicStatusRows();
  el.innerHTML = rows.map((row) => `<div class="diag-row ${row.ok ? "ok" : "warn"}"><b>${row.ok ? "✓" : "!"} ${escapeHtml(row.label)}</b><span>${escapeHtml(row.value)}</span></div>`).join("");
}

function buildPublicStatusReport() {
  const rows = getCurrentPublicStatusRows();
  return [
    "拿破崙與秘書｜公開版狀態報告",
    `版本：${APP_VERSION}（${APP_BUILD}）`,
    `時間：${new Date().toLocaleString()}`,
    ...rows.map((row) => `${row.ok ? "✓" : "!"} ${row.label}：${row.value}`),
    "",
    `狐狸網路遊戲之家：${FOX_HOME_URL}`
  ].join("\n");
}

async function copyPublicGameLink() {
  await copyText(getPublicGameUrl(), "已複製公開網址");
}

async function copyPublicIntroText() {
  const text = [
    "🦊 拿破崙與秘書｜台式多人/單人網頁遊戲",
    "可單人離線對 4 位電腦，也可用 Firebase 房間邀朋友一起玩。",
    "支援 QR Code、觀戰、玩家提示、牌局回放、AI 健康檢查與 PWA 安裝。",
    `遊戲網址：${getPublicGameUrl()}`,
    `狐狸網路遊戲之家：${FOX_HOME_URL}`
  ].join("\n");
  try {
    if (navigator.share) await navigator.share({ title: "拿破崙與秘書", text, url: getPublicGameUrl() });
    else await copyText(text, "已複製公開介紹文");
    if (navigator.share) toast("已開啟分享");
  } catch {
    await copyText(text, "已複製公開介紹文");
  }
}

function openPublicStatusDialog() {
  renderPublicStatus();
  $("publicStatusDialog")?.showModal();
}

async function copyPublicStatusReport() {
  await copyText(buildPublicStatusReport(), "已複製公開狀態報告");
}


async function clearPwaCachesAndReload() {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((reg) => reg.unregister()));
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
    toast("已清除舊快取，正在重新載入");
    window.setTimeout(() => window.location.reload(), 650);
  } catch (error) {
    console.error(error);
    toast("清除快取失敗，請手動重新整理");
  }
}

async function runDiagnostics() {
  const el = $("diagnosticStatus");
  if (!el) return;
  const checks = [];
  const add = (name, ok, detail) => checks.push({ name, ok, detail });
  let cacheList = "無法讀取";
  if ("caches" in window) {
    try {
      const keys = await caches.keys();
      cacheList = keys.length ? keys.join("、") : "尚無快取";
    } catch {
      cacheList = "讀取失敗";
    }
  }
  const maintenance = currentRoomMaintenanceStatus();
  add("目前版本", true, `${APP_VERSION}（${APP_BUILD}）`);
  add("Service Worker", "serviceWorker" in navigator, "serviceWorker" in navigator ? "瀏覽器支援" : "瀏覽器不支援");
  add("PWA 安裝資訊", Boolean(document.querySelector('link[rel="manifest"]')), "manifest.webmanifest 已掛載");
  add("快取 API", "caches" in window, "caches" in window ? `可使用離線快取；目前快取：${cacheList}` : "不支援 Cache API");
  add("Firebase 狀態", appState.connected, appState.connected ? `已連線，uid ${String(appState.firebaseUid || "").slice(0, 8)}…` : "尚未連線，多人前請先連線 Firebase");
  add("房間狀態", Boolean(appState.roomCode), appState.roomCode ? `${appState.roomCode}・${appState.room?.meta?.status || "未訂閱"}` : "目前未在房間內");
  add("房間維護", !maintenance.warn, maintenance.detail);
  add("Firebase 規則", true, "已附 database.rules.json 與 database.rules.secure.example.json；公開版請優先使用建議規則並定期清理舊房間");
  add("房主工具", true, isHost() ? "目前是房主，可接管離線玩家、延長或關閉房間" : "非房主，只能操作自己的座位");
  add("本機儲存", (() => { try { localStorage.setItem("napoleon.diag", "1"); localStorage.removeItem("napoleon.diag"); return true; } catch { return false; } })(), "用於記住主題、提示、上次房號與偏好");
  const stats = loadLocalStats();
  add("本機統計", true, stats.games ? `${stats.games} 局，勝率 ${Math.round((stats.wins / Math.max(1, stats.games)) * 100)}%` : "尚無完成牌局");
  const unlockedAchievements = computeAchievements(stats).filter((a) => a.unlocked).length;
  add("本機成就", true, `${unlockedAchievements}/${computeAchievements(stats).length} 已解鎖`);
  add("錯誤回報", true, `${loadErrorLog().length} 筆本機錯誤紀錄`);
  add("無障礙/快捷鍵", true, "支援鍵盤 H/L/R/T；焦點樣式已加強；主要狀態區使用 aria-live");
  add("音效/震動", true, `${isSoundEnabled() ? "音效開" : "音效關"}，${isVibrationEnabled() ? "震動開" : "震動關"}`);
  const html = checks.map((item) => `<div class="diag-row ${item.ok ? "ok" : "warn"}"><b>${item.ok ? "✓" : "!"} ${escapeHtml(item.name)}</b><span>${escapeHtml(item.detail)}</span></div>`).join("");
  el.innerHTML = `<div class="diag-grid">${html}</div>`;
  playSfx("click");
  vibrate([20]);
}

function startOfflineGame() {
  detachRoom();
  appState.offline = true;
  appState.uid = "offline-human";
  appState.roomCode = "OFFLINE";
  appState.selectedExchange.clear();
  const name = sanitizeName($("playerName").value);
  $("playerName").value = name;
  localStorage.setItem(STORAGE.name, name);
  const settings = {
    ...defaultSettings(),
    difficulty: Number($("offlineDifficulty").value || 10),
    aiStyle: $("offlineAiStyle")?.value || "varied"
  };
  const seats = {
    0: makeHumanSeat(0, appState.uid, name),
    1: makeBotSeat(1, 1),
    2: makeBotSeat(2, 2),
    3: makeBotSeat(3, 3),
    4: makeBotSeat(4, 4)
  };
  const players = Array.from({ length: 5 }, (_, seat) => seats[seat]);
  appState.room = {
    meta: {
      code: "OFFLINE",
      hostUid: appState.uid,
      status: "game",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      mode: "offline"
    },
    lobby: { dealer: 0, settings, seats },
    game: createGame(players, settings, 0, [0, 0, 0, 0, 0])
  };
  history.replaceState(null, "", location.pathname);
  $("connectView").classList.add("hidden");
  $("lobbyView").classList.add("hidden");
  $("gameView").classList.remove("hidden");
  $("btnLeave").classList.remove("hidden");
  document.body.classList.add("in-game", "offline-game");
  renderGame();
  scheduleHostAutomation();
  toast("已開始單人離線局");
}

async function createRoom() {
  if (!appState.connected) return toast("請先連線 Firebase");
  appState.spectator = false;
  const name = sanitizeName($("playerName").value);
  localStorage.setItem(STORAGE.name, name);
  let code = generateRoomCode();
  for (let i = 0; i < 8; i += 1) {
    const snap = await get(ref(appState.db, `rooms/${code}`));
    if (!snap.exists()) break;
    code = generateRoomCode();
  }
  const now = Date.now();
  const room = {
    meta: {
      code,
      hostUid: appState.uid,
      status: "lobby",
      createdAt: now,
      updatedAt: now,
      expiresAt: now + ROOM_TTL_MS,
      schemaVersion: 36,
      appBuild: APP_BUILD
    },
    lobby: {
      dealer: 0,
      settings: readSettingsFromUI(),
      seats: {
        0: makeHumanSeat(0, appState.uid, name)
      }
    },
    game: null
  };
  appState.spectator = false;
  appState.roomCode = code;
  await set(roomRef(), room);
  await enterRoom(code);
  toast(`已建立房間 ${code}`);
}

function makeHumanSeat(seat, uid, name) {
  return { seat, uid, name, type: "human", joinedAt: Date.now(), online: true, score: 0 };
}

function makeBotSeat(seat, index = seat) {
  return {
    seat,
    uid: `bot-${seat}-${Date.now()}`,
    name: BOT_NAMES[index % BOT_NAMES.length],
    type: "bot",
    joinedAt: Date.now(),
    online: true,
    score: 0
  };
}

async function joinRoomFromInput() {
  if (!appState.connected) return toast("請先連線 Firebase");
  const code = $("roomCode").value.trim().toUpperCase();
  if (!code) return toast("請輸入房號，或按建立新房");
  await joinRoom(code);
}

async function joinAsSpectatorFromInput() {
  if (!appState.connected) return toast("請先連線 Firebase");
  const code = $("roomCode").value.trim().toUpperCase();
  if (!code) return toast("請輸入要觀戰的房號");
  const snap = await get(ref(appState.db, `rooms/${code}`));
  if (!snap.exists()) return toast("找不到房間");
  await joinAsSpectator(code, snap.val());
}

async function joinAsSpectator(code, room = null) {
  if (!appState.connected) return toast("請先連線 Firebase");
  const name = sanitizeName($("playerName").value);
  localStorage.setItem(STORAGE.name, name);
  appState.spectator = true;
  const spectatorData = {
    uid: appState.uid,
    name,
    type: "spectator",
    joinedAt: Date.now(),
    online: true,
    lastSeen: Date.now()
  };
  await update(ref(appState.db, `rooms/${code}/spectators/${appState.uid}`), spectatorData).catch(() => {});
  if (room?.meta?.status !== "lobby") toast("已用觀戰模式加入；可看公開牌桌與回放，不能出牌。");
  else toast("座位已滿或你選擇觀戰，已用觀戰模式加入。房主開始後可旁觀本局。");
  await enterRoom(code);
}

async function joinRoom(code) {
  const roomPath = ref(appState.db, `rooms/${code}`);
  const snap = await get(roomPath);
  if (!snap.exists()) return toast("找不到房間");
  const room = snap.val();
  const expired = room.meta?.expiresAt && Date.now() > Number(room.meta.expiresAt);
  if (expired) toast("這個房間已超過建議清理時間，仍可嘗試加入；建議請房主延長或重開房間。");
  if (room.meta?.status !== "lobby") {
    const gamePlayer = room.game?.players?.find((p) => p?.uid === appState.uid);
    const lobbySeat = Object.values(room.lobby?.seats || {}).find((seat) => seat?.uid === appState.uid);
    if (gamePlayer || lobbySeat) {
      appState.spectator = false;
      await enterRoom(code);
      toast(`已重新連回房間 ${code}`);
      return;
    }
    await joinAsSpectator(code, room);
    return;
  }
  const name = sanitizeName($("playerName").value);
  localStorage.setItem(STORAGE.name, name);
  appState.spectator = false;
  const seatsRef = ref(appState.db, `rooms/${code}/lobby/seats`);
  const result = await runTransaction(seatsRef, (seats) => {
    seats = seats || {};
    for (const key of Object.keys(seats)) {
      if (seats[key]?.uid === appState.uid) {
        seats[key].name = name;
        seats[key].online = true;
        return seats;
      }
    }
    for (let seat = 0; seat < 5; seat += 1) {
      if (!seats[seat]) {
        seats[seat] = makeHumanSeat(seat, appState.uid, name);
        return seats;
      }
    }
    return undefined;
  });
  if (!result.committed) {
    await joinAsSpectator(code, room);
    return;
  }
  await update(ref(appState.db, `rooms/${code}/meta`), { updatedAt: Date.now() });
  await enterRoom(code);
  toast(`已加入房間 ${code}`);
}

async function enterRoom(code) {
  detachRoom();
  appState.roomCode = code;
  localStorage.setItem(STORAGE.lastRoom, code);
  localStorage.setItem(STORAGE.lastRoomAt, String(Date.now()));
  $("roomCode").value = code;
  const params = new URLSearchParams(location.search);
  params.set("room", code);
  history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
  $("connectView").classList.add("hidden");
  $("btnLeave").classList.remove("hidden");
  appState.roomUnsub = onValue(roomRef(), (snapshot) => {
    appState.room = snapshot.val();
    if (!appState.room) {
      toast("房間已不存在");
      leaveRoom(false);
      return;
    }
    markOnlinePresence();
    renderRoom();
    scheduleHostAutomation();
  });
  attachActionListener();
}

function detachRoom() {
  if (appState.roomUnsub) appState.roomUnsub();
  if (appState.db && appState.roomCode && appState.actionsAttached) {
    off(ref(appState.db, `rooms/${appState.roomCode}/actions`));
  }
  appState.actionsAttached = false;
  appState.roomUnsub = null;
  appState.room = null;
  appState.actionQueue = [];
  appState.processingActions = false;
  appState.presenceKey = null;
  clearTimeout(appState.botTimer);
  clearTimeout(appState.offlineTimer);
}

async function leaveRoom(updateSeat = true) {
  if (appState.offline) {
    detachRoom();
    appState.offline = false;
    appState.uid = appState.firebaseUid || appState.uid;
    appState.roomCode = null;
    appState.spectator = false;
    appState.selectedExchange.clear();
    document.body.classList.remove("in-game", "offline-game");
    history.replaceState(null, "", location.pathname);
    $("connectView").classList.remove("hidden");
    $("lobbyView").classList.add("hidden");
    $("gameView").classList.add("hidden");
    $("btnLeave").classList.add("hidden");
    renderConnectState();
    return;
  }
  if (updateSeat && appState.roomCode && appState.room) {
    const seat = myLobbySeat();
    if (seat !== null && appState.room.meta?.status === "lobby") {
      await remove(roomRef(`lobby/seats/${seat}`)).catch(() => {});
    }
    if (appState.spectator && appState.uid && appState.db) {
      await remove(ref(appState.db, `rooms/${appState.roomCode}/spectators/${appState.uid}`)).catch(() => {});
    }
  }
  detachRoom();
  appState.roomCode = null;
  appState.spectator = false;
  appState.selectedExchange.clear();
  document.body.classList.remove("in-game", "offline-game");
  history.replaceState(null, "", location.pathname);
  $("connectView").classList.remove("hidden");
  $("lobbyView").classList.add("hidden");
  $("gameView").classList.add("hidden");
  $("btnLeave").classList.add("hidden");
}

function markOnlinePresence() {
  const seat = myLobbySeat();
  if (!appState.roomCode) return;
  if (seat === null && appState.spectator && appState.uid) {
    const key = `${appState.roomCode}:spectator:${appState.uid}`;
    if (appState.presenceKey === key) return;
    appState.presenceKey = key;
    const spectatorRef = roomRef(`spectators/${appState.uid}`);
    update(spectatorRef, { online: true, lastSeen: serverTimestamp() }).catch(() => {});
    onDisconnect(spectatorRef).update({ online: false, lastSeen: serverTimestamp() }).catch(() => {});
    return;
  }
  if (seat === null) return;
  const key = `${appState.roomCode}:${seat}`;
  if (appState.presenceKey === key) return;
  appState.presenceKey = key;
  const seatRef = roomRef(`lobby/seats/${seat}`);
  update(seatRef, { online: true, lastSeen: serverTimestamp() }).catch(() => {});
  onDisconnect(seatRef).update({ online: false, lastSeen: serverTimestamp() }).catch(() => {});
}

function myLobbySeat() {
  const seats = appState.room?.lobby?.seats || {};
  for (const [seat, value] of Object.entries(seats)) {
    if (value?.uid === appState.uid) return Number(seat);
  }
  return null;
}

function myGameSeat(game = appState.room?.game) {
  if (!game?.players) return null;
  const found = game.players.find((p) => p?.uid === appState.uid);
  return found ? found.seat : null;
}

function isHost() {
  if (appState.offline) return true;
  return appState.room?.meta?.hostUid === appState.uid;
}

function renderRoom() {
  const status = appState.room?.meta?.status;
  const inGame = status !== "lobby" && !!appState.room;
  document.body.classList.toggle("in-game", inGame);
  document.body.classList.toggle("offline-game", !!appState.offline && inGame);
  if (status === "lobby") {
    $("lobbyView").classList.remove("hidden");
    $("gameView").classList.add("hidden");
    renderLobby();
    renderRoomStatusPanels();
  } else {
    $("lobbyView").classList.add("hidden");
    $("gameView").classList.remove("hidden");
    renderGame();
    renderRoomStatusPanels();
  }
  renderHostTools();
}

function renderLobby() {
  const room = appState.room;
  $("lobbyRoomCode").textContent = room.meta.code;
  const inviteUrl = buildInviteLink(room.meta.code);
  $("lobbyShare").textContent = `房號 ${room.meta.code}：分享連結或掃描 QR Code 加入。`;
  $("inviteLinkText").textContent = inviteUrl;
  $("inviteQr").src = buildQrCodeUrl(inviteUrl);
  $("inviteQr").alt = `房間 ${room.meta.code} 加入連結 QR Code`;
  const seats = room.lobby?.seats || {};
  const ordered = Array.from({ length: 5 }, (_, i) => seats[i] || null);
  const spectators = Object.values(room.spectators || {}).filter((sp) => sp?.online !== false);
  $("lobbySeats").innerHTML = ordered.map((seat, i) => {
    if (!seat) return `<div class="lobby-seat"><div><b>座位 ${i + 1}</b><small>空位</small></div><span class="tag">等待</span></div>`;
    const mine = seat.uid === appState.uid ? "（你）" : "";
    const type = seat.type === "bot" ? "電腦" : "真人";
    const online = seat.online === false ? `離線${seat.lastSeen ? `・${timeAgo(seat.lastSeen)}` : ""}` : "在線";
    return `<div class="lobby-seat"><div><b>${escapeHtml(seat.name)}${mine}</b><small>座位 ${i + 1}・${type}・${online}</small></div><span class="tag ${seat.type === "bot" ? "gold" : ""}">${seat.score || 0} 分</span></div>`;
  }).join("") + (spectators.length ? `<div class="spectator-list"><b>觀戰中</b>${spectators.map((sp) => `<span>👀 ${escapeHtml(sp.name || "觀眾")}</span>`).join("")}</div>` : "");

  applySettingsToUI(room.lobby?.settings || defaultSettings());
  const host = isHost();
  document.querySelectorAll(".host-only").forEach((el) => el.classList.toggle("hidden", !host));
  for (const id of ["lobbyPreset", "difficulty", "buriedMode", "leadMode", "trumpMode", "aiStyle", "jokerLowLast3", "summonJokers", "allowSelfSecretary", "showAiThoughts"]) {
    $(id).disabled = !host;
  }
  const filled = ordered.filter(Boolean).length;
  $("btnStartGame").disabled = !host || filled !== 5;
  $("lobbyNotice").textContent = host
    ? (filled === 5 ? "座位已滿，可以開始。" : `目前 ${filled}/5 人，可等待朋友或補電腦。`)
    : "等待房主調整規則並開始。";
}


function renderRoomStatusPanels() {
  const room = appState.room;
  const lobbyEl = $("lobbyRoomStatus");
  const gameEl = $("gameRoomStatus");
  const html = room ? buildRoomStatusHtml(room) : "";
  if (lobbyEl) {
    lobbyEl.innerHTML = html;
    lobbyEl.classList.toggle("hidden", !html);
  }
  if (gameEl) {
    gameEl.innerHTML = html;
    const show = Boolean(html) && !appState.offline;
    gameEl.classList.toggle("hidden", !show);
  }
}

function buildRoomStatusHtml(room) {
  if (!room || appState.offline) return "";
  const seats = room.lobby?.seats || {};
  const values = Object.values(seats);
  const humans = values.filter((seat) => seat?.type !== "bot");
  const bots = values.filter((seat) => seat?.type === "bot");
  const spectators = Object.values(room.spectators || {}).filter((sp) => sp?.online !== false);
  const offlineHumans = humans.filter((seat) => seat?.online === false);
  const hostSeat = values.find((seat) => seat?.uid === room.meta?.hostUid);
  const updated = room.meta?.updatedAt ? timeAgo(room.meta.updatedAt) : "剛剛";
  const created = room.meta?.createdAt ? timeAgo(room.meta.createdAt) : "未知";
  const expiresAt = Number(room.meta?.expiresAt || 0);
  const expires = expiresAt ? timeUntil(expiresAt) : "未設定";
  const stale = room.meta?.createdAt && Date.now() - Number(room.meta.createdAt) > ROOM_STALE_MS;
  const expired = expiresAt && Date.now() > expiresAt;
  const state = room.meta?.status === "lobby" ? "大廳" : "遊戲中";
  const hostName = hostSeat?.name || "房主";
  const warnings = [];
  if (offlineHumans.length) warnings.push(`${offlineHumans.length} 位真人離線，可由房主改電腦接手。`);
  if (expired) warnings.push("房間已超過建議保留時間，公開版建議關閉或重開房間。");
  else if (stale) warnings.push("房間已超過 12 小時，建議結束後關閉，或由房主延長 24 小時。");
  const warning = warnings.length
    ? `<span class="room-warning">${escapeHtml(warnings.join(" "))}</span>`
    : `<span class="room-ok">所有真人在線；房間維護狀態正常。</span>`;
  return `
    <div class="room-status-grid">
      <span><b>${escapeHtml(state)}</b><small>房間狀態</small></span>
      <span><b>${escapeHtml(hostName)}</b><small>房主</small></span>
      <span><b>${humans.length} 真人 / ${bots.length} 電腦</b><small>座位</small></span>
      <span><b>${spectators.length}</b><small>觀戰</small></span>
      <span><b>${escapeHtml(updated)}</b><small>最後同步</small></span>
      <span><b>${escapeHtml(created)}</b><small>建立時間</small></span>
      <span><b>${escapeHtml(expires)}</b><small>建議清理</small></span>
    </div>
    ${warning}
  `;
}

function renderHostTools() {
  const host = isHost();
  const hasRoom = Boolean(appState.room) && !appState.offline;
  const hasOffline = countOfflineHumans() > 0;
  for (const id of ["btnTakeOverOfflineLobby", "btnTakeOverOfflineGame"]) {
    const btn = $(id);
    if (btn) {
      btn.disabled = !host || !hasRoom || !hasOffline;
      btn.textContent = hasOffline ? `離線玩家改電腦（${hasOffline}）` : "離線玩家改電腦";
    }
  }
  for (const id of ["btnExtendRoomLobby", "btnExtendRoomGame", "btnCopyRoomMaintenanceLobby", "btnCopyRoomMaintenanceGame"]) {
    const btn = $(id);
    if (btn) btn.disabled = !host || !hasRoom;
  }
  const gameTools = $("gameHostTools");
  if (gameTools) gameTools.classList.toggle("hidden", !host || !hasRoom);
}

function countOfflineHumans() {
  const seats = appState.room?.lobby?.seats || {};
  return Object.values(seats).filter((seat) => seat?.type !== "bot" && seat?.online === false).length;
}

function timeAgo(value) {
  let ms = Number(value);
  if (!Number.isFinite(ms)) return "剛剛";
  if (ms < 1000000000000) ms *= 1000;
  const diff = Math.max(0, Date.now() - ms);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "剛剛";
  if (min < 60) return `${min} 分前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小時前`;
  return `${Math.floor(hr / 24)} 天前`;
}

function timeUntil(value) {
  let ms = Number(value);
  if (!Number.isFinite(ms) || !ms) return "未設定";
  if (ms < 1000000000000) ms *= 1000;
  const diff = ms - Date.now();
  const abs = Math.abs(diff);
  const min = Math.ceil(abs / 60000);
  const label = min < 60 ? `${min} 分` : (min < 1440 ? `${Math.ceil(min / 60)} 小時` : `${Math.ceil(min / 1440)} 天`);
  return diff >= 0 ? `${label}後` : `已超過 ${label}`;
}

function currentRoomMaintenanceStatus() {
  const room = appState.room;
  if (!room || appState.offline) return { warn: false, detail: "未連線房間；單人離線不需要 Firebase 房間清理" };
  const createdAt = Number(room.meta?.createdAt || 0);
  const expiresAt = Number(room.meta?.expiresAt || 0);
  const ageMs = createdAt ? Date.now() - createdAt : 0;
  if (expiresAt && Date.now() > expiresAt) return { warn: true, detail: `房間已到建議清理時間：${timeUntil(expiresAt)}。房主可關閉房間或延長 24 小時。` };
  if (ageMs > ROOM_STALE_MS) return { warn: true, detail: `房間已建立 ${timeAgo(createdAt)}，建議結束後關閉；若還要玩可由房主延長。` };
  return { warn: false, detail: expiresAt ? `房間維護正常，建議清理時間：${timeUntil(expiresAt)}` : "房間未設定清理時間；新版建立房間會自動設定 24 小時" };
}

async function hostTakeOverOfflinePlayers() {
  if (!isHost() || !appState.room || appState.offline) return;
  const room = appState.room;
  const seats = { ...(room.lobby?.seats || {}) };
  const game = room.game ? normalizeGame(JSON.parse(JSON.stringify(room.game))) : null;
  let changed = 0;
  const updates = { "meta/updatedAt": Date.now() };
  for (const [key, seat] of Object.entries(seats)) {
    if (!seat || seat.type === "bot" || seat.online !== false) continue;
    const seatNo = Number(key);
    const botName = `${seat.name || BOT_NAMES[seatNo % BOT_NAMES.length]}（電腦）`;
    const botUid = `bot-takeover-${seatNo}-${Date.now()}-${changed}`;
    const botSeat = { ...seat, uid: botUid, name: botName, type: "bot", online: true, takenOver: true, lastSeen: Date.now() };
    updates[`lobby/seats/${seatNo}`] = botSeat;
    if (game?.players?.[seatNo]) {
      game.players[seatNo].uid = botUid;
      game.players[seatNo].name = botName;
      game.players[seatNo].type = "bot";
    }
    changed += 1;
  }
  if (!changed) return toast("目前沒有離線真人玩家");
  if (game) updates.game = game;
  await update(roomRef(), updates);
  toast(`已讓 ${changed} 位離線玩家由電腦接手`);
}

async function hostCloseRoom() {
  if (!isHost() || !appState.roomCode) return;
  if (appState.offline) return leaveRoom(false);
  const ok = window.confirm("確定關閉這個房間？所有玩家會離開，房間資料會從 Firebase 移除。");
  if (!ok) return;
  const code = appState.roomCode;
  await remove(ref(appState.db, `rooms/${code}`));
  toast("房間已關閉");
  leaveRoom(false);
}

async function hostExtendRoom() {
  if (!isHost() || !appState.roomCode || appState.offline) return;
  const expiresAt = Date.now() + ROOM_TTL_MS;
  await update(roomRef("meta"), { updatedAt: Date.now(), expiresAt, appBuild: APP_BUILD, schemaVersion: 33 });
  toast("已延長房間 24 小時");
}

async function copyRoomMaintenanceSummary() {
  const room = appState.room;
  if (!room || appState.offline) return toast("目前沒有線上房間資訊");
  const code = room.meta?.code || appState.roomCode || "未知";
  const status = currentRoomMaintenanceStatus();
  const text = [
    `房號：${code}`,
    `狀態：${room.meta?.status || "未知"}`,
    `版本：${APP_VERSION}（${APP_BUILD}）`,
    `建立：${room.meta?.createdAt ? timeAgo(room.meta.createdAt) : "未知"}`,
    `最後同步：${room.meta?.updatedAt ? timeAgo(room.meta.updatedAt) : "未知"}`,
    `建議清理：${room.meta?.expiresAt ? timeUntil(room.meta.expiresAt) : "未設定"}`,
    `維護判斷：${status.detail}`
  ].join("\n");
  try {
    await navigator.clipboard.writeText(text);
    toast("已複製房間維護摘要");
  } catch {
    toast("無法複製，請改用系統測試工具查看");
  }
}

function defaultSettings() {
  return {
    difficulty: 10,
    buriedMode: "addContract",
    leadMode: "next",
    trumpMode: "suitOnly",
    aiStyle: "varied",
    jokerLowLast3: true,
    summonJokers: true,
    allowSelfSecretary: false,
    showAiThoughts: true
  };
}

function readSettingsFromUI() {
  return {
    difficulty: Number($("difficulty").value),
    buriedMode: $("buriedMode").value,
    leadMode: $("leadMode").value,
    trumpMode: $("trumpMode").value,
    aiStyle: $("aiStyle").value,
    jokerLowLast3: $("jokerLowLast3").checked,
    summonJokers: $("summonJokers").checked,
    allowSelfSecretary: $("allowSelfSecretary").checked,
    showAiThoughts: $("showAiThoughts").checked
  };
}

function applySettingsToUI(settings) {
  if ($("lobbyPreset")) $("lobbyPreset").value = "standard";
  $("difficulty").value = settings.difficulty ?? 10;
  $("difficultyLabel").textContent = settings.difficulty ?? 10;
  $("buriedMode").value = settings.buriedMode || "addContract";
  $("leadMode").value = settings.leadMode || "next";
  $("trumpMode").value = settings.trumpMode || "suitOnly";
  $("aiStyle").value = settings.aiStyle || "varied";
  $("jokerLowLast3").checked = settings.jokerLowLast3 !== false;
  $("summonJokers").checked = settings.summonJokers !== false;
  $("allowSelfSecretary").checked = !!settings.allowSelfSecretary;
  $("showAiThoughts").checked = settings.showAiThoughts !== false;
}

let settingsTimer = null;
function syncLobbySettingsSoon() {
  if (!isHost() || appState.room?.meta?.status !== "lobby") return;
  clearTimeout(settingsTimer);
  settingsTimer = setTimeout(() => {
    update(roomRef("lobby/settings"), readSettingsFromUI()).catch(console.error);
  }, 180);
}

async function hostAddBot() {
  if (!isHost()) return;
  const seatsRef = roomRef("lobby/seats");
  await runTransaction(seatsRef, (seats) => {
    seats = seats || {};
    for (let seat = 0; seat < 5; seat += 1) {
      if (!seats[seat]) {
        seats[seat] = makeBotSeat(seat, seat);
        return seats;
      }
    }
    return seats;
  });
}

async function hostRemoveBot() {
  if (!isHost()) return;
  const seatsRef = roomRef("lobby/seats");
  await runTransaction(seatsRef, (seats) => {
    seats = seats || {};
    for (let seat = 4; seat >= 0; seat -= 1) {
      if (seats[seat]?.type === "bot") {
        delete seats[seat];
        return seats;
      }
    }
    return seats;
  });
}

async function hostStartGame() {
  if (!isHost()) return;
  const seats = appState.room?.lobby?.seats || {};
  const players = Array.from({ length: 5 }, (_, seat) => seats[seat]).filter(Boolean);
  if (players.length !== 5) return toast("需要剛好 5 位玩家或電腦");
  const dealer = appState.room?.lobby?.dealer || 0;
  const scores = Array.from({ length: 5 }, (_, seat) => seats[seat]?.score || 0);
  const game = createGame(players, appState.room.lobby.settings || defaultSettings(), dealer, scores);
  await update(roomRef(), {
    "meta/status": "game",
    "meta/updatedAt": Date.now(),
    "meta/expiresAt": Date.now() + ROOM_TTL_MS,
    game
  });
}

async function hostNextRound() {
  if (!isHost() || !appState.room?.game) return;
  const oldGame = appState.room.game;
  const scores = oldGame.players.map((p) => p.score || 0);
  const seats = appState.room.lobby?.seats || {};
  const players = Array.from({ length: 5 }, (_, seat) => seats[seat]).filter(Boolean);
  if (players.length !== 5) return toast("座位不足，請回大廳重新補人");
  const nextDealer = ((oldGame.dealer || 0) + 1) % 5;
  const game = createGame(players, appState.room.lobby.settings || oldGame.settings || defaultSettings(), nextDealer, scores);
  if (appState.offline) {
    appState.room.lobby.dealer = nextDealer;
    scores.forEach((score, seat) => { if (appState.room.lobby.seats[seat]) appState.room.lobby.seats[seat].score = score; });
    appState.room.game = game;
    appState.room.meta.status = "game";
    appState.room.meta.updatedAt = Date.now();
    renderRoom();
    scheduleHostAutomation();
    return;
  }
  const scoreUpdates = {};
  scores.forEach((score, seat) => { scoreUpdates[`lobby/seats/${seat}/score`] = score; });
  await update(roomRef(), {
    ...scoreUpdates,
    "lobby/dealer": nextDealer,
    "meta/status": "game",
    "meta/updatedAt": Date.now(),
    "meta/expiresAt": Date.now() + ROOM_TTL_MS,
    game
  });
}

async function hostReturnToLobby() {
  if (!isHost()) return;
  if (appState.offline) {
    leaveRoom(false);
    return;
  }
  await update(roomRef(), {
    "meta/status": "lobby",
    "meta/updatedAt": Date.now(),
    game: null
  });
}

function makeDeck() {
  const cards = [];
  for (const suit of ["S", "H", "D", "C"]) {
    for (const rank of RANKS) {
      cards.push({ id: suit + rank, suit, rank, value: RANK_VALUE[rank], point: POINT_RANKS.has(rank), joker: false });
    }
  }
  cards.push({ id: "BJ", suit: null, rank: "大鬼", value: 16, point: false, joker: true, bigJoker: true });
  cards.push({ id: "RJ", suit: null, rank: "小鬼", value: 15, point: false, joker: true, smallJoker: true });
  return cards;
}

function createGame(lobbyPlayers, settings, dealer = 0, scores = [0, 0, 0, 0, 0]) {
  const deck = makeDeck();
  shuffle(deck);
  const kitty = deck.slice(50);
  const players = Array.from({ length: 5 }, (_, seat) => {
    const lp = lobbyPlayers.find((p) => Number(p.seat) === seat) || lobbyPlayers[seat];
    return {
      seat,
      uid: lp.uid,
      name: lp.name,
      type: lp.type,
      hand: sortHand(deck.slice(seat * 10, seat * 10 + 10)),
      passed: false,
      lastBid: null,
      score: scores[seat] || 0
    };
  });
  return {
    phase: PHASE.BIDDING,
    settings,
    dealer,
    players,
    kitty,
    buried: [],
    napoleon: null,
    secretaryOwner: null,
    secretaryCardId: null,
    secretaryRevealed: false,
    trump: null,
    bid: null,
    contract: null,
    currentPlayer: dealer,
    leader: dealer,
    trick: [],
    trickNo: 0,
    captured: [[], [], [], [], []],
    requestedId: null,
    pendingClear: null,
    trickHistory: [],
    bidding: { highest: null, turn: dealer, consecutivePasses: 0, passesWithoutBid: 0 },
    log: [`第 ${dealer + 1} 家先叫牌。最低 9 頭，叫品為「數字＋花色」，同數字依橋牌花色大小 ♣ < ♦ < ♥ < ♠ 比較。`],
    createdAt: Date.now()
  };
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function sortHand(hand) {
  const suitOrder = { S: 4, H: 3, D: 2, C: 1, null: 9 };
  return [...hand].sort((a, b) => {
    const aj = a.joker ? 100 + (a.bigJoker ? 2 : 1) : 0;
    const bj = b.joker ? 100 + (b.bigJoker ? 2 : 1) : 0;
    if (aj || bj) return bj - aj;
    if (suitOrder[a.suit] !== suitOrder[b.suit]) return suitOrder[b.suit] - suitOrder[a.suit];
    return b.value - a.value;
  });
}

function appendLog(game, message) {
  game.log = [message, ...(game.log || [])].slice(0, 90);
}

function shouldShowAiThoughts(game) {
  return Number(game?.settings?.difficulty || 10) >= 16 && game?.settings?.showAiThoughts !== false;
}

function attachActionListener() {
  if (appState.actionsAttached) return;
  appState.actionsAttached = true;
  onChildAdded(ref(appState.db, `rooms/${appState.roomCode}/actions`), (snapshot) => {
    if (!isHost()) return;
    appState.actionQueue.push({ key: snapshot.key, action: snapshot.val() });
    processActionQueue();
  });
}

async function processActionQueue() {
  if (appState.processingActions || !isHost()) return;
  appState.processingActions = true;
  while (appState.actionQueue.length) {
    const item = appState.actionQueue.shift();
    const gameSnap = await get(roomRef("game"));
    const game = normalizeGame(gameSnap.val());
    let changed = false;
    if (game) changed = applyAction(game, item.action);
    if (changed) await saveGame(game);
    await remove(ref(appState.db, `rooms/${appState.roomCode}/actions/${item.key}`)).catch(() => {});
  }
  appState.processingActions = false;
}

async function submitAction(type, payload = {}) {
  const game = normalizeGame(appState.room?.game);
  const seat = myGameSeat(game);
  if (seat === null) return toast("你不在此局中");
  const action = {
    uid: appState.uid,
    seat,
    type,
    payload,
    createdAt: Date.now()
  };
  if (appState.offline) {
    const changed = applyAction(game, action);
    if (changed) await saveGame(game);
    return;
  }
  await push(ref(appState.db, `rooms/${appState.roomCode}/actions`), action);
}

function normalizeGame(game) {
  if (!game) return game;
  if (!Array.isArray(game.trick)) game.trick = [];
  if (!Array.isArray(game.buried)) game.buried = [];
  if (!Array.isArray(game.kitty)) game.kitty = [];
  if (!Array.isArray(game.log)) game.log = [];
  if (!Array.isArray(game.players)) game.players = [];
  if (!Array.isArray(game.trickHistory)) game.trickHistory = [];
  if (game.pendingClear && (!game.pendingClear.until || !Array.isArray(game.trick))) game.pendingClear = null;
  game.players.forEach((p) => { if (p && !Array.isArray(p.hand)) p.hand = []; });
  ensureCaptured(game);
  return game;
}

function ensureCaptured(game) {
  if (!Array.isArray(game.captured)) game.captured = [];
  for (let i = 0; i < 5; i += 1) {
    if (!Array.isArray(game.captured[i])) game.captured[i] = [];
  }
}

function applyAction(game, action) {
  normalizeGame(game);
  const seat = Number(action.seat);
  const player = game.players?.[seat];
  if (!player) return false;
  if (player.type === "human" && player.uid !== action.uid) return false;
  if (game.pendingClear) return false;

  if (game.phase === PHASE.BIDDING && game.currentPlayer === seat) {
    if (action.type === "pass") return passBid(game, seat, action.payload);
    if (action.type === "bid") return makeBid(game, seat, action.payload);
  }
  if (game.phase === PHASE.TRUMP && game.napoleon === seat && action.type === "chooseTrump") {
    return chooseTrump(game, seat, action.payload?.trump);
  }
  if (game.phase === PHASE.EXCHANGE && game.napoleon === seat && action.type === "exchange") {
    return exchangeCards(game, seat, action.payload?.cardIds || []);
  }
  if (game.phase === PHASE.SECRETARY && game.napoleon === seat && action.type === "chooseSecretary") {
    return chooseSecretary(game, seat, action.payload?.cardId, action.payload?.aiReason || null);
  }
  if (game.phase === PHASE.PLAY && game.currentPlayer === seat && action.type === "playCard") {
    return playCard(game, seat, action.payload?.cardId, action.payload?.leadSuit || null, action.payload?.aiReason || null);
  }
  return false;
}

function allowedBidSuits(settings) {
  const suits = ["C", "D", "H", "S"];
  if (settings?.trumpMode === "allowNoTrump") suits.push("NT");
  return suits;
}

function bidValue(bid) {
  if (!bid) return 0;
  const amount = Number(bid.amount || 0);
  const suit = bid.suit || bid.trump || null;
  const order = SUITS[suit]?.order || 0;
  return amount * 10 + order;
}

function normalizeBidPayload(payload) {
  if (!payload) return null;
  if (typeof payload === "number") return { amount: payload, suit: "S" };
  const amount = Number(payload.amount);
  const suit = payload.suit || payload.trump;
  if (!Number.isInteger(amount) || amount < 9 || amount > 16 || !SUITS[suit]) return null;
  return { amount, suit };
}

function formatBid(bid) {
  if (!bid) return "-";
  const amount = Number(bid.amount || bid);
  const suit = bid.suit || bid.trump || null;
  return suit ? `${amount} ${suitName(suit)}` : `${amount} 頭`;
}

function getBidAmount(game) {
  if (typeof game.bid === "number") return game.bid;
  return Number(game.bid?.amount || game.bidAmount || game.bidding?.highest?.amount || 0);
}

function legalBidsAbove(highest, settings) {
  const suits = allowedBidSuits(settings);
  const highValue = bidValue(highest);
  const bids = [];
  for (let amount = 9; amount <= 16; amount += 1) {
    for (const suit of suits) {
      const bid = { amount, suit };
      if (bidValue(bid) > highValue) bids.push(bid);
    }
  }
  return bids;
}

function passBid(game, seat, payload = {}) {
  const p = game.players[seat];
  if (!game.bidding) game.bidding = { highest: null, turn: game.currentPlayer, consecutivePasses: 0, passesWithoutBid: 0 };
  p.lastBid = "Pass";
  if (game.bidding.highest) game.bidding.consecutivePasses = (game.bidding.consecutivePasses || 0) + 1;
  else game.bidding.passesWithoutBid = (game.bidding.passesWithoutBid || 0) + 1;
  appendLog(game, `${p.name} Pass。`);
  if (p.type === "bot" && payload?.aiReason && shouldShowAiThoughts(game)) appendLog(game, `AI叫牌：${p.name} ${payload.aiReason}`);

  if (game.bidding.highest && game.bidding.consecutivePasses >= 4) return finishBidding(game);
  if (!game.bidding.highest && game.bidding.passesWithoutBid >= 5) {
    game.phase = PHASE.ROUND_END;
    game.currentPlayer = null;
    appendLog(game, "全部 Pass，本局流局。房主可開始下一局。");
    return true;
  }
  return advanceBidding(game);
}

function makeBid(game, seat, payload) {
  if (!game.bidding) game.bidding = { highest: null, turn: game.currentPlayer, consecutivePasses: 0, passesWithoutBid: 0 };
  const bid = normalizeBidPayload(payload);
  if (!bid) return false;
  if (!allowedBidSuits(game.settings).includes(bid.suit)) return false;
  if (bidValue(bid) <= bidValue(game.bidding.highest)) return false;
  const p = game.players[seat];
  p.lastBid = formatBid(bid);
  game.bidding.highest = { seat, amount: bid.amount, suit: bid.suit };
  game.bidding.consecutivePasses = 0;
  appendLog(game, `${p.name} 叫 ${formatBid(bid)}。`);
  if (p.type === "bot" && payload?.aiReason && shouldShowAiThoughts(game)) appendLog(game, `AI叫牌：${p.name} ${payload.aiReason}`);
  return advanceBidding(game);
}

function advanceBidding(game) {
  const next = (game.currentPlayer + 1) % 5;
  game.currentPlayer = next;
  game.bidding.turn = next;
  return true;
}

function finishBidding(game) {
  const high = game.bidding.highest;
  if (!high) return false;
  game.napoleon = high.seat;
  game.bid = { amount: high.amount, suit: high.suit };
  game.bidAmount = high.amount;
  game.trump = high.suit;
  game.phase = PHASE.EXCHANGE;
  game.currentPlayer = high.seat;
  const player = game.players[high.seat];
  player.hand = sortHand([...player.hand, ...(game.kitty || [])]);
  game.players.forEach((p) => { p.passed = false; });
  appendLog(game, `${player.name} 成為拿破崙，叫 ${formatBid(high)}，${suitName(high.suit)} 為王牌，拿起 4 張底牌。`);
  return true;
}

function chooseTrump(game, seat, trump) {
  const allowed = game.settings?.trumpMode === "allowNoTrump" ? ["S", "H", "D", "C", "NT"] : ["S", "H", "D", "C"];
  if (!allowed.includes(trump)) return false;
  game.trump = trump;
  const player = game.players[seat];
  player.hand = sortHand([...player.hand, ...(game.kitty || [])]);
  game.phase = PHASE.EXCHANGE;
  game.currentPlayer = seat;
  appendLog(game, `${player.name} 選擇 ${suitName(trump)} 為王牌，拿起 4 張底牌。`);
  return true;
}

function exchangeCards(game, seat, cardIds) {
  if (!Array.isArray(cardIds) || cardIds.length !== 4 || new Set(cardIds).size !== 4) return false;
  const player = game.players[seat];
  const ids = new Set(cardIds);
  const buried = [];
  for (const id of ids) {
    const card = player.hand.find((c) => c.id === id);
    if (!card) return false;
    buried.push(card);
  }
  player.hand = sortHand(player.hand.filter((c) => !ids.has(c.id)));
  game.buried = buried;
  const buriedHeads = countPoints(buried);
  game.contract = Math.min(16, getBidAmount(game) + (game.settings?.buriedMode === "addContract" ? buriedHeads : 0));
  game.phase = PHASE.SECRETARY;
  game.currentPlayer = seat;
  appendLog(game, `${player.name} 蓋掉 4 張底牌；底牌有 ${buriedHeads} 張頭，成約為 ${game.contract} 頭。`);
  return true;
}

function chooseSecretary(game, seat, cardId, aiReason = null) {
  if (!cardId) return false;
  if (game.buried?.some((c) => c.id === cardId)) return false;
  const owner = game.players.find((p) => p.hand.some((c) => c.id === cardId));
  if (!owner) return false;
  if (!game.settings?.allowSelfSecretary && owner.seat === seat) return false;
  game.secretaryCardId = cardId;
  game.secretaryOwner = owner.seat;
  game.secretaryRevealed = owner.seat === seat;
  game.phase = PHASE.PLAY;
  game.leader = game.settings?.leadMode === "napoleon" ? seat : (seat + 1) % 5;
  game.currentPlayer = game.leader;
  game.trick = [];
  game.trickNo = 0;
  game.requestedId = null;
  const revealText = owner.seat === seat ? "拿破崙自己持有，進入獨裁局。" : "秘書身分先保密，打出秘書牌時公開。";
  appendLog(game, `${game.players[seat].name} 指定 ${cardLong(findCardById(cardId))} 為秘書牌；${revealText}`);
  if (game.players[seat]?.type === "bot" && aiReason && shouldShowAiThoughts(game)) appendLog(game, `AI計畫：${game.players[seat].name} ${aiReason}`);
  return true;
}

function playCard(game, seat, cardId, chosenLeadSuit = null, aiReason = null) {
  const player = game.players[seat];
  const card = player.hand.find((c) => c.id === cardId);
  if (!card) return false;
  const legal = legalCardsFor(game, seat).map((c) => c.id);
  if (!legal.includes(cardId)) return false;

  let leadSuit = null;
  if (game.trick.length === 0) {
    if (card.joker) {
      leadSuit = ["S", "H", "D", "C"].includes(chosenLeadSuit) ? chosenLeadSuit : null;
    } else {
      leadSuit = card.suit;
    }
    game.requestedId = summonTargetForLead(game, card);
    if (game.requestedId) appendLog(game, `${player.name} 以 ${cardLong(card)} 召 ${game.requestedId === "BJ" ? "大鬼" : "小鬼"}。`);
  }

  player.hand = sortHand(player.hand.filter((c) => c.id !== cardId));
  game.trick.push({ seat, card, leadSuit });
  if (card.id === game.secretaryCardId && !game.secretaryRevealed) {
    game.secretaryRevealed = true;
    appendLog(game, `${player.name} 打出秘書牌，秘書公開！`);
  }
  appendLog(game, `${player.name} 出 ${cardLong(card)}。`);
  if (player.type === "bot" && aiReason && shouldShowAiThoughts(game)) {
    appendLog(game, `AI思路：${player.name} ${aiReason}`);
  }

  if (game.trick.length === 5) {
    settleTrick(game);
  } else {
    game.currentPlayer = (seat + 1) % 5;
  }
  return true;
}

function summonTargetForLead(game, card) {
  if (!game.settings?.summonJokers) return null;
  if (game.trickNo >= 3) return null;
  if (!game.trump || game.trump === "NT") return null;
  if (card.suit !== game.trump) return null;
  if (card.rank === "3") return "BJ";
  if (card.rank === "2") return "RJ";
  return null;
}

function legalCardsFor(game, seat) {
  const hand = game.players[seat]?.hand || [];
  if (game.phase !== PHASE.PLAY || game.currentPlayer !== seat) return [];
  if (game.trick.length === 0) return hand;
  if (game.requestedId && hand.some((c) => c.id === game.requestedId)) {
    return hand.filter((c) => c.id === game.requestedId);
  }
  const leadSuit = effectiveLeadSuit(game.trick);
  if (!leadSuit) return hand;
  const suited = hand.filter((c) => !c.joker && c.suit === leadSuit);
  return suited.length ? suited : hand;
}

function illegalPlayReason(game, seat, card) {
  if (!game || seat === null || seat === undefined) return "目前不在牌局中。";
  if (game.phase !== PHASE.PLAY) return "目前不是出牌階段。";
  if (game.pendingClear) return "本墩剛結束，請等牌桌清空後再出牌。";
  if (game.currentPlayer !== seat) return "還沒輪到你出牌。";
  const hand = game.players?.[seat]?.hand || [];
  if (!card || !hand.some((c) => c.id === card.id)) return "這張牌不在你的手牌中。";
  const legalIds = new Set(legalCardsFor(game, seat).map((c) => c.id));
  if (legalIds.has(card.id)) return "這張牌可以出。";
  if (game.requestedId && hand.some((c) => c.id === game.requestedId)) {
    const requested = findCardById(game.requestedId);
    return `目前有人召 ${cardLong(requested)}，你手上有這張牌，必須先打出。`;
  }
  const leadSuit = effectiveLeadSuit(game.trick);
  if (leadSuit) {
    const hasLeadSuit = hand.some((c) => !c.joker && c.suit === leadSuit);
    if (hasLeadSuit && (card.joker || card.suit !== leadSuit)) {
      return `本墩首引花色是${suitName(leadSuit)}，你手上有${suitName(leadSuit)}，必須先跟牌。`;
    }
  }
  return "這張牌目前不能出，請選擇亮起的合法牌。";
}

function effectiveLeadSuit(trick) {
  if (!trick?.length) return null;
  const first = trick[0];
  if (first.leadSuit) return first.leadSuit;
  if (first.card?.joker) return null;
  return first.card?.suit || null;
}

function settleTrick(game) {
  const leadSuit = effectiveLeadSuit(game.trick);
  let best = game.trick[0];
  for (const play of game.trick.slice(1)) {
    if (cardStrength(play.card, game, leadSuit) > cardStrength(best.card, game, leadSuit)) best = play;
  }
  const winner = best.seat;
  const heads = countPoints(game.trick.map((p) => p.card));
  game.trickHistory = [
    ...(Array.isArray(game.trickHistory) ? game.trickHistory : []),
    {
      trickNo: game.trickNo,
      leadSuit,
      winner,
      heads,
      plays: game.trick.map((p) => ({ seat: p.seat, card: p.card, leadSuit: p.leadSuit || null }))
    }
  ].slice(-12);
  game.captured[winner] = [...(game.captured[winner] || []), ...game.trick.map((p) => p.card)];
  game.pendingClear = {
    until: Date.now() + 3000,
    winner,
    heads,
    bestCardId: best.card.id,
    trickNo: game.trickNo
  };
  game.currentPlayer = null;
  appendLog(game, `${game.players[winner].name} 以 ${cardLong(best.card)} 吃下第 ${game.trickNo + 1} 墩，取得 ${heads} 張頭。3 秒後清空牌桌。`);
}

function clearPendingTrickIfReady(game) {
  if (!game?.pendingClear) return false;
  if (Date.now() < game.pendingClear.until) return false;
  const winner = game.pendingClear.winner;
  game.trick = [];
  game.requestedId = null;
  game.pendingClear = null;
  game.trickNo += 1;
  if (game.trickNo >= 10) {
    endRound(game);
  } else {
    game.leader = winner;
    game.currentPlayer = winner;
  }
  return true;
}

function cardStrength(card, game, leadSuit) {
  if (card.id === game.secretaryCardId) return 10000;
  if (card.joker) {
    if (game.settings?.jokerLowLast3 && game.trickNo >= 7) return card.bigJoker ? 20 : 10;
    return card.bigJoker ? 9000 : 8500;
  }
  if (game.trump && game.trump !== "NT" && card.suit === game.trump) return 5000 + card.value;
  if (leadSuit && card.suit === leadSuit) return 2000 + card.value;
  return card.value;
}

function cardBeats(card, otherCard, game, leadSuit) {
  if (!card) return false;
  if (!otherCard) return true;
  return cardStrength(card, game, leadSuit) > cardStrength(otherCard, game, leadSuit);
}

function endRound(game) {
  const totals = calculateHeadTotals(game);
  const teamHeads = totals.teamHeads;
  const defenderHeads = totals.defenderHeads;
  const buriedHeads = totals.buriedHeads;
  const contract = totals.contract;
  game.contract = contract;

  const made = teamHeads >= contract;
  const diff = Math.abs(teamHeads - contract);
  const solo = game.secretaryOwner === game.napoleon;
  const base = (solo ? 160 : 100) + diff * 10;
  const napDelta = made ? base : -base;
  const secDelta = made ? Math.round(base / 2) : -Math.round(base / 2);
  const defDelta = made ? -Math.round(base / 2) : Math.round(base / 2);
  const scoreDeltas = [0, 0, 0, 0, 0];
  game.players.forEach((p) => {
    let delta = defDelta;
    if (p.seat === game.napoleon) delta = napDelta;
    else if (p.seat === game.secretaryOwner) delta = secDelta;
    p.score += delta;
    scoreDeltas[p.seat] = delta;
  });
  game.roundResult = {
    made,
    winningTeam: made ? "nap" : "def",
    teamHeads,
    defenderHeads,
    buriedHeads,
    contract,
    scoreDeltas,
    endedAt: Date.now()
  };
  game.phase = PHASE.ROUND_END;
  game.currentPlayer = null;
  game.secretaryRevealed = true;
  appendLog(game, `${made ? "拿破崙軍達標" : "聯合國守成"}：拿破崙軍 ${teamHeads} 頭，成約 ${contract} 頭。`);
}

async function saveGame(game) {
  if (appState.offline) {
    appState.room.game = game;
    appState.room.meta.updatedAt = Date.now();
    if (game.phase === PHASE.ROUND_END) {
      game.players.forEach((p) => {
        if (appState.room.lobby?.seats?.[p.seat]) appState.room.lobby.seats[p.seat].score = p.score || 0;
      });
    }
    renderRoom();
    scheduleHostAutomation();
    return;
  }
  await update(roomRef(), {
    game,
    "meta/updatedAt": Date.now()
  });
  if (game.phase === PHASE.ROUND_END) {
    const scoreUpdates = {};
    game.players.forEach((p) => { scoreUpdates[`lobby/seats/${p.seat}/score`] = p.score || 0; });
    await update(roomRef(), scoreUpdates).catch(() => {});
  }
}

function scheduleHostAutomation() {
  clearTimeout(appState.botTimer);
  if (!isHost()) return;
  const game = normalizeGame(appState.room?.game);
  if (!game || appState.room?.meta?.status !== "game") return;
  if (game.pendingClear) {
    const delay = Math.max(0, game.pendingClear.until - Date.now()) + 60;
    appState.botTimer = setTimeout(async () => {
      const latest = appState.offline ? normalizeGame(appState.room?.game) : normalizeGame((await get(roomRef("game"))).val());
      if (!latest) return;
      const changed = clearPendingTrickIfReady(latest);
      if (changed) await saveGame(latest);
    }, delay);
    return;
  }
  const action = getBotAction(game);
  if (!action) return;
  const difficulty = game.settings?.difficulty || 10;
  const delay = game.phase === PHASE.BIDDING
    ? 1100 + difficulty * 45 + Math.random() * 700
    : 650 + Math.random() * 550;
  appState.botTimer = setTimeout(async () => {
    const latest = appState.offline ? normalizeGame(appState.room?.game) : normalizeGame((await get(roomRef("game"))).val());
    const botAction = getBotAction(latest);
    if (!botAction) return;
    const changed = applyAction(latest, botAction);
    if (changed) await saveGame(latest);
  }, delay);
}

function getBotAction(game) {
  if (!game || game.phase === PHASE.ROUND_END) return null;
  const seat = game.currentPlayer;
  const player = game.players?.[seat];
  if (!player || player.type !== "bot") return null;
  if (game.phase === PHASE.BIDDING) return aiBidAction(game, seat);
  if (game.phase === PHASE.TRUMP && game.napoleon === seat) return { uid: player.uid, seat, type: "chooseTrump", payload: { trump: aiChooseTrump(game, seat) } };
  if (game.phase === PHASE.EXCHANGE && game.napoleon === seat) return { uid: player.uid, seat, type: "exchange", payload: { cardIds: aiChooseBuried(game, seat) } };
  if (game.phase === PHASE.SECRETARY && game.napoleon === seat) {
    const cardId = aiChooseSecretary(game, seat);
    const aiReason = aiV15OpeningPlanReason(game, seat, cardId);
    return { uid: player.uid, seat, type: "chooseSecretary", payload: { cardId, aiReason } };
  }
  if (game.phase === PHASE.PLAY) {
    const card = aiChoosePlay(game, seat);
    const aiReason = aiExplainPlayChoice(game, seat, card);
    return { uid: player.uid, seat, type: "playCard", payload: { cardId: card.id, leadSuit: card.suit || aiBestSuit(game.players[seat].hand), aiReason } };
  }
  return null;
}

function aiPersonality(seat, settings = {}) {
  const types = [
    { type: "balanced", label: "均衡", bidBias: 0, risk: 0, feed: 0, block: 0, control: 0 },
    { type: "conservative", label: "保守", bidBias: -0.55, risk: -0.34, feed: 0.15, block: 0.12, control: 0.28 },
    { type: "aggressive", label: "進攻", bidBias: 0.48, risk: 0.38, feed: -0.06, block: 0.25, control: -0.12 },
    { type: "support", label: "支援", bidBias: -0.18, risk: -0.08, feed: 0.38, block: 0.05, control: 0.12 },
    { type: "blocker", label: "防守", bidBias: 0.05, risk: 0.12, feed: -0.02, block: 0.42, control: 0.18 }
  ];
  const style = settings?.aiStyle || "varied";
  const base = { ...types[Math.abs(Number(seat) || 0) % types.length] };
  const forced = {
    balanced: { type: "balanced", label: "均衡", bidBias: 0, risk: -0.04, feed: 0.08, block: 0.08, control: 0.08 },
    conservative: { type: "conservative", label: "保守", bidBias: -0.62, risk: -0.42, feed: 0.16, block: 0.16, control: 0.36 },
    aggressive: { type: "aggressive", label: "進攻", bidBias: 0.56, risk: 0.46, feed: -0.08, block: 0.24, control: -0.16 },
    support: { type: "support", label: "支援", bidBias: -0.12, risk: -0.06, feed: 0.48, block: 0.08, control: 0.1 },
    blocker: { type: "blocker", label: "防守", bidBias: 0.03, risk: 0.04, feed: -0.03, block: 0.55, control: 0.22 },
    expert: { type: "expert", label: "高手", bidBias: 0.08, risk: 0.08, feed: 0.26, block: 0.34, control: 0.24 }
  };
  if (style && style !== "varied" && forced[style]) return forced[style];
  return base;
}

function aiBidAction(game, seat) {
  const player = game.players[seat];
  const highest = game.bidding?.highest || null;
  const difficulty = Number(game.settings?.difficulty || 10);
  const personality = aiPersonality(seat, game.settings);
  const profile = aiEvaluateBidProfile(player.hand, game.settings, difficulty);
  const legalAll = legalBidsAbove(highest, game.settings);
  if (!legalAll.length) return { uid: player.uid, seat, type: "pass", payload: { aiReason: "沒有合法叫品可蓋過目前最高叫品，因此 Pass。" } };

  const auction = aiV9AuctionDiscipline(game, seat, profile, legalAll, highest, difficulty, personality);
  if (auction.forcePass) return { uid: player.uid, seat, type: "pass", payload: { aiReason: auction.reason } };
  const v26Bid = aiV26BidCalibration(game, seat, profile, legalAll, highest, difficulty, personality, auction);
  if (v26Bid.forcePass) return { uid: player.uid, seat, type: "pass", payload: { aiReason: v26Bid.reason } };
  if (Number.isFinite(v26Bid.maxComfortBid)) auction.maxComfortBid = Math.min(auction.maxComfortBid, v26Bid.maxComfortBid);

  const safeLegal = legalAll.filter((b) => b.amount <= Math.min(profile.ceiling, auction.maxComfortBid));
  const minimumNeeded = legalAll[0];
  const marginal = profile.ceiling <= minimumNeeded.amount;
  const currentPressure = highest ? Math.max(0, bidValue(highest) - bidValue({ amount: 9, suit: "C" })) / 80 : 0;
  const expectedGap = profile.expectedHeads - (highest ? highest.amount : 9);
  const passDiscipline = aiClamp(
    0.10 + (21 - difficulty) * 0.018 + currentPressure * 0.12 + (marginal ? 0.22 : 0)
      - personality.bidBias * 0.12 - aiClamp(expectedGap, -2, 3) * 0.035,
    0.04,
    0.68
  );

  // 弱牌、牌型不集中、或只是勉強能蓋過目前叫品時，高難度電腦會更願意 Pass。
  if (!safeLegal.length || profile.confidence < 0.24 || profile.expectedHeads < minimumNeeded.amount - 0.75 || (marginal && Math.random() < passDiscipline)) {
    return { uid: player.uid, seat, type: "pass", payload: { aiReason: aiV9BidReason(game, seat, profile, null, highest, auction, "Pass") } };
  }

  const byAmount = new Map();
  safeLegal.forEach((b) => {
    if (!byAmount.has(b.amount)) byAmount.set(b.amount, []);
    byAmount.get(b.amount).push(b);
  });
  const legalAmounts = [...byAmount.keys()].sort((a, b) => a - b);
  let chosenAmount = legalAmounts[0];

  // 真正牌力強時才跳叫；否則以最低安全叫品為主，避免電腦亂衝。
  const roomAbove = profile.ceiling - chosenAmount;
  const jumpIntent = aiClamp((profile.confidence - 0.58) * 0.55 + (difficulty - 12) * 0.018 + roomAbove * 0.045 + personality.bidBias * 0.08, 0, 0.50);
  if (roomAbove >= 2 && Math.random() < jumpIntent) chosenAmount = Math.min(profile.ceiling, chosenAmount + 1);
  if (roomAbove >= 4 && profile.confidence > 0.76 && difficulty >= 17 && Math.random() < 0.18) chosenAmount = Math.min(profile.ceiling, chosenAmount + 1);
  chosenAmount = aiV26ChooseBidAmount(game, seat, profile, chosenAmount, legalAmounts, highest, difficulty, personality);
  chosenAmount = aiV27ChooseBidAmount(game, seat, profile, chosenAmount, legalAmounts, highest, difficulty, personality);
  if (!byAmount.has(chosenAmount)) chosenAmount = legalAmounts.filter((n) => n <= chosenAmount).pop() || legalAmounts[0];

  const candidates = byAmount.get(chosenAmount) || safeLegal;
  const bid = candidates
    .map((b) => ({ bid: b, score: aiBidSuitScore(profile, b) + (Math.random() - 0.5) * Math.max(0.02, (21 - difficulty) / 95) }))
    .sort((a, b) => b.score - a.score)[0].bid;

  return { uid: player.uid, seat, type: "bid", payload: { ...bid, aiReason: aiV9BidReason(game, seat, profile, bid, highest, auction, "Bid") } };
}


function aiV9AuctionDiscipline(game, seat, profile, legalAll, highest, difficulty, personality) {
  const minBid = legalAll[0] || null;
  const highAmount = Number(highest?.amount || 0);
  const minAmount = Number(minBid?.amount || 9);
  const expectedGap = profile.expectedHeads - minAmount;
  const suitFit = minBid ? (profile.expectedBySuit?.[minBid.suit] ?? profile.expectedHeads) - minAmount : 0;
  const auctionRound = (game.bidding?.consecutivePasses || 0) + (game.bidding?.passesWithoutBid || 0);
  const highAuction = highAmount >= 12 || minAmount >= 12;
  const pressure = aiClamp((minAmount - 9) / 7 + Math.max(0, -expectedGap) * 0.28 + auctionRound * 0.035, 0, 1.6);
  let maxComfortBid = Math.max(8, Math.min(16, Math.floor(profile.expectedHeads + profile.confidence * 0.9 + personality.bidBias * 0.55)));

  // V10: 若目前已有多人 Pass，代表叫品已接近桌面共識；高難度只有明顯超值才重新競價。
  if (difficulty >= 15 && highest && (game.bidding?.consecutivePasses || 0) >= 2 && expectedGap < 0.65 && profile.confidence < 0.68) {
    return {
      forcePass: true,
      maxComfortBid,
      pressure,
      reason: `已有 ${(game.bidding?.consecutivePasses || 0)} 家 Pass，估計 ${profile.expectedHeads.toFixed(1)} 頭沒有明顯超值，避免重新開戰。`
    };
  }

  // V9: 競價節奏控制。叫品越高，AI 越需要「期望頭數」與該花色契合度同時支持，避免只為了蓋過而硬叫。
  if (difficulty >= 14 && highAuction && (expectedGap < -0.25 || suitFit < -0.55 || profile.confidence < 0.48)) {
    return {
      forcePass: Math.random() > Math.max(0.04, personality.bidBias * 0.08 + (profile.confidence - 0.45) * 0.2),
      maxComfortBid,
      pressure,
      reason: `目前叫品已偏高，估計約 ${profile.expectedHeads.toFixed(1)} 頭，牌型不足以安全超叫，選擇 Pass。`
    };
  }
  if (difficulty >= 16 && minAmount >= 13 && profile.expectedHeads < minAmount + 0.25 && profile.jokers < 1) {
    return {
      forcePass: true,
      maxComfortBid,
      pressure,
      reason: `沒有鬼牌或足夠控制牌支撐 ${minAmount} 頭以上，避免冒進叫牌。`
    };
  }
  if (difficulty <= 8) maxComfortBid += 1; // 低難度偶爾較冒險。
  return { forcePass: false, maxComfortBid, pressure, reason: "" };
}

function aiV9BidReason(game, seat, profile, bid, highest, auction, action) {
  const bestSuit = suitName(profile.bestSuit);
  if (action === "Pass" || !bid) {
    const highText = highest ? formatBid(highest) : "尚無叫品";
    return `評估最佳花色為${bestSuit}、期望約 ${profile.expectedHeads.toFixed(1)} 頭；目前 ${highText}，安全邊際不足而 Pass。`;
  }
  const fit = profile.expectedBySuit?.[bid.suit] ?? profile.expectedHeads;
  const jump = highest ? bid.amount - highest.amount : bid.amount - 9;
  const jumpText = jump >= 2 ? "牌力足夠，允許小幅跳叫" : "採最低安全叫品";
  return `估計 ${suitName(bid.suit)} 約 ${fit.toFixed(1)} 頭，整體期望 ${profile.expectedHeads.toFixed(1)} 頭；${jumpText}。`;
}

function aiEvaluateBidProfile(hand, settings, difficulty = 10) {
  const suits = allowedBidSuits(settings);
  const suitScores = aiSuitScores(hand);
  const suitDetails = aiSuitDetails(hand);
  const points = countPoints(hand);
  const jokers = hand.filter((c) => c.joker).length;
  const hasBigJoker = hand.some((c) => c.id === "BJ");
  const hasSmallJoker = hand.some((c) => c.id === "RJ");
  const aces = hand.filter((c) => c.rank === "A").length;
  const kings = hand.filter((c) => c.rank === "K").length;
  const queens = hand.filter((c) => c.rank === "Q").length;
  const jacks = hand.filter((c) => c.rank === "J").length;
  const suitEntries = Object.entries(suitDetails).filter(([s]) => suits.includes(s));
  const bestSuit = suitEntries.sort((a, b) => b[1].bidScore - a[1].bidScore)[0] || ["S", suitDetails.S];
  const longest = Math.max(...Object.values(suitDetails).map((d) => d.count));
  const voids = Object.values(suitDetails).filter((d) => d.count === 0).length;
  const singletons = Object.values(suitDetails).filter((d) => d.count === 1).length;
  const balancedPenalty = Math.max(0, 3 - longest) * 0.28;
  const concentration = bestSuit[1].count * 0.25 + bestSuit[1].pointCount * 0.58 + bestSuit[1].topCount * 0.34;
  const controls = jokers * 1.18 + (hasBigJoker ? 0.24 : 0) + (hasSmallJoker ? 0.16 : 0) + aces * 0.25 + kings * 0.12 + queens * 0.05;
  const headPower = points * 0.31 + Math.max(0, points - 4) * 0.12;
  const shape = Math.max(0, longest - 3) * 0.22 + voids * 0.08 - singletons * 0.03;
  const ntBonus = settings?.trumpMode === "allowNoTrump" ? aiNoTrumpBidScore(hand, suitDetails, points, jokers) : -99;
  if (suits.includes("NT")) {
    suitScores.NT = ntBonus * 12;
  }
  const expectedBySuit = aiExpectedHeadProfile(hand, settings, suitDetails);
  const bestExpected = Math.max(...Object.values(expectedBySuit).filter((v) => Number.isFinite(v)));
  const rawShapePower = 8.05 + headPower + controls + concentration + shape - balancedPenalty + difficulty / 115;
  // 期望頭數模型：高難度叫牌會更接近「實際可拿幾頭」，低難度仍帶一些冒險與誤判。
  const expectedHeads = aiClamp(bestExpected + difficulty / 85, 7.2, 15.8);
  const raw = rawShapePower * 0.45 + expectedHeads * 0.55;
  const randomRisk = (Math.random() - 0.5) * Math.max(0.04, (21 - difficulty) * 0.038);
  const ceiling = Math.max(8, Math.min(16, Math.floor(raw + randomRisk)));
  const confidence = aiClamp((raw - 8.35) / 5.35, 0, 1);
  return { ceiling, confidence, suitScores, suitDetails, bestSuit: bestSuit[0], points, jokers, raw, expectedHeads, expectedBySuit };
}

function aiExpectedHeadProfile(hand, settings, suitDetails = aiSuitDetails(hand)) {
  const suits = allowedBidSuits(settings);
  const jokers = hand.filter((c) => c.joker).length;
  const bigJoker = hand.some((c) => c.id === "BJ") ? 0.55 : 0;
  const smallJoker = hand.some((c) => c.id === "RJ") ? 0.42 : 0;
  const totalHeads = countPoints(hand);
  const aces = hand.filter((c) => c.rank === "A").length;
  const kings = hand.filter((c) => c.rank === "K").length;
  const queens = hand.filter((c) => c.rank === "Q").length;
  const jacks = hand.filter((c) => c.rank === "J").length;
  const map = {};
  for (const suit of ["S", "H", "D", "C"]) {
    const d = suitDetails[suit];
    const trumpHeads = d.pointCount;
    const longTrump = Math.max(0, d.count - 3);
    const topTrump = d.topCount;
    const shortSide = Object.entries(suitDetails).filter(([s]) => s !== suit).reduce((n, [, x]) => n + (x.count <= 1 ? 1 : 0), 0);
    const isolatedHeads = Object.entries(suitDetails).filter(([s]) => s !== suit).reduce((n, [, x]) => n + (x.count <= 1 ? x.pointCount : 0), 0);
    map[suit] = 8.15
      + totalHeads * 0.36
      + trumpHeads * 0.62
      + longTrump * 0.48
      + topTrump * 0.30
      + jokers * 0.78 + bigJoker + smallJoker
      + aces * 0.18 + kings * 0.08 + queens * 0.03
      + shortSide * 0.16
      - isolatedHeads * 0.17
      + SUITS[suit].order * 0.03;
  }
  if (suits.includes("NT")) {
    const counts = Object.values(suitDetails).map((d) => d.count);
    const balanced = counts.filter((n) => n >= 2).length;
    const voids = counts.filter((n) => n === 0).length;
    const singletons = counts.filter((n) => n === 1).length;
    map.NT = 7.85 + totalHeads * 0.32 + jokers * 0.95 + aces * 0.26 + kings * 0.14 + queens * 0.05 + balanced * 0.18 - voids * 0.9 - singletons * 0.32;
  }
  return map;
}

function aiBidSuitScore(profile, bid) {
  const detail = profile.suitDetails[bid.suit];
  const expectedFit = (profile.expectedBySuit?.[bid.suit] || 0) - bid.amount;
  if (bid.suit === "NT") return (profile.suitScores.NT || 0) + bid.amount * 0.04 + expectedFit * 1.15;
  return (profile.suitScores[bid.suit] || 0)
    + (detail?.count || 0) * 0.95
    + (detail?.pointCount || 0) * 1.4
    + (detail?.topCount || 0) * 0.72
    + expectedFit * 1.25
    + SUITS[bid.suit].order * 0.05
    - Math.max(0, bid.amount - profile.ceiling) * 8;
}

function aiSuitDetails(hand) {
  const details = {
    S: { count: 0, pointCount: 0, topCount: 0, rankSum: 0, bidScore: 0 },
    H: { count: 0, pointCount: 0, topCount: 0, rankSum: 0, bidScore: 0 },
    D: { count: 0, pointCount: 0, topCount: 0, rankSum: 0, bidScore: 0 },
    C: { count: 0, pointCount: 0, topCount: 0, rankSum: 0, bidScore: 0 }
  };
  for (const card of hand) {
    if (!card.suit || card.joker) continue;
    const d = details[card.suit];
    d.count += 1;
    d.rankSum += card.value;
    if (isHeadCard(card)) d.pointCount += 1;
    if (["A", "K", "Q"].includes(card.rank)) d.topCount += 1;
  }
  for (const [suit, d] of Object.entries(details)) {
    d.bidScore = d.count * 2.2 + d.pointCount * 3.2 + d.topCount * 1.5 + d.rankSum * 0.18 + SUITS[suit].order * 0.12;
  }
  return details;
}

function aiNoTrumpBidScore(hand, suitDetails, points, jokers) {
  const counts = Object.values(suitDetails).map((d) => d.count);
  const longest = Math.max(...counts);
  const voids = counts.filter((n) => n === 0).length;
  const singletons = counts.filter((n) => n === 1).length;
  const highControls = hand.filter((c) => c.joker || c.rank === "A" || c.rank === "K").length;
  return jokers * 1.25 + highControls * 0.42 + points * 0.18 - longest * 0.08 - voids * 0.75 - singletons * 0.25;
}

function aiSuitScores(hand) {
  const scores = { S: 0, H: 0, D: 0, C: 0, NT: 0 };
  const details = aiSuitDetails(hand);
  const jokers = hand.filter((c) => c.joker).length;
  for (const suit of ["S", "H", "D", "C"]) {
    const d = details[suit];
    scores[suit] = d.bidScore + jokers * 3.8 + d.count * 0.35;
  }
  scores.NT = aiNoTrumpBidScore(hand, details, countPoints(hand), jokers) * 8;
  return scores;
}

function estimateHand(hand, settings) {
  return aiEvaluateBidProfile(hand, settings, settings?.difficulty || 10).raw;
}

function aiChooseTrump(game, seat) {
  const scores = aiSuitScores(game.players[seat].hand);
  return Object.entries(scores)
    .filter(([s]) => allowedBidSuits(game.settings).includes(s))
    .sort((a, b) => b[1] - a[1])[0][0];
}

function aiChooseBuried(game, seat) {
  const hand = game.players[seat].hand || [];
  if (hand.length <= 4) return hand.map((c) => c.id);

  // V6: 拿破崙換底牌改用組合評分。不是只丟單張最低分，而是考慮能否清短門、保留王牌控制、避免把頭送進底牌。
  let best = null;
  for (let a = 0; a < hand.length - 3; a += 1) {
    for (let b = a + 1; b < hand.length - 2; b += 1) {
      for (let c = b + 1; c < hand.length - 1; c += 1) {
        for (let d = c + 1; d < hand.length; d += 1) {
          const combo = [hand[a], hand[b], hand[c], hand[d]];
          const score = aiBurialComboScore(game, seat, combo);
          if (!best || score < best.score) best = { combo, score };
        }
      }
    }
  }
  return (best?.combo || [...hand].sort((a, b) => aiDiscardValue(a, game, seat) - aiDiscardValue(b, game, seat)).slice(0, 4)).map((card) => card.id);
}

function aiBurialComboScore(game, seat, combo) {
  const hand = game.players?.[seat]?.hand || [];
  const kept = hand.filter((card) => !combo.some((x) => x.id === card.id));
  const buriedMode = game.settings?.buriedMode || "addContract";
  const trump = game.trump;
  let score = combo.reduce((sum, card) => sum + aiDiscardValue(card, game, seat), 0);
  const buriedHeads = countPoints(combo);
  const buriedTrump = combo.filter((c) => trump && trump !== "NT" && c.suit === trump).length;
  const buriedJokers = combo.filter((c) => c.joker).length;

  // 多數玩法底牌頭會增加成約或讓防家收益，所以高難度拿破崙不輕易蓋牌頭。
  if (buriedMode === "addContract") score += buriedHeads * 9;
  else if (buriedMode === "defenders") score += buriedHeads * 14;
  else score += buriedHeads * 3;
  score += buriedJokers * 80 + buriedTrump * 10;

  for (const suit of ["S", "H", "D", "C"]) {
    const before = hand.filter((c) => c.suit === suit).length;
    const after = kept.filter((c) => c.suit === suit).length;
    const buriedSuitHeads = combo.filter((c) => c.suit === suit && isHeadCard(c)).length;
    const suitIsTrump = trump && trump !== "NT" && suit === trump;
    if (!suitIsTrump && before > 0 && after === 0 && buriedSuitHeads === 0) score -= 11; // 清短門，之後可切牌。
    if (!suitIsTrump && before <= 2 && after === 0) score -= 3;
    if (suitIsTrump && after < 2 && before >= 3) score += 9; // 不把王牌控制清太薄。
    if (!suitIsTrump && buriedSuitHeads > 0 && before <= 2) score += 5; // 避免短門頭牌埋掉讓成約變硬。
  }

  // 保留至少一張低牌作為出牌退路，不要手上只剩高頭牌與王牌。
  const lowExitCards = kept.filter((c) => !c.joker && !isHeadCard(c) && !(trump && trump !== "NT" && c.suit === trump) && c.value <= 9).length;
  if (lowExitCards === 0) score += 8;
  else if (lowExitCards >= 3) score -= 2;

  return score;
}

function aiDiscardValue(card, game, seat) {
  let value = card.value * 0.65;
  const buriedMode = game.settings?.buriedMode || "addContract";
  const isTrump = Boolean(game.trump && game.trump !== "NT" && card.suit === game.trump);
  const hand = game.players?.[seat]?.hand || [];
  const sameSuitCount = card.suit ? hand.filter((c) => c.suit === card.suit).length : 0;

  if (isHeadCard(card)) value += buriedMode === "ignore" ? 12 : 22;
  if (card.id === game.secretaryCardId) value += 120;
  if (card.joker) value += 55;
  if (isTrump) value += 18 + (isHeadCard(card) ? 6 : 0);
  if (card.rank === "A") value += 11;
  if (card.rank === "K") value += 7;
  if (card.rank === "Q") value += 4;
  if (sameSuitCount <= 2 && !isHeadCard(card) && !isTrump) value -= 2.2; // 順手清短門。
  if (sameSuitCount >= 4 && !isHeadCard(card) && card.value <= 8) value -= 1.1; // 長門小牌可蓋掉。
  return value;
}

function aiChooseSecretary(game, seat) {
  const own = new Set(game.players[seat].hand.map((c) => c.id));
  const buried = new Set((game.buried || []).map((c) => c.id));
  const allowSolo = Boolean(game.settings?.allowSelfSecretary && aiShouldConsiderSolo(game, seat));
  const candidates = makeDeck().filter((c) => !buried.has(c.id) && (allowSolo || !own.has(c.id)));
  const preferred = candidates
    .map((card) => ({ card, score: cardSecretaryValue(card, game, seat, own) + aiSecretarySynergy(card, game, seat) }))
    .sort((a, b) => b.score - a.score);
  return (preferred[0]?.card || candidates[0]).id;
}

function aiSecretarySynergy(card, game, seat) {
  if (!card) return 0;
  const hand = game.players?.[seat]?.hand || [];
  const profile = aiEvaluateBidProfile(hand, game.settings, game.settings?.difficulty || 10);
  const sameSuit = card.suit ? hand.filter((c) => c.suit === card.suit).length : 0;
  const isTrump = Boolean(game.trump && game.trump !== "NT" && card.suit === game.trump);
  let score = 0;
  // 高叫品需要更可靠的秘書牌；低叫品可偏向補弱門。
  if (getBidAmount(game) >= 12 && (card.joker || isTrump || card.rank === "A")) score += 10;
  if (sameSuit <= 1 && card.suit && isHeadCard(card)) score += 7;
  if (sameSuit === 0 && card.suit && !isTrump) score += 3;
  if (profile.expectedBySuit?.[card.suit] && profile.expectedBySuit[card.suit] < profile.expectedHeads - 1.2 && isHeadCard(card)) score += 4;
  if (card.rank === "J" && !isTrump && getBidAmount(game) >= 12) score -= 2;
  return score;
}

function aiShouldConsiderSolo(game, seat) {
  const profile = aiEvaluateBidProfile(game.players[seat].hand, game.settings, game.settings?.difficulty || 10);
  const jokers = game.players[seat].hand.filter((c) => c.joker).length;
  return profile.ceiling >= Math.max(12, getBidAmount(game) + 1) && profile.points >= 6 && jokers >= 1;
}

function cardSecretaryValue(card, game, seat = null, own = new Set()) {
  const isTrump = Boolean(game.trump && game.trump !== "NT" && card.suit === game.trump);
  const ownPenalty = own.has(card.id) ? 34 : 0;
  let value = 0;
  if (card.joker) value += card.bigJoker ? 140 : 126;
  if (isTrump) value += 34;
  if (isHeadCard(card)) value += 30;
  if (card.rank === "A") value += 24;
  else if (card.rank === "K") value += 17;
  else if (card.rank === "Q") value += 10;
  else if (card.rank === "J") value += 7;
  value += card.value * 0.75;

  // 若某花色自己很短，選該花色大牌當秘書，常能讓秘書在防家以為安全時突然出現。
  if (seat !== null && card.suit) {
    const ownSuitCount = game.players?.[seat]?.hand?.filter((c) => c.suit === card.suit).length || 0;
    if (ownSuitCount <= 1 && isHeadCard(card)) value += 8;
    if (ownSuitCount >= 4 && !isTrump) value -= 4;
  }
  return value - ownPenalty;
}

function aiChoosePlay(game, seat) {
  const legal = legalCardsFor(game, seat);
  if (!legal.length) return null;
  const difficulty = Number(game.settings?.difficulty || 10);
  const sortedLow = [...legal].sort((a, b) => cardPlayValue(a, game) - cardPlayValue(b, game));
  const myTeam = aiTeamView(game, seat, seat);

  // 低難度保留一點失誤；中高難度改由完整局勢評分決定。
  if (difficulty <= 5 && Math.random() < 0.18) return randomItem(legal);

  // 若啟用「末三輪鬼牌變小」，小鬼會在第 8 墩起失去威力。
  // 因此電腦會在進入末三輪前評估是否先打出，尤其第 7 墩是最後機會。
  const timelySmallJoker = aiConsiderSmallJokerBeforeLast3(game, seat, legal, sortedLow, myTeam, difficulty);
  if (timelySmallJoker) return timelySmallJoker;

  const context = aiBuildPlayContext(game, seat);
  const scored = legal.map((card) => {
    const baseScore = aiScorePlayCard(game, seat, card, context);
    const advancedScore = aiAdvancedPlayAdjustment(game, seat, card, context, legal);
    return { card, score: baseScore + advancedScore };
  });
  return aiPickScoredCard(scored, difficulty, game.settings?.aiStyle || "varied");
}

function aiBuildPlayContext(game, seat) {
  const totals = calculateHeadTotals(game) || { teamHeads: 0, defenderHeads: 0, contract: getBidAmount(game) || 9 };
  const trickCards = (game.trick || []).map((p) => p.card);
  const pointsOnTable = countPoints(trickCards);
  const capturedHeads = totals.teamHeads + totals.defenderHeads;
  const remainingHeads = Math.max(0, 16 - capturedHeads - pointsOnTable);
  const napNeeds = Math.max(0, (totals.contract || getBidAmount(game) || 9) - totals.teamHeads);
  const myTeam = aiTeamView(game, seat, seat);
  const currentWinner = currentTrickWinner(game);
  const currentWinnerTeam = currentWinner === null ? null : aiTeamView(game, currentWinner, seat);
  const seatsAfter = aiSeatsStillToAct(game, seat);
  const opponentsAfter = seatsAfter.filter((s) => aiTeamView(game, s, seat) !== myTeam).length;
  const alliesAfter = seatsAfter.length - opponentsAfter;
  const actingLast = seatsAfter.length === 0;
  const late = (game.trickNo || 0) >= 7;
  const midLate = (game.trickNo || 0) >= 5;
  const player = game.players?.[seat] || { hand: [] };
  const handHeads = countPoints(player.hand || []);
  const trumpCount = game.trump && game.trump !== "NT" ? (player.hand || []).filter((c) => c.suit === game.trump || c.joker).length : 0;
  const napUrgency = aiClamp(napNeeds / Math.max(1, remainingHeads + pointsOnTable), 0, 1.6);
  const defenderUrgency = aiClamp((4 - napNeeds) / 4, 0, 1.5);
  const remainingBySuit = aiRemainingBySuit(game, seat);
  const memory = aiBuildCardMemory(game, seat);
  const secretaryGuess = aiInferSecretaryOwner(game, seat, memory);
  const contractMode = aiContractMode(game, seat, totals, pointsOnTable, remainingHeads, napNeeds, myTeam);
  const personality = aiPersonality(seat, game.settings);
  const trumpState = aiTrumpControlState(game, seat, memory);
  const suitPlan = aiSuitPlan(game, seat, myTeam, memory);
  return {
    totals,
    pointsOnTable,
    remainingHeads,
    capturedHeads,
    napNeeds,
    napUrgency,
    defenderUrgency,
    myTeam,
    currentWinner,
    currentWinnerTeam,
    seatsAfter,
    opponentsAfter,
    alliesAfter,
    actingLast,
    late,
    midLate,
    handHeads,
    trumpCount,
    difficulty: Number(game.settings?.difficulty || 10),
    leadSuit: effectiveLeadSuit(game.trick),
    remainingBySuit,
    memory,
    secretaryGuess,
    contractMode,
    personality,
    trumpState,
    suitPlan,
    handSize: player.hand?.length || 0
  };
}

function aiScorePlayCard(game, seat, card, ctx) {
  const trickLen = game.trick?.length || 0;
  return trickLen === 0
    ? aiScoreLeadCard(game, seat, card, ctx)
    : aiScoreFollowCard(game, seat, card, ctx);
}

function aiSeatsStillToAct(game, seat) {
  const count = Math.max(0, 4 - (game.trick?.length || 0));
  const seats = [];
  let current = (seat + 1) % 5;
  for (let i = 0; i < count; i += 1) {
    seats.push(current);
    current = (current + 1) % 5;
  }
  return seats;
}

function aiRemainingBySuit(game, seat) {
  const remaining = { S: 13, H: 13, D: 13, C: 13, JOKER: 2 };
  const seen = [];
  (game.players?.[seat]?.hand || []).forEach((c) => seen.push(c));
  (game.trick || []).forEach((p) => seen.push(p.card));
  (game.captured || []).flat().forEach((c) => seen.push(c));
  if (seat === game.napoleon) (game.buried || []).forEach((c) => seen.push(c));
  seen.forEach((c) => {
    if (c?.joker) remaining.JOKER -= 1;
    else if (c?.suit) remaining[c.suit] -= 1;
  });
  return remaining;
}

function aiBuildCardMemory(game, observerSeat) {
  const voids = Array.from({ length: 5 }, () => ({ S: false, H: false, D: false, C: false }));
  const voidConfidence = Array.from({ length: 5 }, () => ({ S: 0, H: 0, D: 0, C: 0 }));
  const knownIds = new Set();
  const playedIds = new Set();
  const addKnown = (card, played = false) => {
    if (!card?.id) return;
    knownIds.add(card.id);
    if (played) playedIds.add(card.id);
  };

  (game.players?.[observerSeat]?.hand || []).forEach((c) => addKnown(c, false));
  (game.trick || []).forEach((p) => addKnown(p.card, true));
  (game.captured || []).flat().forEach((c) => addKnown(c, true));
  if (observerSeat === game.napoleon) (game.buried || []).forEach((c) => addKnown(c, false));

  const histories = Array.isArray(game.trickHistory) ? game.trickHistory : [];
  const currentAsHistory = (game.trick || []).length
    ? [{ leadSuit: effectiveLeadSuit(game.trick), plays: game.trick }]
    : [];
  for (const trick of [...histories, ...currentAsHistory]) {
    const plays = trick.plays || [];
    const leadSuit = trick.leadSuit || aiLeadSuitFromPlays(plays);
    if (!leadSuit) continue;
    for (const play of plays.slice(1)) {
      const card = play.card;
      if (!card || card.joker) continue;
      if (card.suit && card.suit !== leadSuit && voids[play.seat]) {
        voids[play.seat][leadSuit] = true;
        voidConfidence[play.seat][leadSuit] = aiClamp((voidConfidence[play.seat][leadSuit] || 0) + 0.5, 0, 1);
      }
    }
  }

  const remaining = makeDeck().filter((c) => !knownIds.has(c.id));
  const remainingBySuit = { S: 0, H: 0, D: 0, C: 0, JOKER: 0 };
  const remainingHeadsBySuit = { S: 0, H: 0, D: 0, C: 0 };
  const playedBySuit = { S: 0, H: 0, D: 0, C: 0, JOKER: 0 };
  const playedHeadsBySuit = { S: 0, H: 0, D: 0, C: 0 };
  for (const card of remaining) {
    if (card.joker) remainingBySuit.JOKER += 1;
    else if (card.suit) {
      remainingBySuit[card.suit] += 1;
      if (isHeadCard(card)) remainingHeadsBySuit[card.suit] += 1;
    }
  }
  for (const id of playedIds) {
    const card = findCardById(id);
    if (!card) continue;
    if (card.joker) playedBySuit.JOKER += 1;
    else if (card.suit) {
      playedBySuit[card.suit] += 1;
      if (isHeadCard(card)) playedHeadsBySuit[card.suit] += 1;
    }
  }

  return {
    voids,
    voidConfidence,
    remaining,
    remainingBySuit,
    remainingHeadsBySuit,
    playedBySuit,
    playedHeadsBySuit,
    bigJokerSeen: playedIds.has("BJ"),
    smallJokerSeen: playedIds.has("RJ"),
    secretarySeen: game.secretaryCardId ? playedIds.has(game.secretaryCardId) : false
  };
}

function aiInferSecretaryOwner(game, observerSeat, memory = null) {
  if (!game || game.secretaryRevealed || !game.secretaryCardId || game.secretaryOwner === null || game.secretaryOwner === undefined) return null;
  const secret = findCardById(game.secretaryCardId);
  if (!secret) return null;
  const observerHand = game.players?.[observerSeat]?.hand || [];
  if (observerHand.some((c) => c.id === secret.id)) return { seat: observerSeat, confidence: 1, reason: "self" };
  if (observerSeat === game.napoleon) return { seat: game.secretaryOwner, confidence: 0.92, reason: "napoleon-knowledge" };

  const mem = memory || aiBuildCardMemory(game, observerSeat);
  const scores = Array.from({ length: 5 }, (_, seat) => ({ seat, score: seat === game.napoleon ? -99 : 0, eliminated: seat === game.napoleon }));
  for (const item of scores) {
    if (item.eliminated) continue;
    if (secret.suit && mem.voids?.[item.seat]?.[secret.suit]) {
      item.eliminated = true;
      item.score = -99;
    }
  }

  const histories = Array.isArray(game.trickHistory) ? game.trickHistory : [];
  for (const trick of histories) {
    const plays = trick.plays || [];
    const leadSuit = trick.leadSuit || aiLeadSuitFromPlays(plays);
    let bestSoFar = plays[0] || null;
    for (let i = 1; i < plays.length; i += 1) {
      const play = plays[i];
      const item = scores[play.seat];
      if (!item || item.eliminated || play.seat === game.napoleon) continue;
      const beforeWinner = bestSoFar?.seat;
      const beforeNap = beforeWinner === game.napoleon;
      const beforeStrength = bestSoFar ? cardStrength(bestSoFar.card, game, leadSuit) : -1;
      const ownStrength = cardStrength(play.card, game, leadSuit);
      const winsNow = ownStrength > beforeStrength;
      const isPoint = isHeadCard(play.card);
      if (beforeNap && !winsNow && isPoint) item.score += 2.2;
      if (beforeNap && winsNow) item.score -= 1.6;
      if (!beforeNap && beforeWinner !== null && !winsNow && isPoint && trick.winner === game.napoleon) item.score += 1.2;
      if (trick.winner === play.seat && trick.heads >= 2) item.score -= 0.35;
      if (winsNow) bestSoFar = play;
    }
  }

  // 持有秘書牌的人在秘書牌花色被領出時通常會跟牌；若一直沒出現但某人尚未被排除，給一點機率而不是偷看。
  const possible = scores.filter((x) => !x.eliminated).sort((a, b) => b.score - a.score);
  if (!possible.length) return null;
  const best = possible[0];
  const second = possible[1]?.score ?? -1.5;
  const gap = best.score - second;
  const difficulty = Number(game.settings?.difficulty || 10);
  const confidence = aiClamp(0.26 + gap * 0.12 + (5 - possible.length) * 0.08 + difficulty * 0.012, 0.18, 0.88);
  if (possible.length === 1) return { seat: best.seat, confidence: Math.max(confidence, 0.72), reason: "elimination" };
  if (confidence < 0.56) return null;
  return { seat: best.seat, confidence, reason: "behavior" };
}

function aiLeadSuitFromPlays(plays) {
  if (!plays?.length) return null;
  const first = plays[0];
  if (first.leadSuit) return first.leadSuit;
  if (first.card?.joker) return null;
  return first.card?.suit || null;
}

function aiContractMode(game, seat, totals, pointsOnTable, remainingHeads, napNeeds, myTeam) {
  const stillAvailable = Math.max(1, remainingHeads + pointsOnTable);
  const ratio = aiClamp(napNeeds / stillAvailable, 0, 2);
  if (myTeam === "nap") {
    if (napNeeds <= 0 || ratio <= 0.24) return { team: "nap", mode: "protect", ratio, label: "保約" };
    if (ratio >= 0.62 || napNeeds >= Math.max(4, stillAvailable - 1)) return { team: "nap", mode: "chase", ratio, label: "搶約" };
    return { team: "nap", mode: "balanced", ratio, label: "穩打" };
  }
  if (napNeeds <= 2 || ratio <= 0.28) return { team: "def", mode: "block", ratio, label: "擋約" };
  if (ratio >= 0.72) return { team: "def", mode: "conserve", ratio, label: "守成" };
  return { team: "def", mode: "balanced", ratio, label: "防守" };
}

function aiLikelyVoid(ctx, seat, suit) {
  if (!suit || seat === null || seat === undefined) return false;
  return Boolean(ctx?.memory?.voids?.[seat]?.[suit]);
}

function aiCountLikelyVoids(ctx, seats, suit) {
  if (!suit) return 0;
  return (seats || []).filter((seat) => aiLikelyVoid(ctx, seat, suit)).length;
}

function aiSeatCanOvertake(game, observerSeat, targetSeat, strength, leadSuit, memory) {
  const unseen = memory?.remaining || aiUnseenCards(game, observerSeat);
  const voids = memory?.voids || [];
  const targetVoidLead = leadSuit ? Boolean(voids[targetSeat]?.[leadSuit]) : false;
  return unseen.some((card) => {
    if (cardStrength(card, game, leadSuit) <= strength) return false;
    if (!leadSuit) return true;
    if (card.id === game.secretaryCardId || card.joker) return true;
    if (card.suit === leadSuit) return !targetVoidLead;
    if (game.trump && game.trump !== "NT" && card.suit === game.trump && card.suit !== leadSuit) return targetVoidLead;
    return false;
  });
}

function aiFutureOvertakeRisk(game, seat, card, ctx) {
  if (ctx.actingLast) return 0;
  const leadSuit = ctx.leadSuit || (game.trick?.[0]?.leadSuit ?? game.trick?.[0]?.card?.suit ?? card.suit ?? null);
  const strength = cardStrength(card, game, leadSuit);
  let danger = 0;
  for (const futureSeat of ctx.seatsAfter) {
    if (aiTeamView(game, futureSeat, seat) === ctx.myTeam) continue;
    if (aiSeatCanOvertake(game, seat, futureSeat, strength, leadSuit, ctx.memory)) {
      danger += aiLikelyVoid(ctx, futureSeat, leadSuit) ? 1.35 : 1;
    }
  }
  return aiClamp(danger / Math.max(1, ctx.seatsAfter.length), 0, 0.96);
}

function aiPotentialOvertakeRisk(game, seat, card, ctx) {
  if (ctx.actingLast) return 0;
  const leadSuit = ctx.leadSuit || (game.trick?.[0]?.leadSuit ?? game.trick?.[0]?.card?.suit ?? card.suit ?? null);
  const strength = cardStrength(card, game, leadSuit);
  const unseen = ctx.memory?.remaining || aiUnseenCards(game, seat);
  const stronger = unseen.filter((c) => cardStrength(c, game, leadSuit) > strength).length;
  const rawDeckRisk = stronger / Math.max(1, unseen.length);
  const seatRisk = aiFutureOvertakeRisk(game, seat, card, ctx);
  return aiClamp(rawDeckRisk * ctx.seatsAfter.length * 0.9 + seatRisk * 0.78, 0, 0.96);
}

function aiCardSuitCount(game, seat, card) {
  if (!card?.suit) return 0;
  return (game.players?.[seat]?.hand || []).filter((c) => c.suit === card.suit).length;
}

function aiIsLikelyMaster(game, seat, card, leadSuit = null, memory = null) {
  const suit = leadSuit || card.suit || null;
  const strength = cardStrength(card, game, suit);
  const unseen = memory?.remaining || aiUnseenCards(game, seat);
  return unseen.every((c) => cardStrength(c, game, suit) <= strength);
}

function aiTrumpControlState(game, seat, memory = null) {
  const trump = game.trump;
  const hand = game.players?.[seat]?.hand || [];
  if (!trump || trump === "NT") {
    return { enabled: false, myCount: hand.filter((c) => c.joker).length, unseenCount: memory?.remainingBySuit?.JOKER || 0, playedCount: memory?.playedBySuit?.JOKER || 0, myHighCount: hand.filter((c) => c.joker).length, opponentsLikelyHave: 0 };
  }
  const mem = memory || aiBuildCardMemory(game, seat);
  const myTrumpCards = hand.filter((c) => c.joker || c.suit === trump);
  const myHighCount = myTrumpCards.filter((c) => c.joker || c.value >= 11).length;
  const unseenTrump = (mem.remaining || []).filter((c) => c.joker || c.suit === trump);
  const playedTrump = (mem.playedBySuit?.[trump] || 0) + (mem.playedBySuit?.JOKER || 0);
  return {
    enabled: true,
    myCount: myTrumpCards.length,
    myHighCount,
    unseenCount: unseenTrump.length,
    highUnseenCount: unseenTrump.filter((c) => c.joker || c.value >= 11).length,
    playedCount: playedTrump,
    opponentsLikelyHave: Math.max(0, unseenTrump.length - myTrumpCards.length)
  };
}

function aiSuitPlan(game, seat, myTeam, memory = null) {
  const hand = game.players?.[seat]?.hand || [];
  const mem = memory || aiBuildCardMemory(game, seat);
  const plan = {};
  for (const suit of ["S", "H", "D", "C"]) {
    const cards = hand.filter((c) => c.suit === suit);
    const lowCards = cards.filter((c) => !isHeadCard(c) && c.value <= 9).length;
    const heads = cards.filter((c) => isHeadCard(c)).length;
    const masters = cards.filter((c) => aiIsLikelyMaster(game, seat, c, suit, mem)).length;
    plan[suit] = {
      count: cards.length,
      heads,
      lowCards,
      masters,
      remaining: mem.remainingBySuit?.[suit] || 0,
      remainingHeads: mem.remainingHeadsBySuit?.[suit] || 0,
      voidOpponents: Array.from({ length: 5 }, (_, s) => s).filter((s) => s !== seat && aiTeamView(game, s, seat) !== myTeam && mem.voids?.[s]?.[suit]).length,
      voidAllies: Array.from({ length: 5 }, (_, s) => s).filter((s) => s !== seat && aiTeamView(game, s, seat) === myTeam && mem.voids?.[s]?.[suit]).length
    };
  }
  return plan;
}

function aiOpeningLeadAdjustment(game, seat, card, ctx) {
  if ((game.trickNo || 0) > 1 || !card?.suit || card.joker) return 0;
  const suitPlan = ctx.suitPlan?.[card.suit];
  if (!suitPlan) return 0;
  const isTrump = Boolean(game.trump && game.trump !== "NT" && card.suit === game.trump);
  const isPoint = isHeadCard(card);
  let score = 0;

  // 前兩墩：高難度更會用低牌探花色，不一開始就把不安全的頭牌送出去。
  if (!isTrump && !isPoint && suitPlan.count >= 3) score += 4.2;
  if (!isTrump && !isPoint && suitPlan.count === 1) score += 2.4; // 清短門。
  if (!isTrump && isPoint && suitPlan.remaining > 5 && suitPlan.masters === 0) score -= 6.5;
  if (isTrump && ctx.trumpState?.myCount <= 2) score -= 5.5;
  if (ctx.myTeam === "nap" && isTrump && ctx.trumpState?.myCount >= 5 && ctx.contractMode.mode !== "protect") score += 4.8; // 王牌長時可先抽王牌。
  if (ctx.myTeam === "def" && isTrump && game.napoleon !== seat && ctx.contractMode.mode !== "block") score -= 4.5; // 防家少替拿破崙抽王牌。
  return score;
}

function aiTrumpControlAdjustment(game, seat, card, ctx, candidateWins, pointsWithCard) {
  const st = ctx.trumpState;
  if (!st?.enabled) return 0;
  const isTrump = Boolean(card.joker || card.suit === game.trump);
  if (!isTrump) return 0;
  let score = 0;
  const isPoint = isHeadCard(card);
  const early = (game.trickNo || 0) <= 4;
  const hasControl = st.myCount >= 4 || st.myHighCount >= 2;

  if (ctx.myTeam === "nap") {
    if (hasControl && (ctx.contractMode.mode === "chase" || ctx.napUrgency > 0.55)) score += candidateWins ? 5.5 : 1.5;
    if (ctx.contractMode.mode === "protect" && early && !isPoint && !candidateWins) score -= 5;
  } else {
    if (early && !candidateWins && pointsWithCard === 0) score -= 6;
    if (ctx.contractMode.mode === "block" && candidateWins && pointsWithCard >= 1) score += 7;
    if (ctx.defenderUrgency < 0.35 && early) score -= 3.5;
  }
  if (st.myCount <= 1 && !ctx.actingLast && !ctx.late && pointsWithCard <= 1) score -= 8;
  if (card.joker && game.settings?.jokerLowLast3 && game.trickNo === 6) score += card.id === "RJ" ? 7 : 3;
  return score;
}

function aiEndgamePlanAdjustment(game, seat, card, ctx, candidateWins, pointsWithCard) {
  const remainingTricks = Math.max(1, 10 - (game.trickNo || 0));
  const hand = game.players?.[seat]?.hand || [];
  if (remainingTricks > 4 && hand.length > 4) return 0;
  const isPoint = isHeadCard(card);
  const master = card.suit ? aiIsLikelyMaster(game, seat, card, card.suit, ctx.memory) : Boolean(card.joker || card.id === game.secretaryCardId);
  let score = 0;

  // 殘局：可穩收的頭牌要收，不能穩收的頭牌要藏，沒用的低牌優先脫手。
  if (master && isPoint) score += 12;
  if (master && !isPoint && ctx.handHeads >= remainingTricks) score += 4;
  if (!master && isPoint && !candidateWins) score -= 12;
  if (!isPoint && !candidateWins && ctx.pointsOnTable === 0) score += 4;
  if (ctx.myTeam === "nap" && ctx.napNeeds <= pointsWithCard && candidateWins) score += 18;
  if (ctx.myTeam === "def" && ctx.napNeeds <= pointsWithCard + 1 && candidateWins) score += 16;
  return score;
}

function aiCooperationAdjustment(game, seat, card, ctx, candidateWins, pointsWithCard) {
  let score = 0;
  const isPoint = isHeadCard(card);
  const currentAllyWinning = ctx.currentWinnerTeam === ctx.myTeam;
  const currentEnemyWinning = ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const futureAllies = ctx.seatsAfter.filter((s) => aiTeamView(game, s, seat) === ctx.myTeam);
  const futureOpponents = ctx.seatsAfter.filter((s) => aiTeamView(game, s, seat) !== ctx.myTeam);
  const suit = ctx.leadSuit || card.suit || null;

  if (currentAllyWinning && !candidateWins && isPoint && futureOpponents.length === 0) score += 10;
  if (currentAllyWinning && candidateWins && pointsWithCard <= 1) score -= 9;
  if (currentEnemyWinning && candidateWins && pointsWithCard >= 1) score += 6;

  // 若後手盟友已缺門，低牌引導切牌；若後手敵人缺門，頭牌更保守。
  if (suit && !card.joker && !(game.trump && game.trump !== "NT" && card.suit === game.trump)) {
    const allyVoid = aiCountLikelyVoids(ctx, futureAllies, suit);
    const oppVoid = aiCountLikelyVoids(ctx, futureOpponents, suit);
    if (allyVoid > 0 && !isPoint && !candidateWins) score += 4 * allyVoid;
    if (oppVoid > 0 && isPoint && !candidateWins) score -= 7 * oppVoid;
  }
  return score;
}

function aiScoreLeadCard(game, seat, card, ctx) {
  const base = cardPlayValue(card, game);
  const isPoint = isHeadCard(card);
  const isTrump = Boolean(game.trump && game.trump !== "NT" && card.suit === game.trump);
  const isJoker = Boolean(card.joker);
  const likelyWin = aiLikelyLeadWin(game, seat, card);
  const suitCount = aiCardSuitCount(game, seat, card);
  const master = aiIsLikelyMaster(game, seat, card, card.suit || null, ctx.memory);
  const leadSuitForCard = card.joker ? null : card.suit;
  const futureOpponents = ctx.seatsAfter.filter((s) => aiTeamView(game, s, seat) !== ctx.myTeam);
  const futureAllies = ctx.seatsAfter.filter((s) => aiTeamView(game, s, seat) === ctx.myTeam);
  const opponentVoids = aiCountLikelyVoids(ctx, futureOpponents, leadSuitForCard);
  const allyVoids = aiCountLikelyVoids(ctx, futureAllies, leadSuitForCard);
  const vulnerableLead = Boolean(leadSuitForCard && !isTrump && opponentVoids > 0);
  let score = 0;
  score += aiOpeningLeadAdjustment(game, seat, card, ctx);

  // 領牌原則：早期先探牌與建立長門；中後期才積極收頭。
  score -= base * 0.18;
  if (!isPoint && !isTrump && !isJoker) score += 3.2;
  if (suitCount >= 4 && !isJoker) score += 3.2;
  if (suitCount === 1 && !isPoint && !isTrump) score += 1.6; // 清短門，之後可切王牌。
  if (isPoint && likelyWin < 0.66) score -= 14;
  if (isPoint && likelyWin >= 0.78) score += 7;
  if (master && (isPoint || ctx.late || ctx.handHeads >= 3)) score += 7;
  if (isTrump && game.trickNo <= 3 && ctx.trumpCount <= 2) score -= 7; // 王牌少時不要早早耗掉。
  if (isJoker && game.trickNo <= 4 && ctx.pointsOnTable === 0) score -= 10;
  if (ctx.late) score += base * 0.24 + (isPoint ? 5 : 0) + (master ? 4 : 0);

  // 記牌與缺門推測：若後手對手已露出該花色缺門，領頭牌容易被切；若盟友缺門，領低牌可能創造切牌機會。
  if (vulnerableLead && isPoint) score -= 8 + opponentVoids * 5;
  if (vulnerableLead && !isPoint && ctx.contractMode.mode === "block") score += 2 + opponentVoids;
  if (allyVoids > 0 && !isTrump && !isJoker && !isPoint) score += allyVoids * (ctx.contractMode.mode === "chase" ? 4.2 : 2.4);
  if (allyVoids > 0 && isPoint && !master) score -= allyVoids * 3.2;

  if (ctx.secretaryGuess && ctx.myTeam === "def" && ctx.secretaryGuess.confidence >= 0.62 && seat !== ctx.secretaryGuess.seat) {
    if (!isPoint && !isTrump && !isJoker && card.suit && aiLikelyVoid(ctx, ctx.secretaryGuess.seat, card.suit)) score += 4.5;
    if (isPoint && card.suit && aiLikelyVoid(ctx, ctx.secretaryGuess.seat, card.suit)) score -= 5.5;
  }

  if (ctx.personality?.type === "aggressive" && likelyWin >= 0.62) score += 2.6;
  if (ctx.personality?.type === "conservative" && isPoint && likelyWin < 0.86) score -= 3.4;
  if (ctx.personality?.type === "blocker" && ctx.myTeam === "def" && likelyWin >= 0.65) score += 2.8;

  if (ctx.contractMode.mode === "protect") {
    if (likelyWin >= 0.78) score += 6 + (master ? 3 : 0);
    if (isPoint && likelyWin < 0.86) score -= 8;
    if (vulnerableLead) score -= 4;
    if (isTrump && ctx.trumpCount <= 2 && !master) score -= 4;
  } else if (ctx.contractMode.mode === "chase") {
    if (likelyWin >= 0.68) score += 7 + (isPoint ? 7 : 0) + (isTrump || isJoker ? 4 : 0);
    if (master) score += 6;
    if (!isPoint && likelyWin < 0.4 && ctx.handHeads >= 2) score -= 4;
  } else if (ctx.contractMode.mode === "block") {
    if (likelyWin >= 0.72) score += 8 + (isTrump || isJoker ? 4 : 0);
    if (master) score += 5;
    if (isPoint && likelyWin < 0.82) score -= 10;
  } else if (ctx.contractMode.mode === "conserve") {
    if ((isTrump || isJoker) && !master && !ctx.late) score -= 8;
    if (isPoint && likelyWin < 0.8) score -= 7;
  }

  if (ctx.myTeam === "nap") {
    const pressure = 8 + ctx.handHeads * 1.7 + ctx.napUrgency * 20;
    score += likelyWin * pressure;
    if (ctx.napUrgency > 0.82 && likelyWin >= 0.7) score += 9;
    if (isPoint && likelyWin >= 0.72) score += 8 + ctx.napUrgency * 6;
    if (isTrump && ctx.trumpCount >= 3) score += 5 + likelyWin * 4.5;
    if (aiCanSummonUsefulJoker(game, seat, card)) score += 7 + ctx.difficulty * 0.42;
  } else {
    const blockPressure = 4 + ctx.defenderUrgency * 14;
    score += likelyWin * blockPressure;
    if (isPoint && likelyWin < 0.8) score -= 16;
    if (!isPoint && !isTrump && !isJoker && likelyWin < 0.48) score += 5;
    if (ctx.defenderUrgency > 0.7 && likelyWin > 0.75) score += 7;
    if (ctx.defenderUrgency < 0.35 && isTrump && game.trickNo < 6) score -= 5;
  }

  if (!game.secretaryRevealed && card.id === game.secretaryCardId) {
    score -= game.trickNo < 5 ? 24 : 9;
    if (ctx.myTeam === "nap" && (ctx.napUrgency > 0.8 || ctx.handHeads >= 3 || ctx.late)) score += 15;
  }

  if (game.settings?.jokerLowLast3 && card.joker && game.trickNo >= 5 && game.trickNo < 7) {
    score += card.bigJoker ? 10 : 5;
  }
  return score;
}

function aiScoreFollowCard(game, seat, card, ctx) {
  const base = cardPlayValue(card, game);
  const isPoint = isHeadCard(card);
  const isTrump = Boolean(game.trump && game.trump !== "NT" && card.suit === game.trump);
  const isJoker = Boolean(card.joker);
  const candidateWins = wouldWin(game, card);
  const allyWinning = ctx.currentWinnerTeam === ctx.myTeam;
  const pointsWithCard = ctx.pointsOnTable + (isPoint ? 1 : 0);
  const headWeight = 7 + ctx.difficulty * 0.56 + (ctx.myTeam === "nap" ? ctx.napUrgency * 11 : ctx.defenderUrgency * 11);
  const overtakeRisk = candidateWins ? aiPotentialOvertakeRisk(game, seat, card, ctx) : 0;
  const futureOpponents = ctx.seatsAfter.filter((s) => aiTeamView(game, s, seat) !== ctx.myTeam);
  const futureAllies = ctx.seatsAfter.filter((s) => aiTeamView(game, s, seat) === ctx.myTeam);
  const opponentVoidLead = aiCountLikelyVoids(ctx, futureOpponents, ctx.leadSuit);
  const allyVoidLead = aiCountLikelyVoids(ctx, futureAllies, ctx.leadSuit);
  const voidCutDanger = opponentVoidLead > 0 && !ctx.actingLast;
  let score = 0;

  if (allyWinning) {
    if (candidateWins) {
      // 盟友已經贏墩時，不蓋隊友；只有末手保險或秘書牌特殊情況才例外。
      score -= 22 + base * 0.36;
      if (ctx.actingLast && isPoint) score -= 8;
      if (!ctx.actingLast && overtakeRisk > 0.55 && pointsWithCard >= 2) score += 4; // 防止後面被對方超車。
    } else {
      score += 9;
      const feedSafe = ctx.actingLast || ctx.opponentsAfter === 0 || (!voidCutDanger && opponentVoidLead === 0);
      const feedBonus = feedSafe ? 30 : Math.max(0, 10 - ctx.opponentsAfter * 5 - opponentVoidLead * 7);
      if (isPoint) score += feedBonus;
      if (ctx.contractMode.mode === "protect" && isPoint && feedSafe) score += 9;
      if (ctx.contractMode.mode === "chase" && isPoint && feedSafe) score += 7;
      if (isTrump || isJoker) score -= 6;
      score -= base * 0.13;
      if (!feedSafe && isPoint) score -= 10 + opponentVoidLead * 5;
      if (!feedSafe && isPoint && pointsWithCard >= 3) score -= 7;
    }
  } else {
    if (candidateWins) {
      // 對方暫時贏墩：以最小成本吃回來；但如果後面還很多人，需考慮被超車風險。
      score += 16 + pointsWithCard * headWeight;
      if (ctx.myTeam === "nap") score += ctx.napUrgency * 13;
      else score += ctx.defenderUrgency * 14;
      score -= base * 0.30;
      score -= overtakeRisk * (10 + Math.max(0, 3 - pointsWithCard) * 3);
      if (isPoint) score += 5;
      if (ctx.actingLast) score += 5;
      if (pointsWithCard >= 2 && overtakeRisk < 0.45) score += 9;
      if (ctx.late && pointsWithCard >= 1) score += 5;
    } else {
      // 吃不回來：不要把頭送給對方，盡量丟低牌；若盟友還在後面，保留可餵牌機會。
      score += 3;
      if (isPoint) score -= 20 + headWeight;
      if (isTrump || isJoker) score -= 4;
      score -= base * 0.10;
      if (ctx.alliesAfter > 0 && isPoint && ctx.pointsOnTable === 0) score -= 5;
    }
  }

  // 推測秘書：防家若懷疑某人是秘書，會避免把頭送給他，必要時也更願意攔截。
  if (ctx.secretaryGuess && ctx.myTeam === "def" && ctx.secretaryGuess.confidence >= 0.62) {
    if (ctx.currentWinner === ctx.secretaryGuess.seat && !candidateWins && isPoint) score -= 13 * ctx.secretaryGuess.confidence;
    if (ctx.currentWinner === ctx.secretaryGuess.seat && candidateWins) score += 9 * ctx.secretaryGuess.confidence;
    if (ctx.seatsAfter.includes(ctx.secretaryGuess.seat) && isPoint && !candidateWins) score -= 5 * ctx.secretaryGuess.confidence;
  }

  if (ctx.personality?.type === "support" && allyWinning && !candidateWins && isPoint && !voidCutDanger) score += 5;
  if (ctx.personality?.type === "aggressive" && candidateWins && !allyWinning) score += 3.5;
  if (ctx.personality?.type === "conservative" && (isTrump || isJoker) && !ctx.late && !ctx.actingLast) score -= 3.5;
  if (ctx.personality?.type === "blocker" && ctx.myTeam === "def" && candidateWins) score += 4;

  // 保約 / 擋約模式：局勢越接近成敗線，越明確搶頭或防守。
  if (ctx.contractMode.mode === "protect") {
    if (allyWinning && !candidateWins && isPoint && !voidCutDanger) score += 10;
    if (!allyWinning && candidateWins && pointsWithCard > 0 && overtakeRisk < 0.55) score += 10;
    if ((isTrump || isJoker) && pointsWithCard === 0 && !ctx.late) score -= 5;
  } else if (ctx.contractMode.mode === "chase") {
    if (!allyWinning && candidateWins) score += 10 + pointsWithCard * 5;
    if (allyWinning && !candidateWins && isPoint && !voidCutDanger) score += 8;
    if (!candidateWins && !allyWinning && isPoint) score -= 16;
  } else if (ctx.contractMode.mode === "block") {
    if (!allyWinning && candidateWins) score += 12 + pointsWithCard * 6;
    if (!candidateWins && !allyWinning && isPoint) score -= 18;
    if (candidateWins && overtakeRisk < 0.35) score += 5;
  } else if (ctx.contractMode.mode === "conserve") {
    if ((isTrump || isJoker) && !candidateWins && !ctx.late) score -= 8;
    if (candidateWins && pointsWithCard === 0 && !ctx.actingLast) score -= 4;
  }

  // 若後手盟友已知缺首引花色，可以期待他切牌；若後手對手缺門，送頭要更保守。
  if (allyVoidLead > 0 && !candidateWins && !isPoint && ctx.myTeam === "nap") score += 2.5 * allyVoidLead;
  if (voidCutDanger && isPoint && !candidateWins) score -= 8 + opponentVoidLead * 5;

  // 若自己是末家，判斷更果斷：能吃有頭墩就吃；盟友已吃就放心餵頭。
  if (ctx.actingLast) {
    if (candidateWins && !allyWinning && pointsWithCard > 0) score += 12 + pointsWithCard * 5;
    if (!candidateWins && allyWinning && isPoint) score += 12;
    if (!candidateWins && !allyWinning && isPoint) score -= 12;
  }

  if (!game.secretaryRevealed && card.id === game.secretaryCardId) {
    if (candidateWins && (!allyWinning || pointsWithCard >= 2 || ctx.late || ctx.napUrgency > 0.75)) {
      score += 20 + pointsWithCard * 8;
    } else {
      score -= game.trickNo < 6 ? 27 : 11;
    }
  }

  if (game.settings?.jokerLowLast3 && card.joker) {
    if (game.trickNo >= 7) score -= card.bigJoker ? 4 : 9;
    else if (game.trickNo <= 4 && ctx.pointsOnTable === 0 && !candidateWins) score -= 8;
    else if (game.trickNo === 6 && card.id === "RJ") score += 8;
  }

  return score;
}


function aiAdvancedPlayAdjustment(game, seat, card, ctx, legal) {
  if (!legal?.length) return 0;
  const difficulty = ctx.difficulty || Number(game.settings?.difficulty || 10);
  const skill = aiClamp((difficulty - 9) / 11, 0, 1);
  if (skill <= 0) return 0;

  const trickLen = game.trick?.length || 0;
  const candidateWins = trickLen > 0 ? wouldWin(game, card) : aiLikelyLeadWin(game, seat, card) >= 0.72;
  const isPoint = isHeadCard(card);
  const isTrump = Boolean(game.trump && game.trump !== "NT" && card.suit === game.trump);
  const isJoker = Boolean(card.joker);
  const leadSuit = ctx.leadSuit || card.suit || null;
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;
  const pointsWithCard = ctx.pointsOnTable + (isPoint ? 1 : 0);
  const legalWinning = trickLen > 0
    ? legal.filter((c) => wouldWin(game, c)).sort((a, b) => cardPlayValue(a, game) - cardPlayValue(b, game))
    : legal.filter((c) => aiLikelyLeadWin(game, seat, c) >= 0.72).sort((a, b) => cardPlayValue(a, game) - cardPlayValue(b, game));
  const cheapWinner = legalWinning[0] || null;
  const bestLoser = legal
    .filter((c) => trickLen === 0 ? aiLikelyLeadWin(game, seat, c) < 0.72 : !wouldWin(game, c))
    .sort((a, b) => cardPlayValue(b, game) - cardPlayValue(a, game))[0] || null;

  let score = 0;

  // 高難度電腦會用「最低成本吃牌」：能吃回來就盡量用最小的贏牌，避免過度浪費鬼牌、王牌或秘書牌。
  if (candidateWins && cheapWinner) {
    const cheapest = cheapWinner.id === card.id;
    const overpay = Math.max(0, cardPlayValue(card, game) - cardPlayValue(cheapWinner, game));
    if (currentEnemyWinning || pointsWithCard >= 2 || ctx.actingLast || ctx.late) {
      if (cheapest) score += (5.5 + pointsWithCard * 1.8) * skill;
      else if (pointsWithCard <= 1 && !ctx.actingLast) score -= aiClamp(overpay / 5, 0, 8) * skill;
    }
    if (!currentEnemyWinning && !ctx.late && pointsWithCard === 0 && !cheapest) score -= aiClamp(overpay / 4, 0, 7) * skill;
  }

  // 如果盟友已經穩吃，本家不應該把關鍵控制牌蓋上去；但可以安全餵頭。
  if (currentAllyWinning) {
    const allyCanBeOvertaken = ctx.currentWinner !== null
      ? aiFutureOvertakeRisk(game, seat, game.trick.find((p) => p.seat === ctx.currentWinner)?.card || card, ctx) > 0.55
      : false;
    if (candidateWins && !allyCanBeOvertaken) score -= (10 + cardPlayValue(card, game) * 0.18) * skill;
    if (!candidateWins && isPoint && (ctx.actingLast || ctx.opponentsAfter === 0)) score += 8 * skill;
  }

  // 關鍵控制牌保留：非必要時保留大鬼、小鬼、秘書牌、最後一張王牌或已知最大牌，讓後面保約/擋約更有工具。
  const control = aiControlCardValue(game, seat, card, ctx);
  if (control > 0 && !ctx.late) {
    const urgent = ctx.contractMode.mode === "chase" || ctx.contractMode.mode === "block" || pointsWithCard >= 2;
    if (!candidateWins || (!urgent && pointsWithCard === 0)) score -= control * (0.52 + skill * 0.42);
    if (candidateWins && urgent) score += control * 0.22 * skill;
  }

  // 高難度會看末段手牌計畫：剩 4 張以內時，能確定收頭的 master 牌要及早兌現；不能安全出的頭牌要避免送出。
  if ((ctx.handSize || 0) <= 4) {
    const master = aiIsLikelyMaster(game, seat, card, leadSuit, ctx.memory);
    if (master && (isPoint || pointsWithCard > 0)) score += (9 + pointsWithCard * 3) * skill;
    if (!master && isPoint && !candidateWins && !currentAllyWinning) score -= 10 * skill;
    if (bestLoser?.id === card.id && !isPoint && !isTrump && !isJoker) score += 3.5 * skill;
  }

  // 缺門推測加強：如果後手對手已缺首引花色，墊頭或領頭牌要更保守；若後手盟友缺門，則可用低牌引導切牌。
  if (leadSuit && !isTrump && !isJoker) {
    const futureOpponents = ctx.seatsAfter.filter((s) => aiTeamView(game, s, seat) !== ctx.myTeam);
    const futureAllies = ctx.seatsAfter.filter((s) => aiTeamView(game, s, seat) === ctx.myTeam);
    const oppVoids = aiCountLikelyVoids(ctx, futureOpponents, leadSuit);
    const allyVoids = aiCountLikelyVoids(ctx, futureAllies, leadSuit);
    if (oppVoids > 0 && isPoint && !candidateWins) score -= (6 + oppVoids * 4) * skill;
    if (allyVoids > 0 && !isPoint && !candidateWins && ctx.myTeam === "nap") score += (3 + allyVoids * 2) * skill;
  }

  // 擋約/保約再細化：臨界局面下，不只是看當前一墩，而是看「剩餘可取得頭數」。
  const nearLine = ctx.myTeam === "nap" ? ctx.napNeeds <= Math.max(2, pointsWithCard + 1) : ctx.napNeeds <= Math.max(3, pointsWithCard + 2);
  if (nearLine) {
    if (ctx.myTeam === "nap") {
      if (candidateWins && pointsWithCard > 0) score += (9 + pointsWithCard * 5) * skill;
      if (!candidateWins && isPoint && !currentAllyWinning) score -= 12 * skill;
    } else {
      if (currentEnemyWinning && candidateWins) score += (11 + pointsWithCard * 5) * skill;
      if (currentEnemyWinning && !candidateWins && isPoint) score -= 13 * skill;
    }
  }

  score += aiTrumpControlAdjustment(game, seat, card, ctx, candidateWins, pointsWithCard) * skill;
  score += aiEndgamePlanAdjustment(game, seat, card, ctx, candidateWins, pointsWithCard) * skill;
  score += aiCooperationAdjustment(game, seat, card, ctx, candidateWins, pointsWithCard) * skill;
  score += aiV7RiskTempoAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) * skill;
  score += aiV7SecretarySignalAdjustment(game, seat, card, ctx, candidateWins, pointsWithCard) * skill;
  score += aiV8ProjectionAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) * skill;
  score += aiV9PlanningAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) * skill;
  score += aiV10EndgameMatrixAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) * skill;
  score += aiV11SignalPressureAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) * skill;
  score += aiV12BlunderGuardAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) * skill;
  score += aiV13AdaptiveLearningAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) * skill;
  score += aiV14StyleStrategyAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) * skill;
  score += aiV15StrategicContinuityAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) * skill;
  score += aiV16OpponentModelAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) * skill;
  score += aiV18HeadGiftShieldAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) * skill;
  score += aiV19DefenseBalanceAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) * skill;
  score += aiV20HeadReportRiskAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) * skill;
  score += aiV21NapoleonAttackBalanceAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) * skill;
  score += aiV22AdaptiveBalanceAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) * skill;
  score += aiV23MicroBalanceAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) * skill;
  score += aiV24NapoleonCommanderAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) * skill;
  score += aiV25NapoleonPracticalBoostAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) * skill;
  score += aiV26BidAndTempoAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) * skill;
  score += aiV27NapoleonWindowAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) * skill;

  return score;
}


function aiV7RiskTempoAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) {
  const trickLen = game.trick?.length || 0;
  const isPoint = isHeadCard(card);
  const isTrump = Boolean(game.trump && game.trump !== "NT" && card.suit === game.trump);
  const isJoker = Boolean(card.joker);
  const cardSuit = card.joker ? null : card.suit;
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;
  const futureOpponents = ctx.seatsAfter.filter((s) => aiTeamView(game, s, seat) !== ctx.myTeam);
  const futureAllies = ctx.seatsAfter.filter((s) => aiTeamView(game, s, seat) === ctx.myTeam);
  const futureRisk = candidateWins ? aiV7FutureDanger(game, seat, card, ctx, futureOpponents) : 0;
  const master = cardSuit ? aiIsLikelyMaster(game, seat, card, cardSuit, ctx.memory) : Boolean(card.joker || card.id === game.secretaryCardId);
  const likelyWin = trickLen === 0 ? aiLikelyLeadWin(game, seat, card) : (candidateWins ? aiClamp(1 - futureRisk, 0, 1) : 0);
  let score = 0;

  // 高難度加入「剩餘大牌推估」：非 master 的頭牌，若後手敵方仍可能有更大牌或切牌，就不要太早送。
  if (isPoint && !master && !ctx.actingLast) {
    const strongerLeft = aiV7StrongerUnseenCount(game, seat, card, ctx.leadSuit || cardSuit);
    score -= aiClamp(strongerLeft * 2.8 + futureRisk * 12, 0, 18);
    if (currentAllyWinning) score += 3; // 盟友吃墩時可稍微放寬。
  }

  // 安全兌現：已知 master 或近似 master 的頭牌，在保約/擋約臨界時要敢收。
  if ((master || likelyWin >= 0.86) && isPoint) {
    if (ctx.contractMode.mode === "protect" || ctx.contractMode.mode === "block") score += 8 + pointsWithCard * 2.5;
    if (ctx.contractMode.mode === "chase") score += 10 + ctx.napUrgency * 5;
    if (ctx.handSize <= 4) score += 7;
  }

  // tempo：還沒必要時保留唯一控制牌；但如果這墩有 2 頭以上或接近成敗線，就要拿出來。
  const control = aiControlCardValue(game, seat, card, ctx);
  const importantTrick = pointsWithCard >= 2 || ctx.napNeeds <= Math.max(2, pointsWithCard + 1) || ctx.handSize <= 3;
  if (control >= 14 && !importantTrick && !ctx.late) score -= 9;
  if (control >= 14 && importantTrick && (candidateWins || likelyWin >= 0.82)) score += 7;

  // 敵我風險矩陣：後手對手已推測缺門或可能切王牌時，降低非安全頭牌；後手隊友缺門時，低牌引導切牌。
  const relevantSuit = ctx.leadSuit || cardSuit;
  if (relevantSuit && !isTrump && !isJoker) {
    const enemyVoidPressure = aiV7VoidPressure(ctx, futureOpponents, relevantSuit);
    const allyVoidPressure = aiV7VoidPressure(ctx, futureAllies, relevantSuit);
    if (enemyVoidPressure > 0 && isPoint && !candidateWins) score -= 10 * enemyVoidPressure;
    if (enemyVoidPressure > 0.45 && candidateWins && !ctx.actingLast) score -= 5 * enemyVoidPressure;
    if (allyVoidPressure > 0 && !isPoint && !candidateWins && ctx.myTeam === "nap") score += 5 * allyVoidPressure;
  }

  // 出牌節奏：若目前隊友穩吃且後面沒有敵方，頭牌加分；如果隊友可能被超車，別急著餵太多頭。
  if (currentAllyWinning && isPoint && !candidateWins) {
    const allyPlay = game.trick?.find((p) => p.seat === ctx.currentWinner);
    const allyRisk = allyPlay ? aiV7FutureDanger(game, seat, allyPlay.card, ctx, futureOpponents) : 0;
    if (allyRisk < 0.28) score += 9 + pointsWithCard;
    else score -= 7 * allyRisk;
  }

  // 防家在擋約時避免「幫拿破崙清路」；拿破崙軍搶約時則更願意用王牌/鬼牌控場。
  if (ctx.myTeam === "def" && ctx.contractMode.mode !== "block" && trickLen === 0 && isTrump && game.napoleon !== seat) score -= 8;
  if (ctx.myTeam === "nap" && (ctx.contractMode.mode === "chase" || ctx.napUrgency > 0.75) && (isTrump || isJoker) && candidateWins) score += 8;

  return score;
}

function aiV7SecretarySignalAdjustment(game, seat, card, ctx, candidateWins, pointsWithCard) {
  if (game.secretaryRevealed || !game.secretaryCardId) return 0;
  const isSecretCard = card.id === game.secretaryCardId;
  const isPoint = isHeadCard(card);
  const guess = ctx.secretaryGuess;
  let score = 0;

  // 暗秘書本人：不是關鍵墩時少曝光；但保約/搶約或能收多頭時要敢亮。
  if (isSecretCard) {
    const keyMoment = pointsWithCard >= 2 || ctx.contractMode.mode === "chase" || ctx.contractMode.mode === "protect" || ctx.handSize <= 4;
    if (candidateWins && keyMoment) score += 22;
    else if (!keyMoment) score -= 18;
  }

  // 防家：若某人疑似秘書，避免讓他吃到頭；若他在後手，少送容易被餵的頭牌。
  if (ctx.myTeam === "def" && guess && guess.confidence >= 0.58) {
    const secretAfter = ctx.seatsAfter.includes(guess.seat);
    const secretWinning = ctx.currentWinner === guess.seat;
    if (secretWinning && !candidateWins && isPoint) score -= 14 * guess.confidence;
    if (secretWinning && candidateWins) score += 11 * guess.confidence;
    if (secretAfter && isPoint && !candidateWins) score -= 7 * guess.confidence;
  }

  // 拿破崙本人：秘書還沒公開時，避免過度逼秘書曝光；若已經需要頭數，才用能引出秘書的花色。
  if (seat === game.napoleon && !isSecretCard && card.suit) {
    const secret = findCardById(game.secretaryCardId);
    if (secret?.suit === card.suit && ctx.contractMode.mode !== "chase" && (game.trickNo || 0) < 5) score -= 5;
    if (secret?.suit === card.suit && ctx.contractMode.mode === "chase") score += 5;
  }

  return score;
}

function aiV7FutureDanger(game, observerSeat, card, ctx, futureOpponents) {
  if (!futureOpponents?.length) return 0;
  const leadSuit = ctx.leadSuit || (card.joker ? null : card.suit);
  const strength = cardStrength(card, game, leadSuit);
  const unseen = aiUnseenCards(game, observerSeat);
  let danger = 0;
  for (const opp of futureOpponents) {
    const voidBonus = leadSuit && ctx.memory?.voids?.[opp]?.[leadSuit] ? 0.28 + (ctx.memory?.voidConfidence?.[opp]?.[leadSuit] || 0) * 0.35 : 0;
    const canTrump = leadSuit && game.trump && game.trump !== "NT" && leadSuit !== game.trump && ctx.memory?.voids?.[opp]?.[leadSuit];
    const stronger = unseen.some((c) => {
      if (canTrump && (c.joker || c.suit === game.trump)) return true;
      return cardStrength(c, game, leadSuit) > strength;
    });
    if (stronger) danger += 0.22;
    danger += voidBonus;
  }
  if (card.joker && !(game.settings?.jokerLowLast3 && game.trickNo >= 7)) danger *= card.bigJoker ? 0.18 : 0.32;
  if (card.id === game.secretaryCardId) danger *= 0.2;
  return aiClamp(danger, 0, 1);
}

function aiV7VoidPressure(ctx, seats, suit) {
  if (!suit || !seats?.length) return 0;
  let pressure = 0;
  for (const s of seats) {
    if (ctx.memory?.voids?.[s]?.[suit]) pressure += 0.55 + (ctx.memory?.voidConfidence?.[s]?.[suit] || 0) * 0.45;
  }
  return aiClamp(pressure, 0, 1.6);
}

function aiV7StrongerUnseenCount(game, seat, card, leadSuit = null) {
  const suit = leadSuit || (card.joker ? null : card.suit);
  const strength = cardStrength(card, game, suit);
  return aiUnseenCards(game, seat).filter((c) => cardStrength(c, game, suit) > strength).length;
}


function aiV8ProjectionAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 12) return 0;
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const isPoint = isHeadCard(card);
  const isControl = aiControlCardValue(game, seat, card, ctx) >= 14;
  const trickLen = game.trick?.length || 0;
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;
  const tacticalWeight = aiClamp((difficulty - 11) / 9, 0, 1.25);
  let score = 0;

  // V8: 以剩餘牌與缺門推測，估算這張牌是否真的能把本墩守到最後。
  if (candidateWins || (trickLen === 0 && projection.holdProb > 0.62)) {
    if (projection.holdProb >= 0.78) score += (4 + pointsWithCard * 2.8) * tacticalWeight;
    if (projection.holdProb < 0.46) score -= (7 + pointsWithCard * 3.2 + (isPoint ? 4 : 0)) * tacticalWeight;
    if (isControl && projection.holdProb < 0.58 && pointsWithCard <= 1 && !ctx.actingLast) score -= 8 * tacticalWeight;
  }

  // V8: 盟友可能守住時才餵頭；若後手對手的反吃概率高，避免把頭送出去。
  if (currentAllyWinning && !candidateWins) {
    if (isPoint && projection.allyHoldProb >= 0.72) score += (9 + pointsWithCard * 1.8) * tacticalWeight;
    if (isPoint && projection.enemySwingProb >= 0.42) score -= (12 + pointsWithCard * 2) * tacticalWeight;
  }
  if (currentEnemyWinning && !candidateWins && isPoint) {
    score -= (10 + projection.enemyHoldProb * 9) * tacticalWeight;
  }

  // V8: 低成本勝牌若已足夠，避免用更大的牌重複過付。
  const winning = (legal || []).filter((c) => trickLen > 0 ? wouldWin(game, c) : aiLikelyLeadWin(game, seat, c) >= 0.68)
    .sort((a, b) => cardPlayValue(a, game) - cardPlayValue(b, game));
  if (candidateWins && winning.length > 1) {
    const cheap = winning[0];
    const overpay = cardPlayValue(card, game) - cardPlayValue(cheap, game);
    if (cheap.id !== card.id && projection.holdProb < 0.72 && pointsWithCard <= 1) score -= aiClamp(overpay / 3, 0, 8) * tacticalWeight;
  }

  // V8: 出門花色選擇。若該花色後手敵方缺門壓力高，頭牌領出更危險；若隊友缺門，低牌領出可製造切牌機會。
  const leadSuit = ctx.leadSuit || (card.joker ? null : card.suit);
  if (leadSuit && !card.joker && !(game.trump && game.trump !== "NT" && card.suit === game.trump)) {
    const enemyCut = projection.enemyCutPressure;
    const allyCut = projection.allyCutPressure;
    if (isPoint && enemyCut > 0.35) score -= (8 + enemyCut * 10) * tacticalWeight;
    if (!isPoint && allyCut > 0.35 && projection.teamAfterPlay === ctx.myTeam) score += (4 + allyCut * 5) * tacticalWeight;
  }

  // V8: 保約 / 擋約臨界線。剩餘頭數不足時，勝率高的頭牌要兌現；勝率低的頭牌要藏。
  if (ctx.contractMode.mode === "protect" || ctx.contractMode.mode === "block" || ctx.contractMode.mode === "chase") {
    if (isPoint && projection.holdProb >= 0.82) score += (8 + pointsWithCard * 2) * tacticalWeight;
    if (isPoint && projection.holdProb < 0.45 && !currentAllyWinning) score -= (11 + pointsWithCard * 2) * tacticalWeight;
  }

  return score;
}

function aiV8ProjectedTrickOutcome(game, seat, card, ctx) {
  const trickLen = game.trick?.length || 0;
  const leadSuit = ctx.leadSuit || (card.joker ? null : card.suit);
  const afterTeam = aiV8TeamAfterCandidate(game, seat, card, ctx);
  const futureSeats = ctx.seatsAfter || [];
  let enemySwingProb = 0;
  let allyProtectProb = 0;
  let enemyCutPressure = 0;
  let allyCutPressure = 0;

  for (const s of futureSeats) {
    const team = aiTeamView(game, s, seat);
    const risk = aiV8SeatOvertakeRisk(game, seat, s, card, ctx, leadSuit);
    const cut = leadSuit ? aiV8SeatCutPressure(game, seat, s, ctx, leadSuit) : 0;
    if (team === ctx.myTeam) {
      allyProtectProb += risk * 0.55;
      allyCutPressure += cut;
    } else {
      enemySwingProb += risk;
      enemyCutPressure += cut;
    }
  }

  enemySwingProb = aiClamp(enemySwingProb, 0, 0.96);
  allyProtectProb = aiClamp(allyProtectProb, 0, 0.72);
  const baseHold = trickLen === 0 ? aiLikelyLeadWin(game, seat, card) : (wouldWin(game, card) ? 0.86 : 0.12);
  const holdProb = aiClamp(baseHold - enemySwingProb * 0.72 + allyProtectProb * 0.18, 0.02, 0.98);
  const allyHoldProb = afterTeam === ctx.myTeam ? holdProb : aiClamp(allyProtectProb * 0.75, 0, 0.7);
  const enemyHoldProb = afterTeam !== ctx.myTeam ? aiClamp(1 - allyProtectProb * 0.55, 0.15, 0.98) : aiClamp(enemySwingProb, 0, 0.95);
  return {
    teamAfterPlay: afterTeam,
    holdProb,
    allyHoldProb,
    enemyHoldProb,
    enemySwingProb,
    enemyCutPressure: aiClamp(enemyCutPressure, 0, 1.3),
    allyCutPressure: aiClamp(allyCutPressure, 0, 1.3)
  };
}

function aiV8TeamAfterCandidate(game, seat, card, ctx) {
  const trickLen = game.trick?.length || 0;
  if (trickLen === 0) return aiLikelyLeadWin(game, seat, card) >= 0.58 ? ctx.myTeam : "unknown";
  if (wouldWin(game, card)) return ctx.myTeam;
  return ctx.currentWinnerTeam || "unknown";
}

function aiV8SeatOvertakeRisk(game, observerSeat, targetSeat, card, ctx, leadSuit) {
  const unseen = aiUnseenCards(game, observerSeat);
  if (!unseen.length || targetSeat === observerSeat) return 0;
  const strength = cardStrength(card, game, leadSuit);
  const voidConf = leadSuit && ctx.memory?.voids?.[targetSeat]?.[leadSuit]
    ? 0.42 + (ctx.memory?.voidConfidence?.[targetSeat]?.[leadSuit] || 0) * 0.38
    : 0;
  const isTrumpSuit = game.trump && game.trump !== "NT" && leadSuit === game.trump;
  let stronger = 0;
  let trumpCuts = 0;
  for (const c of unseen) {
    if (cardStrength(c, game, leadSuit) > strength) stronger += 1;
    if (leadSuit && !isTrumpSuit && (c.joker || c.suit === game.trump)) trumpCuts += 1;
  }
  const strongerRatio = stronger / unseen.length;
  const cutRatio = trumpCuts / unseen.length;
  const likelyHasLeadSuit = leadSuit && !ctx.memory?.voids?.[targetSeat]?.[leadSuit]
    ? aiClamp((ctx.memory?.remainingBySuit?.[leadSuit] || 0) / Math.max(1, unseen.length), 0.08, 0.58)
    : 0;
  let risk = strongerRatio * (2.2 - likelyHasLeadSuit * 0.4) + voidConf * (0.25 + cutRatio * 1.4);
  if (card.joker && !(game.settings?.jokerLowLast3 && game.trickNo >= 7)) risk *= card.bigJoker ? 0.16 : 0.28;
  if (card.id === game.secretaryCardId) risk *= 0.22;
  return aiClamp(risk, 0, 0.88);
}

function aiV8SeatCutPressure(game, observerSeat, targetSeat, ctx, suit) {
  if (!suit || !ctx.memory?.voids?.[targetSeat]?.[suit]) return 0;
  const unseen = aiUnseenCards(game, observerSeat);
  const trumpLeft = unseen.filter((c) => c.joker || (game.trump && game.trump !== "NT" && c.suit === game.trump)).length;
  const voidConf = ctx.memory?.voidConfidence?.[targetSeat]?.[suit] || 0.5;
  return aiClamp(0.24 + voidConf * 0.44 + trumpLeft / Math.max(1, unseen.length) * 0.42, 0, 0.95);
}


function aiV9PlanningAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 13) return 0;
  const weight = aiClamp((difficulty - 12) / 8, 0, 1.35);
  const trickLen = game.trick?.length || 0;
  const isPoint = isHeadCard(card);
  const isTrump = Boolean(card.joker || (game.trump && game.trump !== "NT" && card.suit === game.trump));
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const plan = aiV9ContractSwingPlan(game, seat, card, ctx, projection, candidateWins, pointsWithCard);
  const secret = game.secretaryCardId ? findCardById(game.secretaryCardId) : null;
  let score = 0;

  // V9: 以「本墩後的成約差」評估，不只看這一墩有沒有贏。
  if (plan.isCritical) {
    if (plan.myTeamNeedsWin && (candidateWins || projection.holdProb >= 0.74)) score += 10 + pointsWithCard * 3.5;
    if (plan.myTeamNeedsWin && !candidateWins && isPoint && !currentAllyWinning) score -= 14;
    if (plan.preventOpponent && candidateWins) score += 9 + pointsWithCard * 4;
    if (plan.preventOpponent && !candidateWins && isPoint && currentEnemyWinning) score -= 15;
  }

  // V9: 末三墩與高難度殘局，優先保留最後一張真正控制牌；但成敗線到了要敢用。
  const stopper = aiV9IsLastStopper(game, seat, card, ctx);
  if (stopper && !plan.isCritical && !ctx.late && pointsWithCard <= 1) score -= 12;
  if (stopper && plan.isCritical && (candidateWins || projection.holdProb >= 0.72)) score += 8;

  // V9: 暗秘書曝光時機更細。若秘書牌不需要現在亮，盡量藏；若能完成保約/擋約關鍵頭，立即亮。
  if (!game.secretaryRevealed && card.id === game.secretaryCardId) {
    const revealNow = plan.isCritical || pointsWithCard >= 2 || ctx.handSize <= 3 || ctx.contractMode.mode === "chase";
    if (revealNow && (candidateWins || projection.holdProb >= 0.7)) score += 18;
    if (!revealNow && (game.trickNo || 0) <= 5) score -= 22;
  }

  // V9: 拿破崙領秘書花色會暴露資訊；高難度只有在需要頭或想逼秘書現身時才這樣做。
  if (seat === game.napoleon && trickLen === 0 && secret?.suit && card.suit === secret.suit && !game.secretaryRevealed) {
    if (ctx.contractMode.mode === "chase" || ctx.napNeeds <= Math.max(2, pointsWithCard + 1)) score += 5;
    else if (!isPoint) score -= 5;
    else score -= 9;
  }

  // V9: 防家若推測某人像秘書，會避免讓該座位在後手輕鬆收頭。
  if (ctx.myTeam === "def" && ctx.secretaryGuess && ctx.secretaryGuess.confidence >= 0.62) {
    const guessedAfter = ctx.seatsAfter.includes(ctx.secretaryGuess.seat);
    const guessedWinning = ctx.currentWinner === ctx.secretaryGuess.seat;
    if (guessedAfter && isPoint && !candidateWins) score -= 9 * ctx.secretaryGuess.confidence;
    if (guessedWinning && candidateWins) score += 9 * ctx.secretaryGuess.confidence;
  }

  // V9: 低風險脫手。沒有頭且不影響隊友時，更願意丟掉將來可能卡手的小牌。
  if (!isPoint && !candidateWins && !currentEnemyWinning && projection.enemySwingProb < 0.32 && !isTrump) score += 2.8;

  return score * weight;
}

function aiV9ContractSwingPlan(game, seat, card, ctx, projection, candidateWins, pointsWithCard) {
  const myTeamIsNap = ctx.myTeam === "nap";
  const potentialNapGain = (myTeamIsNap && (candidateWins || projection.holdProb >= 0.72)) ? pointsWithCard : 0;
  const potentialEnemyGain = (!myTeamIsNap && !candidateWins && ctx.currentWinnerTeam === "nap") ? pointsWithCard : 0;
  const napAfterMyWin = ctx.totals.teamHeads + potentialNapGain;
  const napAfterEnemyWin = ctx.totals.teamHeads + potentialEnemyGain;
  const contract = ctx.totals.contract || getBidAmount(game) || 9;
  const napClose = contract - ctx.totals.teamHeads <= Math.max(2, pointsWithCard + 1);
  return {
    isCritical: napClose || ctx.remainingHeads <= 4 || ctx.handSize <= 3 || pointsWithCard >= 2,
    myTeamNeedsWin: myTeamIsNap ? napAfterMyWin < contract && (ctx.contractMode.mode === "chase" || napClose) : ctx.contractMode.mode === "block" || napClose,
    preventOpponent: !myTeamIsNap && (napAfterEnemyWin >= contract - 1 || napClose),
    napAfterMyWin,
    napAfterEnemyWin
  };
}

function aiV9IsLastStopper(game, seat, card, ctx) {
  const hand = game.players?.[seat]?.hand || [];
  const control = aiControlCardValue(game, seat, card, ctx);
  if (control < 14) return false;
  const otherControls = hand.filter((c) => c.id !== card.id && aiControlCardValue(game, seat, c, ctx) >= 14);
  if (otherControls.length) return false;
  if (card.joker || card.id === game.secretaryCardId) return true;
  if (game.trump && game.trump !== "NT" && card.suit === game.trump) return true;
  return card.suit ? aiIsLikelyMaster(game, seat, card, card.suit, ctx.memory) : false;
}


function aiV12BlunderGuardAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) {
  const difficulty = Number(game.settings?.difficulty || ctx.difficulty || 10);
  if (difficulty < 12) return 0;
  const weight = aiClamp((difficulty - 11) / 9, 0, 1.5);
  const trickLen = game.trick?.length || 0;
  const isPoint = isHeadCard(card);
  const isControl = aiControlCardValue(game, seat, card, ctx) >= 14;
  const isTrump = Boolean(card.joker || (game.trump && game.trump !== "NT" && card.suit === game.trump));
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const plan = aiV9ContractSwingPlan(game, seat, card, ctx, projection, candidateWins, pointsWithCard);
  const nonPointAlternative = legal.some((c) => c.id !== card.id && !isHeadCard(c));
  const cheapWinning = trickLen > 0
    ? legal.filter((c) => wouldWin(game, c)).sort((a, b) => cardPlayValue(a, game) - cardPlayValue(b, game))[0]
    : legal.filter((c) => aiLikelyLeadWin(game, seat, c) >= 0.72).sort((a, b) => cardPlayValue(a, game) - cardPlayValue(b, game))[0];
  let score = 0;

  // V12: 明顯不要蓋隊友。隊友已吃且沒有被後手超車的壓力時，任何「蓋隊友」都視為失誤候選。
  if (currentAllyWinning && candidateWins && !plan.isCritical) {
    const winnerPlay = (game.trick || []).find((p2) => p2.seat === ctx.currentWinner);
    const allyRisk = winnerPlay ? aiFutureOvertakeRisk(game, seat, winnerPlay.card, ctx) : 0;
    if (allyRisk < 0.50) score -= (18 + cardPlayValue(card, game) * 0.22 + (isControl ? 10 : 0)) * weight;
    if (allyRisk >= 0.50 && pointsWithCard >= 2) score += 5 * weight; // 只有多頭墩、且隊友可能守不住時才補位。
  }

  // V12: 明顯不要把頭送給正在吃墩的對手；有低牌可丟時，高難度會強烈避免送頭。
  if (currentEnemyWinning && !candidateWins && isPoint && nonPointAlternative) {
    let penalty = 22 + pointsWithCard * 6;
    if (ctx.contractMode.mode === "block" || ctx.contractMode.mode === "protect") penalty += 8;
    if (ctx.actingLast) penalty += 4;
    score -= penalty * weight;
  }

  // V12: 可低成本吃牌時，不用鬼牌、秘書牌或最後控制牌去「大贏小墩」。
  if (candidateWins && cheapWinning && cheapWinning.id !== card.id) {
    const overpay = cardPlayValue(card, game) - cardPlayValue(cheapWinning, game);
    const cheapProjection = aiV8ProjectedTrickOutcome(game, seat, cheapWinning, ctx);
    const sameSafety = cheapProjection.holdProb + 0.08 >= projection.holdProb;
    if (sameSafety && pointsWithCard <= 1 && !plan.isCritical) {
      score -= aiClamp(overpay * 0.55 + (isControl ? 12 : 0), 4, 24) * weight;
    }
  }

  // V12: 領牌前自我檢查。敵方疑似缺該門時，除非是 master 或關鍵墩，不領不安全頭牌。
  if (trickLen === 0 && card.suit && isPoint && !plan.isCritical) {
    const futureOpponents = ctx.seatsAfter.filter((s2) => aiTeamView(game, s2, seat) !== ctx.myTeam);
    const oppVoid = aiCountLikelyVoids(ctx, futureOpponents, card.suit);
    const master = aiIsLikelyMaster(game, seat, card, card.suit, ctx.memory);
    if (oppVoid > 0 && !master) score -= (12 + oppVoid * 7) * weight;
  }

  // V12: 最後控制牌只有在能改善成約差或殘局需要時才出。
  if (isControl && !plan.isCritical && !ctx.late && pointsWithCard === 0) {
    score -= (9 + (isTrump ? 4 : 0)) * weight;
  }

  // V12: 若隊友已穩吃且自己是最後一手，頭牌可以安全餵；否則寧可保留。
  if (currentAllyWinning && !candidateWins && isPoint) {
    const futureOpponents = ctx.seatsAfter.filter((s2) => aiTeamView(game, s2, seat) !== ctx.myTeam);
    if (!futureOpponents.length) score += (10 + pointsWithCard * 2) * weight;
    else score -= (futureOpponents.length * 5) * weight;
  }

  // V12: 非頭小牌可做安全脫手時稍微加分，讓 AI 少卡住小牌。
  if (!isPoint && !candidateWins && !isControl && projection.enemySwingProb < 0.34) score += 3.5 * weight;

  return score;
}

function aiV12BlunderNotes(game, seat, card, ctx) {
  const notes = [];
  if (!card) return notes;
  const trickLen = game.trick?.length || 0;
  const wins = trickLen ? wouldWin(game, card) : aiLikelyLeadWin(game, seat, card) >= 0.72;
  const isPoint = isHeadCard(card);
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const plan = aiV9ContractSwingPlan(game, seat, card, ctx, projection, wins, (ctx.pointsOnTable || 0) + (isPoint ? 1 : 0));
  if (trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam && wins && !plan.isCritical) notes.push("自我檢查：避免無必要蓋隊友");
  if (trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam && !wins && isPoint) notes.push("自我檢查：避免把頭送給對手");
  if (aiControlCardValue(game, seat, card, ctx) >= 14 && !plan.isCritical && !ctx.late) notes.push("控制牌仍可保留，只有必要才用");
  if (projection.enemyCutPressure > 0.48) notes.push("覆核後手切牌壓力");
  if (!notes.length) notes.push("已通過蓋隊友、送頭、浪費控制牌的覆核");
  return notes;
}


function aiV13AdaptiveLearningAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) {
  const difficulty = Number(game.settings?.difficulty || ctx.difficulty || 10);
  if (difficulty < 10) return 0;
  const weight = aiClamp((difficulty - 9) / 11, 0, 1.45);
  const learning = aiV13LearningProfile(game, seat, ctx);
  const trickLen = game.trick?.length || 0;
  const isPoint = isHeadCard(card);
  const isControl = aiControlCardValue(game, seat, card, ctx) >= 14;
  const suit = card.joker ? "JOKER" : card.suit;
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  let score = 0;

  // V13：從本局前幾墩的結果調整同類決策，避免重複「頭牌送給對手」或「控制牌被迫浪費」。
  const lostHeadRisk = suit ? (learning.lostHeadSuit[suit] || 0) : 0;
  if (lostHeadRisk > 0 && isPoint && !candidateWins) score -= (7 + lostHeadRisk * 5) * weight;
  if (lostHeadRisk > 0 && trickLen === 0 && isPoint && projection.holdProb < 0.72) score -= (5 + lostHeadRisk * 4) * weight;

  // V13：如果之前同花色低牌成功讓隊友切牌，類似局面會更願意再嘗試；但不拿頭牌去冒險。
  const allyCutHint = suit ? (learning.allyCutSuits[suit] || 0) : 0;
  if (allyCutHint > 0 && !isPoint && !candidateWins && ctx.alliesAfter > 0) score += (3.5 + allyCutHint * 2.2) * weight;
  if (allyCutHint > 0 && isPoint && projection.enemySwingProb > 0.35) score -= (4 + allyCutHint * 2) * weight;

  // V13：成功餵頭的安全模型。只有隊友目前穩吃、後手對手壓力低，才重複餵頭。
  if (currentAllyWinning && !candidateWins && isPoint) {
    if (learning.safeFeedSuccess >= 1 && projection.enemySwingProb < 0.34) score += (5 + learning.safeFeedSuccess * 2) * weight;
    if (learning.failedFeed >= 1 && projection.enemySwingProb >= 0.28) score -= (8 + learning.failedFeed * 3) * weight;
  }

  // V13：若前面有控制牌打出去卻沒拿下關鍵頭數，高難度會更保留控制牌。
  if (isControl && learning.wastedControls > 0 && !ctx.late && pointsWithCard <= 1 && !currentEnemyWinning) {
    score -= (6 + learning.wastedControls * 3) * weight;
  }

  // V13：殘局復盤。若自己本局已多次失去有頭墩，最後幾墩會更偏向穩收或安全脫手。
  if (ctx.handSize <= 4 && learning.lostHeadTricks >= 2) {
    if (candidateWins && projection.holdProb >= 0.64 && pointsWithCard > 0) score += (7 + pointsWithCard * 2) * weight;
    if (!candidateWins && isPoint && !currentAllyWinning) score -= (8 + learning.lostHeadTricks * 2) * weight;
  }

  return score;
}

function aiV13LearningProfile(game, seat, ctx = null) {
  const histories = Array.isArray(game?.trickHistory) ? game.trickHistory : [];
  const myTeam = ctx?.myTeam || aiTeamView(game, seat, seat);
  const profile = {
    lostHeadSuit: { S: 0, H: 0, D: 0, C: 0, JOKER: 0 },
    allyCutSuits: { S: 0, H: 0, D: 0, C: 0 },
    safeFeedSuccess: 0,
    failedFeed: 0,
    wastedControls: 0,
    lostHeadTricks: 0
  };

  for (const trick of histories.slice(-8)) {
    const plays = Array.isArray(trick.plays) ? trick.plays : [];
    const myPlay = plays.find((p2) => p2.seat === seat);
    if (!myPlay?.card) continue;
    const winnerTeam = aiTeamView(game, trick.winner, seat);
    const myCard = myPlay.card;
    const suit = myCard.joker ? "JOKER" : myCard.suit;
    const myPoint = isHeadCard(myCard);
    const myControl = aiControlCardValue(game, seat, myCard, ctx || aiBuildPlayContext(game, seat)) >= 14;
    const teamWon = winnerTeam === myTeam;

    if (!teamWon && myPoint) {
      if (profile.lostHeadSuit[suit] !== undefined) profile.lostHeadSuit[suit] += 1;
      profile.lostHeadTricks += 1;
    }
    if (!teamWon && myControl && (trick.heads || 0) <= 1) profile.wastedControls += 1;

    const index = plays.findIndex((p2) => p2.seat === seat);
    const beforePlays = index > 0 ? plays.slice(0, index) : [];
    const leadSuit = trick.leadSuit || aiLeadSuitFromPlays(plays);
    const winnerPlay = plays.find((p2) => p2.seat === trick.winner);
    const winnerUsedCut = winnerPlay?.card && leadSuit && (winnerPlay.card.joker || (game.trump && game.trump !== "NT" && winnerPlay.card.suit === game.trump && leadSuit !== game.trump));
    if (teamWon && trick.winner !== seat && winnerUsedCut && leadSuit && !myPoint) {
      profile.allyCutSuits[leadSuit] = (profile.allyCutSuits[leadSuit] || 0) + 1;
    }

    if (myPoint && beforePlays.length) {
      let beforeBest = beforePlays[0];
      for (const play of beforePlays.slice(1)) {
        if (cardStrength(play.card, game, leadSuit) > cardStrength(beforeBest.card, game, leadSuit)) beforeBest = play;
      }
      const beforeBestTeam = aiTeamView(game, beforeBest.seat, seat);
      if (beforeBestTeam === myTeam && teamWon && trick.winner !== seat) profile.safeFeedSuccess += 1;
      if (beforeBestTeam === myTeam && !teamWon) profile.failedFeed += 1;
    }
  }
  return profile;
}

function aiV13LearningNotes(game, seat, card, ctx) {
  const notes = [];
  if (!card || Number(game.settings?.difficulty || 10) < 16) return notes;
  const learning = aiV13LearningProfile(game, seat, ctx);
  const suit = card.joker ? "JOKER" : card.suit;
  if (suit && learning.lostHeadSuit[suit] >= 1 && isHeadCard(card)) notes.push("本局同門頭牌曾被對手收走，改用較保守評分");
  if (suit && learning.allyCutSuits[suit] >= 1 && !isHeadCard(card)) notes.push("本局此門曾成功製造隊友切牌，保留低牌引導價值");
  if (learning.failedFeed >= 1 && ctx.currentWinnerTeam === ctx.myTeam && isHeadCard(card)) notes.push("曾有餵頭失敗紀錄，先覆核後手風險");
  if (learning.wastedControls >= 1 && aiControlCardValue(game, seat, card, ctx) >= 14) notes.push("曾有控制牌低效使用，非關鍵墩傾向保留");
  return notes;
}


function aiV14StyleStrategyAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) {
  const difficulty = Number(game.settings?.difficulty || ctx.difficulty || 10);
  const style = game.settings?.aiStyle || "varied";
  if (difficulty < 5 && style === "varied") return 0;
  const weight = aiClamp((difficulty - 4) / 16, 0.18, 1.45);
  const type = ctx.personality?.type || "balanced";
  const trickLen = game.trick?.length || 0;
  const isPoint = isHeadCard(card);
  const isTrumpOrJoker = Boolean(card.joker || (game.trump && game.trump !== "NT" && card.suit === game.trump));
  const control = aiControlCardValue(game, seat, card, ctx);
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const critical = ctx.myTeam === "nap"
    ? ctx.napNeeds <= Math.max(2, pointsWithCard + 1)
    : ctx.napNeeds <= Math.max(3, pointsWithCard + 2);
  let score = 0;

  // V14：AI 風格模式。讓同樣難度下的電腦不只強弱不同，也有打法差異。
  if (type === "conservative") {
    if (isPoint && projection.holdProb < 0.78 && !ctx.actingLast) score -= 10;
    if (control >= 14 && !critical && !ctx.late) score -= 7 + control * 0.14;
    if (candidateWins && pointsWithCard >= 2 && projection.holdProb >= 0.74) score += 5;
  }

  if (type === "aggressive") {
    if (candidateWins && pointsWithCard >= 1) score += 8 + pointsWithCard * 2.2;
    if (trickLen === 0 && isTrumpOrJoker && ctx.contractMode.mode === "chase") score += 6;
    if (!candidateWins && isPoint && currentEnemyWinning) score -= 7;
    if (critical && (candidateWins || projection.holdProb >= 0.62)) score += 8;
  }

  if (type === "support") {
    if (currentAllyWinning && !candidateWins && isPoint && projection.enemySwingProb < 0.32) score += 11;
    if (currentAllyWinning && candidateWins && !critical) score -= 10;
    if (trickLen === 0 && card.suit && !isPoint && ctx.seatsAfter.some((s) => aiTeamView(game, s, seat) === ctx.myTeam && aiLikelyVoid(ctx, s, card.suit))) score += 7;
  }

  if (type === "blocker") {
    if (ctx.myTeam === "def" && currentEnemyWinning && candidateWins) score += 9 + pointsWithCard * 3;
    if (ctx.myTeam === "def" && isPoint && !candidateWins && projection.enemyHoldProb >= 0.45) score -= 12;
    if (ctx.myTeam === "def" && critical && (candidateWins || projection.holdProb >= 0.6)) score += 12;
    if (ctx.myTeam === "nap" && !critical && control >= 14 && !ctx.late) score -= 4;
  }

  if (type === "expert") {
    // 高手綜合：按局勢在保約、搶約、擋約、餵隊友之間切換，而不是固定偏進攻或保守。
    if (critical && (candidateWins || projection.holdProb >= 0.64)) score += 12 + pointsWithCard * 3;
    if (!critical && control >= 16 && !ctx.late && pointsWithCard <= 1) score -= 7;
    if (currentAllyWinning && !candidateWins && isPoint && projection.enemySwingProb < 0.28) score += 8;
    if (currentEnemyWinning && candidateWins && pointsWithCard >= 1) score += 7;
    if (trickLen === 0 && card.suit && !isPoint && ctx.suitPlan?.[card.suit]?.voidAllies > 0) score += 5;
    if (isPoint && projection.enemyCutPressure > 0.55 && !ctx.actingLast) score -= 9;
  }

  return score * weight;
}

function aiV14StyleNotes(game, seat, card, ctx) {
  const type = ctx?.personality?.type || aiPersonality(seat, game.settings).type;
  const label = ctx?.personality?.label || aiPersonality(seat, game.settings).label || "均衡";
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx || aiBuildPlayContext(game, seat));
  const notes = [`AI風格：${label}`];
  if (type === "conservative" && projection.holdProb < 0.78) notes.push("保守模式會降低不安全頭牌權重");
  if (type === "aggressive" && (isHeadCard(card) || projection.holdProb >= 0.62)) notes.push("進攻模式偏向搶頭與主動控制");
  if (type === "support") notes.push("支援模式優先觀察隊友是否能吃或切牌");
  if (type === "blocker") notes.push("防守模式會優先阻止拿破崙軍接近成約");
  if (type === "expert") notes.push("高手模式依成約差切換保約、搶約與擋約");
  return notes;
}


function aiV15StrategicContinuityAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 12) return 0;
  const weight = aiClamp((difficulty - 11) / 9, 0, 1.7);
  const trickLen = game.trick?.length || 0;
  const hand = game.players?.[seat]?.hand || [];
  const isPoint = isHeadCard(card);
  const isTrumpOrJoker = Boolean(card.joker || (game.trump && game.trump !== "NT" && card.suit === game.trump));
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const plan = aiV15RoundPlan(game, seat, ctx);
  const control = aiControlCardValue(game, seat, card, ctx);
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;
  const master = card.suit ? aiIsLikelyMaster(game, seat, card, card.suit, ctx.memory) : Boolean(card.joker || card.id === game.secretaryCardId);
  const lowNonPoint = !isPoint && !isTrumpOrJoker && !card.joker;
  let score = 0;

  // V15：長局控制牌預算。控制牌不足時，非關鍵墩更保留；控制牌充足且接近成敗線時才兌現。
  if (control >= 10) {
    if (plan.controlBudget === "thin" && !plan.criticalNow && !ctx.late && pointsWithCard <= 1) score -= 8 + control * 0.18;
    if (plan.controlBudget === "rich" && plan.tempo !== "hold" && (candidateWins || projection.holdProb >= 0.68) && pointsWithCard >= 1) score += 4 + control * 0.10;
    if (plan.tempo === "cash" && (candidateWins || master) && projection.holdProb >= 0.58) score += 5 + pointsWithCard * 2.4;
  }

  // V15：每一輪都按同一個節奏打，不反覆在保留與搶頭之間搖擺。
  if (plan.tempo === "hold") {
    if (isPoint && !candidateWins && !currentAllyWinning) score -= 9;
    if (isTrumpOrJoker && !plan.criticalNow && !ctx.late && pointsWithCard === 0) score -= 6;
    if (lowNonPoint && !candidateWins) score += 3.5;
  } else if (plan.tempo === "cash") {
    if (isPoint && (candidateWins || projection.holdProb >= 0.70 || master)) score += 8 + pointsWithCard * 2.6;
    if (currentEnemyWinning && candidateWins) score += 5 + pointsWithCard * 2;
    if (currentEnemyWinning && !candidateWins && isPoint) score -= 8;
  } else if (plan.tempo === "probe") {
    if (trickLen === 0 && lowNonPoint && card.suit && plan.probeSuits.includes(card.suit)) score += 6;
    if (trickLen === 0 && isPoint && card.suit && plan.dangerSuits.includes(card.suit) && !master) score -= 9;
    if (trickLen === 0 && isTrumpOrJoker && !ctx.late) score -= 3.5;
  }

  // V15：隊伍協調的穩定性。隊友已安全吃時，明確餵頭；隊友不穩時不要硬餵。
  if (currentAllyWinning) {
    if (!candidateWins && isPoint && projection.enemySwingProb < 0.26) score += 8 + (ctx.personality?.feed || 0) * 6;
    if (!candidateWins && isPoint && projection.enemySwingProb >= 0.45) score -= 6;
    if (candidateWins && !plan.criticalNow) score -= 7 + control * 0.12;
  }

  // V15：敵方連續成功切牌或收頭的花色，之後領牌更保守；本隊成功的花色可延續。
  if (card.suit && trickLen === 0) {
    const suitTrend = plan.suitTempo[card.suit] || 0;
    if (suitTrend < -0.35 && isPoint && !master) score -= 8 * Math.abs(suitTrend);
    if (suitTrend > 0.35 && lowNonPoint) score += 4 * suitTrend;
    if (suitTrend > 0.55 && isPoint && (master || projection.holdProb > 0.7) && plan.tempo === "cash") score += 3 * suitTrend;
  }

  // V15：殘局一致性。最後幾張不只看最大牌，也看剩下頭牌是否還有退路。
  if ((ctx.handSize || hand.length) <= 4) {
    const handHeads = countPoints(hand);
    const lowExits = hand.filter((c) => !isHeadCard(c) && !c.joker && !(game.trump && game.trump !== "NT" && c.suit === game.trump)).length;
    if (handHeads >= Math.max(2, lowExits + 1) && isPoint && (candidateWins || master || projection.holdProb >= 0.68)) score += 7;
    if (lowExits <= 1 && isPoint && !candidateWins && !currentAllyWinning) score -= 7;
    if (lowExits > 0 && lowNonPoint && !candidateWins && !plan.criticalNow) score += 3;
  }

  return score * weight;
}

function aiV15RoundPlan(game, seat, ctx = null) {
  const context = ctx || aiBuildPlayContext(game, seat);
  const hand = game.players?.[seat]?.hand || [];
  const controls = hand.filter((card) => aiControlCardValue(game, seat, card, context) >= 10).length;
  const remainingTricks = Math.max(1, 10 - (game.trickNo || 0));
  const controlRatio = controls / Math.max(1, Math.min(remainingTricks, hand.length || remainingTricks));
  const pointsOnTable = context.pointsOnTable || 0;
  const criticalNow = context.myTeam === "nap"
    ? context.napNeeds <= Math.max(2, pointsOnTable + 1)
    : context.napNeeds <= Math.max(3, pointsOnTable + 2);
  let tempo = "probe";
  if (context.contractMode?.mode === "protect" || context.contractMode?.mode === "conserve") tempo = "hold";
  if (context.contractMode?.mode === "chase" || context.contractMode?.mode === "block" || criticalNow || context.late) tempo = "cash";
  const controlBudget = controlRatio < 0.22 ? "thin" : controlRatio > 0.46 ? "rich" : "normal";

  const suitTempo = { S: 0, H: 0, D: 0, C: 0 };
  const histories = Array.isArray(game.trickHistory) ? game.trickHistory : [];
  for (const trick of histories.slice(-5)) {
    const suit = trick.leadSuit || aiLeadSuitFromPlays(trick.plays || []);
    if (!suit || !suitTempo.hasOwnProperty(suit)) continue;
    const winnerTeam = aiTeamView(game, trick.winner, seat);
    const delta = (winnerTeam === context.myTeam ? 1 : -1) * (0.18 + Math.min(3, trick.heads || 0) * 0.08);
    suitTempo[suit] = aiClamp(suitTempo[suit] + delta, -1, 1);
  }

  const probeSuits = Object.entries(context.suitPlan || {})
    .filter(([suit, plan]) => plan && plan.voidAllies > 0 && plan.voidOpponents === 0)
    .map(([suit]) => suit);
  const dangerSuits = Object.entries(context.suitPlan || {})
    .filter(([suit, plan]) => plan && plan.voidOpponents > 0 && plan.voidAllies === 0)
    .map(([suit]) => suit);

  return { tempo, controlBudget, criticalNow, controlRatio, suitTempo, probeSuits, dangerSuits };
}

function aiV15ContinuityNotes(game, seat, card, ctx) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 16 || !card) return [];
  const plan = aiV15RoundPlan(game, seat, ctx || aiBuildPlayContext(game, seat));
  const notes = [];
  if (plan.tempo === "hold") notes.push("長局計畫：保留控制牌、避免非必要送頭");
  if (plan.tempo === "cash") notes.push("長局計畫：接近成敗線，優先兌現安全頭");
  if (plan.tempo === "probe") notes.push("長局計畫：先探門與製造切牌機會");
  if (plan.controlBudget === "thin") notes.push("控制牌預算偏少，避免過早耗掉王牌/鬼牌");
  if (card.suit && (plan.suitTempo[card.suit] || 0) < -0.35) notes.push(`本局${suitName(card.suit)}走勢不利，降低冒險`);
  return notes;
}

function aiV15OpeningPlanReason(game, seat, secretaryCardId) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 16) return null;
  const card = findCardById(secretaryCardId);
  const hand = game.players?.[seat]?.hand || [];
  const profile = aiEvaluateBidProfile(hand, game.settings, difficulty);
  const trumpCount = game.trump && game.trump !== "NT" ? hand.filter((c) => c.suit === game.trump || c.joker).length : 0;
  const heads = countPoints(hand);
  const shortSuits = ["S", "H", "D", "C"].filter((suit) => hand.filter((c) => c.suit === suit).length <= 1 && suit !== game.trump);
  const plan = [];
  if (trumpCount >= 4) plan.push("王牌控制較足，前中盤可視情況抽王牌");
  else plan.push("王牌控制有限，先保留關鍵王牌");
  if (heads >= 5) plan.push("手上頭牌多，優先找安全時機兌現");
  else plan.push("頭牌不足，前期以探門和製造切牌為主");
  if (shortSuits.length) plan.push(`短門${shortSuits.map(suitName).join("/")}可作為後續切牌方向`);
  if (card) plan.push(`秘書牌選${cardLong(card)}，用來補強${card.joker ? "最高控制" : suitName(card.suit)}戰力`);
  plan.push(`期望約${profile.expectedHeads.toFixed(1)}頭`);
  return plan.slice(0, 3).join("；") + "。";
}


function aiV16OpponentModelAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 12) return 0;
  const weight = aiClamp((difficulty - 11) / 9, 0, 1.55);
  const trickLen = game.trick?.length || 0;
  const isPoint = isHeadCard(card);
  const isTrumpOrJoker = Boolean(card.joker || (game.trump && game.trump !== "NT" && card.suit === game.trump));
  const leadSuit = ctx.leadSuit || (card.joker ? null : card.suit);
  const models = aiV16OpponentModels(game, seat, ctx);
  const futureOpponents = ctx.seatsAfter.filter((s) => aiTeamView(game, s, seat) !== ctx.myTeam);
  const futureAllies = ctx.seatsAfter.filter((s) => aiTeamView(game, s, seat) === ctx.myTeam);
  const currentModel = ctx.currentWinner !== null && ctx.currentWinner !== undefined ? models[ctx.currentWinner] : null;
  let score = 0;

  // 對手模型：若後手有常切牌/常搶墩的對手，非 master 頭牌更容易變成送頭。
  if (leadSuit && !isTrumpOrJoker && isPoint && !ctx.actingLast) {
    for (const opp of futureOpponents) {
      const model = models[opp];
      if (!model) continue;
      const voidRisk = ctx.memory?.voids?.[opp]?.[leadSuit] ? 0.55 + (ctx.memory?.voidConfidence?.[opp]?.[leadSuit] || 0) * 0.35 : 0;
      const cutterRisk = model.cutter * 0.32 + model.aggression * 0.18 + voidRisk;
      if (cutterRisk > 0.45 && !aiIsLikelyMaster(game, seat, card, leadSuit, ctx.memory)) score -= (8 + cutterRisk * 10) * weight;
    }
  }

  // 如果目前吃墩者是「收頭型」敵方，且本墩已有頭，防家/拿破崙軍都更願意用低成本吃回來。
  if (trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam && currentModel) {
    const dangerCollector = currentModel.collector * 0.55 + currentModel.aggression * 0.25 + currentModel.napFeed * 0.2;
    if (candidateWins && (pointsWithCard > 0 || dangerCollector > 0.52)) score += (6 + pointsWithCard * 4 + dangerCollector * 6) * weight;
    if (!candidateWins && isPoint) score -= (8 + dangerCollector * 9) * weight;
  }

  // 盟友模型：穩定支援型盟友吃墩時可餵頭；若該盟友常被反吃，先不要急著餵頭。
  if (trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam && currentModel) {
    const allyReliability = currentModel.support + currentModel.holdsLead * 0.45 - currentModel.riskyLead * 0.45;
    if (!candidateWins && isPoint) {
      if (ctx.actingLast || allyReliability >= 0.52) score += (6 + allyReliability * 8) * weight;
      else score -= (5 + Math.max(0, 0.46 - allyReliability) * 12) * weight;
    }
    if (candidateWins && allyReliability >= 0.5 && pointsWithCard <= 1 && !ctx.late) score -= 7 * weight;
  }

  // 領牌時依全桌模型調整：敵方偏被動可兌現 master；敵方偏侵略或切牌型則用低牌探門。
  if (trickLen === 0) {
    const enemyAggression = aiV16AverageModel(models, futureOpponents.length ? futureOpponents : [0,1,2,3,4].filter((s) => s !== seat && aiTeamView(game, s, seat) !== ctx.myTeam), "aggression");
    const enemyCut = leadSuit ? aiV16AverageModel(models, [0,1,2,3,4].filter((s) => s !== seat && aiTeamView(game, s, seat) !== ctx.myTeam), "cutter") : 0;
    const master = leadSuit ? aiIsLikelyMaster(game, seat, card, leadSuit, ctx.memory) : Boolean(card.joker || card.id === game.secretaryCardId);
    if (isPoint && master && enemyAggression < 0.45) score += (4 + pointsWithCard * 2) * weight;
    if (isPoint && !master && enemyAggression > 0.55) score -= (7 + enemyAggression * 7) * weight;
    if (!isPoint && !isTrumpOrJoker && enemyCut > 0.45 && ctx.myTeam === "nap") score += 3.5 * weight;
  }

  // 暗秘書尚未公開時，若某玩家模型顯示明顯餵拿破崙，防家更保守；拿破崙軍則可試著保護這個訊號。
  if (!game.secretaryRevealed && ctx.myTeam === "def" && isPoint) {
    const secretLikeAfter = futureOpponents
      .map((s) => models[s])
      .filter(Boolean)
      .reduce((max, m) => Math.max(max, m.napFeed), 0);
    if (secretLikeAfter > 0.55 && !candidateWins) score -= (6 + secretLikeAfter * 9) * weight;
  }

  return score;
}

function aiV16OpponentModels(game, observerSeat, ctx = null) {
  const models = Array.from({ length: 5 }, (_, seat) => aiV16SeatOpponentModel(game, observerSeat, seat, ctx));
  return models;
}

function aiV16SeatOpponentModel(game, observerSeat, targetSeat, ctx = null) {
  const histories = Array.isArray(game.trickHistory) ? game.trickHistory : [];
  let pointFeedsNap = 0;
  let blocksNap = 0;
  let riskyLeads = 0;
  let leadWins = 0;
  let leads = 0;
  let collects = 0;
  let supportFeeds = 0;
  let cutSignals = 0;
  let samples = 0;

  for (const trick of histories) {
    const plays = trick.plays || [];
    if (!plays.length) continue;
    const playIndex = plays.findIndex((p) => p.seat === targetSeat);
    if (playIndex < 0) continue;
    const play = plays[playIndex];
    const card = play.card;
    if (!card) continue;
    samples += 1;
    const isPoint = isHeadCard(card);
    const leadSuit = trick.leadSuit || aiLeadSuitFromPlays(plays);
    if (playIndex === 0) {
      leads += 1;
      if (trick.winner === targetSeat) leadWins += 1;
      if (isPoint && trick.winner !== targetSeat) riskyLeads += 1;
    }
    if (trick.winner === game.napoleon && isPoint && targetSeat !== game.napoleon) pointFeedsNap += 1;
    if (trick.winner === targetSeat && (trick.heads || 0) >= 2) collects += 1;

    const before = plays.slice(0, playIndex);
    if (before.length) {
      let bestBefore = before[0];
      for (const prev of before.slice(1)) {
        if (cardStrength(prev.card, game, leadSuit) > cardStrength(bestBefore.card, game, leadSuit)) bestBefore = prev;
      }
      const beforeTeam = aiTeamView(game, bestBefore.seat, observerSeat);
      const targetTeam = aiTeamView(game, targetSeat, observerSeat);
      const winsNow = cardStrength(card, game, leadSuit) > cardStrength(bestBefore.card, game, leadSuit);
      if (bestBefore.seat === game.napoleon && winsNow) blocksNap += 1;
      if (beforeTeam === targetTeam && !winsNow && isPoint) supportFeeds += 1;
    }

    if (leadSuit && card.suit && card.suit !== leadSuit && !card.joker) cutSignals += 1;
  }

  const mem = ctx?.memory || aiBuildCardMemory(game, observerSeat);
  const voidCount = ["S", "H", "D", "C"].filter((suit) => mem.voids?.[targetSeat]?.[suit]).length;
  const aggression = aiClamp((collects * 0.25 + blocksNap * 0.22 + leadWins * 0.14 - riskyLeads * 0.18) / Math.max(1, samples * 0.32), 0, 1);
  const support = aiClamp((supportFeeds * 0.3 + pointFeedsNap * (targetSeat !== game.napoleon ? 0.12 : 0)) / Math.max(1, samples * 0.22), 0, 1);
  const blocker = aiClamp((blocksNap * 0.38 + collects * 0.12) / Math.max(1, samples * 0.25), 0, 1);
  const napFeed = aiClamp((pointFeedsNap * 0.42 + supportFeeds * 0.12 - blocksNap * 0.2) / Math.max(1, samples * 0.24), 0, 1);
  const cutter = aiClamp(voidCount * 0.23 + cutSignals * 0.2, 0, 1);
  const riskyLead = aiClamp(riskyLeads / Math.max(1, leads), 0, 1);
  const holdsLead = aiClamp(leadWins / Math.max(1, leads), 0, 1);
  let label = "觀察中";
  if (samples >= 3) {
    if (napFeed >= 0.58 && !game.secretaryRevealed) label = "疑似支援拿破崙";
    else if (blocker >= 0.55) label = "擋約積極";
    else if (cutter >= 0.55) label = "切牌威脅";
    else if (aggression >= 0.56) label = "搶墩積極";
    else if (support >= 0.5) label = "餵隊友型";
    else if (riskyLead >= 0.45) label = "領頭牌偏冒險";
  }
  return { seat: targetSeat, samples, aggression, support, blocker, napFeed, cutter, collector: aiClamp(collects / Math.max(1, samples), 0, 1), riskyLead, holdsLead, label };
}

function aiV16AverageModel(models, seats, key) {
  const usable = (seats || []).map((s) => models?.[s]?.[key]).filter((n) => Number.isFinite(n));
  if (!usable.length) return 0;
  return usable.reduce((sum, n) => sum + n, 0) / usable.length;
}

function aiV16OpponentModelNotes(game, seat, card, ctx) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 16 || !card) return [];
  const notes = [];
  const models = aiV16OpponentModels(game, seat, ctx);
  const leadSuit = ctx?.leadSuit || (card.joker ? null : card.suit);
  const futureOpponents = (ctx?.seatsAfter || []).filter((s) => aiTeamView(game, s, seat) !== ctx.myTeam);
  const futureAllies = (ctx?.seatsAfter || []).filter((s) => aiTeamView(game, s, seat) === ctx.myTeam);
  const dangerousEnemy = futureOpponents.map((s) => models[s]).filter(Boolean).sort((a, b) => Math.max(b.cutter, b.aggression, b.napFeed) - Math.max(a.cutter, a.aggression, a.napFeed))[0];
  if (dangerousEnemy && Math.max(dangerousEnemy.cutter, dangerousEnemy.aggression) >= 0.55) notes.push(`對手模型：後手 ${game.players[dangerousEnemy.seat]?.name || "對手"} 偏${dangerousEnemy.label}，降低送頭風險`);
  if (ctx?.currentWinner !== null && ctx?.currentWinner !== undefined) {
    const m = models[ctx.currentWinner];
    if (m && ctx.currentWinnerTeam === ctx.myTeam && isHeadCard(card) && m.support + m.holdsLead >= 0.8) notes.push(`對手模型：目前吃墩的隊友屬${m.label}，可考慮安全餵頭`);
    if (m && ctx.currentWinnerTeam !== ctx.myTeam && (m.collector || m.aggression) && Math.max(m.aggression, m.blocker) >= 0.55) notes.push(`對手模型：目前吃墩者偏${m.label}，需要用低成本攔截`);
  }
  if (leadSuit) {
    const allyCutter = futureAllies.map((s) => models[s]).filter((m) => m?.cutter >= 0.5)[0];
    if (allyCutter && !isHeadCard(card)) notes.push(`對手模型：隊友可能缺${suitName(leadSuit)}，低牌可製造切牌機會`);
  }
  return notes.slice(0, 2);
}


function aiV18HeadGiftShieldAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 8 || !card || !ctx) return 0;
  const weight = aiClamp((difficulty - 7) / 13, 0, 1.35);
  const trickLen = game.trick?.length || 0;
  const isPoint = isHeadCard(card);
  const isControl = aiControlCardValue(game, seat, card, ctx) >= 14;
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const leadSuit = ctx.leadSuit || (card.joker ? null : card.suit);
  const lowDiscards = (legal || []).filter((c) => !isHeadCard(c) && aiControlCardValue(game, seat, c, ctx) < 10);
  const safeLowDiscards = lowDiscards.filter((c) => {
    if (trickLen === 0) return aiLikelyLeadWin(game, seat, c) < 0.5;
    return !wouldWin(game, c);
  });
  const winningCards = (legal || []).filter((c) => trickLen === 0 ? aiLikelyLeadWin(game, seat, c) >= 0.7 : wouldWin(game, c));
  const cheaperWinner = winningCards
    .filter((c) => c.id !== card.id && cardPlayValue(c, game) + 3 < cardPlayValue(card, game))
    .sort((a, b) => cardPlayValue(a, game) - cardPlayValue(b, game))[0] || null;
  const critical = pointsWithCard >= 2 || ctx.handSize <= 3 || ctx.napNeeds <= Math.max(2, pointsWithCard + 1) || ctx.contractMode?.mode === "block" || ctx.contractMode?.mode === "chase";
  const forcedPoint = isPoint && safeLowDiscards.length === 0 && !(legal || []).some((c) => !isHeadCard(c));
  let score = 0;

  // V18: 重點是降低「可疑送頭」。對手吃墩時，除非能吃回來或被迫跟頭，否則不要把頭牌丟出去。
  if (isPoint && currentEnemyWinning && !candidateWins) {
    score -= (forcedPoint ? 7 : 18) * weight;
    if (safeLowDiscards.length) score -= 8 * weight;
  }

  // 領出或墊出頭牌前，先看後手敵方切牌 / 反吃壓力。
  if (isPoint && !ctx.actingLast && !candidateWins) {
    const pressure = projection.enemyCutPressure + projection.enemySwingProb;
    if (pressure > 0.34) score -= (8 + pressure * 11) * weight;
  }
  if (isPoint && trickLen === 0 && projection.enemyCutPressure > 0.35 && !aiIsLikelyMaster(game, seat, card, leadSuit, ctx.memory)) {
    score -= (7 + projection.enemyCutPressure * 10) * weight;
  }

  // 隊友吃墩時可以餵頭，但只有在後手安全或自己是最後一手時才明顯加分。
  if (isPoint && currentAllyWinning && !candidateWins) {
    if (ctx.actingLast || projection.enemySwingProb < 0.28) score += (9 + pointsWithCard * 2) * weight;
    else score -= (5 + projection.enemySwingProb * 8) * weight;
  }

  // 不要為了小墩浪費控制牌；能低成本吃就用低成本吃。
  if (candidateWins && cheaperWinner && !critical) {
    const overpay = cardPlayValue(card, game) - cardPlayValue(cheaperWinner, game);
    score -= aiClamp(overpay / 3.5, 0, 10) * weight;
    if (isControl) score -= 7 * weight;
  }
  if (isControl && candidateWins && pointsWithCard <= 1 && !critical && !ctx.actingLast) score -= 8 * weight;

  // 真的到了保約/擋約關鍵線，就不要過度保守；該吃的多頭墩要吃。
  if (critical && candidateWins && pointsWithCard > 0) score += (8 + pointsWithCard * 4) * weight;
  if (critical && currentEnemyWinning && candidateWins) score += (7 + pointsWithCard * 4) * weight;

  // 有安全低牌可脫手時，非關鍵情境下偏向先保留頭牌。
  if (isPoint && safeLowDiscards.length && !critical && !candidateWins) score -= 6 * weight;

  return score;
}

function aiV18HeadGiftShieldNotes(game, seat, card, ctx) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 16 || !card || !ctx) return [];
  const notes = [];
  const trickLen = game.trick?.length || 0;
  const isPoint = isHeadCard(card);
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const candidateWins = trickLen === 0 ? aiLikelyLeadWin(game, seat, card) >= 0.72 : wouldWin(game, card);
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;

  if (isPoint && currentEnemyWinning && !candidateWins) notes.push("送頭防護：對手吃墩時避免無謂丟頭牌");
  if (isPoint && currentAllyWinning && !candidateWins && (ctx.actingLast || projection.enemySwingProb < 0.28)) notes.push("送頭防護：隊友吃墩且後手安全，允許餵頭");
  if (isPoint && projection.enemyCutPressure > 0.35 && !ctx.actingLast) notes.push("送頭防護：後手切牌壓力偏高，保留頭牌");
  if (aiControlCardValue(game, seat, card, ctx) >= 14 && !ctx.late && (ctx.pointsOnTable || 0) <= 1) notes.push("送頭防護：非關鍵墩保留控制牌");
  return notes.slice(0, 2);
}


function aiV19DefenseBalanceAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 9 || !card || !ctx) return 0;
  const weight = aiClamp((difficulty - 8) / 12, 0, 1.45);
  const trickLen = game.trick?.length || 0;
  const isPoint = isHeadCard(card);
  const isControl = aiControlCardValue(game, seat, card, ctx) >= 14;
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const legalLowLosers = (legal || []).filter((c) => !isHeadCard(c) && aiControlCardValue(game, seat, c, ctx) < 10 && (trickLen === 0 ? aiLikelyLeadWin(game, seat, c) < 0.62 : !wouldWin(game, c)));
  const legalCheapWinners = (legal || []).filter((c) => (trickLen === 0 ? aiLikelyLeadWin(game, seat, c) >= 0.72 : wouldWin(game, c))).sort((a, b) => cardPlayValue(a, game) - cardPlayValue(b, game));
  const cheapestWinner = legalCheapWinners[0] || null;
  const contractNow = calculateHeadTotals(game);
  const napCanReachAfterThis = contractNow.teamHeads + pointsWithCard >= contractNow.contract;
  const nearNapLine = ctx.napNeeds <= Math.max(3, pointsWithCard + 2);
  const suspectedSecretaryBehind = ctx.seatsAfter.some((s) => {
    const guess = aiInferSecretaryOwner(game, seat, ctx.memory);
    return guess && guess.seat === s && guess.confidence >= 0.52;
  });
  let score = 0;

  if (ctx.myTeam === "def") {
    // V19：聯合國在拿破崙接近成約時要更像真人地擋約，而不是保守旁觀。
    if (currentEnemyWinning && candidateWins) {
      const urgency = nearNapLine || napCanReachAfterThis ? 1.65 : 1;
      score += (10 + pointsWithCard * 5.5) * urgency * weight;
      if (cheapestWinner && cheapestWinner.id === card.id) score += 5 * weight;
      if (cheapestWinner && cheapestWinner.id !== card.id && !napCanReachAfterThis) score -= aiClamp((cardPlayValue(card, game) - cardPlayValue(cheapestWinner, game)) / 3.5, 0, 11) * weight;
    }
    if (currentEnemyWinning && !candidateWins && isPoint) {
      score -= (nearNapLine ? 24 : 14) * weight;
      if (legalLowLosers.length) score -= 8 * weight;
    }
    if (!trickLen && isPoint && !aiIsLikelyMaster(game, seat, card, card.suit, ctx.memory)) {
      const riskyLead = projection.enemyCutPressure + projection.enemySwingProb + (suspectedSecretaryBehind ? 0.22 : 0);
      if (riskyLead > 0.34) score -= (10 + riskyLead * 13) * weight;
    }
    if (currentAllyWinning && isPoint && !candidateWins) {
      // 聯合國隊友吃墩時可餵頭，但後手若有拿破崙/疑似秘書威脅，仍要收手。
      const safeFeed = ctx.actingLast || projection.enemySwingProb < 0.24;
      score += (safeFeed ? 8 : -8) * weight;
      if (suspectedSecretaryBehind && !ctx.actingLast) score -= 8 * weight;
    }
    if (isControl && candidateWins && pointsWithCard <= 1 && !nearNapLine && !ctx.actingLast) score -= 9 * weight;
  } else {
    // 拿破崙軍已經偏強時，AI 不再無腦衝：保約時重視穩吃，落後時才提高冒險。
    if (ctx.contractMode?.mode === "protect") {
      if (candidateWins && pointsWithCard > 0) score += (5 + pointsWithCard * 2.5) * weight;
      if (!candidateWins && isPoint && !currentAllyWinning) score -= 11 * weight;
    } else if (ctx.contractMode?.mode === "chase") {
      if (candidateWins && pointsWithCard > 0) score += (8 + pointsWithCard * 4) * weight;
    }
  }

  // 所有陣營共用：非關鍵時避免把可避免頭牌丟給對手；健康檢查的可避免送頭會因此下降。
  if (isPoint && currentEnemyWinning && !candidateWins && legalLowLosers.length) score -= 8 * weight;
  if (candidateWins && cheapestWinner && cheapestWinner.id !== card.id && !nearNapLine && !napCanReachAfterThis) {
    const overpay = cardPlayValue(card, game) - cardPlayValue(cheapestWinner, game);
    if (overpay > 8) score -= aiClamp(overpay / 4, 0, 10) * weight;
  }
  return score;
}

function aiV19DefenseBalanceNotes(game, seat, card, ctx) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 16 || !card || !ctx) return [];
  const notes = [];
  const trickLen = game.trick?.length || 0;
  const isPoint = isHeadCard(card);
  const candidateWins = trickLen === 0 ? aiLikelyLeadWin(game, seat, card) >= 0.72 : wouldWin(game, card);
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;
  const nearNapLine = ctx.napNeeds <= Math.max(3, (ctx.pointsOnTable || 0) + (isPoint ? 1 : 0) + 2);
  if (ctx.myTeam === "def" && currentEnemyWinning && candidateWins && nearNapLine) notes.push("V19擋約：拿破崙接近成約，優先攔截本墩");
  if (ctx.myTeam === "def" && currentEnemyWinning && !candidateWins && isPoint) notes.push("V19送頭分類：避免把頭牌送給拿破崙軍");
  if (ctx.myTeam === "def" && currentAllyWinning && isPoint && !candidateWins) notes.push("V19防守平衡：隊友吃墩時才考慮安全餵頭");
  return notes.slice(0, 2);
}


function aiV20HeadReportRiskAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 12 || !card || !ctx) return 0;
  const weight = aiClamp((difficulty - 11) / 9, 0.35, 1.4);
  const trickLen = game.trick?.length || 0;
  const isPoint = isHeadCard(card);
  const control = aiControlCardValue(game, seat, card, ctx);
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;
  const lowSafeDiscards = (legal || []).filter((c) => {
    if (isHeadCard(c) || aiControlCardValue(game, seat, c, ctx) >= 10) return false;
    const wins = trickLen === 0 ? aiLikelyLeadWin(game, seat, c) >= 0.62 : wouldWin(game, c);
    if (wins) return false;
    const p = aiV8ProjectedTrickOutcome(game, seat, c, ctx);
    return p.enemySwingProb < 0.52;
  });
  const cheapWinners = (legal || []).filter((c) => trickLen === 0 ? aiLikelyLeadWin(game, seat, c) >= 0.72 : wouldWin(game, c))
    .sort((a, b) => cardPlayValue(a, game) - cardPlayValue(b, game));
  const cheapestWinner = cheapWinners[0] || null;
  const nearLine = ctx.myTeam === "def"
    ? ctx.napNeeds <= Math.max(3, (ctx.pointsOnTable || 0) + pointsWithCard + 2)
    : ctx.napNeeds <= Math.max(2, pointsWithCard + 1);
  const suspectedSecretaryAfter = !game.secretaryRevealed && ctx.myTeam === "def" && ctx.secretaryGuess && ctx.seatsAfter.includes(ctx.secretaryGuess.seat) && ctx.secretaryGuess.confidence >= 0.5;
  let score = 0;

  // 健康檢查中真正會被記為「可避免送頭」的情境：對手正在吃，自己吃不回來，卻仍丟出頭牌。
  if (isPoint && currentEnemyWinning && !candidateWins) {
    score -= (18 + pointsWithCard * 3) * weight;
    if (lowSafeDiscards.length) score -= 11 * weight;
    if (ctx.myTeam === "def") score -= (nearLine ? 18 : 9) * weight;
    if (suspectedSecretaryAfter) score -= 7 * weight;
  }

  // 領頭牌前再檢查後手風險；非 master 頭牌若會被切或被反吃，先保留。
  if (trickLen === 0 && isPoint) {
    const master = card.suit ? aiIsLikelyMaster(game, seat, card, card.suit, ctx.memory) : Boolean(card.joker || card.id === game.secretaryCardId);
    const risk = projection.enemyCutPressure + projection.enemySwingProb + (suspectedSecretaryAfter ? 0.18 : 0);
    if (!master && risk > 0.34) score -= (9 + risk * 18) * weight;
    if (!master && lowSafeDiscards.length) score -= 5 * weight;
  }

  // 隊友吃墩時，不再一律餵頭；只有後手安全或自己末手才算安全餵隊友。
  if (isPoint && currentAllyWinning && !candidateWins) {
    const safeFeed = ctx.actingLast || (projection.enemySwingProb < 0.24 && projection.enemyCutPressure < 0.30 && !suspectedSecretaryAfter);
    score += (safeFeed ? 9 : -15) * weight;
  }

  // 防家在成敗線附近要更願意低成本攔截，但避免用高控制牌 overpay。
  if (ctx.myTeam === "def" && currentEnemyWinning && candidateWins) {
    score += (nearLine ? 16 : 7) * weight + pointsWithCard * 3.2 * weight;
    if (cheapestWinner && cheapestWinner.id === card.id) score += 7 * weight;
    else if (cheapestWinner && !nearLine) {
      const overpay = Math.max(0, cardPlayValue(card, game) - cardPlayValue(cheapestWinner, game));
      score -= aiClamp(overpay / 3, 0, 12) * weight;
    }
  }

  // 非關鍵小墩避免浪費控制牌，尤其是健康檢查會標記的鬼牌/秘書牌/大王牌。
  if (control >= 14 && candidateWins && !nearLine && !ctx.late && pointsWithCard <= 1 && !ctx.actingLast) {
    score -= (7 + control * 0.18) * weight;
  }
  return score;
}

function aiV20HeadReportRiskNotes(game, seat, card, ctx) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 16 || !card || !ctx) return [];
  const notes = [];
  const trickLen = game.trick?.length || 0;
  const isPoint = isHeadCard(card);
  const candidateWins = trickLen === 0 ? aiLikelyLeadWin(game, seat, card) >= 0.72 : wouldWin(game, card);
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;
  if (isPoint && currentEnemyWinning && !candidateWins) notes.push("V20送頭分類：避免把可避免頭牌送給對手");
  if (isPoint && currentAllyWinning && !candidateWins && (ctx.actingLast || projection.enemySwingProb < 0.24)) notes.push("V20安全餵頭：隊友吃墩且後手風險低");
  if (ctx.myTeam === "def" && currentEnemyWinning && candidateWins && ctx.napNeeds <= 3) notes.push("V20擋約：拿破崙接近成約，優先攔截");
  if (trickLen === 0 && isPoint && projection.enemyCutPressure > 0.35) notes.push("V20後手風險：對手可能缺門切牌，保留頭牌");
  return notes.slice(0, 2);
}


function aiV21NapoleonAttackBalanceAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 10 || !card || !ctx) return 0;
  const weight = aiClamp((difficulty - 9) / 11, 0.25, 1.35);
  const trickLen = game.trick?.length || 0;
  const isPoint = isHeadCard(card);
  const isTrump = Boolean(game.trump && game.trump !== "NT" && card.suit === game.trump);
  const isJoker = Boolean(card.joker);
  const control = aiControlCardValue(game, seat, card, ctx);
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;
  const napBehind = ctx.myTeam === "nap" && (ctx.contractMode?.mode === "chase" || ctx.napNeeds >= Math.max(3, pointsWithCard + 2) || ctx.napUrgency > 0.56);
  const napCritical = ctx.myTeam === "nap" && ctx.napNeeds <= Math.max(3, pointsWithCard + 2);
  const safeEnough = ctx.actingLast || projection.holdProb >= 0.58 || projection.enemySwingProb < 0.34;
  const legalLowLosers = (legal || []).filter((c) => !isHeadCard(c) && aiControlCardValue(game, seat, c, ctx) < 9 && (trickLen === 0 ? aiLikelyLeadWin(game, seat, c) < 0.64 : !wouldWin(game, c)));
  let score = 0;

  // V21：拿破崙方偏弱時補進攻。落後時，有把握守住的頭牌、王牌、鬼牌與秘書牌要更敢兌現。
  if (ctx.myTeam === "nap") {
    if (napBehind && candidateWins) {
      score += (9 + pointsWithCard * 5 + ctx.napUrgency * 10) * weight;
      if (isPoint) score += 6 * weight;
      if (isTrump || isJoker || control >= 14) score += (safeEnough ? 6 : 2) * weight;
    }
    if (napBehind && trickLen === 0) {
      const leadWin = aiLikelyLeadWin(game, seat, card);
      const master = card.suit ? aiIsLikelyMaster(game, seat, card, card.suit, ctx.memory) : Boolean(isJoker || card.id === game.secretaryCardId);
      if ((isPoint || isTrump || isJoker || master) && leadWin >= 0.66) score += (7 + ctx.napUrgency * 8) * weight;
      if (!isPoint && !master && legalLowLosers.length >= 3 && ctx.handHeads >= 3) score -= 3 * weight;
      if (isTrump && ctx.trumpCount >= 4 && (game.trickNo || 0) <= 4) score += 5 * weight; // 有長王牌時更會抽王牌建立節奏。
    }
    if (currentEnemyWinning && candidateWins && (pointsWithCard >= 1 || napBehind || napCritical)) {
      score += (10 + pointsWithCard * 6) * weight;
      if (projection.holdProb >= 0.55) score += 5 * weight;
    }
    if (currentAllyWinning && !candidateWins && isPoint) {
      const feedSafe = ctx.actingLast || projection.enemySwingProb < 0.30 || ctx.opponentsAfter === 0;
      if (feedSafe && (napBehind || napCritical || pointsWithCard >= 2)) score += (8 + pointsWithCard * 2) * weight;
    }
    if (!game.secretaryRevealed && card.id === game.secretaryCardId) {
      const rescueWindow = napBehind || napCritical || ctx.handSize <= 4 || pointsWithCard >= 2;
      if (rescueWindow && (candidateWins || projection.holdProb >= 0.58)) score += (18 + ctx.napUrgency * 12) * weight;
      else if (!rescueWindow && !ctx.late) score -= 6 * weight;
    }
  }

  // V21：防守方在拿破崙明顯落後時不再過度壓制；保留控制牌，避免把防守強度推到過高。
  if (ctx.myTeam === "def") {
    const napClearlyBehind = ctx.napNeeds >= Math.max(4, (ctx.remainingHeads || 0) * 0.45);
    if (napClearlyBehind && candidateWins && pointsWithCard <= 1 && control >= 12 && !ctx.actingLast && !ctx.late) {
      score -= (8 + control * 0.22) * weight;
    }
    if (napClearlyBehind && trickLen === 0 && (isJoker || isTrump) && pointsWithCard === 0 && !ctx.late) {
      score -= 6 * weight;
    }
    // 真正接近成約時仍保留 V19/V20 的強防守，不削弱擋約。
    if (ctx.napNeeds <= Math.max(3, pointsWithCard + 2) && candidateWins && currentEnemyWinning) {
      score += (6 + pointsWithCard * 3) * weight;
    }
  }

  return score;
}

function aiV21NapoleonAttackBalanceNotes(game, seat, card, ctx) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 16 || !card || !ctx) return [];
  const notes = [];
  const trickLen = game.trick?.length || 0;
  const candidateWins = trickLen === 0 ? aiLikelyLeadWin(game, seat, card) >= 0.66 : wouldWin(game, card);
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const pointsWithCard = (ctx.pointsOnTable || 0) + (isHeadCard(card) ? 1 : 0);
  const napBehind = ctx.myTeam === "nap" && (ctx.contractMode?.mode === "chase" || ctx.napNeeds >= Math.max(3, pointsWithCard + 2) || ctx.napUrgency > 0.56);
  if (napBehind && candidateWins) notes.push("V21進攻補強：拿破崙方落後，優先兌現可守住的頭牌/控制牌");
  if (!game.secretaryRevealed && card.id === game.secretaryCardId && (napBehind || pointsWithCard >= 2 || ctx.handSize <= 4)) notes.push("V21秘書救局：成敗線附近更願意公開支援");
  if (ctx.myTeam === "def" && ctx.napNeeds >= Math.max(4, (ctx.remainingHeads || 0) * 0.45) && projection.enemySwingProb < 0.35) notes.push("V21攻防平衡：拿破崙落後時，防家避免過度耗控制牌");
  return notes.slice(0, 2);
}

function aiV22AdaptiveBalanceAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 11 || !card || !ctx) return 0;
  const weight = aiClamp((difficulty - 10) / 10, 0.2, 1.25);
  const trickLen = game.trick?.length || 0;
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const isPoint = isHeadCard(card);
  const isControl = aiControlCardValue(game, seat, card, ctx) >= 12;
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;
  const remainingHeads = Math.max(1, ctx.remainingHeads || 1);
  const napProgress = 1 - aiClamp((ctx.napNeeds || 0) / remainingHeads, 0, 1);
  let score = 0;

  // V22：用成約距離微調攻防。拿破崙常差一兩頭時，拿破崙軍要敢收；防家在非關鍵小墩不要過度壓制。
  if (ctx.myTeam === "nap") {
    const chaseWindow = ctx.napNeeds >= Math.max(2, pointsWithCard + 1) && ctx.napNeeds <= Math.max(6, remainingHeads * 0.62);
    const desperate = ctx.napNeeds > remainingHeads * 0.62;
    if ((chaseWindow || desperate) && candidateWins && (pointsWithCard > 0 || isControl || projection.holdProb >= 0.62)) {
      score += (5 + pointsWithCard * 3.2 + (desperate ? 3 : 0)) * weight;
    }
    if ((chaseWindow || desperate) && currentAllyWinning && isPoint && !candidateWins && (ctx.actingLast || projection.enemySwingProb < 0.32)) {
      score += (5 + pointsWithCard * 1.8) * weight;
    }
    if ((chaseWindow || desperate) && !game.secretaryRevealed && card.id === game.secretaryCardId && (candidateWins || projection.holdProb > 0.56 || ctx.handSize <= 4)) {
      score += (10 + Math.max(0, ctx.napNeeds - pointsWithCard)) * weight;
    }
  } else {
    const napNearMade = ctx.napNeeds <= Math.max(3, pointsWithCard + 1);
    const napFarBehind = ctx.napNeeds >= Math.max(5, remainingHeads * 0.55);
    if (napNearMade && currentEnemyWinning && candidateWins) score += (6 + pointsWithCard * 3) * weight;
    if (napFarBehind && candidateWins && pointsWithCard <= 1 && isControl && !ctx.late && !ctx.actingLast) score -= 5 * weight;
    if (napFarBehind && trickLen === 0 && isPoint && projection.enemyCutPressure > 0.32) score -= 4 * weight;
  }

  // 低難度保留一點不穩，高難度才完整啟用 V22 的後手保險。
  if (difficulty >= 16 && isPoint && !candidateWins && currentEnemyWinning && !ctx.actingLast) {
    score -= (projection.enemyHoldProb * 5 + projection.enemyCutPressure * 4) * weight;
  }
  if (difficulty >= 16 && isPoint && currentAllyWinning && !candidateWins && projection.enemySwingProb < 0.22) {
    score += 3.5 * weight;
  }

  return score;
}

function aiV22AdaptiveBalanceNotes(game, seat, card, ctx) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 16 || !card || !ctx) return [];
  const notes = [];
  const trickLen = game.trick?.length || 0;
  const candidateWins = trickLen === 0 ? aiLikelyLeadWin(game, seat, card) >= 0.66 : wouldWin(game, card);
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const pointsWithCard = (ctx.pointsOnTable || 0) + (isHeadCard(card) ? 1 : 0);
  const remainingHeads = Math.max(1, ctx.remainingHeads || 1);
  if (ctx.myTeam === "nap" && ctx.napNeeds >= Math.max(2, pointsWithCard + 1) && candidateWins) notes.push("V22攻防平衡：拿破崙仍需追頭，優先兌現可守住的關鍵墩");
  if (ctx.myTeam === "def" && ctx.napNeeds <= Math.max(3, pointsWithCard + 1) && candidateWins) notes.push("V22擋約校正：拿破崙接近成約，防家提高攔截權重");
  if (ctx.myTeam === "def" && ctx.napNeeds >= Math.max(5, remainingHeads * 0.55) && projection.enemySwingProb < 0.35) notes.push("V22節奏校正：拿破崙明顯落後，防家保留控制牌避免過度壓制");
  return notes.slice(0, 2);
}


function aiV23MicroBalanceAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) {
  const difficulty = Number(game.settings?.difficulty || 10);
  const weight = aiClamp((difficulty - 8) / 12, 0, 1);
  if (!weight || !card || !ctx) return 0;
  const trickLen = game.trick?.length || 0;
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const isPoint = isHeadCard(card);
  const isControl = aiControlCardValue(game, seat, card, ctx) >= 12;
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const remainingHeads = Math.max(1, ctx.remainingHeads || 1);
  const napNeeds = Math.max(0, ctx.napNeeds || 0);
  const nearShort = napNeeds >= 1 && napNeeds <= Math.max(3, Math.ceil(remainingHeads * 0.28));
  const chaseShort = napNeeds >= 2 && napNeeds <= Math.max(5, Math.ceil(remainingHeads * 0.46));
  const nonCriticalDefense = ctx.myTeam === "def" && napNeeds >= Math.max(4, remainingHeads * 0.42);
  let score = 0;

  // V23：只在差一點的局面小幅補拿破崙，不讓進攻補強過頭。
  if (ctx.myTeam === "nap") {
    if ((nearShort || chaseShort || ctx.late) && candidateWins && (pointsWithCard > 0 || isControl || projection.holdProb >= 0.64)) {
      score += (3.2 + pointsWithCard * 2.4 + (nearShort ? 2.2 : 0)) * weight;
    }
    if ((nearShort || ctx.late) && currentAllyWinning && isPoint && !candidateWins && (ctx.actingLast || projection.enemySwingProb < 0.26)) {
      score += (3.8 + pointsWithCard * 1.4) * weight;
    }
    if (!game.secretaryRevealed && card.id === game.secretaryCardId && (nearShort || ctx.late || pointsWithCard >= 2) && (candidateWins || currentAllyWinning || projection.holdProb >= 0.52)) {
      score += (6.5 + pointsWithCard * 2.5) * weight;
    }
  }

  // V23：聯合國在拿破崙仍明顯落後時，不要把每個小墩都打成鐵桶防守；關鍵線附近仍強力擋約。
  if (ctx.myTeam === "def") {
    if (nonCriticalDefense && currentAllyWinning && isPoint && !candidateWins && !ctx.actingLast && projection.enemySwingProb < 0.2 && pointsWithCard <= 1) {
      score -= (2.4 + (isControl ? 2.2 : 0)) * weight;
    }
    if (nonCriticalDefense && candidateWins && isControl && pointsWithCard <= 1 && !ctx.late && !ctx.actingLast) {
      score -= 3.4 * weight;
    }
    if (napNeeds <= Math.max(2, pointsWithCard + 1) && currentEnemyWinning && candidateWins) {
      score += (4.8 + pointsWithCard * 2.8) * weight;
    }
  }

  return score;
}

function aiV23MicroBalanceNotes(game, seat, card, ctx) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 16 || !card || !ctx) return [];
  const notes = [];
  const trickLen = game.trick?.length || 0;
  const candidateWins = trickLen === 0 ? aiLikelyLeadWin(game, seat, card) >= 0.66 : wouldWin(game, card);
  const pointsWithCard = (ctx.pointsOnTable || 0) + (isHeadCard(card) ? 1 : 0);
  const remainingHeads = Math.max(1, ctx.remainingHeads || 1);
  const nearShort = ctx.napNeeds >= 1 && ctx.napNeeds <= Math.max(3, Math.ceil(remainingHeads * 0.28));
  if (ctx.myTeam === "nap" && nearShort && candidateWins) notes.push("V23微調：拿破崙差一點，優先兌現可守住的頭牌/控制牌");
  if (ctx.myTeam === "nap" && !game.secretaryRevealed && card.id === game.secretaryCardId && (nearShort || ctx.late || pointsWithCard >= 2)) notes.push("V23秘書救局：成敗線附近提高公開支援權重");
  if (ctx.myTeam === "def" && ctx.napNeeds >= Math.max(4, remainingHeads * 0.42)) notes.push("V23攻防平衡：拿破崙仍落後時，防家降低非關鍵過度餵頭/耗牌");
  return notes.slice(0, 2);
}


function aiV24NapoleonCommanderAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) {
  const difficulty = Number(game.settings?.difficulty || 10);
  const weight = aiClamp((difficulty - 7) / 13, 0, 1.35);
  if (!weight || !card || !ctx) return 0;
  const trickLen = game.trick?.length || 0;
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const isPoint = isHeadCard(card);
  const isTrump = Boolean(game.trump && game.trump !== "NT" && card.suit === game.trump);
  const isJoker = Boolean(card.joker);
  const isControl = aiControlCardValue(game, seat, card, ctx) >= 12 || isJoker;
  const isNapoleon = seat === game.napoleon;
  const isKnownSecretary = game.secretaryRevealed && seat === game.secretaryOwner;
  const isSecretCard = !game.secretaryRevealed && card.id === game.secretaryCardId;
  const remainingHeads = Math.max(1, ctx.remainingHeads || 1);
  const napNeeds = Math.max(0, ctx.napNeeds || 0);
  const nearLine = napNeeds <= Math.max(4, Math.ceil(remainingHeads * 0.4));
  const chaseMode = napNeeds >= Math.max(2, pointsWithCard + 1) && napNeeds <= Math.max(7, Math.ceil(remainingHeads * 0.68));
  const desperate = napNeeds > Math.max(4, remainingHeads * 0.58);
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;
  const holdGood = projection.holdProb >= 0.58 || ctx.actingLast;
  let score = 0;

  if (ctx.myTeam === "nap") {
    // V24：拿破崙軍不再只被動保牌。差 1–3 頭或中盤落後時，要主動收可守住的頭。
    if ((nearLine || chaseMode || desperate) && (candidateWins || (trickLen === 0 && projection.holdProb >= 0.56))) {
      if (pointsWithCard > 0) score += (8.5 + pointsWithCard * 4.2 + (nearLine ? 4 : 0) + (desperate ? 3 : 0));
      if (isControl) score += (4.5 + (nearLine ? 3 : 0));
      if (isNapoleon && isTrump && projection.enemyCutPressure < 0.5) score += 3.8;
    }

    // V24：目前對手吃墩時，拿破崙/秘書更敢用最低成本牌搶回來，避免一墩一墩被防家壓死。
    if (currentEnemyWinning && candidateWins) {
      score += (7.5 + pointsWithCard * 3.4 + (nearLine ? 4.5 : 0));
      if (isNapoleon || isKnownSecretary) score += 2.5;
    }

    // V24：盟友已經吃穩時，拿破崙軍要更會餵頭；但仍看後手風險。
    if (currentAllyWinning && isPoint && !candidateWins && (ctx.actingLast || projection.enemySwingProb < 0.34)) {
      score += (6.2 + pointsWithCard * 1.8 + (nearLine ? 2.8 : 0));
    }

    // V24：暗秘書不能死藏。成敗線附近、殘局、多頭墩或拿破崙快失敗時，提高曝光救局權重。
    if (isSecretCard) {
      const rescueWindow = nearLine || chaseMode || desperate || ctx.late || ctx.handSize <= 4 || pointsWithCard >= 2;
      if (rescueWindow && (candidateWins || holdGood || currentAllyWinning)) score += (20 + pointsWithCard * 4 + (desperate ? 5 : 0));
      else if (!rescueWindow && (game.trickNo || 0) <= 4) score -= 7;
    }

    // V24：拿破崙首攻要更有計畫。需要追頭時，可用中小王牌抽防家王牌；安全 master 頭牌要敢兌現。
    if (isNapoleon && trickLen === 0) {
      const master = card.suit ? aiIsLikelyMaster(game, seat, card, card.suit, ctx.memory) : (isJoker || isSecretCard);
      if ((chaseMode || desperate) && isTrump && !isPoint && projection.holdProb >= 0.48) score += 6.5;
      if ((nearLine || ctx.late) && isPoint && (master || projection.holdProb >= 0.68)) score += 7.5;
      if (desperate && !isPoint && !isTrump && card.value <= 9 && projection.enemySwingProb < 0.26) score += 2.8; // 低牌探門，找切牌窗口。
    }

    // V24：拿破崙軍若無法贏，不要把頭送給對手；尤其是拿破崙本人。
    if (isPoint && !candidateWins && currentEnemyWinning && !ctx.actingLast) {
      score -= (8 + (isNapoleon ? 3 : 0) + projection.enemyHoldProb * 5);
    }
  } else {
    // V24：防家仍會擋約，但拿破崙明顯落後時不再每個小墩都用控制牌封死，避免測試長期偏防守。
    const napFarBehind = napNeeds >= Math.max(5, remainingHeads * 0.55);
    if (napFarBehind && candidateWins && pointsWithCard <= 1 && isControl && !ctx.late && !ctx.actingLast) score -= 3.2;
    if (napFarBehind && currentAllyWinning && isPoint && !candidateWins && projection.enemySwingProb < 0.22 && !ctx.actingLast) score -= 2.4;
  }

  return score * weight;
}

function aiV24NapoleonCommanderNotes(game, seat, card, ctx) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 16 || !card || !ctx) return [];
  const notes = [];
  const trickLen = game.trick?.length || 0;
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const pointsWithCard = (ctx.pointsOnTable || 0) + (isHeadCard(card) ? 1 : 0);
  const remainingHeads = Math.max(1, ctx.remainingHeads || 1);
  const napNeeds = Math.max(0, ctx.napNeeds || 0);
  const nearLine = napNeeds <= Math.max(4, Math.ceil(remainingHeads * 0.4));
  const candidateWins = trickLen === 0 ? aiLikelyLeadWin(game, seat, card) >= 0.66 : wouldWin(game, card);
  if (ctx.myTeam === "nap" && (nearLine || ctx.late) && candidateWins) notes.push("V24拿破崙強化：接近成敗線，主動兌現可守住的頭牌/控制牌");
  if (ctx.myTeam === "nap" && !game.secretaryRevealed && card.id === game.secretaryCardId && (nearLine || ctx.late || pointsWithCard >= 2)) notes.push("V24秘書救局：不再死藏暗秘書，關鍵墩提高曝光支援權重");
  if (seat === game.napoleon && trickLen === 0 && game.trump && game.trump !== "NT" && card.suit === game.trump && projection.enemyCutPressure < 0.5) notes.push("V24拿破崙節奏：用王牌控制節奏，逼出防家王牌");
  if (ctx.myTeam === "def" && napNeeds >= Math.max(5, remainingHeads * 0.55)) notes.push("V24攻防平衡：拿破崙明顯落後時，防家降低非關鍵過度壓制");
  return notes.slice(0, 2);
}


function aiV25BalanceNote(madeRate, target, summary = {}) {
  const diff = (summary.avgNapHeads || 0) - (summary.avgContract || 0);
  if (madeRate < target.low - 0.10) return "聯合國明顯偏強，V25 已啟用拿破崙實戰補強";
  if (madeRate < target.low) return diff >= -1.6 ? "拿破崙略偏難，V25 會在差 1–3 頭時更主動救局" : "拿破崙偏難，V25 會提高抽王牌、搶頭與秘書救局";
  if (madeRate > target.high + 0.08) return "拿破崙偏強，需觀察是否補強過頭";
  if (madeRate > target.high) return "拿破崙略強，但仍在可觀察範圍";
  return (summary.closeRate || 0) >= 0.35 ? "攻防分布正常，接近成敗線局數充足" : "攻防分布正常";
}

function aiV25AttackDefenseNote(summary, target) {
  const madeRate = summary.madeRate || 0;
  const diff = (summary.avgNapHeads || 0) - (summary.avgContract || 0);
  if (madeRate < target.low) {
    return diff >= -1.6
      ? "拿破崙常差一點：V25 會提高中後盤搶頭、秘書曝光與王牌節奏。"
      : "拿破崙明顯偏難：V25 會直接補強拿破崙實戰出牌評分。";
  }
  if (madeRate > target.high) return "拿破崙略強或偏強：先觀察 24/36 局，再決定是否回調防家擋約。";
  return "攻防接近目標：V25 保留拿破崙實戰補強，但不取消聯合國關鍵擋約。";
}

function aiV25TuningSuggestion(summary, target) {
  const madeRate = summary.madeRate || 0;
  const closeRate = summary.closeRate || 0;
  if (madeRate < target.low) {
    if (closeRate >= 0.35) return "拿破崙接近成功但差最後幾頭，建議使用 V25 實戰補強並提高 AI 風格為高手綜合。";
    return "拿破崙進攻窗口不足，建議提高拿破崙首攻抽王牌與秘書救局權重。";
  }
  if (madeRate > target.high) return "拿破崙達標率偏高，若連續測試也偏高，可調成拿破崙挑戰目標。";
  if ((summary.avoidableHeadGifts || 0) > Math.max(20, summary.rounds)) return "攻防平衡但可避免送頭仍偏多，建議保留 V20 送頭防護。";
  return "攻防接近目標，可用 36 局高信度再驗證。";
}

function aiV25NapoleonPracticalBoostAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) {
  const difficulty = Number(game.settings?.difficulty || 10);
  const weight = aiClamp((difficulty - 6) / 14, 0, 1.45);
  if (!weight || !card || !ctx || !game || game.napoleon === null || game.napoleon === undefined) return 0;
  const trickLen = game.trick?.length || 0;
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const isPoint = isHeadCard(card);
  const isTrump = Boolean(game.trump && game.trump !== "NT" && card.suit === game.trump);
  const isJoker = Boolean(card.joker);
  const isSecretCard = !game.secretaryRevealed && card.id === game.secretaryCardId;
  const isControl = aiControlCardValue(game, seat, card, ctx) >= 10 || isJoker || isSecretCard;
  const isNapoleon = seat === game.napoleon;
  const isSecretarySide = ctx.myTeam === "nap";
  const remainingHeads = Math.max(1, ctx.remainingHeads || 1);
  const napNeeds = Math.max(0, ctx.napNeeds || 0);
  const shortage = Math.max(0, (ctx.contract || 0) - (ctx.napHeads || 0));
  const nearLine = napNeeds >= 1 && napNeeds <= Math.max(4, Math.ceil(remainingHeads * 0.38));
  const mustChase = napNeeds >= 2 && napNeeds <= Math.max(7, Math.ceil(remainingHeads * 0.72));
  const late = Boolean(ctx.late || (ctx.handSize || 0) <= 4 || (game.trickNo || 0) >= 6);
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;
  let score = 0;

  if (isSecretarySide) {
    // V25：拿破崙方不能等到最後才救。差 1–3 頭時，任何可守住的頭牌/控制牌都要更早兌現。
    if ((nearLine || mustChase || late) && (candidateWins || (trickLen === 0 && projection.holdProb >= 0.52))) {
      if (pointsWithCard > 0) score += 13 + pointsWithCard * 6 + (nearLine ? 6 : 0) + (late ? 4 : 0);
      if (isControl) score += 8 + (nearLine ? 4 : 0);
      if (isTrump && isNapoleon && projection.enemyCutPressure < 0.62) score += 7;
    }

    // V25：對手正在吃墩時，拿破崙方要更積極用最低成本反吃，不要看著防家連續收走頭。
    if (currentEnemyWinning && candidateWins) {
      score += 12 + pointsWithCard * 6 + (nearLine ? 7 : 0) + (late ? 4 : 0);
      if (isControl && pointsWithCard >= 1) score += 5;
    }

    // V25：盟友吃墩且後手風險可接受時，拿破崙方要積極餵頭，尤其是最後幾墩或差一點時。
    if (currentAllyWinning && isPoint && !candidateWins) {
      const safeFeed = ctx.actingLast || projection.enemySwingProb < (nearLine || late ? 0.52 : 0.38);
      if (safeFeed) score += 10 + (nearLine ? 5 : 0) + (late ? 4 : 0);
      else score -= 3;
    }

    // V25：暗秘書救局再提高。只要能反吃/守住/末段多頭墩，就不要死藏。
    if (isSecretCard) {
      const rescue = nearLine || mustChase || late || pointsWithCard >= 2 || shortage >= 2;
      if (rescue && (candidateWins || currentAllyWinning || projection.holdProb >= 0.48)) score += 30 + pointsWithCard * 7 + (late ? 6 : 0);
      else if (!rescue && (game.trickNo || 0) <= 3) score -= 4;
    }

    // V25：拿破崙首攻要建立節奏。手上有王牌時，中盤落後應更常抽王牌；安全 master 頭牌也要敢收。
    if (isNapoleon && trickLen === 0) {
      const master = card.suit ? aiIsLikelyMaster(game, seat, card, card.suit, ctx.memory) : (isJoker || isSecretCard);
      if ((mustChase || late) && isTrump && projection.enemyCutPressure < 0.7) score += isPoint ? 9 : 11;
      if ((nearLine || late) && isPoint && (master || projection.holdProb >= 0.58)) score += 12 + pointsWithCard * 3;
      if (mustChase && !isPoint && !isTrump && card.value <= 8 && projection.enemySwingProb < 0.30) score += 4;
    }

    // V25：拿破崙方如果不能吃，不要再送頭給對手。
    if (isPoint && !candidateWins && currentEnemyWinning && !ctx.actingLast) {
      score -= 10 + projection.enemyHoldProb * 8;
    }
  } else {
    // V25：聯合國仍能擋約，但拿破崙明顯落後時不要把非關鍵小墩都打成鐵桶。
    const napFarBehind = napNeeds >= Math.max(5, remainingHeads * 0.56);
    const nonCritical = napFarBehind && !late && pointsWithCard <= 1;
    if (nonCritical && candidateWins && isControl && !ctx.actingLast) score -= 6;
    if (nonCritical && currentAllyWinning && isPoint && !candidateWins && projection.enemySwingProb < 0.30 && !ctx.actingLast) score -= 5;
    if (nonCritical && currentEnemyWinning && candidateWins && !isControl && pointsWithCard === 0) score -= 2;
  }

  return score * weight;
}

function aiV25NapoleonPracticalBoostNotes(game, seat, card, ctx) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 16 || !card || !ctx) return [];
  const notes = [];
  const trickLen = game.trick?.length || 0;
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const pointsWithCard = (ctx.pointsOnTable || 0) + (isHeadCard(card) ? 1 : 0);
  const remainingHeads = Math.max(1, ctx.remainingHeads || 1);
  const napNeeds = Math.max(0, ctx.napNeeds || 0);
  const nearLine = napNeeds >= 1 && napNeeds <= Math.max(4, Math.ceil(remainingHeads * 0.38));
  const candidateWins = trickLen === 0 ? aiLikelyLeadWin(game, seat, card) >= 0.58 : wouldWin(game, card);
  if (ctx.myTeam === "nap" && nearLine && candidateWins) notes.push("V25拿破崙實戰：差 1–3 頭時更早兌現可守住的頭牌/控制牌");
  if (ctx.myTeam === "nap" && !game.secretaryRevealed && card.id === game.secretaryCardId && (nearLine || ctx.late || pointsWithCard >= 2)) notes.push("V25秘書救局：關鍵線附近暗秘書更願意曝光救局");
  if (seat === game.napoleon && trickLen === 0 && game.trump && game.trump !== "NT" && card.suit === game.trump && projection.enemyCutPressure < 0.7) notes.push("V25拿破崙節奏：落後時用王牌建立主動權");
  if (ctx.myTeam === "def" && napNeeds >= Math.max(5, remainingHeads * 0.56)) notes.push("V25攻防平衡：拿破崙明顯落後時，防家降低非關鍵過度封鎖");
  return notes.slice(0, 2);
}


function aiV26BidCalibration(game, seat, profile, legalAll, highest, difficulty, personality, auction) {
  const minBid = legalAll[0] || null;
  const minAmount = Number(minBid?.amount || 0);
  const bestFit = minBid ? (profile.expectedBySuit?.[minBid.suit] ?? profile.expectedHeads) : profile.expectedHeads;
  const bestDetail = profile.suitDetails?.[profile.bestSuit] || { count: 0, pointCount: 0 };
  const controls = Number(profile.jokers || 0) + Math.min(2, Number(bestDetail.topCount || 0)) * 0.35 + Math.min(2, Number(bestDetail.pointCount || 0)) * 0.22;
  let maxComfortBid = Math.max(9, Math.floor(profile.expectedHeads + profile.confidence * 0.48 + personality.bidBias * 0.25));

  // AI V26：叫牌校正。13 以上需要更紮實的期望頭數、王牌長度與控制牌，避免拿破崙被高成約拖垮。
  if (difficulty >= 13) {
    if ((profile.expectedHeads || 0) < 12.05 && maxComfortBid >= 13) maxComfortBid = 12;
    if (bestDetail.count < 5 && Number(profile.jokers || 0) === 0 && maxComfortBid >= 13) maxComfortBid = 12;
    if (bestDetail.count < 4 && maxComfortBid >= 12) maxComfortBid = 11;
  }
  if (difficulty >= 15 && minAmount >= 13) {
    const requiredMargin = minAmount === 13 ? 0.72 : 1.05;
    const suitMargin = bestFit - minAmount;
    const hasEnoughControls = controls >= (minAmount >= 14 ? 1.35 : 0.95);
    const strongFit = bestDetail.count >= 5 || Number(profile.jokers || 0) >= 1;
    if ((profile.expectedHeads < minAmount + requiredMargin || suitMargin < 0.15 || !hasEnoughControls || !strongFit) && profile.confidence < 0.84) {
      return {
        forcePass: true,
        maxComfortBid,
        reason: `V26叫牌校正：${minAmount}頭以上需要更高期望與控制牌，目前估 ${profile.expectedHeads.toFixed(1)} 頭，避免高叫。`
      };
    }
  }
  if (difficulty >= 16 && highest && minAmount >= 12 && (game.bidding?.consecutivePasses || 0) >= 2) {
    const premium = profile.expectedHeads - minAmount;
    if (premium < 0.55 && profile.confidence < 0.72) {
      return {
        forcePass: true,
        maxComfortBid,
        reason: `V26競價紀律：已有多家 Pass，估 ${profile.expectedHeads.toFixed(1)} 頭沒有明顯超值，不重新推高成約。`
      };
    }
  }
  return { forcePass: false, maxComfortBid, reason: "" };
}

function aiV26ChooseBidAmount(game, seat, profile, chosenAmount, legalAmounts, highest, difficulty, personality) {
  if (!legalAmounts?.length) return chosenAmount;
  let amount = chosenAmount;
  const bestDetail = profile.suitDetails?.[profile.bestSuit] || { count: 0, pointCount: 0 };
  const expected = Number(profile.expectedHeads || 0);
  const controls = Number(profile.jokers || 0) + Math.min(2, Number(bestDetail.pointCount || 0)) * 0.22;
  if (difficulty >= 13) {
    const cap = Math.floor(expected + profile.confidence * 0.42 + personality.bidBias * 0.20 + (bestDetail.count >= 6 ? 0.25 : 0));
    amount = Math.min(amount, Math.max(legalAmounts[0], cap));
  }
  if (difficulty >= 15 && amount >= 13) {
    const safe13 = expected >= 13.55 && (bestDetail.count >= 5 || profile.jokers >= 1) && controls >= 1.0;
    const safe14 = expected >= 14.25 && bestDetail.count >= 5 && controls >= 1.45;
    if (amount >= 14 && !safe14) amount = 13;
    if (amount >= 13 && !safe13) amount = 12;
  }
  const legal = legalAmounts.filter((n) => n <= amount).pop();
  return legal || legalAmounts[0];
}

function aiV26OverbidNote(summary) {
  const overbid = Number(summary.overbid || 0);
  const avgContract = Number(summary.avgContract || 0);
  const avgHeads = Number(summary.avgNapHeads || 0);
  if (overbid >= Math.max(3, (summary.completed || 1) * 0.10)) return "13頭以上叫品失敗偏多，V26 會更嚴格校正高叫。";
  if (avgContract - avgHeads > 1.5) return "平均成約略高於拿破崙可完成頭數，V26 會優先降低冒進叫牌。";
  return "叫牌風險可接受，V26 保留小幅競價但避免高叫拖垮。";
}

function aiV26BalanceNote(madeRate, target, summary = {}) {
  const diff = (summary.avgNapHeads || 0) - (summary.avgContract || 0);
  if (madeRate < target.low - 0.08) return diff >= -1.6 ? "聯合國偏強，V26 會先校正高叫並強化拿破崙中盤控局" : "聯合國明顯偏強，V26 會降低冒進成約並提高秘書中盤救局";
  if (madeRate < target.low) return "拿破崙略偏難，V26 會讓拿破崙叫得更準、差1–2頭時更早追頭。";
  if (madeRate > target.high + 0.08) return "拿破崙偏強，V26 保留聯合國關鍵擋約避免失衡。";
  if (madeRate > target.high) return "拿破崙略強，V26 會限制非必要控制牌衝刺。";
  return "攻防落在目標區間，V26 維持叫牌校正與拿破崙控局。";
}

function aiV26AttackDefenseNote(summary, target) {
  const madeRate = summary.madeRate || 0;
  const gap = (summary.avgContract || 0) - (summary.avgNapHeads || 0);
  if (madeRate < target.low) {
    if ((summary.overbid || 0) > 0 || gap > 1.4) return "拿破崙偏難：V26 會降低13頭以上冒進叫品，並強化中後盤抽王牌/建立長門。";
    return "拿破崙常差一點：V26 會提高中盤控局、秘書救局與安全追頭。";
  }
  if (madeRate > target.high) return "拿破崙偏強：保留聯合國在成約線附近的低成本擋約。";
  return "攻防平衡：叫牌、控局與秘書救局權重可維持。";
}

function aiV26TuningSuggestion(summary, target) {
  const madeRate = summary.madeRate || 0;
  const closeRate = summary.closeRate || 0;
  if (madeRate < target.low) {
    if ((summary.avgContract || 0) >= 12.2 && (summary.avgNapHeads || 0) < (summary.avgContract || 0) - 1.0) return "優先改善叫牌：13頭以上需更嚴格，拿破崙中盤要更早抽王牌與兌現安全頭。";
    if (closeRate >= 0.30) return "拿破崙接近成功，建議保留 V26 秘書中盤救局與控牌兌現。";
    return "拿破崙進攻窗口不足，可提高拿破崙/秘書救局權重或改成拿破崙友善目標測試。";
  }
  if (madeRate > target.high) return "拿破崙已偏強，建議降低進攻型 AI 風格或改成拿破崙挑戰目標。";
  return "建議用 36 局高信度測試確認；若達標率穩定在 45–60%，可視為平衡。";
}

function aiV26BidAndTempoAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) {
  const difficulty = Number(game.settings?.difficulty || 10);
  const weight = aiClamp((difficulty - 7) / 13, 0, 1.5);
  if (!weight || !card || !ctx || game.napoleon === null || game.napoleon === undefined) return 0;
  const trickLen = game.trick?.length || 0;
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const isPoint = isHeadCard(card);
  const isTrump = Boolean(game.trump && game.trump !== "NT" && card.suit === game.trump);
  const isJoker = Boolean(card.joker);
  const isSecretCard = !game.secretaryRevealed && card.id === game.secretaryCardId;
  const control = aiControlCardValue(game, seat, card, ctx);
  const remainingHeads = Math.max(1, ctx.remainingHeads || 1);
  const napNeeds = Math.max(0, ctx.napNeeds || 0);
  const shortage = Math.max(0, (ctx.contract || 0) - (ctx.napHeads || 0));
  const near = napNeeds >= 1 && napNeeds <= Math.max(4, Math.ceil(remainingHeads * 0.42));
  const behindButLive = shortage >= 2 && napNeeds <= Math.max(8, Math.ceil(remainingHeads * 0.80));
  const late = Boolean(ctx.late || (ctx.handSize || 0) <= 4 || (game.trickNo || 0) >= 6);
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;
  let score = 0;

  if (ctx.myTeam === "nap") {
    // V26：拿破崙不是盲目衝，而是在差1–3頭或中盤可救時，兌現真正守得住的頭牌/控制牌。
    if ((near || behindButLive || late) && (candidateWins || projection.holdProb >= 0.58)) {
      if (pointsWithCard > 0) score += 16 + pointsWithCard * 5 + (near ? 6 : 0);
      if (control >= 10) score += 7 + (late ? 4 : 0);
      if (isJoker && pointsWithCard >= 1) score += 6;
    }

    // V26：拿破崙本人首攻/中盤控局。落後時用中小王牌探抽，不只等最後救火。
    if (seat === game.napoleon && trickLen === 0) {
      const master = card.suit ? aiIsLikelyMaster(game, seat, card, card.suit, ctx.memory) : (isJoker || isSecretCard);
      if (isTrump && behindButLive && projection.enemyCutPressure < 0.72) score += isPoint ? 9 : 14;
      if (isPoint && (master || projection.holdProb >= 0.62) && (near || late || behindButLive)) score += 14 + pointsWithCard * 3;
      if (!isPoint && !isTrump && card.value <= 8 && behindButLive && projection.enemySwingProb < 0.34) score += 5;
    }

    // V26：秘書中盤救局，不等殘局才公開；差2–3頭、多頭墩或能反吃時更願意出手。
    if (isSecretCard) {
      const rescueWindow = (game.trickNo || 0) >= 4 || near || behindButLive || pointsWithCard >= 2;
      if (rescueWindow && (candidateWins || currentAllyWinning || projection.holdProb >= 0.50)) score += 34 + pointsWithCard * 7 + (late ? 7 : 0);
      else if (!rescueWindow && (game.trickNo || 0) <= 2) score -= 5;
    }

    // V26：對手吃墩時，用最低成本搶回關鍵墩；但不能搶回時別把頭送出去。
    if (currentEnemyWinning) {
      if (candidateWins) score += 14 + pointsWithCard * 6 + (near ? 7 : 0);
      else if (isPoint && !ctx.actingLast) score -= 14 + projection.enemyHoldProb * 8;
    }

    // V26：盟友吃穩時安全餵頭，尤其秘書或拿破崙已確定能保住本墩。
    if (currentAllyWinning && isPoint && !candidateWins) {
      const safeFeed = ctx.actingLast || projection.enemySwingProb < (near || late ? 0.58 : 0.42);
      score += safeFeed ? (12 + pointsWithCard * 3 + (near ? 5 : 0)) : -5;
    }
  } else {
    // V26：防家仍要擋約，但拿破崙已明顯落後時，不要每個非關鍵小墩都封死，讓局面有攻防起伏。
    const napFarBehind = napNeeds >= Math.max(6, remainingHeads * 0.62);
    const nonCritical = napFarBehind && !late && pointsWithCard <= 1;
    if (nonCritical && candidateWins && control >= 10 && !ctx.actingLast) score -= 7;
    if (nonCritical && currentAllyWinning && isPoint && !candidateWins && projection.enemySwingProb < 0.36) score -= 5;
    if (!nonCritical && napNeeds <= 3 && candidateWins && currentEnemyWinning) score += 6 + pointsWithCard * 4;
  }

  return score * weight;
}

function aiV26BidAndTempoNotes(game, seat, card, ctx) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 16 || !card || !ctx) return [];
  const notes = [];
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const trickLen = game.trick?.length || 0;
  const pointsWithCard = (ctx.pointsOnTable || 0) + (isHeadCard(card) ? 1 : 0);
  const napNeeds = Math.max(0, ctx.napNeeds || 0);
  const remainingHeads = Math.max(1, ctx.remainingHeads || 1);
  const candidateWins = trickLen === 0 ? aiLikelyLeadWin(game, seat, card) >= 0.58 : wouldWin(game, card);
  const near = napNeeds >= 1 && napNeeds <= Math.max(4, Math.ceil(remainingHeads * 0.42));
  if (ctx.myTeam === "nap" && near && candidateWins) notes.push("V26拿破崙控局：差1–3頭時提前兌現可守住的頭牌/控制牌");
  if (seat === game.napoleon && trickLen === 0 && game.trump && game.trump !== "NT" && card.suit === game.trump && projection.enemyCutPressure < 0.72) notes.push("V26王牌節奏：中盤落後時用王牌逼防家交控制牌");
  if (ctx.myTeam === "nap" && !game.secretaryRevealed && card.id === game.secretaryCardId && ((game.trickNo || 0) >= 4 || near || pointsWithCard >= 2)) notes.push("V26秘書救局：中盤成敗線附近提早曝光支援");
  if (ctx.myTeam === "def" && napNeeds >= Math.max(6, remainingHeads * 0.62)) notes.push("V26攻防平衡：拿破崙明顯落後時防家降低非關鍵封鎖");
  return notes.slice(0, 2);
}



function aiV27ChooseBidAmount(game, seat, profile, chosenAmount, legalAmounts, highest, difficulty, personality) {
  if (!legalAmounts?.length) return chosenAmount;
  let amount = chosenAmount;
  const expected = Number(profile.expectedHeads || 0);
  const bestDetail = profile.suitDetails?.[profile.bestSuit] || { count: 0, pointCount: 0, topCount: 0 };
  const controls = Number(profile.jokers || 0) + Math.min(3, Number(bestDetail.pointCount || 0)) * 0.26 + Math.min(2, Number(bestDetail.topCount || 0)) * 0.12;
  if (difficulty >= 12) {
    const fitBonus = (bestDetail.count >= 6 ? 0.38 : bestDetail.count >= 5 ? 0.18 : 0) + controls * 0.15 + personality.bidBias * 0.18;
    const comfort = Math.floor(expected - 1.25 + profile.confidence * 0.18 + fitBonus * 0.75);
    amount = Math.min(amount, Math.max(legalAmounts[0], comfort));
  }
  if (difficulty >= 15 && amount >= 12) {
    const safe11 = expected >= 11.10 || (expected >= 10.80 && bestDetail.count >= 6 && controls >= 1.0);
    const safe12 = expected >= 12.80 || (expected >= 12.35 && bestDetail.count >= 6 && controls >= 1.25);
    const safe13 = expected >= 14.25 && (bestDetail.count >= 6 || profile.jokers >= 1) && controls >= 1.55;
    const safe14 = expected >= 14.90 && bestDetail.count >= 6 && controls >= 1.90;
    if (amount >= 14 && !safe14) amount = 13;
    if (amount >= 13 && !safe13) amount = 12;
    if (amount >= 12 && !safe12) amount = 11;
    if (amount >= 11 && !safe11) amount = 10;
  }
  const legal = legalAmounts.filter((n) => n <= amount).pop();
  return legal || legalAmounts[0];
}

function aiV27OverbidNote(summary) {
  const overbid = Number(summary.overbid || 0);
  const avgContract = Number(summary.avgContract || 0);
  const avgHeads = Number(summary.avgNapHeads || 0);
  if (overbid >= Math.max(4, (summary.completed || 1) * 0.12)) return "高叫仍偏多，V27 會避免無控制牌的13頭以上冒進。";
  if (avgContract - avgHeads > 1.8) return "成約與實得頭數差距偏大，V27 會讓拿破崙更早進攻但保留叫牌紀律。";
  return "叫牌風險可接受，V27 重點放在拿破崙實戰進攻窗口。";
}

function aiV27BalanceNote(madeRate, target, summary = {}) {
  const diff = (summary.avgNapHeads || 0) - (summary.avgContract || 0);
  if (madeRate < target.low - 0.10) return "聯合國明顯偏強，V27 會直接提高拿破崙中盤進攻與秘書救局權重。";
  if (madeRate < target.low) return diff >= -1.5 ? "拿破崙略偏難，V27 會在差1–3頭時開啟進攻窗口。" : "拿破崙偏難，V27 會強化抽王牌、建立長門與秘書中盤救局。";
  if (madeRate > target.high + 0.08) return "拿破崙偏強，V27 仍保留聯合國關鍵擋約。";
  if (madeRate > target.high) return "拿破崙略強，V27 會限制非關鍵控制牌硬衝。";
  return "攻防落在目標區間，V27 維持拿破崙進攻窗口與聯合國關鍵擋約。";
}

function aiV27AttackDefenseNote(summary, target) {
  const madeRate = summary.madeRate || 0;
  const gap = (summary.avgContract || 0) - (summary.avgNapHeads || 0);
  const close = summary.closeRate || 0;
  if (madeRate < target.low) {
    if (gap <= 1.5 || close >= 0.28) return "拿破崙常差一點：V27 提高中盤追頭、秘書提早曝光與王牌節奏。";
    return "拿破崙進攻不足：V27 會提高拿破崙首攻抽王牌、建立長門與控制牌兌現。";
  }
  if (madeRate > target.high) return "拿破崙偏強：V27 保留聯合國成敗線擋約，避免攻方過強。";
  return "攻防接近目標：V27 微幅強化攻方，但保留防守的低成本攔頭。";
}

function aiV27TuningSuggestion(summary, target) {
  const madeRate = summary.madeRate || 0;
  const gap = (summary.avgContract || 0) - (summary.avgNapHeads || 0);
  if (madeRate < target.low) {
    if (gap <= 1.6) return "拿破崙只差一點，建議保留 V27 追頭窗口並測試拿破崙友善目標。";
    return "拿破崙仍偏難，建議提高拿破崙首攻抽王牌與秘書救局權重。";
  }
  if (madeRate > target.high) return "拿破崙偏強，可改用標準/挑戰目標或提高聯合國擋約權重。";
  return "目前可維持 V27 參數，建議用 36 局高信度再驗證。";
}

function aiV27NapoleonWindowAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) {
  const difficulty = Number(game.settings?.difficulty || 10);
  const weight = aiClamp((difficulty - 6) / 14, 0, 1.65);
  if (!weight || !card || !ctx || game.napoleon === null || game.napoleon === undefined) return 0;
  const trickLen = game.trick?.length || 0;
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const isPoint = isHeadCard(card);
  const isTrump = Boolean(game.trump && game.trump !== "NT" && card.suit === game.trump);
  const isJoker = Boolean(card.joker);
  const isSecretCard = !game.secretaryRevealed && card.id === game.secretaryCardId;
  const control = aiControlCardValue(game, seat, card, ctx);
  const napNeeds = Math.max(0, ctx.napNeeds || 0);
  const remainingHeads = Math.max(1, ctx.remainingHeads || 1);
  const shortage = Math.max(0, (ctx.contract || 0) - (ctx.napHeads || 0));
  const midgame = (game.trickNo || 0) >= 3 && (game.trickNo || 0) <= 7;
  const late = Boolean(ctx.late || (ctx.handSize || 0) <= 4 || (game.trickNo || 0) >= 7);
  const attackWindow = ctx.myTeam === "nap" && shortage >= 1 && shortage <= 4 && napNeeds <= Math.max(7, Math.ceil(remainingHeads * 0.78));
  const mustMove = ctx.myTeam === "nap" && (shortage >= 2 || napNeeds >= Math.max(3, Math.ceil(remainingHeads * 0.38))) && (midgame || late);
  const currentEnemyWinning = trickLen > 0 && ctx.currentWinnerTeam && ctx.currentWinnerTeam !== ctx.myTeam;
  const currentAllyWinning = trickLen > 0 && ctx.currentWinnerTeam === ctx.myTeam;
  let score = 0;

  if (ctx.myTeam === "nap") {
    // V27：真正把拿破崙的進攻窗口接進評分。差1–4頭時，能守住的頭牌/控制牌不要等到殘局才出。
    if ((attackWindow || mustMove) && (candidateWins || projection.holdProb >= 0.50 || currentAllyWinning)) {
      if (pointsWithCard > 0) score += 34 + pointsWithCard * 10 + (midgame ? 8 : 0) + (late ? 8 : 0);
      if (control >= 10 && (candidateWins || projection.holdProb >= 0.50)) score += 18 + (shortage >= 2 ? 7 : 0);
      if (isJoker && (pointsWithCard >= 1 || napNeeds <= 5)) score += 16;
      if (isTrump && !isPoint && candidateWins && midgame && projection.enemyCutPressure < 0.76) score += 14;
    }

    // 拿破崙本人領牌：落後時更會抽王牌/建立長門，而不是被防家慢慢收頭。
    if (seat === game.napoleon && trickLen === 0 && (attackWindow || mustMove)) {
      const master = card.suit ? aiIsLikelyMaster(game, seat, card, card.suit, ctx.memory) : (isJoker || isSecretCard);
      if (isTrump && projection.enemyCutPressure < 0.80) score += isPoint ? 18 : 30;
      if (master && isPoint && projection.holdProb >= 0.38) score += 30 + pointsWithCard * 6;
      if (!isPoint && !isTrump && card.suit && card.value <= 8 && midgame && projection.enemySwingProb < 0.40) score += 11;
      // 避免拿破崙領出容易被切的頭牌，強化「聰明進攻」而非盲衝。
      if (isPoint && !master && projection.enemyCutPressure > 0.58 && !isTrump && !isJoker) score -= 14;
    }

    // 暗秘書救局：中盤差2–3頭就該更願意曝光，不要等殘局才來不及。
    if (isSecretCard) {
      const rescue = (game.trickNo || 0) >= 3 && (shortage >= 1 || pointsWithCard >= 2 || napNeeds <= 5);
      if (rescue && (candidateWins || currentAllyWinning || projection.holdProb >= 0.34)) score += 88 + pointsWithCard * 14 + (midgame ? 18 : 0) + (late ? 10 : 0);
      else if ((game.trickNo || 0) <= 1 && pointsWithCard <= 1 && !candidateWins) score -= 8;
    }

    // 對手正在吃墩：拿破崙軍在成敗線附近應更敢以最低成本搶回來。
    if (currentEnemyWinning) {
      if (candidateWins) score += 34 + pointsWithCard * 11 + (attackWindow ? 16 : 0);
      else if (isPoint && !ctx.actingLast) score -= 24 + projection.enemyHoldProb * 12;
    }

    // 盟友正在吃墩：拿破崙軍需要更懂得在安全時餵頭，尤其秘書已公開或推定是自己人。
    if (currentAllyWinning && isPoint && !candidateWins) {
      const safeFeed = ctx.actingLast || projection.enemySwingProb < (attackWindow ? 0.66 : 0.48) || ctx.opponentsAfter === 0;
      score += safeFeed ? (30 + pointsWithCard * 6 + (attackWindow ? 12 : 0)) : -10;
    }
  } else {
    // V27：聯合國仍會擋約，但拿破崙已落後且非關鍵小墩時，不再過度鐵桶封鎖或大量餵頭。
    const napFarBehind = napNeeds >= Math.max(5, Math.ceil(remainingHeads * 0.54));
    const nonCritical = napFarBehind && !late && pointsWithCard <= 1;
    const notAtLine = napNeeds >= 4 && !late;
    if (nonCritical && candidateWins && control >= 8 && !ctx.actingLast) score -= 42;
    if (notAtLine && currentAllyWinning && isPoint && !candidateWins && projection.enemySwingProb < 0.68) score -= 38;
    if (notAtLine && candidateWins && pointsWithCard <= 1 && control >= 8 && projection.holdProb < 0.90) score -= 32;
    if (notAtLine && candidateWins && isJoker && pointsWithCard <= 1) score -= 36;
    if (notAtLine && trickLen === 0 && isPoint && !isTrump && !isJoker && projection.enemyCutPressure > 0.35) score -= 28;
    if (notAtLine && currentEnemyWinning && candidateWins && pointsWithCard <= 1 && control >= 10) score -= 22;
    if (!nonCritical && napNeeds <= 3 && candidateWins && currentEnemyWinning) score += 8 + pointsWithCard * 4;
  }

  return score * weight;
}

function aiV27NapoleonWindowNotes(game, seat, card, ctx) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 16 || !card || !ctx) return [];
  const notes = [];
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const trickLen = game.trick?.length || 0;
  const pointsWithCard = (ctx.pointsOnTable || 0) + (isHeadCard(card) ? 1 : 0);
  const shortage = Math.max(0, (ctx.contract || 0) - (ctx.napHeads || 0));
  const midgame = (game.trickNo || 0) >= 3 && (game.trickNo || 0) <= 7;
  const candidateWins = trickLen === 0 ? aiLikelyLeadWin(game, seat, card) >= 0.54 : wouldWin(game, card);
  if (ctx.myTeam === "nap" && shortage >= 1 && shortage <= 4 && candidateWins) notes.push("V27進攻窗口：拿破崙差1–4頭時提前兌現安全頭牌/控制牌");
  if (seat === game.napoleon && trickLen === 0 && midgame && game.trump && game.trump !== "NT" && card.suit === game.trump && projection.enemyCutPressure < 0.74) notes.push("V27王牌節奏：拿破崙中盤落後時主動抽王牌爭取控局");
  if (ctx.myTeam === "nap" && !game.secretaryRevealed && card.id === game.secretaryCardId && ((game.trickNo || 0) >= 3 || pointsWithCard >= 2)) notes.push("V27秘書救局：中盤差頭時提高暗秘書曝光救局權重");
  if (ctx.myTeam === "def" && ctx.napNeeds >= Math.max(6, Math.ceil((ctx.remainingHeads || 1) * 0.60))) notes.push("V27攻防平衡：拿破崙明顯落後時降低非關鍵鐵桶封鎖");
  return notes.slice(0, 2);
}

function aiExplainPlayChoice(game, seat, card) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 16 || !card) return null;
  const ctx = aiBuildPlayContext(game, seat);
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const point = isHeadCard(card);
  const wins = (game.trick?.length || 0) ? wouldWin(game, card) : aiLikelyLeadWin(game, seat, card) >= 0.68;
  const parts = [];
  if (wins && projection.holdProb >= 0.78) parts.push("判斷這張牌大多能守住本墩");
  if (wins && projection.holdProb < 0.55) parts.push("雖可暫時領先，但後手有反吃風險");
  if (ctx.currentWinnerTeam === ctx.myTeam && point && projection.enemySwingProb < 0.32) parts.push("隊友吃墩較穩，適合餵頭");
  if (point && projection.enemyCutPressure > 0.45) parts.push("注意到後手對手可能缺門切牌，降低送頭風險");
  const v9Plan = aiV9ContractSwingPlan(game, seat, card, ctx, projection, wins, (ctx.pointsOnTable || 0) + (point ? 1 : 0));
  if (v9Plan.isCritical) parts.push("本墩接近成敗線，改用關鍵墩評分");
  if (ctx.handSize <= 3) parts.push("進入殘局，改用剩餘頭數預算評分");
  if (aiV9IsLastStopper(game, seat, card, ctx)) parts.push("這張屬於最後控制牌，只有在必要時使用");
  if (ctx.contractMode?.label) parts.push(`目前採用${ctx.contractMode.label}節奏`);
  const v11Pressure = aiV11TrumpJokerPressure(game, seat, ctx);
  const v11Signal = aiV11PartnershipSignal(game, seat);
  if (v11Pressure.enemyCutPressure > 0.48) parts.push("王牌/鬼牌壓力偏高，避免不安全送頭");
  if (!game.secretaryRevealed && v11Signal?.exposureRisk > 0.5) parts.push("依餵頭訊號重新估計暗秘書風險");
  const v12Notes = aiV12BlunderNotes(game, seat, card, ctx);
  parts.push(...v12Notes);
  const v13Notes = aiV13LearningNotes(game, seat, card, ctx);
  parts.push(...v13Notes);
  parts.push(...aiV14StyleNotes(game, seat, card, ctx));
  parts.push(...aiV15ContinuityNotes(game, seat, card, ctx));
  parts.push(...aiV16OpponentModelNotes(game, seat, card, ctx));
  parts.push(...aiV18HeadGiftShieldNotes(game, seat, card, ctx));
  parts.push(...aiV19DefenseBalanceNotes(game, seat, card, ctx));
  parts.push(...aiV20HeadReportRiskNotes(game, seat, card, ctx));
  parts.push(...aiV21NapoleonAttackBalanceNotes(game, seat, card, ctx));
  parts.push(...aiV22AdaptiveBalanceNotes(game, seat, card, ctx));
  parts.push(...aiV23MicroBalanceNotes(game, seat, card, ctx));
  parts.push(...aiV24NapoleonCommanderNotes(game, seat, card, ctx));
  parts.push(...aiV25NapoleonPracticalBoostNotes(game, seat, card, ctx));
  parts.push(...aiV26BidAndTempoNotes(game, seat, card, ctx));
  parts.push(...aiV27NapoleonWindowNotes(game, seat, card, ctx));
  if (!parts.length) parts.push("以最低成本、後手投影、隊友訊號、成約差、本局學習、AI風格、長局計畫、對手模型、送頭防護、防守平衡、攻防微調、V26控局校正與V27拿破崙進攻窗口評分後選出");
  return `選 ${cardLong(card)}：${parts.slice(0, 3).join("；")}。`;
}

function aiControlCardValue(game, seat, card, ctx) {
  let value = 0;
  if (card.id === game.secretaryCardId) value += 18;
  if (card.joker) value += card.bigJoker ? 20 : 16;
  const isTrump = Boolean(game.trump && game.trump !== "NT" && card.suit === game.trump);
  if (isTrump) {
    const trumpInHand = (game.players?.[seat]?.hand || []).filter((c) => c.suit === game.trump || c.joker).length;
    value += card.value >= 12 ? 8 : 4;
    if (trumpInHand <= 2) value += 7;
  }
  if (card.suit && aiIsLikelyMaster(game, seat, card, card.suit, ctx.memory)) value += isHeadCard(card) ? 9 : 5;
  if (game.settings?.jokerLowLast3 && card.joker && game.trickNo >= 6) value *= card.id === "RJ" ? 0.55 : 0.75;
  return value;
}


function aiV10EndgameMatrixAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 14) return 0;
  const weight = aiClamp((difficulty - 13) / 7, 0, 1.45);
  const trickLen = game.trick?.length || 0;
  const hand = game.players?.[seat]?.hand || [];
  const remainingTricks = Math.max(1, 10 - (game.trickNo || 0));
  const isPoint = isHeadCard(card);
  const isTrump = Boolean(card.joker || (game.trump && game.trump !== "NT" && card.suit === game.trump));
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const control = aiControlCardValue(game, seat, card, ctx);
  const master = card.suit ? aiIsLikelyMaster(game, seat, card, card.suit, ctx.memory) : Boolean(card.joker || card.id === game.secretaryCardId);
  const criticalLine = ctx.myTeam === "nap"
    ? ctx.napNeeds <= Math.max(2, pointsWithCard + 1)
    : ctx.napNeeds <= Math.max(3, pointsWithCard + 1);
  let score = 0;

  // V10: 殘局頭數預算。剩下頭牌不多時，安全可收的頭要更積極；不安全的頭要避免送給對方。
  const handHeads = countPoints(hand);
  if (remainingTricks <= 3 || ctx.handSize <= 3) {
    if (isPoint && (master || projection.holdProb >= 0.78) && (candidateWins || trickLen === 0)) score += 11 + pointsWithCard * 3;
    if (isPoint && !candidateWins && projection.enemyHoldProb >= 0.52) score -= 12 + projection.enemyHoldProb * 8;
    if (!isPoint && !candidateWins && handHeads >= remainingTricks) score += 4.5; // 先脫低牌，保留後續頭牌搭配。
  }

  // V10: 最低成本升級。若小贏牌已足夠，避免把唯一控制牌或鬼牌浪費在低頭墩。
  const legalWinning = trickLen > 0
    ? legal.filter((c) => wouldWin(game, c)).sort((a, b) => cardPlayValue(a, game) - cardPlayValue(b, game))
    : legal.filter((c) => aiLikelyLeadWin(game, seat, c) >= 0.7).sort((a, b) => cardPlayValue(a, game) - cardPlayValue(b, game));
  const cheapestWinner = legalWinning[0] || null;
  if (candidateWins && cheapestWinner && cheapestWinner.id !== card.id && pointsWithCard <= 1 && !criticalLine) {
    const overpay = cardPlayValue(card, game) - cardPlayValue(cheapestWinner, game);
    if (control >= 12 || isTrump) score -= aiClamp(overpay / 3, 0, 12);
  }

  // V10: 防家擋約與拿破崙保約的臨界處理。
  if (ctx.myTeam === "nap") {
    if (criticalLine && candidateWins && projection.holdProb >= 0.62) score += 12 + pointsWithCard * 4;
    if (ctx.contractMode.mode === "protect" && control >= 14 && !criticalLine && !ctx.late) score -= 8;
    if (ctx.contractMode.mode === "chase" && isPoint && projection.holdProb >= 0.66) score += 6;
  } else {
    if (criticalLine && candidateWins && projection.holdProb >= 0.55) score += 13 + pointsWithCard * 4;
    if (criticalLine && !candidateWins && isPoint && projection.enemyHoldProb >= 0.5) score -= 14;
    if (ctx.contractMode.mode === "conserve" && control >= 14 && !criticalLine && !ctx.late) score -= 6;
  }

  // V10: 領牌矩陣。高難度會避開敵方已缺門的高頭牌，並利用隊友缺門做切牌配合。
  if (trickLen === 0 && card.suit && !card.joker) {
    const plan = ctx.suitPlan?.[card.suit];
    if (plan) {
      if (isPoint && plan.voidOpponents > 0 && !master) score -= 9 * plan.voidOpponents;
      if (!isPoint && plan.voidAllies > 0 && ctx.myTeam === "nap") score += 5 * plan.voidAllies;
      if (plan.masters > 0 && isPoint && (ctx.late || criticalLine)) score += 7;
      if (plan.count >= 4 && !isPoint && !isTrump && (game.trickNo || 0) <= 3) score += 3.5;
    }
  }

  // V10: 秘書牌不再機械保留；當它能直接跨過成敗線，應果斷公開。
  if (!game.secretaryRevealed && card.id === game.secretaryCardId) {
    if (criticalLine && (candidateWins || projection.holdProb >= 0.68)) score += 18;
    else if (!ctx.late && pointsWithCard <= 1) score -= 18;
  }

  return score * weight;
}


function aiV11SignalPressureAdjustment(game, seat, card, ctx, legal, candidateWins, pointsWithCard) {
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty < 11) return 0;
  const weight = aiClamp((difficulty - 10) / 10, 0, 1.6);
  const trickLen = game.trick?.length || 0;
  const isPoint = isHeadCard(card);
  const isTrumpOrJoker = Boolean(card.joker || (game.trump && game.trump !== "NT" && card.suit === game.trump));
  const projection = aiV8ProjectedTrickOutcome(game, seat, card, ctx);
  const pressure = aiV11TrumpJokerPressure(game, seat, ctx);
  const signal = aiV11PartnershipSignal(game, seat);
  const futureOpponents = ctx.seatsAfter.filter((s) => aiTeamView(game, s, seat) !== ctx.myTeam);
  const futureAllies = ctx.seatsAfter.filter((s) => aiTeamView(game, s, seat) === ctx.myTeam);
  let score = 0;

  // V11：剩餘王牌/鬼牌壓力。高壓時，非安全頭牌容易被後手切走；低壓時，master 頭牌要敢收。
  if (!isTrumpOrJoker && isPoint && !ctx.actingLast) {
    if (pressure.enemyCutPressure >= 0.42 && !candidateWins) score -= 10 * pressure.enemyCutPressure;
    if (candidateWins && projection.holdProb < 0.62 && pressure.unseenControlCount >= 2) score -= 6 * pressure.enemyCutPressure;
  }
  if (isPoint && candidateWins && projection.holdProb >= 0.78 && pressure.enemyCutPressure <= 0.22) {
    score += 5 + pointsWithCard * 2.2;
  }

  // V11：隊友訊號推理。暗秘書未公開時，用歷史餵頭/攔截行為估計誰偏拿破崙軍，避免防家把頭餵給疑似幫拿破崙的人。
  if (!game.secretaryRevealed && signal) {
    if (ctx.myTeam === "def") {
      if (ctx.currentWinner !== null && signal.napLean[ctx.currentWinner] > 0.42 && !candidateWins && isPoint) {
        score -= 10 * signal.napLean[ctx.currentWinner];
      }
      for (const s of futureOpponents) {
        if (signal.napLean[s] > 0.42 && isPoint && !candidateWins) score -= 4.5 * signal.napLean[s];
      }
      if (candidateWins && ctx.currentWinner !== null && signal.napLean[ctx.currentWinner] > 0.48) {
        score += 6 * signal.napLean[ctx.currentWinner];
      }
    } else {
      // 拿破崙軍：若後手疑似盟友且可能缺門，可用低牌引導；但非關鍵墩少逼暗秘書曝光。
      const likelyHelperAfter = futureAllies.find((s) => signal.napLean[s] > 0.45);
      if (likelyHelperAfter !== undefined && !isPoint && !candidateWins && card.suit && aiLikelyVoid(ctx, likelyHelperAfter, card.suit)) {
        score += 5 * signal.napLean[likelyHelperAfter];
      }
      if (card.id === game.secretaryCardId && signal.exposureRisk > 0.55 && pointsWithCard <= 1 && !ctx.late) {
        score -= 8 * signal.exposureRisk;
      }
    }
  }

  // V11：自然難度分層。中低難度不完全使用風險矩陣，高難度才明顯保留控制牌與計算成敗線。
  const critical = ctx.myTeam === "nap"
    ? ctx.napNeeds <= Math.max(2, pointsWithCard + 1)
    : ctx.napNeeds <= Math.max(3, pointsWithCard + 2);
  const control = aiControlCardValue(game, seat, card, ctx);
  if (difficulty >= 17 && control >= 14 && !critical && !ctx.late && pointsWithCard <= 1) {
    score -= 6 + control * 0.22;
  }
  if (difficulty >= 17 && critical && candidateWins && projection.holdProb >= 0.58) {
    score += 8 + pointsWithCard * 3;
  }

  // V11：領牌時若已知道敵方多人缺門，避免領出高頭牌；若隊友缺門，低牌開門更有價值。
  if (trickLen === 0 && card.suit && !isTrumpOrJoker) {
    const enemyVoids = futureOpponents.filter((s) => aiLikelyVoid(ctx, s, card.suit)).length;
    const allyVoids = futureAllies.filter((s) => aiLikelyVoid(ctx, s, card.suit)).length;
    if (enemyVoids > 0 && isPoint && !aiIsLikelyMaster(game, seat, card, card.suit, ctx.memory)) score -= 8 * enemyVoids;
    if (allyVoids > 0 && !isPoint && ctx.myTeam === "nap") score += 4 * allyVoids;
  }

  return score * weight;
}

function aiV11TrumpJokerPressure(game, seat, ctx) {
  const memory = ctx?.memory || aiBuildCardMemory(game, seat);
  const remaining = memory.remaining || [];
  const trump = game.trump;
  const controlCards = remaining.filter((c) => c.joker || (trump && trump !== "NT" && c.suit === trump));
  const unseenControlCount = controlCards.length;
  const futureOpponents = ctx?.seatsAfter?.filter((s) => aiTeamView(game, s, seat) !== ctx.myTeam) || [];
  const futureEnemyVoids = ctx?.leadSuit ? futureOpponents.filter((s) => aiLikelyVoid(ctx, s, ctx.leadSuit)).length : 0;
  const jokerThreat = (memory.bigJokerSeen ? 0 : 1) + (memory.smallJokerSeen ? 0 : 0.72);
  const trumpThreat = trump && trump !== "NT" ? aiClamp(unseenControlCount / 9, 0, 1) : 0;
  return {
    unseenControlCount,
    jokerThreat,
    trumpThreat,
    enemyCutPressure: aiClamp(futureEnemyVoids * 0.34 + trumpThreat * 0.36 + jokerThreat * 0.14, 0, 1)
  };
}

function aiV11PartnershipSignal(game, observerSeat) {
  if (!game?.trickHistory?.length || game.secretaryRevealed) {
    return { napLean: [0, 0, 0, 0, 0], exposureRisk: 0 };
  }
  const napLean = [0, 0, 0, 0, 0];
  const histories = Array.isArray(game.trickHistory) ? game.trickHistory : [];
  for (const trick of histories) {
    const plays = trick.plays || [];
    const leadSuit = trick.leadSuit || aiLeadSuitFromPlays(plays);
    let best = plays[0] || null;
    for (let i = 1; i < plays.length; i += 1) {
      const play = plays[i];
      const seat = play.seat;
      if (seat === game.napoleon) {
        best = cardStrength(play.card, game, leadSuit) > cardStrength(best?.card, game, leadSuit) ? play : best;
        continue;
      }
      const beforeWinner = best?.seat;
      const beforeNap = beforeWinner === game.napoleon;
      const winsNow = cardStrength(play.card, game, leadSuit) > cardStrength(best?.card, game, leadSuit);
      const isPoint = isHeadCard(play.card);
      if (beforeNap && !winsNow && isPoint) napLean[seat] += 0.22;
      if (beforeNap && winsNow) napLean[seat] -= 0.20;
      if (!beforeNap && trick.winner === game.napoleon && !winsNow && isPoint) napLean[seat] += 0.12;
      if (trick.winner === seat && trick.heads >= 2 && seat !== game.napoleon) napLean[seat] -= 0.08;
      if (winsNow) best = play;
    }
  }
  for (let i = 0; i < napLean.length; i += 1) {
    if (i === game.napoleon) napLean[i] = 1;
    else napLean[i] = aiClamp(napLean[i], -0.6, 0.8);
  }
  const maxHidden = Math.max(0, ...napLean.filter((_, i) => i !== game.napoleon && i !== observerSeat));
  return { napLean, exposureRisk: maxHidden };
}


function aiPickScoredCard(scored, difficulty, aiStyle = "varied") {
  const tier = difficulty >= 18 ? "expert" : difficulty >= 14 ? "hard" : difficulty >= 9 ? "normal" : "easy";
  const spreadMap = { easy: 18, normal: 8.5, hard: 3.4, expert: 0.95 };
  const styleSpread = {
    expert: 0.58,
    conservative: 0.72,
    blocker: 0.82,
    balanced: 0.9,
    support: 0.95,
    varied: 1,
    aggressive: 1.08
  };
  const spread = (spreadMap[tier] ?? Math.max(0.34, (21 - difficulty) * 1.32)) * (styleSpread[aiStyle] || 1);
  const withNoise = scored.map((item) => ({
    card: item.card,
    score: item.score + (Math.random() - 0.5) * spread
  })).sort((a, b) => b.score - a.score);

  if (tier === "easy" && withNoise.length > 1 && Math.random() < 0.22) {
    return randomItem(withNoise.slice(0, Math.min(4, withNoise.length))).card;
  }
  if (tier === "normal" && withNoise.length > 1 && Math.random() < 0.075) {
    return withNoise[1].card;
  }
  if (tier === "hard" && withNoise.length > 2 && Math.random() < 0.018) {
    return withNoise[1].card;
  }
  return withNoise[0].card;
}

function aiLikelyLeadWin(game, seat, card) {
  if (card.id === game.secretaryCardId) return 1;
  if (card.joker && !(game.settings?.jokerLowLast3 && game.trickNo >= 7)) return card.bigJoker ? 0.97 : 0.91;
  const leadSuit = card.joker ? null : card.suit;
  const strength = cardStrength(card, game, leadSuit);
  const unseen = aiUnseenCards(game, seat);
  const stronger = unseen.filter((c) => cardStrength(c, game, leadSuit) > strength);
  if (!stronger.length) return 0.94;

  const remainingSuit = leadSuit ? aiRemainingBySuit(game, seat)[leadSuit] : unseen.length;
  const suitPressure = leadSuit ? aiClamp(remainingSuit / 13, 0.12, 0.95) : 0.8;
  const risk = aiClamp(stronger.length / Math.max(1, unseen.length), 0, 0.9);
  const followers = 4;
  return aiClamp(1 - risk * followers * (1.05 + suitPressure * 0.55), 0.06, 0.88);
}

function aiUnseenCards(game, seat) {
  const known = new Set();
  (game.players?.[seat]?.hand || []).forEach((c) => known.add(c.id));
  (game.trick || []).forEach((p) => known.add(p.card?.id));
  (game.captured || []).flat().forEach((c) => known.add(c.id));
  // 底牌通常只有拿破崙知道；為避免電腦過度作弊，非拿破崙不把底牌視為已知。
  if (seat === game.napoleon) (game.buried || []).forEach((c) => known.add(c.id));
  return makeDeck().filter((c) => !known.has(c.id));
}

function aiTeamView(game, targetSeat, observerSeat) {
  if (targetSeat === null || targetSeat === undefined) return null;
  if (targetSeat === game.napoleon) return "nap";
  if (game.secretaryRevealed) return teamOf(game, targetSeat);
  // 拿破崙與秘書本人知道自己的陣營；其他人只能靠行為與缺門推測。
  if (observerSeat === game.napoleon || targetSeat === observerSeat) return teamOf(game, targetSeat);
  const difficulty = Number(game.settings?.difficulty || 10);
  if (difficulty >= 14 && observerSeat !== null && observerSeat !== undefined) {
    const guess = aiInferSecretaryOwner(game, observerSeat);
    const threshold = difficulty >= 18 ? 0.58 : 0.68;
    if (guess && guess.seat === targetSeat && guess.confidence >= threshold) return "nap";
  }
  // V27：秘書未公開時，聯合國不能百分百確定其他防家都是自己人。
  // 以 unknown 處理可降低過度餵隊友與鐵桶防守，讓拿破崙/秘書有中盤救局空間。
  return "unknown";
}

function aiCanSummonUsefulJoker(game, seat, card) {
  const target = summonTargetForLead(game, card);
  if (!target) return false;
  const handIds = new Set((game.players?.[seat]?.hand || []).map((c) => c.id));
  return !handIds.has(target);
}

function aiClamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function aiConsiderSmallJokerBeforeLast3(game, seat, legal, sortedLow, myTeam, difficulty) {
  if (!game.settings?.jokerLowLast3) return null;
  if (game.trickNo >= 7) return null;
  const smallJoker = legal.find((c) => c.id === "RJ");
  if (!smallJoker) return null;

  const tricksUntilLow = 7 - game.trickNo; // 1 表示本墩是變小前最後機會。
  const isLastChance = tricksUntilLow <= 1;
  const urgency = Math.max(0, 4 - tricksUntilLow); // 越接近末三輪越高。
  const pointCount = countPoints(game.trick.map((p) => p.card));
  const currentWinner = currentTrickWinner(game);
  const winnerTeam = currentWinner === null ? null : aiTeamView(game, currentWinner, seat);
  const smallWins = wouldWin(game, smallJoker);
  const hasCheapAlternative = sortedLow.some((c) => c.id !== "RJ" && !c.point && !wouldWin(game, c));

  if (game.trick.length === 0) {
    // 領出時若手上有小鬼，越接近末三輪越傾向先確保它發揮威力。
    const leadChance = isLastChance ? 0.92 : Math.min(0.58, 0.10 + urgency * 0.14 + difficulty / 85);
    return Math.random() < leadChance ? smallJoker : null;
  }

  if (smallWins) {
    // 對方暫時吃墩、或桌上已有頭時，小鬼提早出手的價值較高。
    if (winnerTeam !== myTeam) return smallJoker;
    if (pointCount > 0 && (isLastChance || Math.random() < 0.25 + difficulty / 80)) return smallJoker;
    if (isLastChance && Math.random() < 0.68) return smallJoker;
  }

  // 最後機會且小鬼已無法贏時，如果能用低成本把小鬼脫手，避免留到末三輪變小。
  if (isLastChance && !smallWins && hasCheapAlternative && Math.random() < 0.48 + difficulty / 70) {
    return smallJoker;
  }

  return null;
}

function cardPlayValue(card, game) {
  let v = card.value;
  if (card.point) v += 12;
  if (card.joker) {
    if (game.settings?.jokerLowLast3 && game.trickNo >= 7) {
      v += card.bigJoker ? 3 : 1;
    } else {
      v += card.bigJoker ? 45 : 40;
    }
  }
  if (game.trump && game.trump !== "NT" && card.suit === game.trump) v += 20;
  if (card.id === game.secretaryCardId) v += 100;
  return v;
}

function currentTrickWinner(game) {
  if (!game.trick?.length) return null;
  const leadSuit = effectiveLeadSuit(game.trick);
  let best = game.trick[0];
  for (const play of game.trick.slice(1)) {
    if (cardStrength(play.card, game, leadSuit) > cardStrength(best.card, game, leadSuit)) best = play;
  }
  return best.seat;
}

function wouldWin(game, card) {
  const hypothetical = { ...game, trick: [...game.trick, { seat: game.currentPlayer, card }] };
  return currentTrickWinner(hypothetical) === game.currentPlayer;
}

function teamOf(game, seat) {
  if (seat === game.napoleon || seat === game.secretaryOwner) return "nap";
  return "def";
}

function calculateHeadTotals(game) {
  const bidAmount = getBidAmount(game);
  const buriedHeads = countPoints(game?.buried || []);
  const buriedMode = game?.settings?.buriedMode || "addContract";
  const rawContract = buriedMode === "addContract"
    ? bidAmount + buriedHeads
    : (Number(game?.contract || 0) || bidAmount);
  const contract = Math.min(16, rawContract);
  const teamSeats = new Set([game.napoleon]);
  if (game.secretaryOwner !== null && game.secretaryOwner !== undefined) teamSeats.add(game.secretaryOwner);
  let teamHeads = 0;
  let defenderHeads = 0;
  for (let seat = 0; seat < 5; seat += 1) {
    const heads = seatHeadCount(game, seat);
    if (teamSeats.has(Number(seat))) teamHeads += heads;
    else defenderHeads += heads;
  }

  // V40：結算與座位資訊要用同一套實際吃牌統計。
  // 某些舊局或同步狀態可能只保留拿破崙軍 captured 統計，導致防家顯示 0 頭。
  // A/K/Q/J 共 16 頭；底牌若沒有算給防家，需先扣掉底牌頭，再由總頭數反推出防家至少應有的頭數。
  if (buriedMode === "defenders") defenderHeads += buriedHeads;
  else if (buriedMode !== "addContract" && buriedMode !== "ignore") teamHeads += buriedHeads;
  const headsOutsidePlay = buriedMode === "defenders" ? 0 : buriedHeads;
  const expectedDefenderHeads = Math.max(0, 16 - headsOutsidePlay - teamHeads);
  defenderHeads = Math.max(defenderHeads, expectedDefenderHeads);

  return { teamHeads, defenderHeads, buriedHeads, contract };
}

function calculateRoundResult(game) {
  if (!game || game.napoleon === null || game.napoleon === undefined) return null;
  const totals = calculateHeadTotals(game);
  if (!totals.contract) return null;
  const made = totals.teamHeads >= totals.contract;
  return {
    made,
    winningTeam: made ? "nap" : "def",
    teamHeads: totals.teamHeads,
    defenderHeads: totals.defenderHeads,
    buriedHeads: totals.buriedHeads,
    contract: totals.contract,
    scoreDeltas: game.roundResult?.scoreDeltas || [],
    endedAt: game.roundResult?.endedAt || game.createdAt || Date.now()
  };
}

function roundResultKey(game, result) {
  return [appState.roomCode || "room", game.createdAt || "game", result.endedAt || "end", result.winningTeam, result.teamHeads, result.defenderHeads, result.contract].join(":");
}

function hideRoundResultOverlay() {
  const overlay = $("resultOverlay");
  if (!overlay) return;
  overlay.classList.remove("show", "win", "lose");
  overlay.classList.add("hidden");
  if (appState.currentRoundResultKey) appState.dismissedRoundResultKey = appState.currentRoundResultKey;
}

function renderRoundResultAnimation(game) {
  const overlay = $("resultOverlay");
  if (!overlay) return;
  if (game.phase !== PHASE.ROUND_END) {
    overlay.classList.remove("show", "win", "lose");
    overlay.classList.add("hidden");
    appState.currentRoundResultKey = null;
    return;
  }
  const seat = myGameSeat(game);
  // 永遠從實際吃牌與底牌重新計算頭數；舊版 roundResult 只保留分數與時間，避免顯示成 2/11 這類舊統計錯誤。
  const result = calculateRoundResult(game) || game.roundResult;
  if (seat === null || !result) {
    overlay.classList.remove("show", "win", "lose");
    overlay.classList.add("hidden");
    return;
  }
  const key = roundResultKey(game, result);
  if (appState.dismissedRoundResultKey === key) {
    overlay.classList.remove("show", "win", "lose");
    overlay.classList.add("hidden");
    return;
  }

  const playerTeam = teamOf(game, seat);
  const playerWon = result.winningTeam === playerTeam;
  recordRoundStats(key, game, result, seat, playerTeam, playerWon, deltaFromResult(result, seat));
  if (appState.currentRoundResultKey !== key) {
    playSfx(playerWon ? "win" : "lose");
    vibrate(playerWon ? [35, 30, 35, 30, 70] : [120]);
  }
  const delta = result.scoreDeltas?.[seat] ?? 0;
  const teamName = playerTeam === "nap" ? "拿破崙軍" : "聯合國";
  const winnerName = result.winningTeam === "nap" ? "拿破崙軍" : "聯合國";
  $("resultTitle").textContent = playerWon ? "勝利！" : "失敗…";
  $("resultSubtitle").textContent = playerWon ? `你的陣營「${teamName}」贏得本局。` : `你的陣營「${teamName}」本局失利。`;
  $("resultStats").innerHTML = `
    <div><span>勝方</span><b>${winnerName}</b></div>
    <div><span>拿破崙軍</span><b>${result.teamHeads} / ${result.contract} 頭</b></div>
    <div><span>聯合國</span><b>${result.defenderHeads} 頭</b></div>
    <div><span>本局分數</span><b>${delta >= 0 ? "+" : ""}${delta}</b></div>
  `;

  overlay.classList.remove("hidden", "win", "lose", "show");
  overlay.classList.add(playerWon ? "win" : "lose");
  void overlay.offsetWidth;
  overlay.classList.add("show");
  appState.currentRoundResultKey = key;
}

function renderGame() {
  const game = appState.room?.game;
  if (!game) return;
  normalizeGame(game);
  maybeNotifyMyTurn(game);
  renderPhase(game);
  renderContract(game);
  renderTableTrump(game);
  renderTableTeamHeads(game);
  renderScores(game);
  renderSeats(game);
  renderTrick(game);
  renderHand(game);
  renderActions(game);
  renderPlayerTips(game);
  renderLog(game);
  renderRoundResultAnimation(game);
  renderVersionInfo();
}

function renderPhase(game) {
  const titles = {
    [PHASE.BIDDING]: "叫牌",
    [PHASE.TRUMP]: "確認王牌",
    [PHASE.EXCHANGE]: "換底牌",
    [PHASE.SECRETARY]: "指定秘書牌",
    [PHASE.PLAY]: "出牌",
    [PHASE.ROUND_END]: "本局結算"
  };
  $("phaseTitle").textContent = titles[game.phase] || "牌局";
  if (game.pendingClear) {
    const winner = game.players[game.pendingClear.winner]?.name || "勝方";
    $("phaseHelp").textContent = `第 ${game.trickNo + 1} 墩完成，由 ${winner} 吃下；牌桌會停留 3 秒再清空。`;
    return;
  }
  const current = game.currentPlayer !== null && game.currentPlayer !== undefined ? game.players[game.currentPlayer]?.name : "";
  const helps = {
    [PHASE.BIDDING]: `輪到 ${current} 叫牌。叫「數字＋花色」，同數字依 ♣ < ♦ < ♥ < ♠ 比較；叫牌後其他 4 家都 Pass 才結束。`,
    [PHASE.TRUMP]: `拿破崙 ${current} 選擇王牌。`,
    [PHASE.EXCHANGE]: "拿破崙已依最高叫品決定王牌並拿起底牌，請選 4 張蓋牌棄出。",
    [PHASE.SECRETARY]: "拿破崙指定一張秘書牌；持有者暗中同隊。",
    [PHASE.PLAY]: `第 ${game.trickNo + 1} 墩，輪到 ${current} 出牌。`,
    [PHASE.ROUND_END]: "本局已結束，房主可開始下一局。"
  };
  $("phaseHelp").textContent = helps[game.phase] || "";
}

function renderTableTrump(game) {
  const el = $("tableTrump");
  if (!el) return;
  const hasTrump = game.napoleon !== null && game.napoleon !== undefined && game.trump;
  if (!hasTrump) {
    el.classList.add("hidden");
    el.innerHTML = "";
    return;
  }
  const suit = game.trump;
  const suitMeta = SUITS[suit] || {};
  const bidText = formatBid(game.bid || game.bidding?.highest);
  el.className = `table-trump ${suitMeta.color === "red" ? "red" : "black"} ${suit === "NT" ? "no-trump" : ""}`;
  el.innerHTML = `
    <span>王牌</span>
    <b>${escapeHtml(suitName(suit))}</b>
    <small>叫品 ${escapeHtml(bidText)}</small>
  `;
}

function renderTableTeamHeads(game) {
  const el = $("tableTeamHeads");
  if (!el) return;
  const hasNapoleon = game.napoleon !== null && game.napoleon !== undefined;
  if (!hasNapoleon || game.phase === PHASE.BIDDING) {
    el.classList.add("hidden");
    el.innerHTML = "";
    return;
  }

  const secretaryKnown = Boolean(game.secretaryRevealed && game.secretaryOwner !== null && game.secretaryOwner !== undefined);
  const shownHeads = secretaryKnown ? napoleonTeamHeadCount(game, true) : seatHeadCount(game, game.napoleon);
  const totals = calculateHeadTotals(game);
  const target = totals.contract ? ` / ${totals.contract}` : "";
  const label = secretaryKnown
    ? (game.secretaryOwner === game.napoleon ? "拿破崙獨裁" : "拿破崙＋秘書")
    : "拿破崙已吃";
  const hint = secretaryKnown ? "秘書已公開，顯示合計頭數" : "秘書未公開，只顯示拿破崙個人頭數";

  el.className = `table-heads ${secretaryKnown ? "secret-open" : "secret-hidden"}`;
  el.innerHTML = `
    <span>${escapeHtml(label)}</span>
    <b>${shownHeads}${target} 頭</b>
    <small>${escapeHtml(hint)}</small>
  `;
}

function renderContract(game) {
  if (game.napoleon === null || game.napoleon === undefined) {
    if (game.phase === PHASE.BIDDING) {
      const high = game.bidding?.highest || null;
      const highPlayer = high ? game.players?.[high.seat]?.name : null;
      const current = game.currentPlayer !== null && game.currentPlayer !== undefined ? game.players?.[game.currentPlayer]?.name : null;
      $("contractInfo").innerHTML = `
        <div class="bid-mini">
          <span>輪到叫牌</span><b>${escapeHtml(current || "-")}</b>
        </div>
        <div class="bid-mini emphasized">
          <span>目前最高叫品</span><b>${escapeHtml(formatBid(high))}</b>
          ${highPlayer ? `<small>${escapeHtml(highPlayer)} 領先</small>` : `<small>尚未有人叫牌</small>`}
        </div>
      `;
    } else {
      $("contractInfo").innerHTML = "尚未叫牌";
    }
    return;
  }
  const secretaryCard = game.secretaryCardId ? findCardById(game.secretaryCardId) : null;
  const secretaryText = game.secretaryRevealed && game.secretaryOwner !== null && game.secretaryOwner !== undefined
    ? `${game.players[game.secretaryOwner].name}（${cardLong(secretaryCard)}）`
    : (secretaryCard ? `${cardLong(secretaryCard)}（未公開）` : "未指定");
  $("contractInfo").innerHTML = `
    <div><b>拿破崙：</b>${escapeHtml(game.players[game.napoleon].name)}</div>
    <div><b>叫牌／成約：</b>${formatBid(game.bid || game.bidding?.highest)} / ${game.contract || "-"} 頭</div>
    <div><b>王牌：</b>${suitName(game.trump)}</div>
    <div><b>秘書：</b>${secretaryText}</div>
    <div><b>底牌頭：</b>${countPoints(game.buried || [])}</div>
  `;
}

function renderScores(game) {
  const scoreBoard = document.querySelector(".scoreboard");
  const hideDuringGame = game.phase !== PHASE.ROUND_END;
  if (scoreBoard) scoreBoard.classList.toggle("hidden", hideDuringGame);
  if (hideDuringGame) {
    $("scoreList").innerHTML = "";
    return;
  }

  $("scoreList").innerHTML = game.players.map((p) => {
    let role = "玩家";
    if (p.seat === game.napoleon) role = "拿破崙";
    else if (p.seat === game.secretaryOwner && game.secretaryRevealed) role = "秘書";
    else if (game.napoleon !== null && game.napoleon !== undefined) role = "聯合國";
    return `<div class="score-row"><div><b>${escapeHtml(p.name)}</b><div class="role">${role}</div></div><b>${p.score || 0}</b></div>`;
  }).join("");
}

function renderSeats(game) {
  const mine = myGameSeat(game);
  const biddingHighest = game.phase === PHASE.BIDDING ? (game.bidding?.highest || null) : null;
  for (let seat = 0; seat < 5; seat += 1) {
    const p = game.players[seat];
    const el = $(`seat${seat}`);
    const current = game.currentPlayer === seat ? "current" : "";
    const isMine = mine === seat ? "mine" : "";
    const biddingTurn = game.phase === PHASE.BIDDING && game.currentPlayer === seat ? "bidding-turn" : "";
    const bidLeader = biddingHighest && biddingHighest.seat === seat ? "bid-leader" : "";
    el.className = `seat seat-${seat} ${current} ${isMine} ${biddingTurn} ${bidLeader}`;
    const tags = [];
    const capturedHeads = seatHeadCount(game, seat);
    tags.push(`<span class="tag">${p.hand?.length || 0} 張</span>`);
    tags.push(`<span class="tag">吃 ${capturedHeads} 頭</span>`);
    const secretaryKnown = Boolean(game.secretaryRevealed && game.secretaryOwner !== null && game.secretaryOwner !== undefined);
    const teamSeats = napoleonTeamSeats(game, true);
    if (secretaryKnown && teamSeats.has(Number(seat))) {
      tags.push(`<span class="tag gold">軍 ${napoleonTeamHeadCount(game, true)} 頭</span>`);
    } else if (seat === game.napoleon && !secretaryKnown && game.napoleon !== null && game.napoleon !== undefined) {
      tags.push(`<span class="tag gold">拿方 ${capturedHeads} 頭</span>`);
    }
    if (p.type === "bot") {
      const aiLabel = aiPersonality(seat, game.settings).label || "電腦";
      tags.push(`<span class="tag gold">AI ${escapeHtml(aiLabel)}</span>`);
    }
    if (game.phase === PHASE.BIDDING && game.currentPlayer === seat) tags.push(`<span class="tag call-active">輪到叫牌</span>`);
    if (biddingHighest && biddingHighest.seat === seat) tags.push(`<span class="tag call-high">最高 ${escapeHtml(formatBid(biddingHighest))}</span>`);
    if (p.seat === game.napoleon) tags.push(`<span class="tag danger">拿破崙</span>`);
    if (p.seat === game.secretaryOwner && game.secretaryRevealed) tags.push(`<span class="tag gold">秘書</span>`);
    if (game.phase === PHASE.BIDDING && p.lastBid !== null && p.lastBid !== undefined && (!biddingHighest || biddingHighest.seat !== seat || p.lastBid === "Pass")) tags.push(`<span class="tag">${escapeHtml(p.lastBid)}</span>`);
    el.innerHTML = `<div class="player-name">${escapeHtml(p.name)}${mine === seat ? "（你）" : ""}</div><div class="player-meta">${tags.join("")}</div>`;
  }
}

function renderTrick(game) {
  if (game.phase === PHASE.BIDDING) {
    for (let seat = 0; seat < 5; seat += 1) {
      const holder = $(`play${seat}`);
      if (!holder) continue;
      holder.innerHTML = "";
      holder.classList.add("empty");
      holder.classList.remove("leading");
    }
    $("trickArea").innerHTML = renderBiddingStatus(game);
    $("kittyArea").textContent = `底牌：${game.kitty?.length || 4} 張`;
    return;
  }

  const bestPlay = currentBestTrickPlay(game);
  for (let seat = 0; seat < 5; seat += 1) {
    const holder = $(`play${seat}`);
    if (!holder) continue;
    const play = (game.trick || []).find((item) => item.seat === seat);
    if (play) {
      const isBest = bestPlay && bestPlay.seat === play.seat && bestPlay.card?.id === play.card?.id;
      const bestLabel = game.pendingClear ? "本墩最大" : "目前最大";
      holder.innerHTML = `
        <div class="trick-card ${isBest ? "leading" : ""}">
          ${isBest ? `<div class="lead-badge">${bestLabel}</div>` : ""}
          <div class="play-card ${cardClass(play.card)}">${cardLabel(play.card)}</div>
          <small>${escapeHtml(game.players[seat].name)}</small>
        </div>`;
      holder.classList.remove("empty");
      holder.classList.toggle("leading", Boolean(isBest));
    } else {
      holder.innerHTML = "";
      holder.classList.add("empty");
      holder.classList.remove("leading");
    }
  }

  let centerText = "等待出牌";
  if (game.pendingClear) {
    const winner = game.players[game.pendingClear.winner]?.name || "勝方";
    centerText = `${winner} 吃下本墩：${game.pendingClear.heads || 0} 頭`;
  } else if ((game.trick || []).length) {
    centerText = `第 ${game.trickNo + 1} 墩，已出 ${game.trick.length}/5 張`;
  }
  $("trickArea").innerHTML = `<div class="table-status">${escapeHtml(centerText)}</div>`;
  const kittyText = game.phase === PHASE.EXCHANGE && game.napoleon === myGameSeat(game)
    ? `你已拿起底牌，請蓋掉 4 張。`
    : (game.buried?.length ? `底牌已蓋牌：${game.buried.length} 張` : `底牌：${game.kitty?.length || 4} 張`);
  $("kittyArea").textContent = kittyText;
}

function renderBiddingStatus(game) {
  const current = game.currentPlayer !== null && game.currentPlayer !== undefined ? game.players?.[game.currentPlayer]?.name : "-";
  const high = game.bidding?.highest || null;
  const highPlayer = high ? game.players?.[high.seat]?.name : null;
  const passCount = high ? (game.bidding?.consecutivePasses || 0) : (game.bidding?.passesWithoutBid || 0);
  const passNeed = high ? 4 : 5;
  return `
    <div class="bid-status">
      <div class="bid-current">
        <span>現在輪到</span>
        <b>${escapeHtml(current)}</b>
        <em>叫牌</em>
      </div>
      <div class="bid-highlight">
        <span>目前最高叫品</span>
        <strong>${escapeHtml(formatBid(high))}</strong>
        <small>${highPlayer ? `${escapeHtml(highPlayer)} 領先` : "尚未有人叫牌"}</small>
      </div>
      <div class="bid-pass-count">連續 Pass：${passCount}/${passNeed}</div>
    </div>
  `;
}


function currentBestTrickPlay(game) {
  const trick = game?.trick || [];
  if (!trick.length) return null;
  const leadSuit = effectiveLeadSuit(trick);
  let best = trick[0];
  for (const play of trick.slice(1)) {
    if (cardStrength(play.card, game, leadSuit) > cardStrength(best.card, game, leadSuit)) best = play;
  }
  return best;
}

function renderHand(game) {
  const seat = myGameSeat(game);
  const observer = seat === null || seat === undefined;
  const hand = observer ? [] : (game.players[seat]?.hand || []);
  $("handCount").textContent = observer ? "觀戰" : `${hand.length} 張`;
  if (observer) {
    $("hand").innerHTML = `<div class="spectator-hand-note">👀 觀戰模式：可看公開牌桌、牌局紀錄與回放，但不能查看手牌或操作。</div>`;
    $("handHint").textContent = "你正在觀戰本局。";
    return;
  }
  const actionable = isMyTurn(game);
  const legalIds = new Set(legalCardsFor(game, seat).map((c) => c.id));
  $("hand").innerHTML = hand.map((card) => {
    const selectable = canSelectCardInHand(game, card, actionable, legalIds);
    const selected = appState.selectedExchange.has(card.id) ? "selected" : "";
    const illegal = actionable && game.phase === PHASE.PLAY && !legalIds.has(card.id) ? "illegal" : "";
    const reason = illegal ? illegalPlayReason(game, seat, card) : "";
    return `<button class="card-btn ${cardClass(card)} ${selected} ${illegal}" data-card="${card.id}" title="${escapeHtml(reason)}" ${selectable ? "" : "disabled"}>${cardLabel(card)}</button>`;
  }).join("");
  document.querySelectorAll("#hand .card-btn").forEach((btn) => {
    btn.addEventListener("click", () => onHandCardClick(game, btn.dataset.card));
  });
  $("handHint").textContent = handHint(game, actionable);
}

function canSelectCardInHand(game, card, actionable, legalIds) {
  if (!actionable) return false;
  if (game.phase === PHASE.EXCHANGE) return true;
  if (game.phase === PHASE.PLAY) return true;
  return false;
}

function handHint(game, actionable) {
  if (!actionable) return "等待其他玩家操作。";
  if (game.phase === PHASE.EXCHANGE) return `請選 4 張蓋牌，目前已選 ${appState.selectedExchange.size} 張。`;
  if (game.phase === PHASE.PLAY) return "請依規則出一張合法牌。";
  return "請使用左側操作區。";
}

function onHandCardClick(game, cardId) {
  if (!isMyTurn(game)) return;
  if (game.phase === PHASE.EXCHANGE) {
    if (appState.selectedExchange.has(cardId)) appState.selectedExchange.delete(cardId);
    else if (appState.selectedExchange.size < 4) appState.selectedExchange.add(cardId);
    renderHand(game);
    renderActions(game);
    return;
  }
  if (game.phase === PHASE.PLAY) {
    const seat = myGameSeat(game);
    const card = game.players[seat].hand.find((c) => c.id === cardId);
    const legalIds = new Set(legalCardsFor(game, seat).map((c) => c.id));
    if (!legalIds.has(cardId)) {
      const reason = illegalPlayReason(game, seat, card);
      toast(reason);
      $("handHint").textContent = reason;
      const ruleHint = $("playRuleHint");
      if (ruleHint) ruleHint.textContent = reason;
      return;
    }
    const leadSuit = (game.trick.length === 0 && card?.joker) ? ($("leadSuitSelect")?.value || null) : null;
    submitAction("playCard", { cardId, leadSuit });
  }
}

function renderActions(game) {
  const seat = myGameSeat(game);
  const myTurn = isMyTurn(game);
  const el = $("actionPanel");
  if (game.pendingClear) {
    const winner = game.players[game.pendingClear.winner]?.name || "勝方";
    el.innerHTML = `<p class="hint">${escapeHtml(winner)} 吃下本墩，牌桌保留 3 秒後清空。</p>`;
    return;
  }
  if (game.phase === PHASE.ROUND_END) {
    el.innerHTML = isHost()
      ? `<div class="inline"><button id="btnNextRound" class="primary">再玩一局</button><button id="btnReturnLobby" class="ghost">${appState.offline ? "回主畫面" : "返回大廳"}</button><button id="btnOpenReplay" class="ghost">牌局回放</button></div><p class="hint">再玩一局會保留目前分數並換下一位發牌；返回大廳可重新調整座位與規則。</p>`
      : `<div class="inline"><button id="btnOpenReplay" class="ghost">牌局回放</button></div><p class="hint">等待房主選擇再玩一局或返回大廳。</p>`;
    $("btnNextRound")?.addEventListener("click", hostNextRound);
    $("btnReturnLobby")?.addEventListener("click", hostReturnToLobby);
    $("btnOpenReplay")?.addEventListener("click", () => openReplayDialog(game));
    return;
  }
  if ((seat === null || seat === undefined) && appState.spectator) {
    el.innerHTML = `<p class="hint">👀 觀戰模式：你可以看牌桌、紀錄與結算回放；不能出牌或叫牌。</p><button id="btnOpenReplaySpectator" class="ghost" type="button">牌局回放</button>`;
    $("btnOpenReplaySpectator")?.addEventListener("click", () => openReplayDialog(game));
    return;
  }
  if (!myTurn) {
    if (game.phase === PHASE.BIDDING) {
      el.innerHTML = `<div class="action-bid-banner">${renderBiddingStatus(game)}</div><p class="hint">等待 ${escapeHtml(game.players[game.currentPlayer]?.name || "其他玩家")} 叫牌。</p>`;
    } else {
      el.innerHTML = `<p class="hint">等待 ${escapeHtml(game.players[game.currentPlayer]?.name || "其他玩家")} 操作。</p>`;
    }
    return;
  }
  if (game.phase === PHASE.BIDDING) {
    const bids = legalBidsAbove(game.bidding?.highest || null, game.settings);
    const options = bids.map((b) => `<option value="${b.amount}|${b.suit}">${formatBid(b)}</option>`);
    const bidControl = options.length
      ? `<label class="field"><span>叫牌</span><select id="bidSelect">${options.join("")}</select></label><button id="btnBid" class="primary">叫牌</button>`
      : `<p class="hint">已是最高叫品，只能 Pass。</p>`;
    el.innerHTML = `<div class="action-bid-banner">${renderBiddingStatus(game)}</div><p class="hint">同數字花色大小：♣ < ♦ < ♥ < ♠${game.settings?.trumpMode === "allowNoTrump" ? " < 無王" : ""}。</p><div class="inline">${bidControl}<button id="btnPass" class="ghost">Pass</button></div>`;
    $("btnBid")?.addEventListener("click", () => {
      const [amount, suit] = $("bidSelect").value.split("|");
      submitAction("bid", { amount: Number(amount), suit });
    });
    $("btnPass").addEventListener("click", () => submitAction("pass"));
    return;
  }
  if (game.phase === PHASE.TRUMP) {
    const suits = game.settings?.trumpMode === "allowNoTrump" ? ["S", "H", "D", "C", "NT"] : ["S", "H", "D", "C"];
    el.innerHTML = `<p class="hint">選擇王牌花色。</p><div class="inline">${suits.map((s) => `<button class="ghost" data-trump="${s}">${suitName(s)}</button>`).join("")}</div>`;
    el.querySelectorAll("button[data-trump]").forEach((btn) => btn.addEventListener("click", () => submitAction("chooseTrump", { trump: btn.dataset.trump })));
    return;
  }
  if (game.phase === PHASE.EXCHANGE) {
    el.innerHTML = `<p class="hint">選 4 張蓋牌。已選 ${appState.selectedExchange.size}/4。</p><button id="btnExchange" class="primary" ${appState.selectedExchange.size === 4 ? "" : "disabled"}>確認蓋牌</button>`;
    $("btnExchange").addEventListener("click", () => {
      submitAction("exchange", { cardIds: [...appState.selectedExchange] });
      appState.selectedExchange.clear();
    });
    return;
  }
  if (game.phase === PHASE.SECRETARY) {
    const own = new Set(game.players[seat].hand.map((c) => c.id));
    const buried = new Set((game.buried || []).map((c) => c.id));
    const options = makeDeck()
      .filter((c) => !buried.has(c.id) && (game.settings?.allowSelfSecretary || !own.has(c.id)))
      .sort((a, b) => cardSecretaryValue(b, game) - cardSecretaryValue(a, game))
      .map((c) => `<option value="${c.id}">${cardLong(c)}</option>`);
    el.innerHTML = `<label class="field"><span>秘書牌</span><select id="secretarySelect">${options.join("")}</select></label><button id="btnSecretary" class="primary">指定秘書</button>`;
    $("btnSecretary").addEventListener("click", () => submitAction("chooseSecretary", { cardId: $("secretarySelect").value }));
    return;
  }
  if (game.phase === PHASE.PLAY) {
    const leadSuitSelect = game.trick.length === 0
      ? `<label class="field"><span>若首攻鬼牌，可指定要跟的花色</span><select id="leadSuitSelect"><option value="">不指定</option><option value="S">黑桃</option><option value="H">紅心</option><option value="D">方塊</option><option value="C">梅花</option></select></label>`
      : "";
    const reasonHint = game.trick.length
      ? `本墩首引：${suitName(effectiveLeadSuit(game.trick) || "")}。不能出的牌可點一下查看原因。`
      : "你是本墩首攻，可出任一張牌；若首攻鬼牌可先指定要跟的花色。";
    el.innerHTML = `${leadSuitSelect}<p id="playRuleHint" class="hint play-rule-hint">${escapeHtml(reasonHint)}</p><p class="hint">直接點擊手牌出牌。</p>`;
  }
}

function isMyTurn(game) {
  const seat = myGameSeat(game);
  return seat !== null && game.currentPlayer === seat;
}


function getPlayerHintsVisible() {
  return localStorage.getItem(STORAGE.playerHints) === "1";
}

function setPlayerHintsVisible(visible) {
  localStorage.setItem(STORAGE.playerHints, visible ? "1" : "0");
  applyPlayerHintsVisible(visible);
  renderPlayerTips(appState.room?.game || null);
}

function applyPlayerHintsVisible(visible) {
  const toggle = $("hintToggle");
  if (toggle) toggle.checked = Boolean(visible);
  const panel = $("playerTips");
  if (panel) panel.classList.toggle("hidden", !visible || !appState.room?.game);
}

function renderPlayerTips(game) {
  const panel = $("playerTips");
  if (!panel) return;
  const visible = getPlayerHintsVisible();
  if (!visible || !game || appState.room?.meta?.status === "lobby") {
    panel.classList.add("hidden");
    panel.innerHTML = "";
    return;
  }
  const tips = buildPlayerTips(game);
  panel.classList.toggle("hidden", !tips.length);
  panel.innerHTML = tips.length
    ? `<h3>玩家提示</h3><ul>${tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("")}</ul>`
    : "";
}

function buildPlayerTips(game) {
  const seat = myGameSeat(game);
  if (seat === null || seat === undefined) return [];
  const tips = [];
  const totals = game.napoleon !== null && game.napoleon !== undefined ? calculateHeadTotals(game) : null;
  if (totals && game.phase !== PHASE.ROUND_END) {
    const gap = totals.contract - totals.teamHeads;
    if (teamOf(game, seat) === "nap") tips.push(`拿破崙軍目前 ${totals.teamHeads}/${totals.contract} 頭，還差 ${Math.max(0, gap)} 頭。`);
    else tips.push(`聯合國目前守到 ${totals.defenderHeads} 頭，讓拿破崙少於 ${totals.contract} 頭即可。`);
  }
  if (!isMyTurn(game)) {
    const current = game.currentPlayer !== null && game.currentPlayer !== undefined ? game.players?.[game.currentPlayer]?.name : "其他玩家";
    tips.push(`目前等待 ${current} 操作。`);
    return tips;
  }
  if (game.phase === PHASE.BIDDING) return tips.concat(playerBidTips(game, seat));
  if (game.phase === PHASE.EXCHANGE) return tips.concat(playerExchangeTips(game, seat));
  if (game.phase === PHASE.SECRETARY) return tips.concat(playerSecretaryTips(game, seat));
  if (game.phase === PHASE.PLAY) return tips.concat(playerPlayTips(game, seat));
  if (game.phase === PHASE.ROUND_END) tips.push("本局已結束，可查看牌局回放理解關鍵墩。 ");
  return tips;
}

function playerBidTips(game, seat) {
  const hand = game.players?.[seat]?.hand || [];
  const profile = aiEvaluateBidProfile(hand, game.settings || {}, game.settings?.difficulty || 10);
  const legal = legalBidsAbove(game.bidding?.highest || null, game.settings || {});
  const tips = [];
  const bestLegal = legal
    .filter((b) => b.amount <= Math.max(9, Math.floor(profile.expectedHeads + 0.4)))
    .map((b) => ({ bid: b, score: aiBidSuitScore(profile, b) }))
    .sort((a, b) => b.score - a.score)[0]?.bid;
  tips.push(`估計牌力約 ${profile.expectedHeads.toFixed(1)} 頭，王牌候選以 ${suitName(profile.bestSuit || "S")} 較佳。`);
  if (bestLegal) tips.push(`可考慮叫 ${formatBid(bestLegal)}；若目前叫品已接近牌力上限，Pass 也合理。`);
  else tips.push("目前沒有很舒服的叫品，建議保守 Pass。 ");
  return tips;
}

function playerExchangeTips(game, seat) {
  const ids = new Set(aiChooseBuried(game, seat));
  const cards = (game.players?.[seat]?.hand || []).filter((c) => ids.has(c.id));
  const names = cards.map(cardLong).join("、") || "低非王牌";
  return [`建議優先蓋牌：${names}。`, "通常保留鬼牌、王牌控制牌與可穩收的頭牌；短門小牌可視情況蓋掉來製造切牌。"];
}

function playerSecretaryTips(game, seat) {
  const id = aiChooseSecretary(game, seat);
  const card = findCardById(id);
  return [`建議秘書牌：${cardLong(card)}。`, "高成約適合找鬼牌、王牌大牌或能補你短門弱點的頭牌。"];
}

function playerPlayTips(game, seat) {
  const legal = legalCardsFor(game, seat);
  if (!legal.length) return ["目前沒有合法牌可出。"];
  const context = aiBuildPlayContext(game, seat);
  const scored = legal.map((card) => ({ card, score: aiScorePlayCard(game, seat, card, context) + aiAdvancedPlayAdjustment(game, seat, card, context, legal) }))
    .sort((a, b) => b.score - a.score);
  const best = scored[0]?.card || legal[0];
  const leadSuit = effectiveLeadSuit(game.trick);
  const tips = [];
  if (leadSuit) tips.push(`本墩首引花色是 ${suitName(leadSuit)}，有同花色時必須跟牌。`);
  else tips.push("你是本墩首攻，優先考慮安全收頭、探門，或依局勢抽王牌。 ");
  tips.push(`推薦出牌：${cardLong(best)}。${playerPlayReason(game, seat, best)}`);
  if (scored[1]) tips.push(`備選：${cardLong(scored[1].card)}。`);
  return tips;
}

function playerPlayReason(game, seat, card) {
  const totals = calculateHeadTotals(game);
  const trickHeads = countPoints((game.trick || []).map((p) => p.card)) + (isHeadCard(card) ? 1 : 0);
  const isNapTeam = teamOf(game, seat) === "nap";
  const wins = game.trick?.length ? wouldWin(game, card) : aiLikelyLeadWin(game, seat, card) >= 0.65;
  if (isNapTeam && totals.contract - totals.teamHeads <= 3 && wins) return `目前接近成敗線，這張有機會搶下 ${trickHeads} 頭。`;
  if (!isNapTeam && totals.contract - totals.teamHeads <= 3 && wins) return `拿破崙接近達標，這張可嘗試攔截。`;
  if (isHeadCard(card) && !wins) return "這是頭牌但未必能吃，請注意後手風險。";
  if (wins) return "它有機會以較低成本吃下本墩。";
  return "它可降低送出控制牌的風險。";
}

function openReplayDialog(game = appState.room?.game) {
  const dialog = $("replayDialog");
  if (!dialog || !game) return toast("目前沒有可回放的牌局");
  const histories = Array.isArray(game.trickHistory) ? game.trickHistory : [];
  const result = calculateRoundResult(game) || game.roundResult;
  const summary = result
    ? `拿破崙軍 ${result.teamHeads}/${result.contract} 頭，聯合國 ${result.defenderHeads} 頭，勝方：${result.winningTeam === "nap" ? "拿破崙軍" : "聯合國"}。`
    : `目前共有 ${histories.length} 墩紀錄。`;
  $("replaySummary").textContent = summary;
  $("replayList").innerHTML = histories.length
    ? histories.map((h) => renderReplayTrick(game, h)).join("")
    : `<p class="hint">目前還沒有完整墩紀錄。</p>`;
  appState.lastReplayText = buildReplayShareText(game, histories, summary);
  dialog.showModal();
}


function buildReplayShareText(game, histories = Array.isArray(game?.trickHistory) ? game.trickHistory : [], summary = "") {
  const lines = ["拿破崙與秘書｜牌局回放", `版本：${APP_VERSION}`, summary || "無結算摘要"];
  const keyTricks = histories
    .map((h) => ({ h, tags: replayAnalysisTags(game, h) }))
    .filter((item) => item.tags.length || (item.h.heads || 0) >= 2)
    .slice(0, 6);
  if (keyTricks.length) {
    lines.push("關鍵墩：");
    for (const item of keyTricks) {
      const winnerName = game.players?.[item.h.winner]?.name || `座位 ${Number(item.h.winner) + 1}`;
      const tags = item.tags.map((t) => t.text).join("、") || `${item.h.heads || 0} 頭`;
      lines.push(`第 ${Number(item.h.trickNo) + 1} 墩：${winnerName} 吃，${tags}`);
    }
  } else {
    lines.push("尚無可分享的關鍵墩標籤。");
  }
  return lines.join("\n");
}

async function shareReplay() {
  const text = appState.lastReplayText || buildReplayShareText(appState.room?.game);
  try {
    if (navigator.share) await navigator.share({ title: "拿破崙與秘書牌局回放", text });
    else await navigator.clipboard.writeText(text);
    toast(navigator.share ? "已開啟回放分享" : "回放摘要已複製");
  } catch {
    await navigator.clipboard.writeText(text).catch(() => {});
    toast("回放摘要已複製");
  }
}

function renderReplayTrick(game, h) {
  const winnerName = game.players?.[h.winner]?.name || `座位 ${Number(h.winner) + 1}`;
  const tags = replayAnalysisTags(game, h);
  const plays = (h.plays || []).map((p) => {
    const name = game.players?.[p.seat]?.name || `座位 ${Number(p.seat) + 1}`;
    const isWinner = Number(p.seat) === Number(h.winner);
    const tag = replayPlayTag(game, h, p);
    return `<div class="replay-play ${isWinner ? "winner" : ""} ${tag.className}"><span>${escapeHtml(name)}</span><b class="${cardClass(p.card)}">${escapeHtml(cardLabel(p.card))}</b>${tag.text ? `<small>${escapeHtml(tag.text)}</small>` : ""}</div>`;
  }).join("");
  const roleNote = replayTrickNote(game, h);
  const tagHtml = tags.length ? `<div class="replay-tags">${tags.map((tag) => `<span class="${escapeHtml(tag.className)}">${escapeHtml(tag.text)}</span>`).join("")}</div>` : "";
  return `<article class="replay-trick"><header><b>第 ${Number(h.trickNo) + 1} 墩</b><span>${escapeHtml(winnerName)} 吃下，${h.heads || 0} 頭</span></header>${tagHtml}<div class="replay-plays">${plays}</div>${roleNote ? `<p>${escapeHtml(roleNote)}</p>` : ""}</article>`;
}

function replayAnalysisTags(game, h) {
  const tags = [];
  const heads = h.heads || 0;
  const winnerTeam = teamOf(game, h.winner);
  const plays = h.plays || [];
  if (heads >= 2) tags.push({ text: `關鍵多頭墩 ${heads} 頭`, className: "tag-key" });
  if (heads >= 3) tags.push({ text: "勝負轉折候選", className: "tag-swing" });
  if (plays.some((p) => p.card?.id === game.secretaryCardId)) tags.push({ text: "秘書曝光/秘書牌", className: "tag-secretary" });
  if (plays.some((p) => isReplayControlCard(game, p.card))) tags.push({ text: "控制牌使用", className: "tag-control" });
  if (winnerTeam === "def" && heads >= 1 && game.contract) tags.push({ text: "聯合國擋約墩", className: "tag-defense" });
  const suspicious = replaySuspiciousFeeds(game, h);
  if (suspicious.length) tags.push({ text: `可疑送頭 ${suspicious.length}`, className: "tag-warning" });
  return tags;
}

function replayPlayTag(game, h, p) {
  if (!p?.card) return { text: "", className: "" };
  if (p.card.id === game.secretaryCardId) return { text: "秘書牌", className: "secret-card" };
  if (p.card.joker) return { text: "鬼牌", className: "control-card" };
  if (game.trump && game.trump !== "NT" && p.card.suit === game.trump && p.card.value >= 11) return { text: "王牌", className: "control-card" };
  if (isHeadCard(p.card)) return { text: "頭", className: "head-card" };
  return { text: "", className: "" };
}

function isReplayControlCard(game, card) {
  if (!card) return false;
  if (card.joker || card.id === game.secretaryCardId) return true;
  return Boolean(game.trump && game.trump !== "NT" && card.suit === game.trump && card.value >= 11);
}

function replaySuspiciousFeeds(game, h) {
  const winnerTeam = teamOf(game, h.winner);
  return (h.plays || []).filter((p) => {
    if (!isHeadCard(p.card) || Number(p.seat) === Number(h.winner)) return false;
    const team = teamOf(game, p.seat);
    if (team === winnerTeam) return false;
    return true;
  });
}

function replayTrickNote(game, h) {
  const winnerTeam = teamOf(game, h.winner);
  const lead = h.leadSuit ? `首引 ${suitName(h.leadSuit)}` : "首引未指定花色";
  const tags = replayAnalysisTags(game, h).map((tag) => tag.text).join("、");
  if (tags) return `${lead}；分析：${tags}。`;
  if ((h.heads || 0) >= 2) return `${lead}；本墩有 ${h.heads} 頭，是關鍵多頭墩。`;
  if (winnerTeam === "nap") return `${lead}；拿破崙軍收下本墩。`;
  return `${lead}；聯合國守住本墩。`;
}

function renderVersionInfo() {
  const el = $("versionFooter");
  if (!el) return;
  el.textContent = `版本：${APP_VERSION}（${APP_BUILD}）`;
}

function showUpdateBanner(worker) {
  appState.waitingWorker = worker || appState.waitingWorker;
  const banner = $("updateBanner");
  if (banner) banner.classList.remove("hidden");
}

function reloadForUpdate() {
  if (appState.waitingWorker) appState.waitingWorker.postMessage({ type: "SKIP_WAITING" });
  window.location.reload();
}

function getLogVisible() {
  return localStorage.getItem(STORAGE.logVisible) === "1";
}

function applyLogVisibility(visible) {
  const gameView = $("gameView");
  if (!gameView) return;
  gameView.classList.toggle("log-collapsed", !visible);
  const btn = $("btnToggleLog");
  if (btn) {
    btn.textContent = visible ? "隱藏紀錄" : "顯示紀錄";
    btn.setAttribute("aria-expanded", visible ? "true" : "false");
  }
}

function toggleLogVisibility() {
  const next = !getLogVisible();
  localStorage.setItem(STORAGE.logVisible, next ? "1" : "0");
  applyLogVisibility(next);
  renderLog(appState.room?.game || { log: [] });
}

function renderLog(game) {
  const entries = game.log || [];
  $("log").innerHTML = entries.map((msg) => `<div class="log-entry">${escapeHtml(msg)}</div>`).join("");
  applyLogVisibility(getLogVisible());
  const summary = $("logSummary");
  if (summary) {
    summary.textContent = entries.length ? `已隱藏 ${entries.length} 筆紀錄，需要時可展開查看。` : "牌局紀錄已隱藏。";
  }
}

function cardLabel(card) {
  if (!card) return "";
  if (card.joker) return card.rank;
  return `${SUITS[card.suit].sym}${card.rank}`;
}

function cardLong(card) {
  if (!card) return "";
  if (card.joker) return card.rank;
  return `${SUITS[card.suit].name}${card.rank}`;
}

function cardClass(card) {
  if (card.joker) return "joker";
  return SUITS[card.suit]?.color === "red" ? "red" : "black";
}

function suitName(suit) {
  return SUITS[suit]?.name || "未定";
}

function isHeadCard(card) {
  if (!card) return false;
  if (card.point === true) return true;
  if (POINT_RANKS.has(card.rank)) return true;
  const id = String(card.id || "");
  return /^(S|H|D|C)(A|K|Q|J)$/.test(id);
}

function countPoints(cards) {
  return (cards || []).filter(isHeadCard).length;
}

function seatCapturedCards(game, seat) {
  if (!game) return [];
  const fromCaptured = game.captured?.[seat] || [];
  const history = Array.isArray(game.trickHistory) ? game.trickHistory : [];
  const fromHistory = history
    .filter((trick) => Number(trick.winner) === Number(seat))
    .flatMap((trick) => (trick.plays || []).map((play) => play.card).filter(Boolean));
  // V40：以牌局回放紀錄作為優先來源。
  // 某些多人同步或舊版狀態可能讓 captured[seat] 沒有即時帶到座位資訊，
  // 但 trickHistory 仍保留每墩勝者與出牌，能避免拿破崙座位顯示「吃 0 頭」。
  return fromHistory.length ? fromHistory : fromCaptured;
}

function seatHeadCount(game, seat) {
  return countPoints(seatCapturedCards(game, seat));
}

function napoleonTeamSeats(game, revealOnly = false) {
  const seats = new Set();
  if (game?.napoleon !== null && game?.napoleon !== undefined) seats.add(Number(game.napoleon));
  const canShowSecretary = !revealOnly || Boolean(game?.secretaryRevealed);
  if (canShowSecretary && game?.secretaryOwner !== null && game?.secretaryOwner !== undefined) seats.add(Number(game.secretaryOwner));
  return seats;
}

function napoleonTeamHeadCount(game, revealOnly = false) {
  return Array.from(napoleonTeamSeats(game, revealOnly)).reduce((sum, seat) => sum + seatHeadCount(game, seat), 0);
}

function findCardById(id) {
  return makeDeck().find((c) => c.id === id) || null;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function aiBestSuit(hand) {
  const scores = { S: 0, H: 0, D: 0, C: 0 };
  for (const c of hand || []) if (c.suit) scores[c.suit] += c.value;
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || "S";
}

function buildInviteLink(code = appState.roomCode) {
  return `${location.origin}${location.pathname}?room=${encodeURIComponent(code)}`;
}

function buildQrCodeUrl(url) {
  const size = 220;
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=12&data=${encodeURIComponent(url)}`;
}

async function copyInviteLink() {
  const url = buildInviteLink();
  try {
    await navigator.clipboard.writeText(url);
    toast("已複製邀請連結");
  } catch {
    toast(`邀請連結：${url}`);
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").then((registration) => {
      if (registration.waiting && navigator.serviceWorker.controller) showUpdateBanner(registration.waiting);
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) showUpdateBanner(worker);
        });
      });
    }).catch((error) => {
      console.warn("Service worker registration failed", error);
    });
  });
}

registerServiceWorker();

init();
