const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const filterButtons = document.querySelectorAll('.filter-btn');
const campaignCards = document.querySelectorAll('.campaign-card');

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
  });
});
