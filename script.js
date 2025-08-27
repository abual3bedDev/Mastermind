 // ==================== DOM ELEMENTS ====================
    const gameUI = document.getElementById('gameUI');
    const timerEl = document.getElementById('timer');
    const attemptsEl = document.getElementById('attempts');
    const boardEl = document.getElementById('board');
    const input = document.getElementById('guessInput');
    const submitBtn = document.getElementById('submitBtn');
    const resetBtn = document.getElementById('resetBtn');
    const body = document.body;
    const bootSequence = document.getElementById('bootSequence');
    const gameContent = document.getElementById('gameContent');
    const matrixRain = document.getElementById('matrixRain');
    const resultScreen = document.getElementById('resultScreen');
    const resultLoader = document.querySelector('.result-loader');
    const resultFinal = document.querySelector('.result-final');
    const resultCircle = document.querySelector('.result-circle');
    const resultIcon = document.querySelector('.result-icon');
    const resultText = document.querySelector('.result-text');
    const playAgainBtn = document.getElementById('playAgainBtn');

    // ==================== GAME STATE ====================
    let secretCode = [];
    let timer = 60;
    let attempts = 0;
    const maxAttempts = 6;
    let intervalId = null;
    const BOOT_MS = 7000; // Boot sequence duration

    // ==================== MATRIX RAIN ====================
    function createWaterfallMatrix(){
      matrixRain.innerHTML = '';
      const style = document.createElement('style');
      style.textContent = `@keyframes waterfall{0%{transform:translateY(-100%);opacity:0;}5%{opacity:1;}95%{opacity:1;}100%{transform:translateY(100vh);opacity:0;}}.waterfall-column{position:absolute;top:0;width:14px;height:100%;overflow:hidden}.waterfall-stream{position:absolute;width:100%;animation:waterfall 3s linear infinite;white-space:nowrap}.matrix-char{display:block;color:#00ff41;font-size:14px;line-height:1.2;font-family:'Share Tech Mono', monospace}.fast{animation-duration:2s!important}.medium{animation-duration:4s!important}.slow{animation-duration:6s!important}`;
      document.head.appendChild(style);
      const characters = '010101010011010101010010101010100101010101001010101';
      const columns = Math.floor(window.innerWidth / 14);
      for(let i=0;i<columns;i++){
        const column = document.createElement('div');
        column.className = 'waterfall-column';
        column.style.left = (i*14) + 'px';
        const streamCount = 3 + Math.floor(Math.random()*3);
        for(let j=0;j<streamCount;j++){
          const stream = document.createElement('div');
          stream.className = 'waterfall-stream';
          const speeds = ['fast','medium','slow'];
          stream.classList.add(speeds[Math.floor(Math.random()*speeds.length)]);
          stream.style.animationDelay = `${Math.random()*3}s`;
          const charCount = 30;
          for(let k=0;k<charCount;k++){
            const ch = document.createElement('span');
            ch.className = 'matrix-char';
            ch.textContent = characters.charAt(Math.floor(Math.random()*characters.length));
            ch.style.opacity = (0.3 + Math.random()*0.7).toString();
            stream.appendChild(ch);
          }
          column.appendChild(stream);
        }
        matrixRain.appendChild(column);
      }
    }

    window.addEventListener('resize', ()=>{
      // Regen matrix rain on resize (debounced)
      clearTimeout(window.__matrixResize);
      window.__matrixResize = setTimeout(createWaterfallMatrix, 150);
    });

    // ==================== GAME CORE ====================
    function genSecret(){
      // 4-digit code, digits 0-9, can repeat
      return Array.from({length:4}, ()=> Math.floor(Math.random()*10));
    }

    function resetBoard(){ boardEl.innerHTML = ''; }

    function updateStatus(){
      timerEl.textContent = `${timer}s`;
      attemptsEl.textContent = `${attempts}/${maxAttempts}`;
      if(timer <= 10){
        timerEl.style.color = '#ff3333';
        timerEl.style.textShadow = '0 0 5px #ff3333';
      } else {
        timerEl.style.color = '#ffffff';
        timerEl.style.textShadow = '0 0 5px #ffffff';
      }
    }

    function startTimer(){
      stopTimer();
      intervalId = setInterval(()=>{
        timer--; updateStatus();
        if(timer <= 0){ endGame(false); }
      }, 1000);
    }

    function stopTimer(){ if(intervalId){ clearInterval(intervalId); intervalId = null; } }

    function startBoot(){
      body.classList.remove('hidden');
      gameUI.classList.remove('hidden','closing');
      bootSequence.classList.remove('hidden');
      gameContent.classList.add('hidden');
      resultScreen.classList.add('hidden');
      createWaterfallMatrix();
      setTimeout(()=>{ bootSequence.classList.add('hidden'); gameContent.classList.remove('hidden'); input.focus(); startGame(); }, BOOT_MS);
    }

    function startGame(){
      secretCode = genSecret();
      attempts = 0; timer = 60; resetBoard(); updateStatus(); startTimer();
      // console.log('Secret Code:', secretCode.join(''));
    }

    function feedbackRow(guess){
      const row = document.createElement('div');
      guess.forEach((num,i)=>{
        const span = document.createElement('span');
        if(num === secretCode[i]) span.className = 'green';
        else if(secretCode.includes(num)) span.className = 'yellow';
        else span.className = 'red';
        span.textContent = num; row.appendChild(span);
      });
      boardEl.appendChild(row); boardEl.scrollTop = boardEl.scrollHeight;
    }

    function handleGuess(){
      const val = input.value.trim();
      if(val.length !== 4 || !/^\d+$/.test(val)){
        input.classList.add('invalid');
        setTimeout(()=> input.classList.remove('invalid'), 800);
        return;
      }
      const guess = val.split('').map(Number);
      attempts++; updateStatus();
      feedbackRow(guess);
      input.value = '';

      if(guess.join('') === secretCode.join('')){ endGame(true); return; }
      if(attempts >= maxAttempts){ endGame(false); return; }
    }

    function showResultWithLoader(isWin){
      gameContent.classList.add('hidden');
      resultScreen.classList.remove('hidden');
      resultLoader.classList.remove('hidden');
      resultFinal.classList.add('hidden');

      setTimeout(()=>{
        resultLoader.classList.add('hidden');
        resultFinal.classList.remove('hidden');
        if(isWin){
          resultCircle.className = 'result-circle success';
          resultIcon.className = 'result-icon success';
          resultIcon.textContent = '✓';
          resultText.className = 'result-text success';
          resultText.textContent = 'ACCESS GRANTED';
        } else {
          resultCircle.className = 'result-circle failure';
          resultIcon.className = 'result-icon failure';
          resultIcon.textContent = '✗';
          resultText.className = 'result-text failure';
          resultText.textContent = 'ACCESS DENIED';
        }
        setTimeout(()=>{ resultFinal.classList.add('show'); }, 100);
      }, 1800);
    }

    function endGame(isWin){
      stopTimer();
      showResultWithLoader(isWin);
    }

    function softResetAndReboot(){
      // Reset UI for next game
      gameContent.classList.remove('hidden');
      resultScreen.classList.add('hidden');
      resultLoader.classList.add('hidden');
      resultFinal.classList.remove('show');
      resetBoard();
      input.value = '';
      input.disabled = false; submitBtn.disabled = false;
      startBoot();
    }

    // ==================== EVENTS ====================
    submitBtn.addEventListener('click', handleGuess);
    resetBtn.addEventListener('click', softResetAndReboot);
    playAgainBtn.addEventListener('click', softResetAndReboot);

    input.addEventListener('input', function(){ this.value = this.value.replace(/[^0-9]/g, '').slice(0,4); });
    input.addEventListener('keypress', (e)=>{ if(e.key === 'Enter') handleGuess(); });

    document.addEventListener('keyup', (e)=>{
      if(e.key === 'Escape') {
        // Graceful close/fade and reopen boot after short delay
        gameUI.classList.add('closing');
        setTimeout(()=>{ softResetAndReboot(); }, 300);
      }
      if(e.key.toLowerCase() === 'r') softResetAndReboot();
    });

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', ()=>{
      body.classList.remove('hidden');
      gameUI.classList.remove('hidden');
      // Start with boot every time
      startBoot();
    });