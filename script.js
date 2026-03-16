document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const campaignCards = document.querySelectorAll('.campaign-card');
  const redeemButtons = document.querySelectorAll('.redeem-btn');
  const reserveButtons = document.querySelectorAll('.reserve-btn');
  const usageButtons = document.querySelectorAll('.usage-btn');
  const mapCards = document.querySelectorAll('.map-card');
  const pointsBalance = document.querySelector('#points-balance');
  const leaderboardPoints = document.querySelector('#leaderboard-points');
  const liveFeedback = document.querySelector('#live-feedback');
  const walletHistory = document.querySelector('#wallet-history');
  const subscriptionStatus = document.querySelector('#subscription-status');
  const trackerCode = document.querySelector('#tracker-code');
  const trackerDrop = document.querySelector('#tracker-drop');
  const trackerValidation = document.querySelector('#tracker-validation');
  const trackerNote = document.querySelector('#tracker-note');
  const markDroppedBtn = document.querySelector('#mark-dropped-btn');
  const validateDepositBtn = document.querySelector('#validate-deposit-btn');

  let balance = 280;
  let classementPoints = 820;
  let currentDeposit = null;

  const setFeedback = (message) => {
    if (liveFeedback) liveFeedback.textContent = message;
    if (walletHistory && message.toLowerCase().includes('points')) walletHistory.textContent = `Dernière action : ${message}`;
  };

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      campaignCards.forEach(card => {
        const category = card.dataset.category;
        const shouldShow = filter === 'all' || filter === category;
        card.classList.toggle('hidden', !shouldShow);
      });

      setFeedback(`Filtre appliqué : ${button.textContent}.`);
    });
  });

  reserveButtons.forEach(button => {
    button.addEventListener('click', () => {
      const campaign = button.dataset.campaign || 'campagne';
      const points = Number(button.dataset.points || 0);
      const location = button.dataset.location || 'point de collecte';
      const depositCode = `LNW-${Math.floor(10000 + Math.random() * 90000)}`;

      reserveButtons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('is-disabled');
        btn.textContent = 'Créer un bon de dépôt';
      });

      button.textContent = 'Bon généré';
      button.disabled = true;
      button.classList.add('is-disabled');

      currentDeposit = { campaign, points, location, code: depositCode, dropped: false, validated: false };

      if (trackerCode) trackerCode.textContent = `Bon ${depositCode} créé pour « ${campaign} » · dépôt prévu à ${location}.`;
      if (trackerDrop) trackerDrop.textContent = 'En attente du dépôt physique par le client.';
      if (trackerValidation) trackerValidation.textContent = `En attente du scan / contrôle qualité · jusqu'à ${points} points possibles.`;
      if (trackerNote) trackerNote.textContent = `Le client montre le code ${depositCode} sur place. Le point de collecte retrouve la demande, contrôle les articles et valide ensuite le dépôt.`;
      if (markDroppedBtn) markDroppedBtn.disabled = false;
      if (validateDepositBtn) validateDepositBtn.disabled = true;

      setFeedback(`Bon de dépôt créé pour « ${campaign} » : code ${depositCode}. Le client doit maintenant déposer le sac à ${location}, puis attendre la validation.`);
    });
  });


  if (markDroppedBtn) {
    markDroppedBtn.addEventListener('click', () => {
      if (!currentDeposit) {
        setFeedback('Aucun bon de dépôt actif à déclarer.');
        return;
      }

      currentDeposit.dropped = true;
      if (trackerDrop) trackerDrop.textContent = `Dépôt déclaré par le client à ${currentDeposit.location}. Le sac attend la confirmation du point de collecte.`;
      if (trackerValidation) trackerValidation.textContent = 'Statut : dépôt reçu, contrôle qualité en cours.';
      if (trackerNote) trackerNote.textContent = 'Le dépôt a été signalé comme effectué. Dans une vraie app, une borne, un scan QR ou un agent confirme maintenant la réception.';
      markDroppedBtn.disabled = true;
      if (validateDepositBtn) validateDepositBtn.disabled = false;
      setFeedback(`Dépôt physique déclaré pour ${currentDeposit.code}. Il faut maintenant une validation du point de collecte pour créditer les points.`);
    });
  }

  if (validateDepositBtn) {
    validateDepositBtn.addEventListener('click', () => {
      if (!currentDeposit || !currentDeposit.dropped) {
        setFeedback("Le dépôt doit d'abord être marqué comme déposé.");
        return;
      }

      currentDeposit.validated = true;
      balance += currentDeposit.points;
      if (pointsBalance) pointsBalance.textContent = balance;
      if (trackerValidation) trackerValidation.textContent = `Validé : +${currentDeposit.points} points crédités pour « ${currentDeposit.campaign} ».`;
      if (trackerNote) trackerNote.textContent = `Validation terminée. Les points sont maintenant disponibles dans le portefeuille et utilisables dans la boutique cashback.`;
      if (validateDepositBtn) validateDepositBtn.disabled = true;
      setFeedback(`Dépôt validé pour « ${currentDeposit.campaign} » : +${currentDeposit.points} points ajoutés au portefeuille après contrôle.`);
    });
  }

  usageButtons.forEach(button => {
    button.addEventListener('click', () => {
      const usage = button.dataset.usage || 'usage concret visible dans la boutique cashback';
      document.querySelector('#cashback-shop')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.querySelectorAll('.reward-card').forEach(card => card.classList.remove('highlighted'));
      document.querySelector('.reward-card')?.classList.add('highlighted');
      setFeedback(`Usage des points : ${usage}. Consulte la boutique cashback pour l'activer immédiatement.`);
    });
  });

  redeemButtons.forEach(button => {
    button.addEventListener('click', () => {
      const cost = Number(button.dataset.cost || 0);

      if (balance < cost) {
        setFeedback(`Solde insuffisant : il vous manque ${cost - balance} points pour cet avantage.`);
        return;
      }

      balance -= cost;
      if (pointsBalance) pointsBalance.textContent = balance;
      button.textContent = 'Activé';
      button.disabled = true;
      button.classList.add('is-disabled');

      const reward = button.dataset.reward || '';

      if (reward === 'contest') {
        classementPoints += 50;
        if (leaderboardPoints) leaderboardPoints.textContent = `${classementPoints} pts`;
        setFeedback('Ticket concours activé : 90 points débités et +50 points ajoutés au classement mensuel.');
        return;
      }

      if (reward === 'subscription') {
        if (subscriptionStatus) subscriptionStatus.textContent = 'Abonnement actuel : Loop & Wear Plus actif via cashback';
        setFeedback('Abonnement Plus activé : 180 points débités pour 1 mois premium.');
        return;
      }

      if (reward === 'place-cinema') {
        setFeedback('Place de cinéma activée : 150 points débités. Le coupon apparaît dans les avantages de l’app.');
        return;
      }

      if (reward === 'nike-5') {
        setFeedback('Coupon 5€ activé : 220 points débités pour une réduction marque partenaire type Nike.');
        return;
      }

      if (reward === 'atelier') {
        setFeedback('Atelier partenaire réservé : 240 points débités avec accès prioritaire confirmé.');
        return;
      }

      setFeedback('Avantage activé : les points ont bien été débités dans le portefeuille.');
    });
  });

  const planEuroButton = Array.from(document.querySelectorAll('.plan-actions .btn-primary')).find(Boolean);
  if (planEuroButton) {
    planEuroButton.addEventListener('click', () => {
      if (subscriptionStatus) subscriptionStatus.textContent = 'Abonnement actuel : Loop & Wear Plus actif via paiement mensuel';
      planEuroButton.textContent = 'Abonnement activé';
      planEuroButton.disabled = true;
      planEuroButton.classList.add('is-disabled');
      setFeedback('Abonnement Plus activé par paiement mensuel : accès premium débloqué.');
    });
  }

  if (window.L && document.querySelector('#collecte-map')) {
    const first = mapCards[0];
    const map = L.map('collecte-map').setView([48.579, 7.746], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const markers = [];

    mapCards.forEach((card) => {
      const lat = Number(card.dataset.lat);
      const lng = Number(card.dataset.lng);
      const name = card.dataset.name;
      const address = card.querySelector('span')?.textContent || '';
      const marker = L.marker([lat, lng]).addTo(map).bindPopup(`<strong>${name}</strong><br>${address}<br><a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}">Ouvrir dans Google Maps</a>`);
      markers.push(marker);

      card.addEventListener('click', () => {
        mapCards.forEach(item => item.classList.remove('active'));
        card.classList.add('active');
        map.flyTo([lat, lng], 15, { duration: 0.8 });
        marker.openPopup();
        setFeedback(`Point de collecte sélectionné : ${name}.`);
      });
    });

    if (first) first.click();
  }
});
