/**
 * Next Station: Berlin - Deck Companion
 * Official UK Rules Deck Companion
 */

document.addEventListener('DOMContentLoaded', () => {
    // Line Color definitions for the 4 rounds
    const COLORS = [
        { name: 'Pink Line', color: '#e6007e' },
        { name: 'Green Line', color: '#00964e' },
        { name: 'Brown Line', color: '#8b5cf6' },
        { name: 'Blue Line', color: '#0099db' }
    ];

    // Card definitions for Next Station: Berlin
    // 5 Bear Cards (Orange) + 5 Crown Cards (Purple) + 1 Double Railway Switch = 11 cards total
    const BASE_DECK = [
        { id: 'b_circle', type: 'bear', symbol: 'circle', name: 'Bear • Circle Station 🐻' },
        { id: 'b_square', type: 'bear', symbol: 'square', name: 'Bear • Square Station 🐻' },
        { id: 'b_triangle', type: 'bear', symbol: 'triangle', name: 'Bear • Triangle Station 🐻' },
        { id: 'b_pentagon', type: 'bear', symbol: 'pentagon', name: 'Bear • Pentagon Station 🐻' },
        { id: 'b_wild', type: 'bear', symbol: 'wild', name: 'Bear • Wild Station (Joker) 🐻' },

        { id: 'c_circle', type: 'crown', symbol: 'circle', name: 'Crown • Circle Station 👑' },
        { id: 'c_square', type: 'crown', symbol: 'square', name: 'Crown • Square Station 👑' },
        { id: 'c_triangle', type: 'crown', symbol: 'triangle', name: 'Crown • Triangle Station 👑' },
        { id: 'c_pentagon', type: 'crown', symbol: 'pentagon', name: 'Crown • Pentagon Station 👑' },
        { id: 'c_wild', type: 'crown', symbol: 'wild', name: 'Crown • Wild Station (Joker) 👑' },

        { id: 'switch', type: 'switch', symbol: 'switch', name: 'Double Railway Switch ⇄' }
    ];

    // App State
    let roundColorsSequence = [];
    let currentRoundIndex = 0; // 0 to 3
    let deck = [];
    let revealedCards = [];
    let bearCardsRevealed = [];
    let crownCardsRevealed = [];
    let isRoundOver = false;
    let isGameOver = false;
    let completedRoundsData = [];

    // DOM Elements
    const statusPanelEl = document.getElementById('statusPanel');
    const roundNumberEl = document.getElementById('roundNumber');
    const lineBadgeEl = document.getElementById('lineBadge');
    const lineDotEl = document.getElementById('lineDot');
    const lineNameEl = document.getElementById('lineName');

    const bearCountEl = document.getElementById('bearCount');
    const crownCountEl = document.getElementById('crownCount');

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
    function getSymbolSvg(symbol, color = 'currentColor', className = 'card-symbol-svg') {
        switch (symbol) {
            case 'circle':
                return `<svg viewBox="0 0 100 100" class="${className}" style="color: ${color}">
                    <circle cx="50" cy="50" r="40" fill="currentColor" />
                </svg>`;
            case 'square':
                return `<svg viewBox="0 0 100 100" class="${className}" style="color: ${color}">
                    <rect x="12" y="12" width="76" height="76" rx="10" fill="currentColor" />
                </svg>`;
            case 'triangle':
                return `<svg viewBox="0 0 100 100" class="${className}" style="color: ${color}">
                    <polygon points="50,8 92,86 8,86" fill="currentColor" />
                </svg>`;
            case 'pentagon':
                return `<svg viewBox="0 0 100 100" class="${className}" style="color: ${color}">
                    <polygon points="50,8 94,39 77,88 23,88 6,39" fill="currentColor" />
                </svg>`;
            case 'wild':
                return `<svg viewBox="0 0 100 100" class="${className}" style="color: ${color}">
                    <polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" fill="currentColor" />
                </svg>`;
            case 'switch':
                return `<svg viewBox="0 0 100 100" class="${className}" style="color: ${color}">
                    <path d="M 15 50 L 85 50" stroke="currentColor" stroke-width="12" stroke-linecap="round"/>
                    <path d="M 38 50 Q 58 50 78 20" stroke="currentColor" stroke-width="12" fill="none" stroke-linecap="round"/>
                    <polygon points="85,50 70,40 70,60" fill="currentColor" />
                    <polygon points="78,20 63,15 70,32" fill="currentColor" />
                    <circle cx="38" cy="50" r="9" fill="#ffffff" stroke="currentColor" stroke-width="6"/>
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
        bearCardsRevealed = [];
        crownCardsRevealed = [];
        isRoundOver = false;

        const currentLine = roundColorsSequence[currentRoundIndex];

        // Update Round & Line info
        roundNumberEl.textContent = `${currentRoundIndex + 1} / 4`;
        lineDotEl.style.backgroundColor = currentLine.color;
        lineNameEl.textContent = currentLine.name;
        statusPanelEl.style.borderColor = currentLine.color;

        // Reset Trackers
        updateTrackerUI();

        // Reset Main Card Display
        cardDisplayEl.className = 'card-card';
        cardTypeLabelEl.textContent = `ROUND ${currentRoundIndex + 1}: ${currentLine.name.toUpperCase()}`;
        cardSymbolContainerEl.innerHTML = `<div class="placeholder-icon">🎴</div>`;
        cardNameLabelEl.textContent = 'Press Flip Card';

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
            finishRoundAndAdvance();
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

        // Update Bear / Crown lists
        if (card.type === 'bear') {
            bearCardsRevealed.push(card);
            updateTrackerUI();
        } else if (card.type === 'crown') {
            crownCardsRevealed.push(card);
            updateTrackerUI();
        }

        // Add to history UI
        addCardToHistory(card, revealedCards.length);

        // Handle Double Railway Switch Logic
        if (card.symbol === 'switch') {
            showAlert('banner-info', '⇄ DOUBLE RAILWAY SWITCH! Create a switch on both lines. Drawing destination card...');
            
            // Draw the next card immediately to pair with the switch card!
            if (deck.length > 0) {
                setTimeout(() => {
                    const nextCard = deck.pop();
                    revealedCards.push(nextCard);

                    secondaryCardDisplayEl.classList.remove('hidden');
                    secondaryCardDisplayEl.classList.remove('flip-anim');
                    void secondaryCardDisplayEl.offsetWidth;
                    secondaryCardDisplayEl.classList.add('flip-anim');

                    renderCard(nextCard, secondaryCardDisplayEl, secondaryCardTypeLabelEl, secondaryCardSymbolContainerEl, secondaryCardNameLabelEl);

                    if (nextCard.type === 'bear') {
                        bearCardsRevealed.push(nextCard);
                        updateTrackerUI();
                    } else if (nextCard.type === 'crown') {
                        crownCardsRevealed.push(nextCard);
                        updateTrackerUI();
                    }

                    addCardToHistory(nextCard, revealedCards.length);

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
            typeLabelEl.textContent = 'DOUBLE RAILWAY SWITCH';
        } else if (card.type === 'bear') {
            containerEl.classList.add('card-bear');
            typeLabelEl.textContent = 'BEAR CARD (ORANGE) 🐻';
        } else if (card.type === 'crown') {
            containerEl.classList.add('card-crown');
            typeLabelEl.textContent = 'CROWN CARD (PURPLE) 👑';
        }

        const symbolColor = card.symbol === 'switch' ? '#a16207' : (card.type === 'bear' ? '#c2410c' : '#7e22ce');
        symbolContainerEl.innerHTML = getSymbolSvg(card.symbol, symbolColor);
        nameLabelEl.textContent = card.name;
    }

    // Check if 5th Bear or 5th Crown card was revealed
    function checkRoundEndState() {
        const bearCount = bearCardsRevealed.length;
        const crownCount = crownCardsRevealed.length;

        if (bearCount >= 5 || crownCount >= 5) {
            isRoundOver = true;
            const currentLine = roundColorsSequence[currentRoundIndex];
            const cause = bearCount >= 5 ? '5th Bear card (Orange 🐻)' : '5th Crown card (Purple 👑)';
            
            showAlert('banner-warning', `⚠️ ${cause} drawn! Round ${currentRoundIndex + 1} (${currentLine.name}) is OVER after this turn.`);

            if (currentRoundIndex === 3) {
                primaryBtn.textContent = 'End Game';
            } else {
                primaryBtn.textContent = `Start Round ${currentRoundIndex + 2}`;
            }
        }
    }

    // Update 1-5 Bear and Crown tracker slots with revealed symbols
    function updateTrackerUI() {
        bearCountEl.textContent = `${bearCardsRevealed.length} / 5`;
        crownCountEl.textContent = `${crownCardsRevealed.length} / 5`;

        for (let i = 1; i <= 5; i++) {
            const bearSlot = document.getElementById(`bear-slot-${i}`);
            const crownSlot = document.getElementById(`crown-slot-${i}`);

            // Bear slot update
            if (i <= bearCardsRevealed.length) {
                const card = bearCardsRevealed[i - 1];
                bearSlot.classList.add('active');
                bearSlot.innerHTML = getSymbolSvg(card.symbol, '#ffffff', 'slot-symbol-svg');
            } else {
                bearSlot.classList.remove('active');
                bearSlot.innerHTML = `<span class="slot-num">${i}</span>`;
            }

            // Crown slot update
            if (i <= crownCardsRevealed.length) {
                const card = crownCardsRevealed[i - 1];
                crownSlot.classList.add('active');
                crownSlot.innerHTML = getSymbolSvg(card.symbol, '#ffffff', 'slot-symbol-svg');
            } else {
                crownSlot.classList.remove('active');
                crownSlot.innerHTML = `<span class="slot-num">${i}</span>`;
            }
        }
    }

    // Add card to current round history strip
    function addCardToHistory(card, turnIndex) {
        if (historyCardsEl.querySelector('.empty-history')) {
            historyCardsEl.innerHTML = '';
        }

        cardsDrawnCountEl.textContent = revealedCards.length;

        const mini = document.createElement('div');
        mini.className = `mini-card mini-${card.type}`;

        const iconColor = card.symbol === 'switch' ? '#a16207' : (card.type === 'bear' ? '#c2410c' : '#7e22ce');
        const badgeIcon = card.type === 'bear' ? '🐻' : (card.type === 'crown' ? '👑' : '⇄');

        mini.innerHTML = `
            <span class="mini-card-badge">#${turnIndex}</span>
            <div class="mini-card-icon">${getSymbolSvg(card.symbol, iconColor)}</div>
            <div class="mini-card-label">${card.symbol} ${badgeIcon}</div>
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
            cards: [...revealedCards],
            endedBy: bearCardsRevealed.length >= 5 ? 'Bear (5)' : 'Crown (5)'
        });

        renderCompletedRoundsSummary();

        if (currentRoundIndex >= 3) {
            // All 4 rounds finished!
            isGameOver = true;
            cardDisplayEl.className = 'card-card card-bear';
            cardTypeLabelEl.textContent = 'GAME OVER';
            cardSymbolContainerEl.innerHTML = `<div class="card-symbol-svg" style="font-size: 4.5rem; display: flex; justify-content: center; align-items: center;">🎉</div>`;
            cardNameLabelEl.textContent = 'All 4 Metro Lines Completed!';
            secondaryCardDisplayEl.classList.add('hidden');

            showAlert('banner-success', '🎉 Game Completed! Calculate your final score on your Berlin score sheet.');
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
                const pillClass = `pill-${c.type}`;
                const icon = c.type === 'bear' ? '🐻' : (c.type === 'crown' ? '👑' : '⇄');
                return `<span class="summary-card-pill ${pillClass}">${c.symbol.toUpperCase()} ${icon}</span>`;
            }).join('');

            row.innerHTML = `
                <div class="round-summary-header">
                    <span>Round ${roundData.roundNum}: <strong style="color: ${roundData.line.color}">${roundData.line.name}</strong> (${roundData.endedBy})</span>
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
