// ... JavaScript (no changes needed from the previous version for these specific requests)
    function updateClock() {
      const now = new Date();
      const options = { timeZone: 'Europe/Rome', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
      const time = now.toLocaleTimeString('it-IT', options);
      const clockElement = document.getElementById('clock');
      if (clockElement) clockElement.textContent = time;
    }
    setInterval(updateClock, 1000);
    updateClock();

    document.addEventListener('DOMContentLoaded', function() {
      // QR Modal
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

        if (startsOpen) {
            openContent();
        } else {
            closeContent();
        }

        button.addEventListener('click', function(e) {
          if (button.tagName.toLowerCase() === 'a') {
            e.preventDefault();
          }

          const isCurrentlyOpen = button.getAttribute('aria-expanded') === 'true';
          if (isCurrentlyOpen) {
            closeContent();
          } else {
            openContent();
          }
        });
      }

      setupCollapsible('infoTesseraButton', 'userInfoDetailsDropdown', 'infoTesseraChevron', false);
      setupCollapsible('validationHeaderButton', 'validationContentArea', 'validationChevron', true);
      setupCollapsible('leggiTuttoLink', 'dettagliContent', 'leggiTuttoChevron', false);
    });
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(() => {
    console.log('SW registered');
  }).catch(console.error);
}