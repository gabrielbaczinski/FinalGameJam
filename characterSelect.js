let selectedCharacters = {
    player1: null,
    player2: null
};

function initCharacterSelect() {
    console.log('Iniciando seleção de personagens');
    const p1Grid = document.querySelector('#character-select .player1 .character-list');
    const p2Grid = document.querySelector('#character-select .player2 .character-list');
    
    if (!p1Grid || !p2Grid) {
        console.error('Elementos da grade de personagens não encontrados');
        return;
    }

    console.log('Criando cards de personagens');
    Object.entries(CHARACTERS).forEach(([id, char]) => {
        p1Grid.appendChild(createCharacterButton(id, char, 1));
        p2Grid.appendChild(createCharacterButton(id, char, 2));
    });

    // Habilita/desabilita o botão de início
    updateStartButton();
}

function createCharacterButton(id, char, player) {
    const button = document.createElement('button');
    button.className = 'character-button p-4 w-full text-center bg-game-darker hover:bg-game-red transition-colors rounded-lg';
    button.innerHTML = `
        <div class="char-preview mb-2 mx-auto w-20 h-20 rounded-full" 
             style="background-color: rgb(${char.color.join(',')})"></div>
        <h4 class="font-bold">${char.name}</h4>
    `;
    
    button.addEventListener('click', () => selectCharacter(id, player));
    return button;
}

function selectCharacter(id, player) {
    selectedCharacters[`player${player}`] = id;
    
    // Atualiza visual dos botões
    const playerGrid = document.querySelector(`#character-select .player${player} .character-list`);
    playerGrid.querySelectorAll('.character-button').forEach(btn => {
        btn.classList.remove('selected', 'bg-game-red');
    });
    
    const selectedButton = playerGrid.querySelector(`[data-char-id="${id}"]`);
    if (selectedButton) {
        selectedButton.classList.add('selected', 'bg-game-red');
    }

    updateStartButton();
}

function updateStartButton() {
    const startButton = document.getElementById('startFight');
    const canStart = selectedCharacters.player1 && selectedCharacters.player2;
    startButton.disabled = !canStart;
    
    if (canStart) {
        startButton.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        startButton.classList.add('opacity-50', 'cursor-not-allowed');
    }
}