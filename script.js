document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const nav = $('nav');
  const menuBtn = $('menu-btn');
  const liveCard = $('live-card');
  const pointsBalance = $('points-balance');
  const walletBalance = $('wallet-balance');
  const validatedCount = $('validated-count');
  const co2Count = $('co2-count');
  const levelTitle = $('level-title');
  const profileLevel = $('profile-level');
  const currentXp = $('current-xp');
  const nextXp = $('next-xp');
  const levelFill = $('level-fill');
  const profileFill = $('profile-fill');
  const levelHelper = $('level-helper');
  const subscriptionState = $('subscription-state');
  const contestScore = $('contest-score');
  const plusBadge = $('plus-badge');

  const bonChip = $('bon-chip');
  const bonValidity = $('bon-validity');
  const bonTitle = $('bon-title');
  const bonText = $('bon-text');
  const bonCode = $('bon-code');
  const bonLocation = $('bon-location');
  const bonReward = $('bon-reward');
  const bonStatus = $('bon-status');
  const track1 = $('track-1');
  const track2 = $('track-2');
  const track3 = $('track-3');

  const codeList = $('code-list');
  const cashbackHistory = $('cashback-history');
  const depositHistory = $('deposit-history');
  const notifList = $('notif-list');
  const walletLast = $('wallet-last');

  const modal = $('reward-modal');
  const modalTitle = $('modal-title');
  const modalText = $('modal-text');
  const modalCode = $('modal-code');
  const openLink = $('open-link');

  let points = 1280;
  let validated = 4;
  let contest = 920;
  let co2 = 480;
  let subscriptionActive = false;
  let activeBon = null;
  let qr = null;

  const levels = [
    { min: 0, title: 'Niveau 1 · Départ textile' },
    { min: 60, title: 'Niveau 2 · Tri débutant' },
    { min: 140, title: 'Niveau 3 · Apporteur utile' },
    { min: 240, title: 'Niveau 4 · Collecteur local' },
    { min: 360, title: 'Niveau 5 · Trieur fiable' },
    { min: 500, title: 'Niveau 6 · Booster campus' },
    { min: 660, title: 'Niveau 7 · Acteur circulaire' },
    { min: 840, title: 'Niveau 8 · Ambassadeur textile' },
    { min: 1040, title: 'Niveau 9 · Leader quartier' },
    { min: 1260, title: 'Niveau 10 · Capitaine collecte' },
    { min: 1500, title: 'Niveau 11 · Expert réemploi' },
    { min: 1760, title: 'Niveau 12 · Maître Loop & Wear' }
  ];

  const notifications = [
    'Nouvelle campagne manteaux publiée près de Rivetoile.',
    'Une mission flash denim rapporte +25 pts concours.',
    'Votre bon actif expire bientôt, pensez à déposer avant ce soir.',
    'Un partenaire local a ajouté une récompense exclusive.',
    'Une nouvelle entreprise cherche des sweats unis sur Strasbourg.'
  ];

  if (window.QRious) {
    qr = new QRious({ element: $('qr-canvas'), size: 180, value: 'Loop & Wear Strasbourg' });
  }

  function setLive(text) {
    liveCard.textContent = text;
  }

  function currentLevelInfo() {
    let current = levels[0];
    let next = levels[1];
    levels.forEach((level, idx) => {
      if (points >= level.min) {
        current = level;
        next = levels[idx + 1] || null;
      }
    });
    return { current, next };
  }

  function renderStats() {
    const { current, next } = currentLevelInfo();
    const start = current.min;
    const end = next ? next.min : start + 260;
    const ratio = Math.max(6, Math.min(100, ((points - start) / (end - start)) * 100));
    pointsBalance.textContent = points;
    walletBalance.textContent = points;
    validatedCount.textContent = validated;
    co2Count.textContent = co2;
    levelTitle.textContent = current.title;
    profileLevel.textContent = current.title;
    currentXp.textContent = `${points} XP`;
    nextXp.textContent = next ? `Prochain palier : ${next.min} XP` : 'Palier max atteint';
    levelFill.style.width = `${ratio}%`;
    profileFill.style.width = `${ratio}%`;
    levelHelper.textContent = next ? `Encore ${next.min - points} XP pour atteindre ${next.title}.` : 'Tu as atteint le niveau maximum.';
    subscriptionState.textContent = `Statut actuel : ${subscriptionActive ? 'Loop & Wear Plus' : 'Standard'}`;
    if (subscriptionActive) plusBadge.classList.add('active');
    else plusBadge.classList.remove('active');
  }

  function addHistory(listEl, html) {
    const empty = listEl.querySelector('.empty-state');
    if (empty) empty.remove();
    const li = document.createElement('li');
    li.innerHTML = html;
    listEl.prepend(li);
  }

  function openModal(title, text, code, link) {
    modalTitle.textContent = title;
    modalText.textContent = text;
    modalCode.textContent = code || '—';
    if (link) {
      openLink.href = link;
      openLink.classList.remove('hidden');
    } else {
      openLink.href = '#';
      openLink.classList.add('hidden');
    }
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }

  function randomCode(prefix) {
    return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.campaign-card').forEach((card) => {
        card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
      });
      setLive(`Filtre actif : ${btn.textContent}.`);
    });
  });

  document.querySelectorAll('.reserve-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const code = `LNW-${Math.floor(10000 + Math.random() * 90000)}`;
      activeBon = {
        code,
        campaign: btn.dataset.campaign,
        location: btn.dataset.location,
        reward: Number(btn.dataset.points),
        scanned: false,
        validated: false
      };
      bonChip.textContent = 'Bon créé';
      bonValidity.textContent = 'Validité : 48 h';
      bonTitle.textContent = activeBon.campaign;
      bonText.textContent = 'Présente ce bon au point de collecte choisi. Le scan enregistre le dépôt avant validation.';
      bonCode.textContent = activeBon.code;
      bonLocation.textContent = activeBon.location;
      bonReward.textContent = `${activeBon.reward} pts estimés`;
      bonStatus.textContent = 'Créé';
      track1.textContent = `Bon ${activeBon.code} créé pour la campagne ${activeBon.campaign}.`;
      track2.textContent = 'En attente du scan à la collecte.';
      track3.textContent = 'Validation non déclenchée.';
      if (qr) qr.value = `${activeBon.code} | ${activeBon.campaign} | ${activeBon.location}`;
      setLive(`Bon ${activeBon.code} créé avec succès.`);
      window.location.hash = 'bons';
    });
  });

  $('scan-btn').addEventListener('click', () => {
    if (!activeBon) {
      setLive('Aucun bon actif à scanner.');
      return;
    }
    activeBon.scanned = true;
    bonChip.textContent = 'Déposé';
    bonStatus.textContent = 'Scanné à la collecte';
    track2.textContent = `Dépôt scanné à ${activeBon.location}.`; 
    track3.textContent = 'En attente du contrôle qualité par le partenaire.';
    setLive(`Le dépôt ${activeBon.code} a bien été scanné.`);
  });

  $('validate-btn').addEventListener('click', () => {
    if (!activeBon) {
      setLive('Crée d’abord un bon de dépôt.');
      return;
    }
    if (!activeBon.scanned) {
      setLive('Le bon doit être scanné à la collecte avant validation.');
      return;
    }
    if (activeBon.validated) {
      setLive('Ce dépôt a déjà été validé.');
      return;
    }
    activeBon.validated = true;
    points += activeBon.reward;
    validated += 1;
    contest += 40;
    co2 += 18;
    bonChip.textContent = 'Validé';
    bonStatus.textContent = 'Conforme';
    track3.textContent = `Dépôt validé : +${activeBon.reward} pts crédités.`;
    addHistory(depositHistory, `<strong>${activeBon.code}</strong> · ${activeBon.campaign} · Validé · +${activeBon.reward} pts`);
    setLive(`Dépôt validé : ${activeBon.reward} points ajoutés à votre compte.`);
    renderStats();
  });

  document.querySelectorAll('.redeem-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cost = Number(btn.dataset.cost);
      if (points < cost) {
        openModal('Solde insuffisant', `Il te manque ${cost - points} pts pour débloquer cet avantage.`, '—', '');
        return;
      }

      const title = btn.dataset.title;
      let code = btn.dataset.code || randomCode('LOOP');
      const link = btn.dataset.link || '';
      points -= cost;
      let modalText = `Votre avantage a été activé. Copiez ce code et utilisez-le chez le partenaire.`;

      if (title === 'Booster concours') {
        contest += 120;
        code = 'BOOST120';
        modalText = 'Votre booster est activé. 120 points ont été ajoutés au classement mensuel.';
      }

      if (title === 'Loop & Wear Plus') {
        subscriptionActive = true;
        modalText = 'Loop & Wear Plus est activé pour 30 jours. Vos avantages premium sont désormais disponibles.';
      }

      walletLast.textContent = title;
      addHistory(cashbackHistory, `<strong>${title}</strong> · ${cost} pts · Activé aujourd’hui`);
      addHistory(codeList, `<strong>${title}</strong> · Code : <span>${code}</span>${link ? ` · <a href="${link}" target="_blank" rel="noopener">Ouvrir le site</a>` : ''}`);
      openModal(title, modalText, code, link);
      setLive(`${title} activé avec succès.`);
      renderStats();
      contestScore.textContent = `${contest} pts`;
    });
  });

  $('copy-btn').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(modalCode.textContent);
      $('copy-btn').textContent = 'Code copié';
      setTimeout(() => $('copy-btn').textContent = 'Copier le code', 1500);
    } catch {
      $('copy-btn').textContent = 'Copie impossible';
      setTimeout(() => $('copy-btn').textContent = 'Copier le code', 1500);
    }
  });

  $('modal-close').addEventListener('click', closeModal);
  $('modal-backdrop').addEventListener('click', closeModal);

  $('subscribe-btn').addEventListener('click', () => {
    subscriptionActive = !subscriptionActive;
    setLive(subscriptionActive ? 'Loop & Wear Plus activé.' : 'Loop & Wear Plus désactivé.');
    renderStats();
  });

  $('notif-btn').addEventListener('click', () => {
    addHistory(notifList, notifications[Math.floor(Math.random() * notifications.length)]);
    setLive('Nouvelle notification ajoutée.');
  });

  $('partner-btn').addEventListener('click', () => {
    $('partner-feedback').textContent = 'Demande partenaire envoyée. Un rendez-vous de qualification peut être proposé sous 48 h.';
    setLive('Demande partenaire envoyée.');
  });

  $('contact-btn').addEventListener('click', () => {
    $('contact-feedback').textContent = 'Message envoyé. Merci, nous revenons vers vous rapidement.';
    setLive('Message de contact envoyé.');
  });

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  if (window.L) {
    const map = L.map('map').setView([48.5839, 7.7455], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const pointsData = [
      ['Esplanade · Borne 1', 48.5838, 7.7680],
      ['Rivetoile · Point relais', 48.5737, 7.7579],
      ['Neudorf · Borne 3', 48.5652, 7.7608],
      ['Gare centrale · Borne 4', 48.5854, 7.7340],
      ['Krutenau · Borne 5', 48.5796, 7.7544]
    ];

    pointsData.forEach(([label, lat, lng]) => L.marker([lat, lng]).addTo(map).bindPopup(label));
  }

  renderStats();
});
