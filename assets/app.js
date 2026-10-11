(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- language ---------- */
  var langBtns = Array.prototype.slice.call(document.querySelectorAll('[data-lang-set]'));
  function setLang(l) {
    root.setAttribute('data-lang', l);
    root.setAttribute('lang', l === 'en' ? 'en' : 'ko');
    langBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang-set') === l ? 'true' : 'false');
    });
    try { localStorage.setItem('lang', l); } catch (e) {}
  }
  langBtns.forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang-set')); });
  });
  var savedLang = null;
  try { savedLang = localStorage.getItem('lang'); } catch (e) {}
  setLang(savedLang === 'en' ? 'en' : 'ko');

  /* ---------- theme ---------- */
  var themeBtn = document.getElementById('themeBtn');
  try {
    var savedTheme = localStorage.getItem('theme');
    if (savedTheme) root.setAttribute('data-theme', savedTheme);
  } catch (e) {}
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var cur = root.getAttribute('data-theme') || (sysDark ? 'dark' : 'light');
      var next = cur === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---------- scroll spy ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.rail nav a[href^="#"]'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function setActive(id) {
    links.forEach(function (a) {
      a.setAttribute('aria-current', a.getAttribute('href') === '#' + id ? 'true' : 'false');
    });
  }

  if ('IntersectionObserver' in window) {
    if (sections.length) {
      var spy = new IntersectionObserver(function (entries) {
        var vis = entries
          .filter(function (e) { return e.isIntersecting; })
          .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
        if (vis.length) setActive(vis[0].target.id);
      }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
      sections.forEach(function (s) { spy.observe(s); });
      setActive(sections[0].id);
    }

    /* ---------- reveal ---------- */
    if (!reduce) {
      var vh = window.innerHeight;
      var below = Array.prototype.slice.call(document.querySelectorAll('.rv'))
        .filter(function (el) { return el.getBoundingClientRect().top > vh * 0.9; });
      below.forEach(function (el) { el.classList.add('pending'); });
      var rev = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.remove('pending'); rev.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      below.forEach(function (el) { rev.observe(el); });
    }
  }

  /* ---------- click-to-play demo videos ---------- */
  Array.prototype.slice.call(document.querySelectorAll('.demo-thumb[data-yt]'))
    .forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-yt');
        var frame = document.createElement('iframe');
        frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
        frame.title = btn.getAttribute('data-title') || 'Demo video';
        frame.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
        frame.allowFullscreen = true;
        btn.innerHTML = '';
        btn.appendChild(frame);
        btn.style.cursor = 'default';
      }, { once: true });
    });

  /* ---------- interactive schema diagram ---------- */
  var dgm = document.querySelector('.dgm');
  if (dgm) {
    var info = document.querySelector('.dgm-info');
    var cards = info ? Array.prototype.slice.call(info.querySelectorAll('[data-for]')) : [];
    var idle = info ? info.querySelector('.idle-card') : null;
    var nodes = Array.prototype.slice.call(dgm.querySelectorAll('.node'));
    var edges = Array.prototype.slice.call(dgm.querySelectorAll('.edge'));
    var locked = null;

    function edgeEnds(edge) {
      return (edge.getAttribute('data-ends') || '').split(' ').filter(Boolean);
    }

    function show(name) {
      dgm.classList.add('is-focused');
      var related = {};
      related[name] = true;
      edges.forEach(function (ed) {
        var ends = edgeEnds(ed);
        var hit = ends.indexOf(name) !== -1;
        ed.classList.toggle('on', hit);
        if (hit) ends.forEach(function (n) { related[n] = true; });
      });
      nodes.forEach(function (n) {
        var id = n.getAttribute('data-node');
        n.classList.toggle('on', !!related[id]);
        n.classList.toggle('root', id === name);
      });
      cards.forEach(function (c) { c.hidden = c.getAttribute('data-for') !== name; });
      if (idle) idle.hidden = true;
    }

    function clear() {
      dgm.classList.remove('is-focused');
      nodes.forEach(function (n) { n.classList.remove('on', 'root'); });
      edges.forEach(function (e) { e.classList.remove('on'); });
      cards.forEach(function (c) { c.hidden = true; });
      if (idle) idle.hidden = false;
    }

    nodes.forEach(function (n) {
      var name = n.getAttribute('data-node');
      n.addEventListener('mouseenter', function () { if (!locked) show(name); });
      n.addEventListener('mouseleave', function () { if (!locked) clear(); });
      n.addEventListener('focus', function () { if (!locked) show(name); });
      n.addEventListener('blur', function () { if (!locked) clear(); });
      n.addEventListener('click', function () {
        if (locked === name) { locked = null; clear(); }
        else { locked = name; show(name); }
      });
      n.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); n.click(); }
      });
    });

    document.addEventListener('click', function (ev) {
      if (locked && !dgm.contains(ev.target)) { locked = null; clear(); }
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && locked) { locked = null; clear(); }
    });
  }
})();
