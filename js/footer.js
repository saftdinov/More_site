// Подключение общего футера из footer.html на всех страницах.
document.addEventListener('DOMContentLoaded', async () => {
  const mount = document.querySelector('[data-footer]');
  if (!mount) return;
  try { const response = await fetch('footer.html'); if (!response.ok) throw new Error('footer.html не найден'); mount.innerHTML = await response.text(); }
  catch (error) { mount.innerHTML = '<footer class="footer"><div class="footer-content"><div class="footer-col"><h3 class="footer-title">море</h3><p class="footer-subtitle">кавер-группа</p></div><div class="footer-col"><a class="footer-link" href="index.html">Главная</a><br><a class="footer-link" href="index_portfolio.html">Портфолио</a></div><div class="footer-col"><a class="footer-link" href="index_bronirovanie.html">Забронировать выступление</a></div></div><div class="footer-bottom">© 2026 Кавер-группа «Море»</div></footer>'; console.warn(error); }
});
