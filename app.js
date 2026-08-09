/**
 * Next Station: Berlin - Deck Companion
 * Base Game Destination Deck Helper
 */

document.addEventListener('DOMContentLoaded', () => {
    // Color definitions
    const COLORS = [
        { name: 'Pink Line', color: '#e6007e' },
        { name: 'Blue Line', color: '#0099db' },
        { name: 'Green Line', color: '#00964e' },
        { name: 'Yellow Line', color: '#f5a623' }
    ];

    // Card definitions
    // 5 Underground (Pink frame) + 6 Street (Blue frame) = 11 cards
    const BASE_DECK = [
        { id: 'u_circle', type: 'underground', symbol: 'circle', name: 'Circle Station' },
        { id: 'u_square', type: 'underground', symbol: 'square', name: 'Square Station' },
        { id: 'u_triangle', type: 'underground', symbol: 'triangle', name: 'Triangle Station' },
        { id: 'u_pentagon', type: 'underground', symbol: 'pentagon', name: 'Pentagon Station' },
        { id: 'u_wild', type: 'underground', symbol: 'wild', name: 'Wild Station (Joker)' },

        { id: 's_circle', type: 'street', symbol: 'circle', name: 'Circle Station' },
        { id: 's_square', type: 'street', symbol: 'square', name: 'Square Station' },
        { id: 's_triangle', type: 'street', symbol: 'triangle', name: 'Triangle Station' },
        { id: 's_pentagon', type: 'street', symbol: 'pentagon', name: 'Pentagon Station' },
        { id: 's_wild', type: 'street', symbol: 'wild', name: 'Wild Station (Joker)' },
        { id: 's_switch', type: 'street', symbol: 'switch', name: 'Railroad Switch' }
    ];

    // App State
    let roundColorsSequence = [];
    let currentRoundIndex = 0; // 0 to 3
    let deck = [];
    let revealedCards = [];
    let undergroundCount = 0;
    let isRoundOver = false;
    let isGameOver = false;
    let completedRoundsData = [];

    // DOM Elements
    const roundNumberEl = document.getElementById('roundNumber');
    const lineBadgeEl = document.getElementById('lineBadge');
    const lineDotEl = document.getElementById('lineDot');
    const lineNameEl = document.getElementById('lineName');
    const trackerCountEl = document.getElementById('trackerCount');

    const cardDisplayEl = document.getElementById('cardDisplay');
    const cardTypeLabelEl = document.getElementById('cardTypeLabel');
    const cardSymbolContainerEl = document.getElementById('cardSymbolContainer');
    const cardNameLabelEl = document.getElementById('cardNameLabel');

    const secondaryCardDisplayEl = document.getElementById('secondaryCardDisplay');
    const secondaryCardTypeLabelEl = document.getElementById('secondaryCardTypeLabel');
    const secondaryCardSymbolContainerEl = document.getElementById('secondaryCardSymbolContainer');
    const secondaryCardNameLabelEl = document.getElementById('secondaryCardNameLabel');

    const alertBannerEl = document.getElementById('alertBanner');
    const primaryBtn = document.getElementById('primaryBtn');
    const restartBtn = document.getElementById('restartBtn');

    const historyCardsEl = document.getElementById('historyCards');
    const cardsDrawnCountEl = document.getElementById('cardsDrawnCount');
    const completedRoundsPanelEl = document.getElementById('completedRoundsPanel');
    const completedRoundsContainerEl = document.getElementById('completedRoundsContainer');

    // Utility: SVG Generators for symbols
    function getSymbolSvg(symbol, color = 'currentColor', size = 120) {
        switch (symbol) {
            case 'circle':
                return `<svg viewBox="0 0 100 100" class="card-symbol-svg" style="color: ${color}">
                    <circle cx="50" cy="50" r="40" fill="currentColor" stroke="none" />
                </svg>`;
            case 'square':
                return `<svg viewBox="0 0 100 100" class="card-symbol-svg" style="color: ${color}">
                    <rect x="12" y="12" width="76" height="76" rx="8" fill="currentColor" stroke="none" />
                </svg>`;
            case 'triangle':
                return `<svg viewBox="0 0 100 100" class="card-symbol-svg" style="color: ${color}">
                    <polygon points="50,10 90,85 10,85" fill="currentColor" stroke="none" />
                </svg>`;
            case 'pentagon':
                return `<svg viewBox="0 0 100 100" class="card-symbol-svg" style="color: ${color}">
                    <polygon points="50,10 92,40 76,88 24,88 8,40" fill="currentColor" stroke="none" />
                </svg>`;
            case 'wild':
                return `<svg viewBox="0 0 100 100" class="card-symbol-svg" style="color: ${color}">
                    <polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" fill="currentColor" stroke="none" />
                </svg>`;
            case 'switch':
                return `<svg viewBox="0 0 100 100" class="card-symbol-svg" style="color: ${color}">
                    <!-- Main line -->
                    <path d="M 15 50 L 85 50" stroke="currentColor" stroke-width="12" stroke-linecap="round"/>
                    <!-- Branching line up -->
                    <path d="M 40 50 Q 60 50 80 20" stroke="currentColor" stroke-width="12" fill="none" stroke-linecap="round"/>
                    <!-- Arrow heads -->
                    <polygon points="85,50 70,40 70,60" fill="currentColor" />
                    <polygon points="80,20 65,15 72,32" fill="currentColor" />
                    <!-- Circle node at split -->
                    <circle cx="40" cy="50" r="10" fill="#ffffff" stroke="currentColor" stroke-width="6"/>
                </svg>`;
            default:
                return '';
        }
    }

    // Helper: Fisher-Yates Shuffle
    function shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // Initialize New Game
    function startNewGame() {
        // Randomize the 4 line colors sequence
        roundColorsSequence = shuffle(COLORS);
        currentRoundIndex = 0;
        isGameOver = false;
        completedRoundsData = [];

        completedRoundsPanelEl.classList.add('hidden');
        completedRoundsContainerEl.innerHTML = '';

        startRound(currentRoundIndex);
    }

    // Start a specific round (0 to 3)
    function startRound(roundIdx) {
        currentRoundIndex = roundIdx;
        deck = shuffle(BASE_DECK);
        revealedCards = [];
        undergroundCount = 0;
        isRoundOver = false;

        const currentLine = roundColorsSequence[currentRoundIndex];

        // Update Round & Line info
        roundNumberEl.textContent = `${currentRoundIndex + 1} / 4`;
        lineDotEl.style.backgroundColor = currentLine.color;
        lineNameEl.textContent = currentLine.name;

        // Reset Tracker
        updateTrackerUI();

        // Reset Main Card Display
        cardDisplayEl.className = 'card-card';
        cardTypeLabelEl.textContent = `ROUND ${currentRoundIndex + 1}: ${currentLine.name.toUpperCase()}`;
        cardSymbolContainerEl.innerHTML = `<div class="placeholder-icon">🎴</div>`;
        cardNameLabelEl.textContent = 'Press Flip Card to Start';

        secondaryCardDisplayEl.classList.add('hidden');

        // Reset Alert Banner
        hideAlert();

        // Reset Buttons
        primaryBtn.textContent = 'Flip Card';
        primaryBtn.classList.remove('hidden');

        // Reset History
        historyCardsEl.innerHTML = '<span class="empty-history">No cards revealed yet in this round.</span>';
        cardsDrawnCountEl.textContent = '0';
    }

    // Flip Card Logic
    function flipCard() {
        if (isGameOver) {
            startNewGame();
            return;
        }

        if (isRoundOver) {
            finishRoundAndAdvance();
            return;
        }

        if (deck.length === 0) {
            // Safety check
            endCurrentRound();
            return;
        }

        // Trigger animation on card container
        cardDisplayEl.classList.remove('flip-anim');
        void cardDisplayEl.offsetWidth; // trigger reflow
        cardDisplayEl.classList.add('flip-anim');

        secondaryCardDisplayEl.classList.add('hidden');
        hideAlert();

        const card = deck.pop();
        revealedCards.push(card);

        renderCard(card, cardDisplayEl, cardTypeLabelEl, cardSymbolContainerEl, cardNameLabelEl);

        // Check if Underground card
        if (card.type === 'underground') {
            undergroundCount++;
            updateTrackerUI();
        }

        // Add to history UI
        addCardToHistory(card);

        // Handle Switch Card Logic
        if (card.symbol === 'switch') {
            showAlert('banner-info', '⇄ RAILROAD SWITCH! You can branch from any station on your line. Flipping next card...');
            
            // Per Next Station rules: Draw the next card immediately to pair with the switch card!
            if (deck.length > 0) {
                setTimeout(() => {
                    const nextCard = deck.pop();
                    revealedCards.push(nextCard);

                    secondaryCardDisplayEl.classList.remove('hidden');
                    secondaryCardDisplayEl.classList.remove('flip-anim');
                    void secondaryCardDisplayEl.offsetWidth;
                    secondaryCardDisplayEl.classList.add('flip-anim');

                    renderCard(nextCard, secondaryCardDisplayEl, secondaryCardTypeLabelEl, secondaryCardSymbolContainerEl, secondaryCardNameLabelEl);

                    if (nextCard.type === 'underground') {
                        undergroundCount++;
                        updateTrackerUI();
                    }

                    addCardToHistory(nextCard);

                    checkRoundEndState();
                }, 400);
                return;
            }
        }

        checkRoundEndState();
    }

    // Render single card details to DOM elements
    function renderCard(card, containerEl, typeLabelEl, symbolContainerEl, nameLabelEl) {
        containerEl.className = 'card-card';
        if (card.symbol === 'switch') {
            containerEl.classList.add('card-switch');
            typeLabelEl.textContent = 'STREET CARD • RAILROAD SWITCH';
        } else if (card.type === 'underground') {
            containerEl.classList.add('card-underground');
            typeLabelEl.textContent = 'UNDERGROUND CARD (PINK FRAME)';
        } else {
            containerEl.classList.add('card-street');
            typeLabelEl.textContent = 'STREET CARD (BLUE FRAME)';
        }

        const symbolColor = card.symbol === 'switch' ? '#b45309' : (card.type === 'underground' ? '#9e0059' : '#006699');
        symbolContainerEl.innerHTML = getSymbolSvg(card.symbol, symbolColor);
        nameLabelEl.textContent = card.name;
    }

    // Check if 5th underground card was revealed
    function checkRoundEndState() {
        if (undergroundCount >= 5) {
            isRoundOver = true;
            const currentLine = roundColorsSequence[currentRoundIndex];
            showAlert('banner-warning', `⚠️ 5th Underground card drawn! Round ${currentRoundIndex + 1} (${currentLine.name}) is OVER after this turn.`);

            if (currentRoundIndex === 3) {
                primaryBtn.textContent = 'End Game';
            } else {
                primaryBtn.textContent = `Start Round ${currentRoundIndex + 2}`;
            }
        }
    }

    // Update 1-5 tracker slots
    function updateTrackerUI() {
        trackerCountEl.textContent = `${undergroundCount} / 5`;
        for (let i = 1; i <= 5; i++) {
            const slotEl = document.getElementById(`slot-${i}`);
            if (i <= undergroundCount) {
                slotEl.classList.add('active');
            } else {
                slotEl.classList.remove('active');
            }
        }
    }

    // Add card to current round history strip
    function addCardToHistory(card) {
        if (historyCardsEl.querySelector('.empty-history')) {
            historyCardsEl.innerHTML = '';
        }

        cardsDrawnCountEl.textContent = revealedCards.length;

        const mini = document.createElement('div');
        mini.className = `mini-card mini-${card.symbol === 'switch' ? 'switch' : card.type}`;

        const iconColor = card.symbol === 'switch' ? '#b45309' : (card.type === 'underground' ? '#9e0059' : '#006699');
        mini.innerHTML = `
            <div class="mini-card-icon">${getSymbolSvg(card.symbol, iconColor, 32)}</div>
            <div class="mini-card-label">${card.symbol}</div>
        `;

        historyCardsEl.appendChild(mini);
        historyCardsEl.scrollLeft = historyCardsEl.scrollWidth;
    }

    // Advance to next round or end game
    function finishRoundAndAdvance() {
        // Save history of completed round
        const currentLine = roundColorsSequence[currentRoundIndex];
        completedRoundsData.push({
            roundNum: currentRoundIndex + 1,
            line: currentLine,
            cards: [...revealedCards]
        });

        renderCompletedRoundsSummary();

        if (currentRoundIndex >= 3) {
            // All 4 rounds finished!
            isGameOver = true;
            cardDisplayEl.className = 'card-card card-underground';
            cardTypeLabelEl.textContent = 'GAME OVER';
            cardSymbolContainerEl.innerHTML = getSymbolSvg('wild', '#e6007e');
            cardNameLabelEl.textContent = 'All 4 Metro Lines Completed!';
            secondaryCardDisplayEl.classList.add('hidden');

            showAlert('banner-success', '🎉 Game Completed! Compare final scores on your physical sheets.');
            primaryBtn.textContent = 'Play Again';
        } else {
            startRound(currentRoundIndex + 1);
        }
    }

    // Render completed rounds at the bottom
    function renderCompletedRoundsSummary() {
        completedRoundsPanelEl.classList.remove('hidden');
        completedRoundsContainerEl.innerHTML = '';

        completedRoundsData.forEach(roundData => {
            const row = document.createElement('div');
            row.className = 'round-summary-row';

            const pillsHtml = roundData.cards.map(c => {
                const pillClass = c.symbol === 'switch' ? 'pill-switch' : (c.type === 'underground' ? 'pill-underground' : 'pill-street');
                return `<span class="summary-card-pill ${pillClass}">${c.symbol.toUpperCase()}</span>`;
            }).join('');

            row.innerHTML = `
                <div class="round-summary-header">
                    <span>Round ${roundData.roundNum}: <strong style="color: ${roundData.line.color}">${roundData.line.name}</strong></span>
                    <span>${roundData.cards.length} Cards</span>
                </div>
                <div class="round-summary-cards">${pillsHtml}</div>
            `;
            completedRoundsContainerEl.appendChild(row);
        });
    }

    // Alert helpers
    function showAlert(type, message) {
        alertBannerEl.className = `alert-banner ${type}`;
        alertBannerEl.textContent = message;
        alertBannerEl.classList.remove('hidden');
    }

    function hideAlert() {
        alertBannerEl.classList.add('hidden');
    }

    // Event Listeners
    primaryBtn.addEventListener('click', flipCard);
    restartBtn.addEventListener('click', startNewGame);

    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            flipCard();
        }
    });

    // Start game on load
    startNewGame();
});
