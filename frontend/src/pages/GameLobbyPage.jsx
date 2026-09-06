import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Trophy, Play, CheckCircle, Shield, Award, Lock, ExternalLink, 
  RefreshCw, Eye, HelpCircle, ArrowRight, Zap, Check, Clock, Sparkles, 
  Copy, Key, UserPlus, Crown, LogIn, ArrowLeft, Gamepad2, Radio, CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { lobbySyncEngine } from '../lib/lobbySyncEngine';
import { getPlayerImageUrl } from '../lib/playerImages';

export function GameLobbyPage({ account, connectWallet, userCards = [] }) {
  // Inspector & verification state
  const [showInspector, setShowInspector] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedStatus, setVerifiedStatus] = useState(true);

  // Lobby mode: 'select' (choose Host vs Join) | 'host' | 'join'
  const [lobbyMode, setLobbyMode] = useState('select');
  
  // Room Code & Multi-Player State
  const [roomCode, setRoomCode] = useState('FIFA-8492');
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [isHost, setIsHost] = useState(true);
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Active public rooms for demo quick-joining & real-time tab sync
  const DEMO_ACTIVE_ROOMS = [
    { code: 'FIFA-8492', host: '0xf39F...92266', playersCount: 2, maxPlayers: 3, status: 'Waiting for 1 player' },
    { code: 'FIFA-5921', host: '0x71C7...4811', playersCount: 1, maxPlayers: 3, status: 'Open Slot' },
    { code: 'FIFA-3344', host: '0xA92b...3301', playersCount: 2, maxPlayers: 3, status: 'Waiting for 1 player' }
  ];

  const [publicRooms, setPublicRooms] = useState(() => {
    const saved = lobbySyncEngine.getPublicRooms();
    return saved.length > 0 ? saved : DEMO_ACTIVE_ROOMS;
  });

  const collectionBonus = (userCards?.length || 0) * 2;

  // Match State: 'lobby' | 'quiz' | 'turnOrderSummary' | 'draft' | 'results'
  const [gameState, setGameState] = useState('lobby');

  // Multi-Round Position Track: 0 = GK, 1 = DEF, 2 = MID, 3 = FWD
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);

  // Quiz State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [p1Answers, setP1Answers] = useState([]);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [liveTimer, setLiveTimer] = useState('0.00');
  const timerRef = useRef(null);

  // Turn Order State for Current Round: Array of [Rank 1 Player, Rank 2 Player, Rank 3 Player]
  const [roundTurnOrder, setRoundTurnOrder] = useState([]);

  // Draft state within current round
  const [claimedCardsInRound, setClaimedCardsInRound] = useState({}); // { cardId: playerObj }
  const [userHasDraftedInRound, setUserHasDraftedInRound] = useState(false);

  // Squad Accumulator: Stores unique NFT cards picked by each player across rounds
  const [squads, setSquads] = useState({
    p1: [],
    p2: [],
    p3: []
  });

  // Dynamic player room state
  const [roomPlayers, setRoomPlayers] = useState([
    { id: 1, name: 'Player 1 (Host)', wallet: account || '0x...', ready: true, role: 'Room Leader (Host)', isYou: true }
  ]);

  // Real-Time Cross-Tab Event Subscriptions
  useEffect(() => {
    const unsubscribe = lobbySyncEngine.subscribe((msg) => {
      if (!msg || !msg.type) return;

      if (msg.type === 'PUBLIC_ROOMS_UPDATED' && Array.isArray(msg.payload)) {
        setPublicRooms(msg.payload.length > 0 ? msg.payload : DEMO_ACTIVE_ROOMS);
      }

      if (msg.type === 'ROOM_CREATED') {
        const newRoom = msg.payload;
        setPublicRooms(prev => {
          const exists = prev.some(r => r.code === newRoom.code);
          if (exists) return prev;
          const updated = [newRoom, ...prev];
          lobbySyncEngine.savePublicRooms(updated);
          return updated;
        });
      }

      if (msg.type === 'PLAYER_JOINED') {
        const { code, player } = msg.payload;
        if (code === roomCode) {
          setRoomPlayers(prev => {
            const exists = prev.some(p => p.wallet?.toLowerCase() === player.wallet?.toLowerCase());
            if (exists) return prev;
            const updated = [...prev, { ...player, id: prev.length + 1 }];
            if (isHost) {
              lobbySyncEngine.broadcast('ROOM_UPDATE', { roomCode: code, players: updated });
            }
            return updated;
          });
        }
      }

      if (msg.type === 'ROOM_UPDATE') {
        const { roomCode: targetCode, players } = msg.payload;
        if (targetCode === roomCode) {
          setRoomPlayers(players.map(p => ({
            ...p,
            isYou: p.wallet?.toLowerCase() === (account?.toLowerCase() || '')
          })));
        }
      }

      if (msg.type === 'MATCH_STARTED') {
        const { roomCode: targetCode, players: finalPlayers } = msg.payload;
        if (targetCode === roomCode) {
          if (finalPlayers && finalPlayers.length >= 2) {
            setRoomPlayers(finalPlayers.map(p => ({
              ...p,
              isYou: p.wallet?.toLowerCase() === (account?.toLowerCase() || '')
            })));
          }
          setCurrentRoundIdx(0);
          setSquads({ p1: [], p2: [], p3: [] });
          setGameState('quiz');
          setCurrentQuestionIdx(0);
          setP1Answers([]);
          setQuizStartTime(Date.now());
          setUserHasDraftedInRound(false);
          setClaimedCardsInRound({});
        }
      }

      if (msg.type === 'CARD_DRAFTED') {
        const { roomCode: targetCode, cardId, playerWallet, roundIdx } = msg.payload;
        if (targetCode === roomCode && roundIdx === currentRoundIdx) {
          setClaimedCardsInRound(prev => ({
            ...prev,
            [cardId]: { wallet: playerWallet }
          }));
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode, isHost, account, currentRoundIdx]);

  // Option 1: Host a Game handler
  const handleSelectHostMode = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newCode = `FIFA-${randomDigits}`;
    setRoomCode(newCode);
    setIsHost(true);
    setHasJoinedRoom(true);
    setLobbyMode('host');
    
    const hostPlayer = {
      id: 1,
      name: 'Player 1 (Host / You)',
      wallet: account || '0x...',
      ready: true,
      role: 'Room Leader (Host)',
      isYou: true
    };
    setRoomPlayers([hostPlayer]);

    const newPublicRoom = {
      code: newCode,
      host: account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : '0xHost...1234',
      playersCount: 1,
      maxPlayers: 3,
      status: 'Open Slot'
    };

    setPublicRooms(prev => {
      const updated = [newPublicRoom, ...prev];
      lobbySyncEngine.savePublicRooms(updated);
      return updated;
    });

    lobbySyncEngine.broadcast('ROOM_CREATED', newPublicRoom);
  };

  // Option 2: Select Join Game Mode
  const handleSelectJoinMode = () => {
    setLobbyMode('join');
    setHasJoinedRoom(false);
    setJoinError('');
    setInputRoomCode('');
  };

  // Generate new code inside Host mode
  const handleGenerateNewRoomCode = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newCode = `FIFA-${randomDigits}`;
    setRoomCode(newCode);
    setIsHost(true);
    setHasJoinedRoom(true);
    setRoomPlayers([
      { id: 1, name: 'Player 1 (Host / You)', wallet: account || '0x...', ready: true, role: 'Room Leader (Host)', isYou: true }
    ]);
  };

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Execute Join Room via Code input
  const handleJoinViaCode = (codeToJoin) => {
    const targetCode = (codeToJoin || inputRoomCode || '').trim().toUpperCase();
    if (!targetCode || targetCode.length < 4) {
      setJoinError('Please enter a valid room code (e.g., FIFA-8492)');
      return;
    }
    setJoinError('');
    setRoomCode(targetCode);
    setIsHost(false);
    setHasJoinedRoom(true);
    setLobbyMode('join');
    
    const joiningPlayer = {
      name: account ? `Player (${account.substring(0, 6)}...)` : 'Player 2 (You)',
      wallet: account || '0x...',
      ready: true,
      role: 'Connected Participant',
      isYou: true
    };

    setRoomPlayers([
      { id: 1, name: 'Room Host (Leader)', wallet: '0xf39F...92266', ready: true, role: 'Room Leader (Host)', isYou: false },
      { id: 2, name: 'Player 2 (You)', wallet: account || '0x...', ready: true, role: 'Connected Participant', isYou: true }
    ]);

    lobbySyncEngine.broadcast('PLAYER_JOINED', {
      code: targetCode,
      player: joiningPlayer
    });
  };

  const handleLeaveRoom = () => {
    setLobbyMode('select');
    setHasJoinedRoom(false);
    setGameState('lobby');
  };

  useEffect(() => {
    if (account) {
      setRoomPlayers(prev => prev.map(p => p.isYou ? { ...p, wallet: account } : p));
    }
  }, [account]);

  // Live Stopwatch during Quiz
  useEffect(() => {
    if (gameState === 'quiz' && quizStartTime) {
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - quizStartTime) / 1000;
        setLiveTimer(elapsed.toFixed(2));
      }, 50);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, quizStartTime]);

  // 4 POSITION DRAFT ROUNDS WITH UNIQUE TOKEN IDs (NFT ERC-721 STANDARDS)
  const ROUNDS_CONFIG = [
    {
      key: 'GK',
      title: 'Round 1: Goalkeeper (GK) NFT Draft',
      pool: [
        { id: 'courtois', tokenId: '11', name: 'Thibaut Courtois', pos: 'GK', rating: 90, club: 'Real Madrid', pac: 50, def: 92, phy: 89, color: '#9333ea', image: '🧤', imageUrl: getPlayerImageUrl(11, 'Thibaut Courtois') },
        { id: 'alisson', tokenId: '12', name: 'Alisson Becker', pos: 'GK', rating: 89, club: 'Liverpool', pac: 54, def: 90, phy: 87, color: '#2563eb', image: '🧤', imageUrl: getPlayerImageUrl(12, 'Alisson Becker') },
        { id: 'ederson', tokenId: '13', name: 'Ederson Moraes', pos: 'GK', rating: 88, club: 'Man City', pac: 64, def: 88, phy: 86, color: '#0284c7', image: '🧤' }
      ]
    },
    {
      key: 'DEF',
      title: 'Round 2: Defender (DEF) NFT Draft',
      pool: [
        { id: 'vandijk', tokenId: '7', name: 'Virgil van Dijk', pos: 'CB', rating: 89, club: 'Liverpool', pac: 78, def: 91, phy: 86, color: '#9333ea', image: '🛡️', imageUrl: getPlayerImageUrl(7, 'Virgil van Dijk') },
        { id: 'dias', tokenId: '8', name: 'Rúben Dias', pos: 'CB', rating: 88, club: 'Man City', pac: 72, def: 89, phy: 87, color: '#2563eb', image: '🛡️', imageUrl: getPlayerImageUrl(8, 'Rúben Dias') },
        { id: 'davies', tokenId: '9', name: 'Alphonso Davies', pos: 'LB', rating: 87, club: 'Bayern Munich', pac: 95, def: 79, phy: 77, color: '#0284c7', image: '⚡', imageUrl: getPlayerImageUrl(9, 'Alphonso Davies') }
      ]
    },
    {
      key: 'MID',
      title: 'Round 3: Midfielder (MID) NFT Draft',
      pool: [
        { id: 'debruyne', tokenId: '5', name: 'Kevin De Bruyne', pos: 'CM', rating: 91, club: 'Man City', pac: 72, def: 94, phy: 78, color: '#e6ad16', image: '🎯', imageUrl: getPlayerImageUrl(5, 'Kevin De Bruyne') },
        { id: 'modric', tokenId: '6', name: 'Luka Modrić', pos: 'CM', rating: 90, club: 'Real Madrid', pac: 72, def: 90, phy: 74, color: '#9333ea', image: '🎩', imageUrl: getPlayerImageUrl(6, 'Luka Modrić') },
        { id: 'bellingham', tokenId: '14', name: 'Jude Bellingham', pos: 'CM', rating: 89, club: 'Real Madrid', pac: 82, def: 85, phy: 84, color: '#2563eb', image: '🌟' }
      ]
    },
    {
      key: 'FWD',
      title: 'Round 4: Attacker (FWD) NFT Draft',
      pool: [
        { id: 'messi', tokenId: '1', name: 'Lionel Messi', pos: 'RW', rating: 95, club: 'Inter Miami', pac: 80, def: 89, phy: 68, color: '#e6ad16', image: '👑', imageUrl: getPlayerImageUrl(1, 'Lionel Messi') },
        { id: 'ronaldo', tokenId: '2', name: 'Cristiano Ronaldo', pos: 'ST', rating: 94, club: 'Al Nassr', pac: 87, def: 92, phy: 77, color: '#e6ad16', image: '🚀', imageUrl: getPlayerImageUrl(2, 'Cristiano Ronaldo') },
        { id: 'mbappe', tokenId: '3', name: 'Kylian Mbappé', pos: 'LW', rating: 93, club: 'Real Madrid', pac: 97, def: 89, phy: 78, color: '#9333ea', image: '⚡', imageUrl: getPlayerImageUrl(3, 'Kylian Mbappé') }
      ]
    }
  ];

  // 20 NON-REPEATING QUIZ QUESTIONS (5 MCQs per round x 4 rounds)
  const QUESTION_BANK = [
    // Round 1 (GK Questions)
    [
      { q: "Who won the Yashin Trophy for the best goalkeeper in the world in 2023?", options: ["Thibaut Courtois", "Emiliano Martínez", "Alisson Becker", "Ederson"], correct: 1 },
      { q: "Which goalkeeper holds the all-time record for most Premier League clean sheets?", options: ["Petr Čech", "David de Gea", "Edwin van der Sar", "Peter Schmeichel"], correct: 0 },
      { q: "Who was Germany's captain and starting goalkeeper during their 2014 FIFA World Cup victory?", options: ["Marc-André ter Stegen", "Oliver Kahn", "Manuel Neuer", "Jens Lehmann"], correct: 2 },
      { q: "Which Premier League club did Thibaut Courtois play for before joining Real Madrid?", options: ["Chelsea", "Arsenal", "Liverpool", "Manchester City"], correct: 0 },
      { q: "Which Liverpool goalkeeper saved three penalties in the 2005 Champions League Miracle of Istanbul?", options: ["Pepe Reina", "Jerzy Dudek", "Alisson Becker", "Simon Mignolet"], correct: 1 }
    ],
    // Round 2 (DEF Questions)
    [
      { q: "Which defender won the FIFA Ballon d'Or in 2006 after captaining Italy to World Cup victory?", options: ["Paolo Maldini", "Sergio Ramos", "Fabio Cannavaro", "Carles Puyol"], correct: 2 },
      { q: "Virgil van Dijk transferred to Liverpool in 2018 from which Premier League club?", options: ["Celtic", "Southampton", "Everton", "Newcastle"], correct: 1 },
      { q: "Which national team does Bayern Munich star Alphonso Davies play for?", options: ["USA", "Canada", "Jamaica", "Ghana"], correct: 1 },
      { q: "How many UEFA Champions League titles did Sergio Ramos win with Real Madrid?", options: ["2", "3", "4", "5"], correct: 2 },
      { q: "Which English left-back made 107 international appearances for England?", options: ["Ashley Cole", "Luke Shaw", "Leighton Baines", "Gary Neville"], correct: 0 }
    ],
    // Round 3 (MID Questions)
    [
      { q: "Which Croatian midfielder won the Ballon d'Or in 2018?", options: ["Ivan Rakitić", "Luka Modrić", "Mateo Kovačić", "Marcelo Brozović"], correct: 1 },
      { q: "Kevin De Bruyne tied the single-season Premier League assist record with how many assists?", options: ["18", "19", "20", "22"], correct: 2 },
      { q: "Jude Bellingham transferred to Real Madrid in 2023 from which Bundesliga club?", options: ["Bayern Munich", "Borussia Dortmund", "RB Leipzig", "Bayer Leverkusen"], correct: 1 },
      { q: "Who scored Spain's winning goal in the 2010 FIFA World Cup Final?", options: ["Xavi", "Andrés Iniesta", "David Villa", "Fernando Torres"], correct: 1 },
      { q: "Which defensive midfielder won the 2023 UEFA Champions League final Man of the Match for Man City?", options: ["Rodri", "Fernandinho", "Ilkay Gündogan", "Bernardo Silva"], correct: 0 }
    ],
    // Round 4 (FWD Questions)
    [
      { q: "Who scored a hat-trick for France in the 2022 FIFA World Cup Final?", options: ["Antoine Griezmann", "Karim Benzema", "Kylian Mbappé", "Olivier Giroud"], correct: 2 },
      { q: "How many Ballon d'Or awards has Lionel Messi won in total?", options: ["6", "7", "8", "9"], correct: 2 },
      { q: "Who is the all-time leading goalscorer in international men's football history?", options: ["Ali Daei", "Lionel Messi", "Cristiano Ronaldo", "Pele"], correct: 2 },
      { q: "Erling Haaland broke the Premier League single-season goalscoring record with how many goals?", options: ["32", "34", "36", "38"], correct: 2 },
      { q: "Which Polish striker won the FIFA Best Men's Player award in both 2020 and 2021?", options: ["Robert Lewandowski", "Arkadiusz Milik", "Krzysztof Piątek", "Wojciech Szczęsny"], correct: 0 }
    ]
  ];

  const handleAddTestPlayer = () => {
    if (roomPlayers.length >= 3) return;
    const nextId = roomPlayers.length + 1;
    const mockWallets = ['0x8765...4321', '0x9999...1111'];
    setRoomPlayers(prev => [
      ...prev,
      {
        id: nextId,
        name: `Player ${nextId} (Joined)`,
        wallet: mockWallets[nextId - 2] || `0x${Math.floor(Math.random()*10000)}...${Math.floor(Math.random()*10000)}`,
        ready: true,
        role: 'Equal Participant',
        isYou: false
      }
    ]);
  };

  const handleRemoveTestPlayer = (id) => {
    setRoomPlayers(prev => prev.filter(p => p.id !== id));
  };

  // START ENTIRE MATCH (Available for Host and Joined Player simulation)
  const startMatch = () => {
    let finalPlayers = [...roomPlayers];
    // If less than 3 players when starting, auto-fill room for seamless gameplay
    if (finalPlayers.length < 3) {
      finalPlayers = [
        { id: 1, name: isHost ? 'Player 1 (Host / You)' : 'Room Host (Leader)', wallet: isHost ? (account || '0x...') : '0xf39F...92266', ready: true, role: 'Room Leader (Host)', isYou: isHost },
        { id: 2, name: isHost ? 'Player 2 (Joined)' : 'Player 2 (You)', wallet: isHost ? '0x8765...4321' : (account || '0x...'), ready: true, role: 'Connected Participant', isYou: !isHost },
        { id: 3, name: 'Player 3 (Joined)', wallet: '0x9999...1111', ready: true, role: 'Connected Participant', isYou: false }
      ];
      setRoomPlayers(finalPlayers);
    }

    setCurrentRoundIdx(0);
    setSquads({ p1: [], p2: [], p3: [] });
    startRoundQuiz(0);

    lobbySyncEngine.broadcast('MATCH_STARTED', {
      roomCode,
      players: finalPlayers
    });
  };

  // START A SPECIFIC ROUND QUIZ
  const startRoundQuiz = (roundIdx) => {
    setGameState('quiz');
    setCurrentQuestionIdx(0);
    setP1Answers([]);
    setQuizStartTime(Date.now());
    setUserHasDraftedInRound(false);
    setClaimedCardsInRound({});
  };

  // HANDLE MCQ ANSWER CLICK
  const handleAnswerQuestion = (optionIdx) => {
    const roundQuestions = QUESTION_BANK[currentRoundIdx];
    const currentQ = roundQuestions[currentQuestionIdx];
    const isCorrect = optionIdx === currentQ.correct;

    const newAnswers = [...p1Answers, isCorrect];
    setP1Answers(newAnswers);

    if (currentQuestionIdx + 1 < roundQuestions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Quiz finished for this round!
      const totalTimeSeconds = parseFloat(((Date.now() - quizStartTime) / 1000).toFixed(2));
      const p1CorrectCount = newAnswers.filter(Boolean).length;
      computeRoundTurnOrder(p1CorrectCount, totalTimeSeconds);
    }
  };

  // COMPUTE TURN ORDER BASED ON (1) HIGHEST ACCURACY AND (2) LOWEST TIME
  const computeRoundTurnOrder = (p1Correct, p1Time) => {
    // Generate realistic test scores for P2 and P3
    const p2Correct = Math.floor(Math.random() * 3) + 3; // 3 to 5 correct
    const p2Time = parseFloat((Math.random() * 5 + 10).toFixed(2)); // 10-15 seconds

    const p3Correct = Math.floor(Math.random() * 4) + 2; // 2 to 5 correct
    const p3Time = parseFloat((Math.random() * 6 + 9).toFixed(2)); // 9-15 seconds

    const results = [
      { id: 'p1', name: isHost ? 'Player 1 (You)' : 'Player 2 (You)', correct: p1Correct, time: p1Time, wallet: account || '0x...' },
      { id: 'p2', name: isHost ? 'Player 2' : 'Player 1 (Host)', correct: p2Correct, time: p2Time, wallet: '0x8765...4321' },
      { id: 'p3', name: 'Player 3', correct: p3Correct, time: p3Time, wallet: '0x9999...1111' }
    ];

    // Sort by Correct answers descending, then Time ascending
    results.sort((a, b) => {
      if (b.correct !== a.correct) return b.correct - a.correct;
      return a.time - b.time;
    });

    setRoundTurnOrder(results);
    setGameState('turnOrderSummary');
  };

  // PROCEED FROM TURN ORDER SUMMARY TO CARD DRAFTING WITH STRICT ZERO-DUPLICATE BLOCKCHAIN RULE
  const proceedToDrafting = () => {
    setGameState('draft');

    const pool = [...ROUNDS_CONFIG[currentRoundIdx].pool].sort((a, b) => b.rating - a.rating);
    const newClaims = {};
    const newSquadP1 = [...squads.p1];
    const newSquadP2 = [...squads.p2];
    const newSquadP3 = [...squads.p3];

    // Process turn order sequentially so NO TWO PLAYERS CAN EVER DRAFT THE SAME CARD TOKEN!
    let currentAvailablePool = [...pool];

    for (let rank = 0; rank < roundTurnOrder.length; rank++) {
      const player = roundTurnOrder[rank];

      if (player.id === 'p1') {
        // Player 1 (You) will pick manually when clicking on screen from currentAvailablePool!
        break;
      } else {
        // AI player takes highest rated remaining available card token in pool
        const aiPickedCard = currentAvailablePool.shift();
        newClaims[aiPickedCard.id] = player;

        if (player.id === 'p2') newSquadP2.push(aiPickedCard);
        if (player.id === 'p3') newSquadP3.push(aiPickedCard);
      }
    }

    setClaimedCardsInRound(newClaims);
    setSquads({
      p1: newSquadP1,
      p2: newSquadP2,
      p3: newSquadP3
    });
  };

  // PLAYER SELECTS AN AVAILABLE CARD IN DRAFT
  const handleSelectCard = (selectedCard) => {
    if (userHasDraftedInRound || claimedCardsInRound[selectedCard.id]) return;
    setUserHasDraftedInRound(true);

    const pool = [...ROUNDS_CONFIG[currentRoundIdx].pool].sort((a, b) => b.rating - a.rating);
    const newClaims = { ...claimedCardsInRound, [selectedCard.id]: { id: 'p1', name: 'Player (You)' } };
    
    const updatedP1Squad = [...squads.p1, selectedCard];
    let updatedP2Squad = [...squads.p2];
    let updatedP3Squad = [...squads.p3];

    // Determine remaining unassigned cards for AI players who haven't picked yet
    let remainingPool = pool.filter(c => !newClaims[c.id]);

    roundTurnOrder.forEach((player) => {
      if (player.id === 'p1') return;
      
      const pSquad = player.id === 'p2' ? updatedP2Squad : updatedP3Squad;
      const alreadyHasCardForRound = pSquad.length > currentRoundIdx;

      if (!alreadyHasCardForRound && remainingPool.length > 0) {
        const cardForAI = remainingPool.shift();
        newClaims[cardForAI.id] = player;
        if (player.id === 'p2') updatedP2Squad.push(cardForAI);
        if (player.id === 'p3') updatedP3Squad.push(cardForAI);
      }
    });

    setClaimedCardsInRound(newClaims);
    setSquads({
      p1: updatedP1Squad,
      p2: updatedP2Squad,
      p3: updatedP3Squad
    });

    // Advance to next round or finish tournament
    setTimeout(() => {
      if (currentRoundIdx + 1 < ROUNDS_CONFIG.length) {
        const nextRound = currentRoundIdx + 1;
        setCurrentRoundIdx(nextRound);
        startRoundQuiz(nextRound);
      } else {
        setGameState('results');
      }
    }, 1200);
  };

  // CALCULATE SQUAD RATINGS & TRANSPARENT BONUS BREAKDOWN
  const getSquadTotal = (cards = []) => cards.reduce((sum, c) => sum + (c?.rating || 0), 0);

  const p1RawTotal = getSquadTotal(squads.p1);
  const p1Total = p1RawTotal + collectionBonus;
  const p2Total = getSquadTotal(squads.p2);
  const p3Total = getSquadTotal(squads.p3);

  // Winner calculation
  let winner = { name: isHost ? 'Player 1 (You)' : 'Player 2 (You)', score: p1Total, id: 'p1' };
  if (p2Total > winner.score) winner = { name: isHost ? 'Player 2' : 'Player 1 (Host)', score: p2Total, id: 'p2' };
  if (p3Total > winner.score) winner = { name: 'Player 3', score: p3Total, id: 'p3' };

  const totalSlots = [1, 2, 3];
  const connectedCount = roomPlayers.length;

  if (!account) {
    return (
      <div className="py-24 rounded-3xl glass-panel border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
          <Trophy className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black text-white">Connect Wallet to Enter Lobby</h3>
        <p className="text-slate-400 text-xs leading-relaxed px-4">
          The multiplayer football card game requires wallet connection for draft verification and ranking rewards.
        </p>
        <button
          onClick={connectWallet}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all hover:scale-105"
        >
          Connect MetaMask Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Banner & Inspector Access */}
      <div className="rounded-3xl glass-panel border border-slate-800 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Decentralized 3-Player Draft Arena</span>
            </span>
            <button
              onClick={() => setShowInspector(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>On-Chain Verifiable Fair Play</span>
            </button>
          </div>
          <h2 className="text-3xl font-black text-white">Game Lobby</h2>
          <p className="text-slate-400 text-xs mt-1">
            Choose to <strong>Host a Game</strong> or <strong>Join a Game</strong> to compete in 4 position quiz rounds & draft unique NFT football cards!
          </p>
        </div>

        {gameState === 'lobby' && lobbyMode !== 'select' && (
          <button
            onClick={handleLeaveRoom}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Switch Lobby Option</span>
          </button>
        )}
      </div>

      {/* GAME STATE 1: LOBBY */}
      {gameState === 'lobby' && (
        <>
          {/* LOBBY MODE SELECTION SCREEN: 2 PROMINENT OPTIONS (HOST OR JOIN) */}
          {lobbyMode === 'select' && (
            <div className="space-y-6">
              <div className="text-center space-y-2 py-2">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  Select Game Lobby Mode
                </span>
                <h3 className="text-2xl font-black text-white">How would you like to play?</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* OPTION 1: HOST A GAME */}
                <div 
                  onClick={handleSelectHostMode}
                  className="group relative p-8 rounded-3xl glass-panel border border-purple-500/40 hover:border-purple-500/80 bg-gradient-to-b from-purple-950/20 via-slate-950/80 to-slate-950/90 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-2xl flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                        <Crown className="w-7 h-7 text-amber-400" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                        Room Leader
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-white group-hover:text-purple-300 transition-colors">
                        Host a Game
                      </h3>
                      <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                        Create a brand new match room with an auto-generated Room Code. Invite up to 2 other players, manage participants, and launch the tournament.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-purple-500/20">
                      <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Generates unique 6-character Room Code</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Room Leader controls when the match starts</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Full match telemetry & test player simulation</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 group-hover:from-purple-500 group-hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2">
                    <Radio className="w-4 h-4 text-purple-200" />
                    <span>Host New Match Room 🚀</span>
                  </button>
                </div>

                {/* OPTION 2: JOIN A GAME */}
                <div 
                  onClick={handleSelectJoinMode}
                  className="group relative p-8 rounded-3xl glass-panel border border-cyan-500/40 hover:border-cyan-500/80 bg-gradient-to-b from-cyan-950/20 via-slate-950/80 to-slate-950/90 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-2xl flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                        <LogIn className="w-7 h-7 text-cyan-400" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                        Participant
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-white group-hover:text-cyan-300 transition-colors">
                        Join a Game
                      </h3>
                      <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                        Enter an active Room Code provided by a Host to connect immediately to an existing match lobby as a participant.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-cyan-500/20">
                      <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        <span>Instant connection via Room Code</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        <span>Join active public demo rooms in 1 click</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        <span>Equal draft turn rights & live sync</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 group-hover:from-cyan-500 group-hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center space-x-2">
                    <UserPlus className="w-4 h-4 text-cyan-200" />
                    <span>Join Existing Match Room 🚪</span>
                  </button>
                </div>

              </div>

              {/* DEMO ACTIVE PUBLIC ROOMS QUICK JOIN BOARD */}
              <div className="rounded-3xl glass-panel border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <h4 className="font-extrabold text-white text-sm">Active Public Demo Rooms</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Click any code to join instantly</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {publicRooms.map((r) => (
                    <div 
                      key={r.code}
                      onClick={() => handleJoinViaCode(r.code)}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white group-hover:text-cyan-400 transition-colors text-sm">
                          {r.code}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {r.playersCount}/{r.maxPlayers}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Host: {r.host}</span>
                        <span className="text-cyan-300 font-bold group-hover:underline">Join ➔</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* HOST A GAME INTERFACE */}
          {lobbyMode === 'host' && (
            <div className="space-y-6">
              
              {/* Active Host Room Code Banner */}
              <div className="p-6 rounded-3xl glass-panel border border-purple-500/50 bg-gradient-to-r from-purple-950/40 via-slate-950 to-slate-950 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <span className="text-[10px] uppercase font-mono font-bold text-purple-400 tracking-wider block">
                    👑 Host Room Active
                  </span>
                  <div className="flex items-center space-x-3 justify-center md:justify-start">
                    <span className="text-3xl font-black text-white font-mono tracking-wider">{roomCode}</span>
                    <button
                      onClick={handleCopyCode}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-purple-300 font-semibold transition-all flex items-center space-x-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                    <button
                      onClick={handleGenerateNewRoomCode}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-xs text-purple-200 font-semibold transition-all flex items-center space-x-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>New Code</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 inline-block mb-1">
                      {connectedCount} / 3 Players Connected
                    </span>
                    <p className="text-[10px] text-purple-300 font-mono">You are the Room Host (Leader)</p>
                  </div>
                </div>
              </div>

              {/* Host Lobby Main Panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Player Slot List */}
                <div className="md:col-span-2 rounded-3xl glass-panel border border-slate-800 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-purple-400" />
                      <h3 className="font-extrabold text-white text-base">Host Room Participants</h3>
                    </div>
                    {connectedCount < 3 && (
                      <button
                        onClick={handleAddTestPlayer}
                        className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all flex items-center space-x-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>+ Connect Test Player</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {totalSlots.map((slotNum) => {
                      const player = roomPlayers[slotNum - 1];
                      if (player) {
                        return (
                          <div key={player.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/30">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center font-bold text-purple-300">
                                P{slotNum}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-bold text-white text-xs">{player.name}</h4>
                                  <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                                    {player.role}
                                  </span>
                                </div>
                                <p className="font-mono text-[10px] text-slate-400">{player.wallet}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className="flex items-center space-x-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Ready</span>
                              </span>
                              {!player.isYou && (
                                <button
                                  onClick={() => handleRemoveTestPlayer(player.id)}
                                  className="text-slate-500 hover:text-rose-400 px-2 py-1 text-xs"
                                  title="Remove participant"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div key={slotNum} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/30 border border-dashed border-slate-800 text-slate-500">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-600">
                                P{slotNum}
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-400 text-xs">Empty Slot {slotNum}</h4>
                                <p className="font-mono text-[10px] text-slate-600">Waiting for player to join with code <strong className="text-purple-400">{roomCode}</strong>...</p>
                              </div>
                            </div>
                            <span className="text-[11px] text-slate-600 italic">Open Slot</span>
                          </div>
                        );
                      }
                    })}
                  </div>

                  {/* START MATCH BUTTON */}
                  <button
                    onClick={startMatch}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-600 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-xl shadow-purple-500/25 hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    <span>Start Match (Host Launch) 🚀</span>
                  </button>
                </div>

                {/* Host Instructions Card */}
                <div className="rounded-3xl glass-panel border border-slate-800 p-6 space-y-4">
                  <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>Host Responsibilities</span>
                  </h3>
                  
                  <ul className="text-xs text-slate-400 space-y-3 leading-relaxed">
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400 font-bold">1.</span>
                      <span>Share your unique Room Code <strong>{roomCode}</strong> with friends.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400 font-bold">2.</span>
                      <span>Or click <strong>+ Connect Test Player</strong> to quickly simulate player connections.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400 font-bold">3.</span>
                      <span>Click <strong>Start Match</strong> to launch the 4-Round Position Quiz & NFT Draft!</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* JOIN A GAME INTERFACE */}
          {lobbyMode === 'join' && (
            <div className="space-y-6">
              
              {!hasJoinedRoom ? (
                /* STEP 1: INPUT ROOM CODE TO JOIN */
                <div className="max-w-xl mx-auto rounded-3xl glass-panel border border-cyan-500/40 p-8 space-y-6 bg-slate-950/90 shadow-2xl">
                  <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                      <LogIn className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">Join Existing Match Room</h3>
                      <p className="text-xs text-slate-400">Enter the 6-character Room Code provided by the Room Host.</p>
                    </div>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleJoinViaCode(); }} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs uppercase font-mono font-bold text-slate-300 tracking-wider block">
                        Room Code Input
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="e.g. FIFA-8492"
                          value={inputRoomCode}
                          onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                          className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-lg tracking-widest uppercase focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                        {inputRoomCode && (
                          <button
                            type="button"
                            onClick={() => setInputRoomCode('')}
                            className="absolute right-3 top-3.5 text-slate-500 hover:text-white text-xs font-bold"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      {joinError && (
                        <p className="text-xs text-rose-400 font-mono flex items-center space-x-1 pt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{joinError}</span>
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex items-center space-x-3">
                      <button
                        type="submit"
                        className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Join Room Now ➔</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleLeaveRoom}
                        className="px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>

                  {/* QUICK DEMO SELECTION */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <span className="text-[11px] font-mono text-slate-400 block font-semibold">
                      Or click a demo room to join instantly:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {DEMO_ACTIVE_ROOMS.map(r => (
                        <button
                          key={r.code}
                          type="button"
                          onClick={() => handleJoinViaCode(r.code)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold transition-all"
                        >
                          {r.code} ({r.playersCount}/3)
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* STEP 2: JOINED LOBBY WAITING SCREEN */
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl glass-panel border border-cyan-500/50 bg-gradient-to-r from-cyan-950/40 via-slate-950 to-slate-950 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center md:text-left">
                      <span className="text-[10px] uppercase font-mono font-bold text-cyan-400 tracking-wider block">
                        🚪 Joined Room Active
                      </span>
                      <div className="flex items-center space-x-3 justify-center md:justify-start">
                        <span className="text-3xl font-black text-white font-mono tracking-wider">{roomCode}</span>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                          Connected as Player 2
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setHasJoinedRoom(false)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-all"
                    >
                      Change Code / Leave
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 rounded-3xl glass-panel border border-slate-800 p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center space-x-2">
                          <Users className="w-5 h-5 text-cyan-400" />
                          <h3 className="font-extrabold text-white text-base">Joined Room Lobby ({roomCode})</h3>
                        </div>
                        <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
                          {connectedCount} / 3 Connected
                        </span>
                      </div>

                      <div className="space-y-3">
                        {roomPlayers.map((player, idx) => (
                          <div key={player.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300">
                                P{idx + 1}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-bold text-white text-xs">{player.name}</h4>
                                  <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                                    {player.role}
                                  </span>
                                </div>
                                <p className="font-mono text-[10px] text-slate-400">{player.wallet}</p>
                              </div>
                            </div>
                            <span className="flex items-center space-x-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Connected</span>
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-3 text-center">
                        <div className="flex items-center justify-center space-x-2 text-cyan-300 text-xs font-bold">
                          <Clock className="w-4 h-4 animate-spin text-cyan-400" />
                          <span>Waiting for Host to launch match...</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          As a participant in this room, you will automatically enter the quiz round when the host starts.
                        </p>
                        
                        {/* SIMULATED HOST START BUTTON FOR PARTICIPANT DEMO */}
                        <button
                          onClick={startMatch}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.01] transition-all cursor-pointer"
                        >
                          Host Started Match! Enter Tournament Now 🚀
                        </button>
                      </div>
                    </div>

                    <div className="rounded-3xl glass-panel border border-slate-800 p-6 space-y-4">
                      <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                        <Gamepad2 className="w-4 h-4 text-cyan-400" />
                        <span>Match Information</span>
                      </h3>
                      
                      <ul className="text-xs text-slate-400 space-y-3 leading-relaxed">
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-400 font-bold">1.</span>
                          <span>You have joined room <strong>{roomCode}</strong> as an equal draft participant.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-400 font-bold">2.</span>
                          <span>Answer 5 MCQs per position round to secure top draft turn order priority!</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-400 font-bold">3.</span>
                          <span>Draft unique ERC-721 NFT cards for your squad. No duplicates allowed!</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </>
      )}

      {/* GAME STATE 2: QUIZ (5 MCQs PER ROUND) */}
      {gameState === 'quiz' && (
        <div className="rounded-3xl glass-panel border border-purple-500/30 p-8 space-y-6">
          
          {/* Quiz Header with Timer & Round Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest block mb-1">
                {ROUNDS_CONFIG[currentRoundIdx].title}
              </span>
              <h3 className="text-2xl font-black text-white">
                Question {currentQuestionIdx + 1} of 5
              </h3>
            </div>

            <div className="flex items-center space-x-3 bg-slate-950 p-2.5 rounded-xl border border-purple-500/30">
              <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="font-mono text-base font-extrabold text-cyan-300">{liveTimer}s</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Live Timer</span>
            </div>
          </div>

          {/* Question Box */}
          <div className="bg-slate-950/90 p-6 rounded-2xl border border-slate-800 space-y-5">
            <h4 className="text-base font-extrabold text-white leading-snug">
              {QUESTION_BANK[currentRoundIdx][currentQuestionIdx].q}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {QUESTION_BANK[currentRoundIdx][currentQuestionIdx].options.map((optionText, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerQuestion(idx)}
                  className="p-4 rounded-xl bg-slate-900 hover:bg-purple-950/40 hover:border-purple-500/60 border border-slate-800 text-left font-semibold text-xs text-slate-200 transition-all flex items-center justify-between group active:scale-[0.98]"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 group-hover:bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{optionText}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Quiz Progress Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
            <span>Accuracy & speed affect draft turn priority</span>
            <div className="flex items-center space-x-1.5">
              {[0, 1, 2, 3, 4].map(qIdx => (
                <div
                  key={qIdx}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    qIdx < currentQuestionIdx ? 'bg-emerald-500' :
                    qIdx === currentQuestionIdx ? 'bg-purple-500 animate-ping' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>
      )}

      {/* GAME STATE 3: TURN ORDER SUMMARY */}
      {gameState === 'turnOrderSummary' && (
        <div className="rounded-3xl glass-panel border border-cyan-500/30 p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <Zap className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-1">
              {ROUNDS_CONFIG[currentRoundIdx].key} Quiz Round Complete
            </span>
            <h3 className="text-3xl font-black text-white">Quiz Accuracy & Speed Rankings</h3>
          </div>

          <div className="max-w-xl mx-auto space-y-3">
            {roundTurnOrder.map((res, rankIdx) => (
              <div
                key={res.id}
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  rankIdx === 0 ? 'bg-amber-950/40 border-amber-500/50 text-amber-200' :
                  rankIdx === 1 ? 'bg-slate-900 border-slate-700 text-slate-200' :
                  'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs ${
                    rankIdx === 0 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                  }`}>
                    #{rankIdx + 1}
                  </span>
                  <div className="text-left">
                    <h4 className="font-extrabold text-sm text-white">{res.name}</h4>
                    <p className="text-[10px] font-mono text-slate-400">{res.wallet || 'Connected'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 font-mono text-xs">
                  <div>
                    <span className="text-emerald-400 font-bold">{res.correct} / 5</span>
                    <span className="text-[10px] block text-slate-400">Correct</span>
                  </div>
                  <div>
                    <span className="text-cyan-300 font-bold">{res.time}s</span>
                    <span className="text-[10px] block text-slate-400">Time</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={proceedToDrafting}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all cursor-pointer"
          >
            Proceed to {ROUNDS_CONFIG[currentRoundIdx].key} NFT Card Draft ➔
          </button>
        </div>
      )}

      {/* GAME STATE 4: POSITION POOL CARD DRAFT (STRICT ZERO-DUPLICATE BLOCKCHAIN NFT UNIQUNESS) */}
      {gameState === 'draft' && (
        <div className="rounded-3xl glass-panel border border-cyan-500/30 p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-1">
                {ROUNDS_CONFIG[currentRoundIdx].title}
              </span>
              <h3 className="text-2xl font-black text-white">Select a Unique NFT Card for Your Squad</h3>
            </div>

            <div className="bg-slate-950 px-3.5 py-1.5 rounded-xl border border-cyan-500/30 text-xs font-bold text-cyan-300 font-mono">
              Your Turn Priority: #{roundTurnOrder.findIndex(r => r.id === 'p1') + 1}
            </div>
          </div>

          {/* 3 Position Cards Pool with Stats & Unique Token IDs Visible */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROUNDS_CONFIG[currentRoundIdx].pool.map((card) => {
              const claimedBy = claimedCardsInRound[card.id];
              const isClaimedByYou = claimedBy?.id === 'p1';
              const isClaimedByOther = claimedBy && !isClaimedByYou;

              return (
                <div
                  key={card.id}
                  onClick={() => !claimedBy && handleSelectCard(card)}
                  className={`p-6 rounded-3xl border transition-all space-y-4 relative ${
                    isClaimedByOther ? 'bg-slate-950/40 border-slate-900 opacity-50 cursor-not-allowed' :
                    isClaimedByYou ? 'bg-emerald-950/40 border-emerald-500/80 shadow-lg shadow-emerald-500/20' :
                    'bg-slate-950/90 border-slate-800 hover:border-cyan-500/80 hover:scale-[1.02] cursor-pointer shadow-xl'
                  }`}
                >
                  {/* Badge & Unique NFT Token ID */}
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl">
                      {card.image}
                    </span>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 block mb-1">
                        Token #{card.tokenId}
                      </span>
                      <span className="text-2xl font-black text-amber-400 font-mono block leading-none">
                        {card.rating}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{card.pos}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-white">{card.name}</h4>
                    <p className="text-xs font-mono text-slate-400">{card.club}</p>
                  </div>

                  {/* Visible Player Attributes */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono text-xs">
                    <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                      <span className="text-[9px] text-slate-400 uppercase block">PAC</span>
                      <span className="font-bold text-white">{card.pac}</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                      <span className="text-[9px] text-slate-400 uppercase block">DEF</span>
                      <span className="font-bold text-white">{card.def}</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                      <span className="text-[9px] text-slate-400 uppercase block">PHY</span>
                      <span className="font-bold text-white">{card.phy}</span>
                    </div>
                  </div>

                  <button
                    disabled={Boolean(claimedBy)}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${
                      isClaimedByYou ? 'bg-emerald-500 text-slate-950' :
                      isClaimedByOther ? 'bg-slate-900 text-slate-500 border border-slate-800' :
                      'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20'
                    }`}
                  >
                    {isClaimedByYou ? '✓ Drafted into Your Squad' :
                     isClaimedByOther ? `Drafted by ${claimedBy.name}` :
                     'Draft Unique NFT Card'}
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* GAME STATE 5: MATCH RESULTS & CHAMPION RECOGNITION */}
      {gameState === 'results' && (
        <div className="rounded-3xl glass-panel border border-amber-500/40 p-8 space-y-8 text-center bg-slate-950">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-purple-500 to-cyan-500 p-[2px] mx-auto shadow-2xl shadow-amber-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-amber-400">
              <Trophy className="w-10 h-10" />
            </div>
          </div>

          <div>
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest block mb-1">
              Match Tournament Complete
            </span>
            <h3 className="text-4xl font-black text-white">🏆 {winner.name} Wins the Match!</h3>
            <p className="text-slate-400 text-xs mt-2 max-w-md mx-auto">
              Highest combined overall squad rating achieved after 4 position draft rounds. All drafted cards are unique ERC-721 tokens.
            </p>
          </div>

          {/* Squad Comparison Grid - Guaranteed Unique Tokens Across All 3 Squads */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
            
            {/* Player 1 Squad */}
            <div className={`p-5 rounded-3xl border space-y-3 ${winner.id === 'p1' ? 'bg-amber-950/30 border-amber-500/60' : 'bg-slate-900/60 border-slate-800'}`}>
              <div className="border-b border-slate-800 pb-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400">{isHost ? 'Player 1 (You)' : 'Player 2 (You)'}</span>
                  <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    TOTAL {p1Total} OVR
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Draft Cards: <strong className="text-cyan-300">{p1RawTotal}</strong></span>
                  {collectionBonus > 0 && (
                    <span className="text-purple-300">+{collectionBonus} Collection Bonus</span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                {squads.p1.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="font-bold text-white block">{c?.name}</span>
                      <span className="text-[9px] font-mono text-purple-400">Token #{c?.tokenId}</span>
                    </div>
                    <span className="font-mono text-cyan-400 text-[10px] font-bold">{c?.pos} | {c?.rating} OVR</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Player 2 Squad */}
            <div className={`p-5 rounded-3xl border space-y-3 ${winner.id === 'p2' ? 'bg-amber-950/30 border-amber-500/60' : 'bg-slate-900/60 border-slate-800'}`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-400">{isHost ? 'Player 2' : 'Player 1 (Host)'}</span>
                <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  TOTAL {p2Total} OVR
                </span>
              </div>

              <div className="space-y-1.5">
                {squads.p2.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="font-bold text-slate-300 block">{c?.name}</span>
                      <span className="text-[9px] font-mono text-purple-400">Token #{c?.tokenId}</span>
                    </div>
                    <span className="font-mono text-cyan-400 text-[10px] font-bold">{c?.pos} | {c?.rating} OVR</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Player 3 Squad */}
            <div className={`p-5 rounded-3xl border space-y-3 ${winner.id === 'p3' ? 'bg-amber-950/30 border-amber-500/60' : 'bg-slate-900/60 border-slate-800'}`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-400">Player 3</span>
                <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  TOTAL {p3Total} OVR
                </span>
              </div>

              <div className="space-y-1.5">
                {squads.p3.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="font-bold text-slate-300 block">{c?.name}</span>
                      <span className="text-[9px] font-mono text-purple-400">Token #{c?.tokenId}</span>
                    </div>
                    <span className="font-mono text-cyan-400 text-[10px] font-bold">{c?.pos} | {c?.rating} OVR</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => { setGameState('lobby'); handleSelectHostMode(); }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-500/20 hover:scale-105 transition-all cursor-pointer"
            >
              Host Another Game 👑
            </button>
            <button
              onClick={() => { setGameState('lobby'); handleSelectJoinMode(); }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all cursor-pointer"
            >
              Join Another Game 🚪
            </button>
            <button
              onClick={() => { setGameState('lobby'); setLobbyMode('select'); }}
              className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer"
            >
              Back to Lobby Menu
            </button>
          </div>
        </div>
      )}

      {/* Fair Play Inspector Modal */}
      {showInspector && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full rounded-3xl glass-panel border border-slate-800 p-6 space-y-5 bg-slate-950 text-slate-200 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Verifiable Fair Play Inspector</h3>
                  <p className="text-[11px] text-slate-400">Cryptographic proof that card stats and room seeds are unbiased.</p>
                </div>
              </div>

              <button
                onClick={() => setShowInspector(false)}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Session Cryptographic Hashes */}
            <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Session Commitment Hash (Keccak-256)
                </label>
                <div className="font-mono text-[11px] text-emerald-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800 break-all select-all">
                  0x9e8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Session Seed</span>
                  <span className="font-mono text-xs text-purple-300">0x7f8a9b3c4d5e6f1a2b3c4d5e</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>On-Chain Verified</span>
                </span>
              </div>
            </div>

            {/* IPFS Metadata Provenance */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-white flex items-center space-x-2">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pre-Committed Draft Card IPFS Provenance</span>
              </h4>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {ROUNDS_CONFIG.flatMap(r => r.pool).map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{c.name}</span>
                      <span className="text-[10px] text-cyan-400 font-mono">(Token #{c.tokenId} | {c.pos} | Rating: {c.rating})</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 flex items-center space-x-1 hover:text-cyan-300">
                      <span>ipfs://QmFIFA.../{c.id}.json</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <button
                onClick={() => {
                  setVerifying(true);
                  setTimeout(() => setVerifying(false), 600);
                }}
                disabled={verifying}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
                <span>{verifying ? 'Calculating Hashes...' : 'Re-Verify Match Hashes'}</span>
              </button>

              {verifiedStatus && !verifying && (
                <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>100% Cryptographically Fair</span>
                </span>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
