(() => {
  const layer = document.getElementById('bubbleLayer');
  if (!layer || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const count = 13;
  for (let i = 0; i < count; i++) {
    const b = document.createElement('i');
    b.className = 'water-bubble';
    const size = 5 + Math.random() * 10;
    b.style.width = `${size}px`;
    b.style.height = `${size}px`;
    b.style.left = `${4 + Math.random() * 92}%`;
    b.style.setProperty('--dur', `${5 + Math.random() * 5}s`);
    b.style.setProperty('--delay', `${-Math.random() * 8}s`);
    b.style.setProperty('--drift', `${-24 + Math.random() * 48}px`);
    layer.appendChild(b);
  }
})();
