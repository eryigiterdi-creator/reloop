document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const campaignCards = document.querySelectorAll('.campaign-card');
  const reserveButtons = document.querySelectorAll('.reserve-btn');
  const usageButtons = document.querySelectorAll('.usage-btn');
  const redeemButtons = document.querySelectorAll('.redeem-btn');
  const mapCards = document.querySelectorAll('.map-card');

  const pointsBalance = document.getElementById('points-balance');
  const walletBalanceBig = document.getElementById('wallet-balance-big');
  const leaderboardPoints = document.getElementById('leaderboard-points');
  const leaderboardSidebarPoints = document.getElementById('leaderboard-sidebar-points');
  const leaderboardRank = document.getElementById('leaderboard-rank');
  const liveFeedback = document.getElementById('live-feedback');
  const walletHistory = document.getElementById('wallet-history');
  const activeBonLabel = document.getElementById('active-bon-label');
  const userLevel = document.getElementById('user-level');
  const validatedCount = document.getElementById('validated-count');
  const badgeCount = document.getElementById('badge-count');
  const subscriptionStatus = document.getElementById('subscription-status');
  const badgeItems = document.querySelectorAll('.badge-item');
  const notificationList = document.getElementById('notification-list');
  const historyList = document.getElementById('deposit-history');
  const notifBtn = document.getElementById('notif-btn');

  const trackerCode = document.getElementById('tracker-code');
  const trackerScan = document.getElementById('tracker-scan');
  const trackerValidation = document.getElementById('tracker-validation');
  const trackerNote = document.getElementById('tracker-note');
  const scanBtn = document.getElementById('scan-btn');
  const validateBtn = document.getElementById('validate-btn');

  const bonStatusChip = document.getElementById('bon-status-chip');
  const bonExpiry = document.getElementById('bon-expiry');
  const bonTitle = document.getElementById('bon-title');
  const bonSubtitle = document.getElementById('bon-subtitle');
  const bonCode = document.getElementById('bon-code');
  const bonLocation = document.getElementById('bon-location');
  const bonPoints = document.getElementById('bon-points');
  const bonStatus = document.getElementById('bon-status');
  const qrCanvas = document.getElementById('qr-canvas');

  const levelCurrentPoints = document.getElementById('level-current-points');
  const levelNextTarget = document.getElementById('level-next-target');
  const levelProgressFill = document.getElementById('level-progress-fill');
  const profileLevelTitle = document.getElementById('profile-level-title');
  const profileLevelProgressFill = document.getElementById('profile-level-progress-fill');
  const levelHelper = document.getElementById('level-helper');
  const levelChip = document.getElementById('level-chip');
  const levelPerks = document.getElementById('level-perks');
  const roadmapSteps = document.querySelectorAll('.level-step');

  let balance = 280;
  let concoursPoints = 820;
  let rank = 12;
  let validatedDeposits = 3;
  let unlockedBadges = 2;
  let activeDeposit = null;
  let qr = null;
  let subscriptionActive = false;

  const levelConfig = [
    { min: 0, title: 'Niveau 1 · Départ textile', perks: ['Découverte des demandes', 'Suivi du premier bon', 'Accès aux points de base'] },
    { min: 60, title: 'Niveau 2 · Tri débutant', perks: ['+1% bonus dépôt', 'Alerte campagne locale', 'Historique simplifié'] },
    { min: 140, title: 'Niveau 3 · Apporteur utile', perks: ['+2% bonus dépôt', '1 mission flash / mois', 'Badge profil visible'] },
    { min: 240, title: 'Niveau 4 · Collecteur local', perks: ['+3% bonus dépôt', '1 mission flash / semaine', 'Badge visible au classement'] },
    { min: 360, title: 'Niveau 5 · Trieur fiable', perks: ['+4% bonus dépôt', 'Accès aux drops premium', 'Priorité atelier local'] },
    { min: 500, title: 'Niveau 6 · Booster campus', perks: ['+5% bonus dépôt', '1 booster concours réduit', 'Challenge campus débloqué'] },
    { min: 660, title: 'Niveau 7 · Acteur circulaire', perks: ['+6% bonus dépôt', 'Récompenses exclusives', 'Stats d’impact détaillées'] },
    { min: 840, title: 'Niveau 8 · Ambassadeur textile', perks: ['+7% bonus dépôt', 'Badge doré concours', 'File rapide sur campagnes urgentes'] },
    { min: 1040, title: 'Niveau 9 · Leader quartier', perks: ['+8% bonus dépôt', '1 lot surprise / mois', 'Visibilité renforcée au classement'] },
    { min: 1260, title: 'Niveau 10 · Capitaine collecte', perks: ['+10% bonus dépôt', 'Ticket concours mensuel offert', 'Accès beta aux nouvelles missions'] },
    { min: 1500, title: 'Niveau 11 · Expert réemploi', perks: ['+12% bonus dépôt', 'Réductions premium', 'Statut expert sur le profil'] },
    { min: 1760, title: 'Niveau 12 · Maître Loop & Wear', perks: ['+15% bonus dépôt', 'Récompenses VIP', 'Top profil sur la saison'] }
  ];

  const notificationsPool = [
    'Nouvelle campagne manteaux publiée près de Rivetoile.',
    'Votre bonus campus est disponible pendant 24 h.',
    'Une benne proche accepte maintenant le denim en bon état.',
    'Une mission flash vous donne +30 pts concours sur les sweats.',
    'Un nouveau palier de niveau est presque atteint.'
  ];

  if (window.QRious && qrCanvas) {
    qr = new QRious({ element: qrCanvas, size: 170, value: 'Loop & Wear' });
  }

  const updateFeedback = (message) => {
    if (liveFeedback) liveFeedback.textContent = message;
  };

  const updateWallet = (message) => {
    if (walletHistory) walletHistory.textContent = message;
  };

  const getCurrentLevel = () => {
    let current = levelConfig[0];
    let next = null;
    levelConfig.forEach((level, index) => {
      if (balance >= level.min) {
        current = level;
        next = levelConfig[index + 1] || null;
      }
    });
    return { current, next, index: levelConfig.findIndex((level) => level.min === current.min) };
  };

  const updateLevel = () => {
    const { current, next, index } = getCurrentLevel();
    const start = current.min;
    const end = next ? next.min : current.min + 240;
    const progress = next ? ((balance - start) / (end - start)) * 100 : 100;
    const nextLabel = next ? `Prochain palier : ${next.min} XP` : 'Palier max atteint';

    userLevel.textContent = current.title;
    if (profileLevelTitle) profileLevelTitle.textContent = current.title;
    if (levelCurrentPoints) levelCurrentPoints.textContent = `${balance} XP`;
    if (levelNextTarget) levelNextTarget.textContent = nextLabel;
    if (levelChip) levelChip.textContent = `${balance} XP`;
    if (levelProgressFill) levelProgressFill.style.width = `${Math.max(6, Math.min(100, progress))}%`;
    if (profileLevelProgressFill) profileLevelProgressFill.style.width = `${Math.max(6, Math.min(100, progress))}%`;

    if (levelHelper) {
      levelHelper.textContent = next
        ? `Encore ${Math.max(0, next.min - balance)} XP pour atteindre ${next.title}.`
        : 'Tu as atteint le plus haut niveau de progression actuellement disponible.';
    }

    if (levelPerks) {
      levelPerks.innerHTML = '';
      current.perks.forEach((perk) => {
        const span = document.createElement('span');
        span.textContent = perk;
        levelPerks.appendChild(span);
      });
    }

    roadmapSteps.forEach((step, stepIndex) => {
      step.classList.remove('active', 'current');
      if (stepIndex < index) step.classList.add('active');
      if (stepIndex === index) step.classList.add('current');
    });
  };

  const refreshScoreboard = () => {
    pointsBalance.textContent = balance;
    walletBalanceBig.textContent = balance;
    leaderboardPoints.textContent = concoursPoints;
    leaderboardSidebarPoints.textContent = `${concoursPoints} pts`;
    leaderboardRank.textContent = rank;
    validatedCount.textContent = validatedDeposits;
    badgeCount.textContent = unlockedBadges;
    subscriptionStatus.textContent = subscriptionActive ? 'Plus' : 'Standard';
    updateLevel();
  };

  const estimateRank = () => {
    if (concoursPoints >= 1180) rank = 1;
    else if (concoursPoints >= 1105) rank = 2;
    else if (concoursPoints >= 1030) rank = 3;
    else if (concoursPoints >= 970) rank = 4;
    else if (concoursPoints >= 900) rank = 5;
    else if (concoursPoints >= 860) rank = 8;
    else rank = 12;
  };

  const unlockBadge = (index) => {
    if (badgeItems[index] && !badgeItems[index].classList.contains('active')) {
      badgeItems[index].classList.add('active');
      unlockedBadges += 1;
    }
  };

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => navLinks.classList.remove('open')));
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      campaignCards.forEach((card) => {
        const shouldShow = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !shouldShow);
      });

      updateFeedback(`Filtre appliqué : ${button.textContent}.`);
    });
  });

  const renderDeposit = () => {
    if (!activeDeposit) return;

    bonStatusChip.textContent = activeDeposit.statusChip;
    bonExpiry.textContent = `Validité : ${activeDeposit.expiry}`;
    bonTitle.textContent = activeDeposit.campaign;
    bonSubtitle.textContent = `${activeDeposit.category} · dépôt prévu à ${activeDeposit.location}`;
    bonCode.textContent = activeDeposit.code;
    bonLocation.textContent = activeDeposit.location;
    bonPoints.textContent = `${activeDeposit.points} pts max`;
    bonStatus.textContent = activeDeposit.statusText;
    activeBonLabel.textContent = activeDeposit.code;

    trackerCode.textContent = `Bon ${activeDeposit.code} créé pour « ${activeDeposit.campaign} ».`;
    trackerScan.textContent = activeDeposit.scanned
      ? `QR code scanné à ${activeDeposit.location}. Le dépôt est enregistré.`
      : 'En attente du scan à la benne ou au point relais.';
    trackerValidation.textContent = activeDeposit.validated
      ? `Dépôt validé. +${activeDeposit.points} points portefeuille crédités.`
      : 'En attente du contrôle qualité et de la confirmation terrain.';

    trackerNote.textContent = activeDeposit.validated
      ? 'Le dépôt a été contrôlé et accepté. Les points sont utilisables dans la boutique cashback et le concours.'
      : activeDeposit.scanned
        ? 'Le scan a bien associé le dépôt au bon. Il reste maintenant la validation par le point de collecte ou le centre de tri.'
        : 'Le client montre ce QR code à la benne connectée ou au point partenaire. Le scan déclenche l’enregistrement du dépôt.';

    scanBtn.disabled = activeDeposit.scanned;
    validateBtn.disabled = !activeDeposit.scanned || activeDeposit.validated;

    if (qr) {
      qr.value = JSON.stringify({
        app: 'Loop & Wear',
        code: activeDeposit.code,
        campaign: activeDeposit.campaign,
        location: activeDeposit.location,
        points: activeDeposit.points
      });
    }
  };

  reserveButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const code = `LNW-${Math.floor(10000 + Math.random() * 90000)}`;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 2);
      const expiry = expiryDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

      activeDeposit = {
        code,
        campaign: button.dataset.campaign,
        category: button.dataset.category,
        location: button.dataset.location,
        points: Number(button.dataset.points),
        scanned: false,
        validated: false,
        statusChip: 'Bon créé',
        statusText: 'À présenter au scan',
        expiry
      };

      reserveButtons.forEach((btn) => {
        btn.disabled = false;
        btn.textContent = 'Créer un bon de dépôt';
      });
      button.disabled = true;
      button.textContent = 'Bon généré';

      renderDeposit();
      document.querySelector('#bons')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      updateFeedback(`Bon ${code} généré pour « ${activeDeposit.campaign} ». Le client peut maintenant aller à ${activeDeposit.location} et faire scanner le QR code.`);
    });
  });

  scanBtn?.addEventListener('click', () => {
    if (!activeDeposit) {
      updateFeedback('Crée d’abord un bon de dépôt.');
      return;
    }

    activeDeposit.scanned = true;
    activeDeposit.statusChip = 'Scanné';
    activeDeposit.statusText = 'Dépôt reçu · contrôle en attente';
    renderDeposit();
    updateFeedback(`Le bon ${activeDeposit.code} a été scanné à ${activeDeposit.location}. Le dépôt est maintenant traçable dans l’application.`);
  });

  validateBtn?.addEventListener('click', () => {
    if (!activeDeposit || !activeDeposit.scanned) {
      updateFeedback('Le QR code doit être scanné avant validation.');
      return;
    }
    if (activeDeposit.validated) {
      updateFeedback('Ce dépôt est déjà validé.');
      return;
    }

    activeDeposit.validated = true;
    activeDeposit.statusChip = 'Validé';
    activeDeposit.statusText = 'Contrôle accepté';
    balance += activeDeposit.points;
    concoursPoints += Math.round(activeDeposit.points * 0.35);
    validatedDeposits += 1;
    unlockBadge(2);
    estimateRank();
    refreshScoreboard();
    renderDeposit();
    updateWallet(`Dépôt validé pour ${activeDeposit.campaign}, +${activeDeposit.points} points ajoutés au portefeuille.`);

    const item = document.createElement('li');
    item.innerHTML = `<strong>${activeDeposit.code}</strong> · ${activeDeposit.campaign} · Validé · +${activeDeposit.points} pts`;
    historyList.prepend(item);

    updateFeedback(`Dépôt validé : ${activeDeposit.points} points crédités et bonus concours ajouté automatiquement.`);
  });

  usageButtons.forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelector(button.dataset.scroll || '#cashback')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      updateFeedback('Les points gagnés peuvent être convertis directement dans la boutique cashback ci-dessous.');
    });
  });

  redeemButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const cost = Number(button.dataset.cost || 0);
      const reward = button.dataset.reward;

      if (balance < cost) {
        updateFeedback(`Solde insuffisant : il manque ${cost - balance} points pour cet avantage.`);
        return;
      }

      balance -= cost;
      let action = 'Avantage activé';

      if (reward === 'contest') {
        concoursPoints += 50;
        action = 'Booster concours activé, +50 pts concours ajoutés';
      }
      if (reward === 'subscription') {
        action = 'Loop & Wear Plus activé pour 1 mois';
        subscriptionActive = true;
        unlockBadge(3);
      }
      if (reward === 'cinema') action = 'Place de cinéma ajoutée dans l’espace avantages';
      if (reward === 'nike') action = 'Coupon 5 € marque partenaire débloqué';
      if (reward === 'atelier') action = 'Atelier upcycling premium réservé';
      if (reward === 'friperie') action = 'Bon 10 € friperie partenaire ajouté au portefeuille';

      estimateRank();
      refreshScoreboard();
      button.disabled = true;
      button.textContent = 'Activé';
      updateWallet(action + '.');
      updateFeedback(`Récompense activée : ${action}. Les points ont été débités du portefeuille.`);
    });
  });

  notifBtn?.addEventListener('click', () => {
    const li = document.createElement('li');
    li.textContent = notificationsPool[Math.floor(Math.random() * notificationsPool.length)];
    notificationList.prepend(li);
    updateFeedback('Nouvelle notification ajoutée au profil utilisateur.');
  });

  if (window.L && document.getElementById('collecte-map')) {
    const map = L.map('collecte-map').setView([48.579, 7.746], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    mapCards.forEach((card) => {
      const lat = Number(card.dataset.lat);
      const lng = Number(card.dataset.lng);
      const name = card.dataset.name;
      const address = card.dataset.address;
      const marker = L.marker([lat, lng]).addTo(map).bindPopup(`<strong>${name}</strong><br>${address}`);

      card.addEventListener('click', () => {
        mapCards.forEach((item) => item.classList.remove('active'));
        card.classList.add('active');
        map.flyTo([lat, lng], 15, { duration: 0.8 });
        marker.openPopup();
        updateFeedback(`Point de collecte sélectionné : ${name}.`);
      });
    });

    if (mapCards[0]) mapCards[0].click();
  }

  refreshScoreboard();
});


  const subscribePlanBtn = document.getElementById("subscribe-plan-btn");
  subscribePlanBtn?.addEventListener("click", () => {
    if (subscriptionActive) {
      updateFeedback("L’abonnement Plus est déjà actif sur ce compte.");
      return;
    }
    subscriptionActive = true;
    unlockBadge(3);
    refreshScoreboard();
    updateWallet("Abonnement Loop & Wear Plus activé depuis l’onglet dédié.");
    updateFeedback("Abonnement Plus activé : bonus, offres exclusives et accès prioritaire débloqués.");
    document.querySelector("#profil")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
