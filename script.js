    // --- Constants ---
    const TICKET_DURATION_MINUTES = 75;
    const ACTIVATION_STORAGE_KEY = 'ticket75ActivationTimestamp';
    const ROME_TIME_ZONE = 'Europe/Rome';
    const ROME_LOCALE = 'it-IT';
    const ROME_DATE_OPTIONS = { timeZone: ROME_TIME_ZONE, day: '2-digit', month: '2-digit', year: 'numeric' };
    const ROME_TIME_OPTIONS = { timeZone: ROME_TIME_ZONE, hour: '2-digit', minute: '2-digit' };
    const ROME_DATE_TIME_OPTIONS = { timeZone: ROME_TIME_ZONE, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };

    let countdownTimerInterval = null;

    // --- Utility Functions ---
    function formatTimeForTimer(milliseconds) {
        if (milliseconds <= 0) return "Scaduto";

        let totalSeconds = Math.floor(milliseconds / 1000);
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes < 10 ? '0' + minutes : minutes}min`;
        } else {
            return `${minutes}min ${seconds < 10 ? '0' + seconds : seconds}s`;
        }
    }

    function updateLiveClock() {
      const now = new Date();
      const time = now.toLocaleTimeString(ROME_LOCALE, ROME_DATE_TIME_OPTIONS);
      const clockElement = document.getElementById('liveClock');
      if (clockElement) clockElement.textContent = time;
    }

    function startTicketCountdown(trueActivationTimestamp) {
        const tempoRestanteElement = document.getElementById('tempoRestante');
        const attivatoIlElement = document.getElementById('attivatoIl');
        const emessoIlValueElement = document.getElementById('emessoIlValue');
        const statusBanner = document.getElementById('ticketStatusBanner');

        if (!tempoRestanteElement || !attivatoIlElement || !emessoIlValueElement || !statusBanner) {
            console.error("Timer display elements not found!");
            return;
        }

        const displayEmissionTimestamp = trueActivationTimestamp - (10 * 60 * 1000);
        const displayEmissionDate = new Date(displayEmissionTimestamp);
        const activationDate = new Date(trueActivationTimestamp);

        const formattedActivationDate = activationDate.toLocaleDateString(ROME_LOCALE, ROME_DATE_OPTIONS);
        const formattedActivationTime = activationDate.toLocaleTimeString(ROME_LOCALE, ROME_TIME_OPTIONS);

        const formattedDisplayEmissionDate = displayEmissionDate.toLocaleDateString(ROME_LOCALE, ROME_DATE_OPTIONS);
        const formattedDisplayEmissionTime = displayEmissionDate.toLocaleTimeString(ROME_LOCALE, ROME_TIME_OPTIONS);

        attivatoIlElement.textContent = `Attivato il: ${formattedActivationDate} - ${formattedActivationTime}`;
        emessoIlValueElement.textContent = `${formattedDisplayEmissionDate} - ${formattedDisplayEmissionTime}`;

        const endTime = trueActivationTimestamp + (TICKET_DURATION_MINUTES * 60 * 1000);

        function updateDisplay() {
            const now = Date.now();
            const remaining = endTime - now;

            if (remaining <= 0) {
                tempoRestanteElement.textContent = "Tempo restante: Scaduto";
                if (countdownTimerInterval) clearInterval(countdownTimerInterval);
                countdownTimerInterval = null;
            } else {
                tempoRestanteElement.textContent = "Tempo restante: " + formatTimeForTimer(remaining);
            }
        }

        if (countdownTimerInterval !== null) {
            clearInterval(countdownTimerInterval);
        }
        countdownTimerInterval = null; // Ensure it's null before setting new one
        updateDisplay();
        countdownTimerInterval = setInterval(updateDisplay, 1000);
        statusBanner.classList.add('active');
    }


    document.addEventListener('DOMContentLoaded', function() {
      updateLiveClock();
      setInterval(updateLiveClock, 1000);

      const activateTicketLogo = document.getElementById('activateTicketLogo');
      const statusBanner = document.getElementById('ticketStatusBanner');
      const emessoIlValueElement = document.getElementById('emessoIlValue');
      const tempoRestanteElement = document.getElementById('tempoRestante');
      const attivatoIlElement = document.getElementById('attivatoIl');


      const storedActivationTimestamp = localStorage.getItem(ACTIVATION_STORAGE_KEY);
      if (storedActivationTimestamp) {
          const trueActivationTimestamp = parseInt(storedActivationTimestamp, 10);
          const endTime = trueActivationTimestamp + (TICKET_DURATION_MINUTES * 60 * 1000);
          if (Date.now() < endTime) {
            startTicketCountdown(trueActivationTimestamp);
          } else {
            const activationDate = new Date(trueActivationTimestamp);
            const displayEmissionTimestamp = trueActivationTimestamp - (10 * 60 * 1000);
            const displayEmissionDate = new Date(displayEmissionTimestamp);

            attivatoIlElement.textContent = `Attivato il: ${activationDate.toLocaleDateString(ROME_LOCALE, ROME_DATE_OPTIONS)} - ${activationDate.toLocaleTimeString(ROME_LOCALE, ROME_TIME_OPTIONS)}`;
            if(emessoIlValueElement) emessoIlValueElement.textContent = `${displayEmissionDate.toLocaleDateString(ROME_LOCALE, ROME_DATE_OPTIONS)} - ${displayEmissionDate.toLocaleTimeString(ROME_LOCALE, ROME_TIME_OPTIONS)}`;
            tempoRestanteElement.textContent = "Tempo restante: Scaduto";
            if(statusBanner) statusBanner.classList.add('active');
          }
      } else {
        tempoRestanteElement.textContent = `Tempo restante: ${TICKET_DURATION_MINUTES}min 00s`;
        attivatoIlElement.textContent = "Attiva cliccando il logo ASF";
        if(emessoIlValueElement) emessoIlValueElement.textContent = "--";
      }

      if (activateTicketLogo) {
        activateTicketLogo.addEventListener('click', function() {
          const existingTimestamp = localStorage.getItem(ACTIVATION_STORAGE_KEY);
          let allowActivation = true;
          if (existingTimestamp) {
            allowActivation = confirm("Un biglietto è già attivo o scaduto. Vuoi attivarne uno nuovo? Il timer e l'orario di emissione verranno resettati.");
          }
          if (allowActivation) {
            const trueActivationTimestamp = Date.now();
            localStorage.setItem(ACTIVATION_STORAGE_KEY, trueActivationTimestamp.toString());
            startTicketCountdown(trueActivationTimestamp);
            console.log("Timer activated/reset by logo. Timestamp:", trueActivationTimestamp);
          }
        });
      }

      const qrModal = document.getElementById('qrModal');
      const enlargeQrButton = document.getElementById('enlargeQrButton');
      const smallQrImage = document.getElementById('smallQrImage');
      const enlargedQrImage = document.getElementById('enlargedQrImage');
      const closeQrBtn = document.getElementById('closeQrBtn');

      if (enlargeQrButton && qrModal && smallQrImage && enlargedQrImage && closeQrBtn) {
        enlargeQrButton.addEventListener('click', function() {
          enlargedQrImage.src = smallQrImage.src;
          qrModal.style.display = 'flex';
        });
        closeQrBtn.addEventListener('click', function() { qrModal.style.display = 'none'; });
        window.addEventListener('click', function(event) {
          if (event.target === qrModal) { qrModal.style.display = 'none'; }
        });
      }

      function setupCollapsible(buttonId, contentId, chevronId, startsOpen = false) {
        const button = document.getElementById(buttonId);
        const contentElement = document.getElementById(contentId);
        const chevronElement = document.getElementById(chevronId);
        if (!button || !contentElement) { return; }

        const openContent = () => {
          button.classList.add('open');
          contentElement.classList.add('open-content');
          contentElement.style.maxHeight = contentElement.scrollHeight + "px";
          if (chevronElement) chevronElement.classList.add('open-chevron');
          button.setAttribute('aria-expanded', 'true');
        };
        const closeContent = () => {
          button.classList.remove('open');
          contentElement.classList.remove('open-content');
          contentElement.style.maxHeight = "0";
          if (chevronElement) chevronElement.classList.remove('open-chevron');
          button.setAttribute('aria-expanded', 'false');
        };

        if (startsOpen) { openContent(); } else { closeContent(); }

        button.addEventListener('click', function(e) {
          if (button.tagName.toLowerCase() === 'a') { e.preventDefault(); }
          const isCurrentlyOpen = button.getAttribute('aria-expanded') === 'true';
          if (isCurrentlyOpen) { closeContent(); } else { openContent(); }
        });
      }
      setupCollapsible('validationHeaderButton', 'validationContentArea', 'validationChevron', true);
      setupCollapsible('leggiTuttoLink', 'dettagliContent', 'leggiTuttoChevron', false);


            // --- Pull-to-Refresh Logic ---
      const ptrScrollView = document.getElementById('mainScrollView');
      const ptrIndicator = document.getElementById('ptrIndicator');
      const ptrGearImg = document.getElementById('ptrGearImg');
      const ptrCardElement = document.getElementById('mainCard');

      let ptrIsTouching = false;
      let ptrStartY = 0;
      // let ptrCurrentY = 0; // Not strictly needed if using e.touches[0].clientY directly
      let ptrPullDistance = 0;
      let ptrIsRefreshing = false;

      // Get these from CSS custom properties or define here
      const PTR_THRESHOLD = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ptr-threshold')) || 70;
      const PTR_MAX_PULL_VISUAL = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ptr-max-pull')) || 100; // Max distance card will move down
      const PTR_INDICATOR_OFFSET = 10; // How far below the header the indicator starts appearing


      if (ptrScrollView && ptrIndicator && ptrCardElement && ptrGearImg) {
        ptrScrollView.addEventListener('touchstart', (e) => {
          if (ptrIsRefreshing || e.touches.length > 1) return;

          // Only engage if scrolled to the very top
          if (ptrScrollView.scrollTop === 0) {
            ptrIsTouching = true;
            ptrStartY = e.touches[0].clientY;
            // Disable transitions for direct manipulation during drag
            ptrCardElement.style.transition = 'none';
            ptrIndicator.style.transition = 'none';
            ptrGearImg.style.transition = 'none';
          }
        }, { passive: true }); // passive:true since we conditionally preventDefault in touchmove

        ptrScrollView.addEventListener('touchmove', (e) => {
          if (!ptrIsTouching || ptrIsRefreshing || e.touches.length > 1) return;

          const currentY = e.touches[0].clientY;
          let diffY = currentY - ptrStartY;

          // Only act if pulling down from the absolute top
          if (ptrScrollView.scrollTop === 0 && diffY > 0) {
            e.preventDefault(); // We are handling the scroll
            ptrPullDistance = diffY;

            // Card movement directly proportional to pull, capped
            let cardTranslateY = Math.min(ptrPullDistance, PTR_MAX_PULL_VISUAL);
            ptrCardElement.style.transform = `translateY(${cardTranslateY}px)`;

            // Indicator visibility and position
            // It becomes more visible and moves down with the card (or slightly less)
            let indicatorOpacity = Math.min(ptrPullDistance / PTR_THRESHOLD, 1);
            ptrIndicator.style.opacity = indicatorOpacity.toString();
            // Position indicator relative to the pulled card or fixed header
            // Let's try to keep it somewhat "stuck" at a certain point below the header
            // as the card pulls further.
            let indicatorTranslateY = Math.min(ptrPullDistance, PTR_THRESHOLD + PTR_INDICATOR_OFFSET); // Indicator moves down with card until threshold
            ptrIndicator.style.transform = `translateY(${indicatorTranslateY - (PTR_INDICATOR_OFFSET*2)}px) scale(${0.8 + indicatorOpacity * 0.2})`;


            // Gear rotation proportional to pull
            let rotation = ptrPullDistance * 2.5; // Adjust multiplier for rotation speed
            ptrGearImg.style.transform = `rotate(${rotation}deg)`;

            ptrIndicator.classList.add('ptr-visible'); // Use class for base visibility if opacity isn't enough

          } else if (diffY < 0 && ptrPullDistance > 0) {
            // If user starts scrolling content up while a pull was active, smoothly reduce the pull
            ptrPullDistance = Math.max(0, ptrPullDistance + diffY); // diffY is negative
            let cardTranslateY = Math.min(ptrPullDistance, PTR_MAX_PULL_VISUAL);
            ptrCardElement.style.transform = `translateY(${cardTranslateY}px)`;

            let indicatorOpacity = Math.min(ptrPullDistance / PTR_THRESHOLD, 1);
            ptrIndicator.style.opacity = indicatorOpacity.toString();
            let indicatorTranslateY = Math.min(ptrPullDistance, PTR_THRESHOLD + PTR_INDICATOR_OFFSET);
             ptrIndicator.style.transform = `translateY(${indicatorTranslateY - (PTR_INDICATOR_OFFSET*2)}px) scale(${0.8 + indicatorOpacity * 0.2})`;


            if(ptrPullDistance === 0) {
                 ptrIndicator.classList.remove('ptr-visible'); // Hide via class too
                 ptrIndicator.style.opacity = '0';
                 ptrIsTouching = false; // Gesture effectively ended
            }
            ptrStartY = currentY; // Reset startY to current for next move delta
          } else {
            // If not pulling down from the top, or pulling up when already at top, reset touching state
             if (ptrIsTouching && ptrScrollView.scrollTop !== 0) {
                 ptrIsTouching = false;
                 // If a pull was in progress and user scrolled, snap back immediately
                 ptrCardElement.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                 ptrIndicator.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                 ptrGearImg.style.transition = 'transform 0.3s ease-in-out';

                 ptrCardElement.style.transform = 'translateY(0px)';
                 ptrIndicator.classList.remove('ptr-visible');
                 ptrIndicator.style.opacity = '0';
                 ptrIndicator.style.transform = 'scale(0.8)'; // Reset initial transform
                 ptrGearImg.style.transform = 'rotate(0deg)';
                 ptrPullDistance = 0;
             }
          }
        }, { passive: false }); // We call preventDefault

        ptrScrollView.addEventListener('touchend', () => {
          if (!ptrIsTouching || ptrIsRefreshing) {
            // If it was an overscroll from bottom, or other touch end not related to pull-to-refresh start
            // Ensure card snaps back if it was moved for any other reason and touchend happened
            if (!ptrIsRefreshing && ptrCardElement.style.transform !== '' && ptrCardElement.style.transform !== 'translateY(0px)') {
                 ptrCardElement.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                 ptrCardElement.style.transform = 'translateY(0px)';
            }
            ptrIsTouching = false;
            return;
          }
          ptrIsTouching = false;

          // Re-enable transitions for snapping back
          ptrCardElement.style.transition = 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          ptrIndicator.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          ptrGearImg.style.transition = 'transform 0.3s ease-in-out';


          if (ptrPullDistance > PTR_THRESHOLD) {
            ptrIsRefreshing = true;
            ptrIndicator.classList.add('ptr-refreshing'); // Starts CSS spin animation
            // Keep card pulled down to where the indicator is comfortably visible
            ptrCardElement.style.transform = `translateY(${PTR_INDICATOR_HEIGHT * 0.9}px)`;
            ptrIndicator.style.opacity = '1'; // Ensure it's fully visible
            ptrIndicator.style.transform = `translateY(0px) scale(1)`; // Position it correctly for refresh


            console.log("Simulating refresh via Pull-to-Refresh...");
            // --- Actual Refresh Action ---
            if (localStorage.getItem(ACTIVATION_STORAGE_KEY)) {
                localStorage.removeItem(ACTIVATION_STORAGE_KEY);
                if(countdownTimerInterval) {
                    clearInterval(countdownTimerInterval);
                    countdownTimerInterval = null;
                }
                // Reset display texts after PTR
                document.getElementById('tempoRestante').textContent = `Tempo restante: ${TICKET_DURATION_MINUTES}min 00s`;
                document.getElementById('attivatoIl').textContent = "Attiva cliccando il logo ASF";
                const emessoIlValueElement = document.getElementById('emessoIlValue');
                if(emessoIlValueElement) emessoIlValueElement.textContent = "--";
                const statusBanner = document.getElementById('ticketStatusBanner');
                if(statusBanner) statusBanner.classList.remove('active');
                console.log("75-min timer reset by PTR.");
            } else {
                console.log("No active timer to reset by PTR.");
            }
            // --- End Refresh Action ---

            setTimeout(() => {
              ptrCardElement.style.transform = 'translateY(0px)';
              ptrIndicator.classList.remove('ptr-visible'); // Hide via class
              ptrIndicator.classList.remove('ptr-refreshing');
              ptrIndicator.style.opacity = '0'; // Explicitly hide
              ptrIndicator.style.transform = 'scale(0.8)'; // Reset initial transform
              ptrGearImg.style.transform = 'rotate(0deg)';
              ptrIsRefreshing = false;
              console.log("Pull-to-Refresh UI reset complete.");
            }, 1500);
          } else { // Didn't pull enough to refresh, just snap back
            ptrCardElement.style.transform = 'translateY(0px)';
            ptrIndicator.classList.remove('ptr-visible');
            ptrIndicator.style.opacity = '0';
            ptrIndicator.style.transform = 'scale(0.8)';
            ptrGearImg.style.transform = 'rotate(0deg)';
          }
          ptrPullDistance = 0;
        });
      }
      // --- End Pull-to-Refresh Logic ---
    });