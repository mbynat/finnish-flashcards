// Flashcards Storage
class FlashcardApp {
    constructor() {
        this.cards = this.loadCards();
        this.phrases = this.loadPhrases();
        this.currentCardIndex = 0;
        this.currentEditCardId = null;
        this.currentEditIsPhrase = false;
        this.typePracticeCards = [];
        this.typeCurrentCardIndex = 0;
        this.practiceMode = 'flip'; // 'flip' or 'type'
        this.practiceCategory = 'words'; // 'words' or 'phrases'
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.setupScrollDetection();
        this.updateAllViews();
        // Ensure display is correct on page load
        this.renderAllCards();
        this.switchSection('home');
    }

    // Storage Management
    loadCards() {
        const stored = localStorage.getItem('flashcards');
        return stored ? JSON.parse(stored) : [];
    }

    loadPhrases() {
        const stored = localStorage.getItem('phrases');
        return stored ? JSON.parse(stored) : [];
    }

    saveCards() {
        localStorage.setItem('flashcards', JSON.stringify(this.cards));
        this.updateAllViews();
    }

    savePhrases() {
        localStorage.setItem('phrases', JSON.stringify(this.phrases));
        this.updateAllViews();
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        const navButtons = document.querySelectorAll('.nav-btn');
        if (navButtons.length > 0) {
            navButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const section = e.target.dataset.section;
                    this.switchSection(section);
                });
            });
        }

        // Add Card Form
        const addCardForm = document.getElementById('addCardForm');
        if (addCardForm) {
            addCardForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addCard();
            });
        }

        // Add Phrase Form
        const addPhraseForm = document.getElementById('addPhraseForm');
        if (addPhraseForm) {
            addPhraseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addPhrase();
            });
        }

        // Add Definition Button
        const addDefBtn = document.getElementById('addDefinitionBtn');
        if (addDefBtn) {
            addDefBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addDefinitionInput();
            });
        }

        // Add Phrase Definition Button
        const addPhraseDefBtn = document.getElementById('addPhraseDefinitionBtn');
        if (addPhraseDefBtn) {
            addPhraseDefBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addPhraseDefinitionInput();
            });
        }

        // Edit Card Form
        const editCardForm = document.getElementById('editCardForm');
        if (editCardForm) {
            editCardForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveEditCard();
            });
        }

        // Edit Add Definition Button
        const editAddDefBtn = document.getElementById('editAddDefinitionBtn');
        if (editAddDefBtn) {
            editAddDefBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addEditDefinitionInput();
            });
        }

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchCards(e.target.value);
            });
        }

        // Search phrase input
        const searchPhraseInput = document.getElementById('searchPhraseInput');
        if (searchPhraseInput) {
            searchPhraseInput.addEventListener('input', (e) => {
                this.searchPhrases(e.target.value);
            });
        }

        // Practice mode toggle buttons
        const modeButtons = document.querySelectorAll('.practice-mode-toggle .toggle-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchPracticeMode(e.target.dataset.mode);
            });
        });

        // Practice category toggle buttons
        const categoryButtons = document.querySelectorAll('.practice-category-toggle .toggle-btn');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchPracticeCategory(e.target.dataset.category);
            });
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('editModal');
            if (e.target === modal) {
                this.closeEditModal();
            }
        });
    }

    addDefinitionInput() {
        const container = document.getElementById('definitionsContainer');
        const definitionGroup = document.createElement('div');
        definitionGroup.className = 'definition-input-group';
        definitionGroup.innerHTML = `
            <input 
                type="text" 
                class="english-definition" 
                placeholder="Enter English translation"
                required
            >
            <button type="button" class="btn-remove-definition" onclick="app.removeDefinitionInput(this)">Remove</button>
        `;
        container.appendChild(definitionGroup);
    }

    removeDefinitionInput(btn) {
        const container = document.getElementById('definitionsContainer');
        const inputs = container.querySelectorAll('.definition-input-group');
        if (inputs.length > 1) {
            btn.parentElement.remove();
        } else {
            alert('You need at least one definition');
        }
    }

    // Edit Card
    openEditModal(cardId, isPhrase = false) {
        let card;
        
        if (isPhrase) {
            card = this.phrases.find(c => c.id === cardId);
        } else {
            card = this.cards.find(c => c.id === cardId);
        }
        
        if (!card) return;

        this.currentEditCardId = cardId;
        this.currentEditIsPhrase = isPhrase;
        const definitions = Array.isArray(card.definitions) ? card.definitions : [card.english || ''];

        document.getElementById('editFinnish').value = card.finnish;

        // Clear and populate definitions
        const container = document.getElementById('editDefinitionsContainer');
        container.innerHTML = definitions.map((def, idx) => `
            <div class="definition-input-group">
                <input 
                    type="text" 
                    class="edit-english-definition" 
                    value="${this.escapeHtml(def)}"
                    required
                >
                ${definitions.length > 1 ? `<button type="button" class="btn-remove-definition" onclick="app.removeEditDefinitionInput(this)">Remove</button>` : ''}
            </div>
        `).join('');

        document.getElementById('editModal').classList.add('active');
    }

    closeEditModal() {
        document.getElementById('editModal').classList.remove('active');
        this.currentEditCardId = null;
    }

    addEditDefinitionInput() {
        const container = document.getElementById('editDefinitionsContainer');
        const definitionGroup = document.createElement('div');
        definitionGroup.className = 'definition-input-group';
        definitionGroup.innerHTML = `
            <input 
                type="text" 
                class="edit-english-definition" 
                placeholder="Enter English translation"
                required
            >
            <button type="button" class="btn-remove-definition" onclick="app.removeEditDefinitionInput(this)">Remove</button>
        `;
        container.appendChild(definitionGroup);
    }

    removeEditDefinitionInput(btn) {
        const container = document.getElementById('editDefinitionsContainer');
        const inputs = container.querySelectorAll('.definition-input-group');
        if (inputs.length > 1) {
            btn.parentElement.remove();
        } else {
            alert('You need at least one definition');
        }
    }

    // Phrase Methods
    addPhrase() {
        const finnish = document.getElementById('finnishPhrase').value.trim();
        const definitionInputs = document.querySelectorAll('.english-phrase-definition');
        const definitions = Array.from(definitionInputs)
            .map(input => input.value.trim())
            .filter(def => def);

        if (!finnish || definitions.length === 0) {
            alert('Please fill in Finnish phrase and at least one definition');
            return;
        }

        const phrase = {
            id: Date.now(),
            finnish: finnish,
            definitions: definitions,
            dateAdded: new Date().toLocaleDateString()
        };

        this.phrases.push(phrase);
        this.savePhrases();

        // Clear form
        document.getElementById('addPhraseForm').reset();
        
        // Reset definitions to single input
        document.getElementById('phraseDefinitionsContainer').innerHTML = `
            <div class="definition-input-group">
                <input 
                    type="text" 
                    class="english-phrase-definition" 
                    placeholder="Enter English translation"
                    required
                >
            </div>
        `;

        // Show success message
        const successMsg = document.getElementById('phraseSuccessMessage');
        successMsg.textContent = `✓ Phrase added: "${finnish}" = "${definitions.join(', ')}"`;
        successMsg.style.display = 'block';
        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 3000);
    }

    addPhraseDefinitionInput() {
        const container = document.getElementById('phraseDefinitionsContainer');
        const definitionGroup = document.createElement('div');
        definitionGroup.className = 'definition-input-group';
        definitionGroup.innerHTML = `
            <input 
                type="text" 
                class="english-phrase-definition" 
                placeholder="Enter English translation"
                required
            >
            <button type="button" class="btn-remove-definition" onclick="app.removePhraseDefinitionInput(this)">Remove</button>
        `;
        container.appendChild(definitionGroup);
    }

    removePhraseDefinitionInput(btn) {
        const container = document.getElementById('phraseDefinitionsContainer');
        const inputs = container.querySelectorAll('.definition-input-group');
        if (inputs.length > 1) {
            btn.parentElement.remove();
        } else {
            alert('You need at least one definition');
        }
    }

    // Keyboard Navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Only apply when not in edit modal
            if (!document.getElementById('editModal').classList.contains('active')) {
                const addSection = document.getElementById('add');
                const addPhrasesSection = document.getElementById('addPhrases');
                
                // Check if add form is active
                if (addSection.classList.contains('active')) {
                    this.handleAddFormKeyboard(e);
                }
                // Check if add phrases form is active
                else if (addPhrasesSection.classList.contains('active')) {
                    this.handleAddPhraseFormKeyboard(e);
                }
            }
        });
    }

    handleAddFormKeyboard(e) {
        const finnishInput = document.getElementById('finnish');
        const definitionInputs = Array.from(document.querySelectorAll('.english-definition'));
        const activeElement = document.activeElement;
        
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            // Move up through definitions or to finnish field
            const currentIndex = definitionInputs.indexOf(activeElement);
            if (currentIndex > 0) {
                definitionInputs[currentIndex - 1].focus();
            } else if (currentIndex === 0) {
                finnishInput.focus();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            // Move down through definitions
            const currentIndex = definitionInputs.indexOf(activeElement);
            if (activeElement === finnishInput) {
                if (definitionInputs.length > 0) {
                    definitionInputs[0].focus();
                }
            } else if (currentIndex < definitionInputs.length - 1) {
                definitionInputs[currentIndex + 1].focus();
            }
        } else if (e.key === 'ArrowRight' && (activeElement === finnishInput || definitionInputs.includes(activeElement))) {
            // When in form, right arrow can add a new definition if at last definition
            if (definitionInputs.includes(activeElement) && activeElement === definitionInputs[definitionInputs.length - 1]) {
                e.preventDefault();
                this.addDefinitionInput();
                setTimeout(() => {
                    const newInputs = document.querySelectorAll('.english-definition');
                    newInputs[newInputs.length - 1].focus();
                }, 0);
            }
        }
    }

    handleAddPhraseFormKeyboard(e) {
        const finnishInput = document.getElementById('finnishPhrase');
        const definitionInputs = Array.from(document.querySelectorAll('.english-phrase-definition'));
        const activeElement = document.activeElement;
        
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            // Move up through definitions or to finnish field
            const currentIndex = definitionInputs.indexOf(activeElement);
            if (currentIndex > 0) {
                definitionInputs[currentIndex - 1].focus();
            } else if (currentIndex === 0) {
                finnishInput.focus();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            // Move down through definitions
            const currentIndex = definitionInputs.indexOf(activeElement);
            if (activeElement === finnishInput) {
                if (definitionInputs.length > 0) {
                    definitionInputs[0].focus();
                }
            } else if (currentIndex < definitionInputs.length - 1) {
                definitionInputs[currentIndex + 1].focus();
            }
        } else if (e.key === 'ArrowRight' && (activeElement === finnishInput || definitionInputs.includes(activeElement))) {
            // When in form, right arrow can add a new definition if at last definition
            if (definitionInputs.includes(activeElement) && activeElement === definitionInputs[definitionInputs.length - 1]) {
                e.preventDefault();
                this.addPhraseDefinitionInput();
                setTimeout(() => {
                    const newInputs = document.querySelectorAll('.english-phrase-definition');
                    newInputs[newInputs.length - 1].focus();
                }, 0);
            }
        }
    }

    setupScrollDetection() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        let lastScrollTop = 0;
        const scrollThreshold = 50;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY || window.pageYOffset;
            
            // Hide ONLY navbar when scrolling down more than threshold
            // Header stays visible
            if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
                navbar.classList.add('hidden');
            } 
            // Show navbar when scrolling up
            else if (scrollTop < lastScrollTop) {
                navbar.classList.remove('hidden');
            }
            
            lastScrollTop = scrollTop;
        }, false);
    }

    saveEditCard() {
        const finnish = document.getElementById('editFinnish').value.trim();
        const definitionInputs = document.querySelectorAll('.edit-english-definition');
        const definitions = Array.from(definitionInputs)
            .map(input => input.value.trim())
            .filter(def => def);

        if (!finnish || definitions.length === 0) {
            alert('Please fill in Finnish word and at least one definition');
            return;
        }

        if (this.currentEditIsPhrase) {
            const cardIndex = this.phrases.findIndex(c => c.id === this.currentEditCardId);
            if (cardIndex !== -1) {
                this.phrases[cardIndex].finnish = finnish;
                this.phrases[cardIndex].definitions = definitions;
                this.savePhrases();
                this.closeEditModal();
            }
        } else {
            const cardIndex = this.cards.findIndex(c => c.id === this.currentEditCardId);
            if (cardIndex !== -1) {
                this.cards[cardIndex].finnish = finnish;
                this.cards[cardIndex].definitions = definitions;
                this.saveCards();
                this.closeEditModal();
            }
        }
    }

    // Navigation
    switchSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionId).classList.add('active');

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === sectionId) {
                btn.classList.add('active');
            }
        });

        // Initialize practice if switching to practice section
        if (sectionId === 'practice') {
            this.initPracticeWithMode();
        }
    }

    // Practice Mode/Category Switchers
    switchPracticeMode(mode) {
        this.practiceMode = mode;
        this.currentCardIndex = 0;
        this.typeCurrentCardIndex = 0;
        
        // Update button states
        document.querySelectorAll('.practice-mode-toggle .toggle-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
        
        this.initPracticeWithMode();
    }

    switchPracticeCategory(category) {
        this.practiceCategory = category;
        this.currentCardIndex = 0;
        this.typeCurrentCardIndex = 0;
        
        // Update button states
        document.querySelectorAll('.practice-category-toggle .toggle-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });
        
        this.initPracticeWithMode();
    }

    initPracticeWithMode() {
        if (this.practiceMode === 'flip') {
            this.initPractice();
        } else {
            this.initTypePractice();
        }
    }
    addCard() {
        const finnish = document.getElementById('finnish').value.trim();
        const definitionInputs = document.querySelectorAll('.english-definition');
        const definitions = Array.from(definitionInputs)
            .map(input => input.value.trim())
            .filter(def => def); // Remove empty definitions

        if (!finnish || definitions.length === 0) {
            alert('Please fill in Finnish word and at least one definition');
            return;
        }

        const card = {
            id: Date.now(),
            finnish: finnish,
            definitions: definitions,
            dateAdded: new Date().toLocaleDateString()
        };

        this.cards.push(card);
        this.saveCards();

        // Clear form
        document.getElementById('addCardForm').reset();
        
        // Reset definitions to single input
        document.getElementById('definitionsContainer').innerHTML = `
            <div class="definition-input-group">
                <input 
                    type="text" 
                    class="english-definition" 
                    placeholder="Enter English translation"
                    required
                >
            </div>
        `;

        // Show success message
        const successMsg = document.getElementById('successMessage');
        successMsg.textContent = `✓ Card added: "${finnish}" = "${definitions.join(', ')}"`;
        successMsg.style.display = 'block';
        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 3000);
    }

    // Delete Card
    deleteCard(cardId, isPhrase = false) {
        if (confirm('Delete this card?')) {
            // Convert string 'true'/'false' to boolean if needed
            const isPhraseCard = isPhrase === true || isPhrase === 'true' || isPhrase === 1;
            
            if (isPhraseCard) {
                this.phrases = this.phrases.filter(phrase => phrase.id !== cardId);
                this.savePhrases();
            } else {
                this.cards = this.cards.filter(card => card.id !== cardId);
                this.saveCards();
            }
        }
    }

    // Render All Cards
    renderAllCards() {
        const container = document.getElementById('cardsGrid');

        if (this.cards.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No words yet. <a href="#" onclick="app.switchSection('add')">Add one now!</a></p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.cards.map(card => {
            const definitions = Array.isArray(card.definitions) ? card.definitions : [card.english || ''];
            return `
                <div class="card" data-card-id="${card.id}" data-is-phrase="false">
                    <div class="card-label">Finnish</div>
                    <div class="card-front">${this.escapeHtml(card.finnish)}</div>
                    <div class="card-label">Definitions</div>
                    <div class="card-back">
                        ${definitions.map((def, idx) => `
                            <div>${idx + 1}. ${this.escapeHtml(def)}</div>
                        `).join('')}
                    </div>
                    <div class="card-actions">
                        <button class="btn-edit" data-action="edit">Edit</button>
                        <button class="btn-delete" data-action="delete">Delete</button>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners
        this.attachCardButtonListeners();
    }

    attachCardButtonListeners() {
        document.querySelectorAll('.card').forEach(cardElement => {
            const cardId = parseInt(cardElement.dataset.cardId);
            const isPhrase = cardElement.dataset.isPhrase === 'true';

            const editBtn = cardElement.querySelector('[data-action="edit"]');
            const deleteBtn = cardElement.querySelector('[data-action="delete"]');

            if (editBtn) {
                editBtn.addEventListener('click', () => this.openEditModal(cardId, isPhrase));
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteCard(cardId, isPhrase));
            }
        });
    }

    // Search Cards
    searchCards(query) {
        const container = document.getElementById('cardsGrid');
        
        if (query.trim() === '') {
            // If search is empty, show all words
            this.renderAllCards();
            return;
        }

        const searchQuery = query.toLowerCase();
        const filteredCards = this.cards.filter(card => {
            const finnishMatch = card.finnish.toLowerCase().includes(searchQuery);
            const definitions = Array.isArray(card.definitions) ? card.definitions : [card.english || ''];
            const definitionsMatch = definitions.some(def => def.toLowerCase().includes(searchQuery));
            return finnishMatch || definitionsMatch;
        });

        if (filteredCards.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No words found matching "${this.escapeHtml(query)}"</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredCards.map(card => {
            const definitions = Array.isArray(card.definitions) ? card.definitions : [card.english || ''];
            return `
                <div class="card" data-card-id="${card.id}" data-is-phrase="false">
                    <div class="card-label">Finnish</div>
                    <div class="card-front">${this.escapeHtml(card.finnish)}</div>
                    <div class="card-label">Definitions</div>
                    <div class="card-back">
                        ${definitions.map((def, idx) => `
                            <div>${idx + 1}. ${this.escapeHtml(def)}</div>
                        `).join('')}
                    </div>
                    <div class="card-actions">
                        <button class="btn-edit" data-action="edit">Edit</button>
                        <button class="btn-delete" data-action="delete">Delete</button>
                    </div>
                </div>
            `;
        }).join('');

        this.attachCardButtonListeners();
    }

    // Render Phrases List
    renderPhrasesList() {
        const container = document.getElementById('phrasesList');

        if (this.phrases.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No phrases yet. <a href="#" onclick="app.switchSection('addPhrases')">Add one now!</a></p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.phrases.map(phrase => {
            const definitions = Array.isArray(phrase.definitions) ? phrase.definitions : [];
            return `
                <div class="phrase-item" data-phrase-id="${phrase.id}">
                    <div class="phrase-finnish">${this.escapeHtml(phrase.finnish)}</div>
                    <div class="phrase-english">
                        ${definitions.map((def, idx) => `
                            <div class="phrase-english-item">${this.escapeHtml(def)}</div>
                        `).join('')}
                    </div>
                    <div class="phrase-item-actions">
                        <button class="btn-edit" data-action="edit-phrase">Edit</button>
                        <button class="btn-delete" data-action="delete-phrase">Delete</button>
                    </div>
                </div>
            `;
        }).join('');

        this.attachPhraseButtonListeners();
    }

    attachPhraseButtonListeners() {
        document.querySelectorAll('.phrase-item').forEach(phraseElement => {
            const phraseId = parseInt(phraseElement.dataset.phraseId);

            const editBtn = phraseElement.querySelector('[data-action="edit-phrase"]');
            const deleteBtn = phraseElement.querySelector('[data-action="delete-phrase"]');

            if (editBtn) {
                editBtn.addEventListener('click', () => this.openEditModal(phraseId, true));
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteCard(phraseId, true));
            }
        });
    }

    // Search Phrases
    searchPhrases(query) {
        const container = document.getElementById('phrasesList');
        
        if (query.trim() === '') {
            // If search is empty, show all phrases
            this.renderPhrasesList();
            return;
        }

        const searchQuery = query.toLowerCase();
        const filteredPhrases = this.phrases.filter(phrase => {
            const finnishMatch = phrase.finnish.toLowerCase().includes(searchQuery);
            const definitions = Array.isArray(phrase.definitions) ? phrase.definitions : [];
            const definitionsMatch = definitions.some(def => def.toLowerCase().includes(searchQuery));
            return finnishMatch || definitionsMatch;
        });

        if (filteredPhrases.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No phrases found matching "${this.escapeHtml(query)}"</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredPhrases.map(phrase => {
            const definitions = Array.isArray(phrase.definitions) ? phrase.definitions : [];
            return `
                <div class="phrase-item" data-phrase-id="${phrase.id}">
                    <div class="phrase-finnish">${this.escapeHtml(phrase.finnish)}</div>
                    <div class="phrase-english">
                        ${definitions.map((def, idx) => `
                            <div class="phrase-english-item">${this.escapeHtml(def)}</div>
                        `).join('')}
                    </div>
                    <div class="phrase-item-actions">
                        <button class="btn-edit" data-action="edit-phrase">Edit</button>
                        <button class="btn-delete" data-action="delete-phrase">Delete</button>
                    </div>
                </div>
            `;
        }).join('');

        this.attachPhraseButtonListeners();
    }

    // Practice Mode
    initPractice() {
        let cardsToUse = [];
        
        if (this.practiceCategory === 'words') {
            cardsToUse = [...this.cards];
        } else if (this.practiceCategory === 'phrases') {
            cardsToUse = [...this.phrases];
        }
        
        if (cardsToUse.length === 0) {
            document.getElementById('practiceContent').innerHTML = `
                <div class="empty-state">
                    <p>No ${this.practiceCategory} to practice. <a href="#" onclick="app.switchSection('${this.practiceCategory === 'words' ? 'add' : 'addPhrases'}')">Add some first!</a></p>
                </div>
            `;
            return;
        }

        // Shuffle the cards so flip practice is randomized like type practice
        this.typePracticeCards = this.shuffleArray([...cardsToUse]);
        this.currentCardIndex = 0;
        this.renderPracticeCard();
    }

    renderPracticeCard() {
        const card = this.typePracticeCards[this.currentCardIndex];
        const totalCards = this.typePracticeCards.length;
        const definitions = Array.isArray(card.definitions) ? card.definitions : [card.english || ''];

        document.getElementById('currentCard').textContent = this.currentCardIndex + 1;
        document.getElementById('totalCards2').textContent = totalCards;

        document.getElementById('practiceContent').innerHTML = `
            <div class="flashcard" onclick="app.toggleCard(this)">
                <div class="card-side">Finnish</div>
                <div class="card-content">${this.escapeHtml(card.finnish)}</div>
                <div style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">(Click to reveal)</div>
                <div class="card-hidden-content" style="display: none;">
                    <div class="card-side">English Definitions</div>
                    <div class="card-content" style="font-size: 1.5rem;">
                        ${definitions.map((def, idx) => `
                            <div style="margin: 0.5rem 0;">${idx + 1}. ${this.escapeHtml(def)}</div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="practice-controls">
                <button class="btn btn-secondary btn-small" onclick="app.revealAndContinue()">📖 I don't know</button>
                ${this.currentCardIndex > 0 ? `<button class="btn btn-secondary" onclick="app.previousCard()">← Previous</button>` : ''}
                ${this.currentCardIndex < totalCards - 1 ? `<button class="btn btn-secondary" onclick="app.nextCard()">Next →</button>` : `<button class="btn btn-success" onclick="app.switchSection('home')" style="background: var(--success);">Finished! 🎉</button>`}
            </div>
        `;
    }

    toggleCard(element) {
        element.classList.toggle('flipped');
        const hiddenContent = element.querySelector('.card-hidden-content');
        const instruction = element.querySelector('div:last-of-type');

        if (element.classList.contains('flipped')) {
            if (hiddenContent) hiddenContent.style.display = 'block';
            if (instruction) instruction.style.display = 'none';
        } else {
            if (hiddenContent) hiddenContent.style.display = 'none';
            if (instruction) instruction.style.display = 'block';
        }
    }

    nextCard() {
        if (this.currentCardIndex < this.typePracticeCards.length - 1) {
            this.currentCardIndex++;
            this.renderPracticeCard();
        }
    }

    previousCard() {
        if (this.currentCardIndex > 0) {
            this.currentCardIndex--;
            this.renderPracticeCard();
        }
    }

    revealAndContinue() {
        const flashcard = document.querySelector('.flashcard');
        if (flashcard && !flashcard.classList.contains('flipped')) {
            // Flip the card to show the answer
            flashcard.classList.add('flipped');
            const hiddenContent = flashcard.querySelector('.card-hidden-content');
            const instruction = flashcard.querySelector('div:nth-child(3)');
            if (hiddenContent) hiddenContent.style.display = 'block';
            if (instruction) instruction.style.display = 'none';
        }
    }

    // Type Practice Mode
    initTypePractice() {
        let cardsToUse = [];
        
        if (this.practiceCategory === 'words') {
            cardsToUse = [...this.cards];
        } else if (this.practiceCategory === 'phrases') {
            cardsToUse = [...this.phrases];
        }
        
        if (cardsToUse.length === 0) {
            document.getElementById('practiceContent').innerHTML = `
                <div class="empty-state">
                    <p>No ${this.practiceCategory} to practice. <a href="#" onclick="app.switchSection('${this.practiceCategory === 'words' ? 'add' : 'addPhrases'}')">Add some first!</a></p>
                </div>
            `;
            return;
        }

        // Shuffle cards
        this.typePracticeCards = this.shuffleArray([...cardsToUse]);
        this.typeCurrentCardIndex = 0;
        this.renderTypePracticeCard();
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    renderTypePracticeCard() {
        const totalCards = this.typePracticeCards.length;
        const card = this.typePracticeCards[this.typeCurrentCardIndex];

        document.getElementById('currentCard').textContent = this.typeCurrentCardIndex + 1;
        document.getElementById('totalCards2').textContent = totalCards;

        const definitions = Array.isArray(card.definitions) ? card.definitions : [card.english || ''];

        document.getElementById('practiceContent').innerHTML = `
            <div class="type-practice-card">
                <div class="type-question">
                    <div class="type-label">What does this mean?</div>
                    <div class="type-word">${this.escapeHtml(card.finnish)}</div>
                </div>
                <div class="type-input-section">
                    <input 
                        type="text" 
                        id="typeAnswer" 
                        class="type-answer-input" 
                        placeholder="Type your answer..."
                        autocomplete="off"
                    >
                    <button class="btn btn-secondary btn-small" onclick="app.showTypeAnswer()" id="showAnswerBtn">📖 Show answer</button>
                    <div id="typeFeedback" class="type-feedback"></div>
                </div>
                <div id="typeDefinitions" class="type-definitions" style="display: none;">
                    <div class="type-label">Correct answer(s):</div>
                    ${definitions.map(def => `<div class="type-definition-item">• ${this.escapeHtml(def)}</div>`).join('')}
                </div>
                <div id="typeControls" class="type-controls" style="display: none;">
                    ${this.typeCurrentCardIndex < totalCards - 1 ? 
                        `<button class="btn btn-primary" onclick="app.nextTypeCard()">Next →</button>` : 
                        `<button class="btn btn-success" onclick="app.switchSection('home')" style="background: var(--success);">Finished! 🎉</button>`}
                </div>
            </div>
        `;

        // Focus on input
        setTimeout(() => document.getElementById('typeAnswer').focus(), 100);

        // Setup answer checking
        document.getElementById('typeAnswer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const isCorrect = this.checkTypePracticeAnswer();
                if (isCorrect && this.typeCurrentCardIndex < this.typePracticeCards.length - 1) {
                    setTimeout(() => this.nextTypeCard(), 800);
                } else if (isCorrect && this.typeCurrentCardIndex === this.typePracticeCards.length - 1) {
                    setTimeout(() => this.switchSection('home'), 800);
                }
            }
        });
    }

    checkTypePracticeAnswer() {
        const userAnswer = document.getElementById('typeAnswer').value.trim().toLowerCase();
        const card = this.typePracticeCards[this.typeCurrentCardIndex];
        const definitions = Array.isArray(card.definitions) ? card.definitions : [card.english || ''];

        const correct = definitions.some(def => def.toLowerCase() === userAnswer);

        const feedback = document.getElementById('typeFeedback');
        const definitionsDisplay = document.getElementById('typeDefinitions');
        const controls = document.getElementById('typeControls');
        const input = document.getElementById('typeAnswer');

        if (correct) {
            feedback.className = 'type-feedback type-correct';
            feedback.innerHTML = '✓ Correct! (Press Enter or click Next)';
            input.disabled = true;
            definitionsDisplay.style.display = 'none';
            controls.style.display = 'block';
            return true;
        } else {
            feedback.className = 'type-feedback type-wrong';
            feedback.innerHTML = '✗ Wrong, try again...';
            input.select();
            return false;
        }
    }

    nextTypeCard() {
        if (this.typeCurrentCardIndex < this.typePracticeCards.length - 1) {
            this.typeCurrentCardIndex++;
            this.renderTypePracticeCard();
        }
    }

    showTypeAnswer() {
        const card = this.typePracticeCards[this.typeCurrentCardIndex];
        const definitions = Array.isArray(card.definitions) ? card.definitions : [card.english || ''];
        const feedback = document.getElementById('typeFeedback');
        const definitionsDisplay = document.getElementById('typeDefinitions');
        const controls = document.getElementById('typeControls');
        const input = document.getElementById('typeAnswer');
        const showBtn = document.getElementById('showAnswerBtn');

        feedback.className = 'type-feedback type-skipped';
        feedback.innerHTML = '✓ No problem! Here\'s the answer:';
        input.disabled = true;
        if (showBtn) showBtn.style.display = 'none';
        definitionsDisplay.style.display = 'block';
        controls.style.display = 'block';
    }

    // Update all views
    updateAllViews() {
        // Update home stats
        document.getElementById('totalCards').textContent = this.cards.length;
        document.getElementById('totalPhrases').textContent = this.phrases.length;

        // Render all cards view
        this.renderAllCards();
        
        // Render all phrases view
        this.renderPhrasesList();
    }

    // Utility
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Backup & Export
    exportCards() {
        const backup = {
            words: this.cards,
            phrases: this.phrases,
            exportDate: new Date().toLocaleDateString(),
            exportTime: new Date().toLocaleTimeString()
        };

        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Finnish-Flashcards-Backup-${new Date().getTime()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert('✓ Backup downloaded! Save it in a safe place like your Documents folder.');
    }

    importCards(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backup = JSON.parse(e.target.result);
                
                if (!backup.words || !backup.phrases) {
                    alert('❌ Invalid backup file');
                    return;
                }

                if (confirm('⚠️ This will replace all your current cards with the backup. Are you sure?')) {
                    this.cards = backup.words || [];
                    this.phrases = backup.phrases || [];
                    this.saveCards();
                    this.savePhrases();
                    alert('✓ Backup restored! All your cards are back.');
                }
            } catch (err) {
                alert('❌ Error reading backup file: ' + err.message);
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }
}

// Global function for switching sections (used in HTML)
function switchSection(sectionId) {
    app.switchSection(sectionId);
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FlashcardApp();
});
