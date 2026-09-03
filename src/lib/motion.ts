/**
 * HAREKET MOTORU — data-attribute API
 *
 * Kullanım (HTML tarafında sıfır JS yazılır):
 *   [data-reveal="up|fade|left|right|scale"]   tekil giriş
 *   [data-reveal-group]                        çocuklarını sırayla açar (stagger)
 *   [data-reveal-delay="0.15"]                 gecikme
 *   [data-clip-reveal]                         aşağıdan yukarı clip-path doğuşu
 *   [data-depth="0..5"]                        derinlik katmanı parallax'ı
 *   [data-parallax="-0.3"]                     serbest parallax çarpanı
 *   [data-word-light]                          scroll ile kelime kelime aydınlanan metin
 *   [data-line-reveal]                         satır satır maskeli açılış (> span)
 *   [data-count="26"] [data-count-suffix="+"]  sayaç
 *   [data-magnetic]                            imleç manyetiği (yalnız ince işaretçi)
 *   [data-marquee] [data-marquee-speed="0.6"]  sonsuz şerit
 *   [data-hero-zoom]                           hero görselinin yavaş sinematik uzaklaşması
 *   [data-sequence]                            adım sekansı — sticky başlık (> [data-step])
 *   [data-tilt]                                hafif 3B eğim (yalnız ince işaretçi)
 *
 * GÜVENLİK AĞI: <html> üzerine `motion-ready` sınıfı yalnız JS çalıştığında
 * eklenir. JS yoksa başlangıç durumları uygulanmaz ve içerik ASLA gizli kalmaz.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DEPTH: Record<string, number> = {
  '0': 0.1,
  '1': 0.25,
  '2': 0.5,
  '3': 0.8,
  '4': 1,
  '5': 1.2,
};

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isCoarse = () => window.matchMedia('(pointer: coarse)').matches;

let listenersBound = false;
let sweepTimer = 0;

/*
 * NOT — Yumuşak scroll kütüphanesi (Lenis) BİLİNÇLİ olarak kullanılmıyor.
 * Lenis her karede scrollTop'u kendi hedefine geri yazdığı için tarayıcının
 * kendi scroll'unu ele geçiriyor: `scrollIntoView`, geri/ileri gezinmede
 * konum geri yükleme, sayfa içinde arama ve yardımcı teknolojilerin scroll'u
 * bozuluyor. Sinematik his zaten reveal + parallax katmanından geliyor;
 * tekerlek yumuşatmasının bedeli buna değmiyor.
 * Çapa bağlantıları CSS `scroll-behavior: smooth` ile çalışır ve
 * `prefers-reduced-motion` altında otomatik olarak devre dışı kalır.
 */

/* ------------------------------------------------------------------ */
/* Giriş animasyonları                                                 */
/*                                                                     */
/* IntersectionObserver kullanılır, ScrollTrigger DEĞİL. Sebep: sayfada */
/* pinlenmiş/sticky bölümler ve yumuşak scroll varken ScrollTrigger'ın  */
/* başlangıç noktaları bayatlayabiliyor ve içerik görünmez kalıyor.     */
/* IO, scroll'un nasıl gerçekleştiğinden bağımsız çalışır — programatik */
/* scroll, çapa bağlantısı, sayfa yenileme, hepsinde tetiklenir.        */
/* ------------------------------------------------------------------ */
function initReveals() {
  const show = (el: Element) => el.classList.add('is-revealed');

  const targets = document.querySelectorAll<HTMLElement>(
    '[data-reveal], [data-reveal-group], [data-clip-reveal]',
  );

  if (prefersReduced() || typeof IntersectionObserver === 'undefined') {
    document
      .querySelectorAll('[data-reveal], [data-reveal-group] > *, [data-clip-reveal]')
      .forEach(show);
    return;
  }

  const play = (el: HTMLElement) => {
    if (el.dataset.revealDone === '1') return;
    el.dataset.revealDone = '1';

    if (el.hasAttribute('data-reveal-group')) {
      const kids = Array.from(el.children);
      if (!kids.length) return;
      gsap.to(kids, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.9,
        stagger: parseFloat(el.dataset.revealStagger ?? '0.085'),
        ease: 'expo.out',
        onComplete: () => kids.forEach(show),
      });
      return;
    }

    if (el.hasAttribute('data-clip-reveal')) {
      gsap.to(el, {
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.3,
        ease: 'expo.out',
        onComplete: () => show(el),
      });
      return;
    }

    gsap.to(el, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.95,
      delay: parseFloat(el.dataset.revealDelay ?? '0'),
      ease: 'expo.out',
      onComplete: () => show(el),
    });
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        play(entry.target as HTMLElement);
        io.unobserve(entry.target);
      }
    },
    // Alt kenardan biraz erken tetikle; üstten çıkanlar da yakalansın
    { rootMargin: '0px 0px -8% 0px', threshold: 0 },
  );

  targets.forEach((el) => io.observe(el));
}

/* ------------------------------------------------------------------ */
/* Derinlik parallax'ı                                                 */
/* ------------------------------------------------------------------ */
function initDepth() {
  if (prefersReduced()) return;
  const mobile = isCoarse();

  document.querySelectorAll<HTMLElement>('[data-depth]').forEach((el) => {
    const factor = DEPTH[el.dataset.depth ?? '2'];
    if (factor === undefined) return;
    const shift = (1 - factor) * (mobile ? 6 : 14);
    if (Math.abs(shift) < 0.4) return;

    gsap.fromTo(
      el,
      { yPercent: 0 },
      {
        yPercent: shift,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('[data-scene]') ?? el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      },
    );
  });

  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = parseFloat(el.dataset.parallax ?? '0.2') * (mobile ? 0.45 : 1);
    gsap.fromTo(
      el,
      { yPercent: -amount * 50 },
      {
        yPercent: amount * 50,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('[data-scene]') ?? el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
        },
      },
    );
  });
}

/* ------------------------------------------------------------------ */
/* Hero görseli — yavaş sinematik uzaklaşma                            */
/* ------------------------------------------------------------------ */
function initHeroZoom() {
  if (prefersReduced()) return;
  document.querySelectorAll<HTMLElement>('[data-hero-zoom]').forEach((el) => {
    gsap.fromTo(
      el,
      { scale: 1.16 },
      { scale: 1, duration: 2.4, ease: 'expo.out' },
    );
    gsap.to(el, {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('[data-scene]') ?? el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.7,
      },
    });
  });
}

/* ------------------------------------------------------------------ */
/* Kelime kelime aydınlanan metin                                      */
/* ------------------------------------------------------------------ */
function initWordLight() {
  document.querySelectorAll<HTMLElement>('[data-word-light]').forEach((el) => {
    if (el.dataset.wordLightDone === '1') return;
    const words = (el.textContent ?? '').split(/\s+/).filter(Boolean);
    if (!words.length) return;

    el.textContent = '';
    const spans = words.map((w) => {
      const s = document.createElement('span');
      s.textContent = w;
      s.style.display = 'inline-block';
      s.style.whiteSpace = 'pre';
      el.appendChild(s);
      el.appendChild(document.createTextNode(' '));
      return s;
    });
    el.dataset.wordLightDone = '1';

    if (prefersReduced()) return;

    // Taban opaklık okunabilirlik sınırının üstünde tutulur: scrub tamamlanmasa
    // ya da kullanıcı sayfanın ortasına düşse bile metin okunur kalır.
    gsap.set(spans, { opacity: 0.34 });
    gsap.to(spans, {
      opacity: 1,
      ease: 'none',
      stagger: 0.5,
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        end: 'bottom 48%',
        scrub: 0.5,
      },
    });
  });
}

/* ------------------------------------------------------------------ */
/* Satır satır maskeli açılış                                          */
/* ------------------------------------------------------------------ */
function initLineReveal() {
  if (prefersReduced()) return;
  document.querySelectorAll<HTMLElement>('[data-line-reveal]').forEach((el) => {
    const lines = Array.from(el.children) as HTMLElement[];
    if (!lines.length) return;
    lines.forEach((l) => {
      const wrap = document.createElement('span');
      wrap.style.display = 'block';
      wrap.style.overflow = 'hidden';
      // Türkçe İ/Ş/Ğ üst işaretleri satır kutusunun dışına taşar; maske alanını
      // yukarı genişletip aynı miktarda negatif marjla akışı bozmadan telafi et.
      wrap.style.paddingBlockStart = '0.16em';
      wrap.style.marginBlockStart = '-0.16em';
      l.parentNode?.insertBefore(wrap, l);
      wrap.appendChild(l);
    });
    gsap.from(lines, {
      yPercent: 118,
      duration: 1.15,
      stagger: 0.085,
      ease: 'expo.out',
      delay: parseFloat(el.dataset.lineDelay ?? '0.1'),
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  });
}

/* ------------------------------------------------------------------ */
/* Sayaç                                                               */
/* ------------------------------------------------------------------ */
function initCounters() {
  const nodes = document.querySelectorAll<HTMLElement>('[data-count]');
  if (!nodes.length) return;

  const final = (el: HTMLElement) =>
    `${parseFloat(el.dataset.count ?? '0')}${el.dataset.countSuffix ?? ''}`;

  if (prefersReduced() || typeof IntersectionObserver === 'undefined') {
    nodes.forEach((el) => (el.textContent = final(el)));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        io.unobserve(el);
        const end = parseFloat(el.dataset.count ?? '0');
        const suffix = el.dataset.countSuffix ?? '';
        const obj = { v: 0 };
        gsap.to(obj, {
          v: end,
          duration: 1.6,
          ease: 'expo.out',
          onUpdate: () => {
            el.textContent = `${Math.round(obj.v)}${suffix}`;
          },
        });
      }
    },
    { threshold: 0.4 },
  );

  nodes.forEach((el) => io.observe(el));
}

/* ------------------------------------------------------------------ */
/* Sonsuz şerit (marquee)                                              */
/* ------------------------------------------------------------------ */
function initMarquee() {
  document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((el) => {
    const track = el.firstElementChild as HTMLElement | null;
    if (!track || track.dataset.marqueeDone === '1') return;
    track.innerHTML += track.innerHTML; // içeriği ikizle — kesintisiz döngü
    track.dataset.marqueeDone = '1';
    if (prefersReduced()) return;

    const speed = parseFloat(el.dataset.marqueeSpeed ?? '0.5');
    const tween = gsap.to(track, {
      xPercent: -50,
      duration: 60 / speed / 3,
      ease: 'none',
      repeat: -1,
    });

    // Scroll yönüne göre hızlanma — sinematik detay
    if (!isCoarse()) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          tween.timeScale(1 + Math.min(Math.abs(self.getVelocity() / 900), 3));
          gsap.to(tween, { timeScale: 1, duration: 0.8, overwrite: true });
        },
      });
    }
  });
}

/* ------------------------------------------------------------------ */
/* Adım sekansı — "çağrıdan teslimata"                                 */
/*                                                                     */
/* Sol sütun CSS `position: sticky` ile durur; adımlar normal akışta    */
/* kayar. Aktif adım IntersectionObserver ile belirlenir — pin yok,     */
/* pin-spacer yok, dolayısıyla düzen kayması ve bayat tetikleyici yok.  */
/* ------------------------------------------------------------------ */
function initSequence() {
  document.querySelectorAll<HTMLElement>('[data-sequence]').forEach((scene) => {
    const steps = Array.from(scene.querySelectorAll<HTMLElement>('[data-step]'));
    const bar = scene.querySelector<HTMLElement>('[data-sequence-progress]');
    if (steps.length < 2) return;

    const setActive = (idx: number) => {
      steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      if (bar) bar.style.setProperty('--progress', `${((idx + 1) / steps.length) * 100}%`);
    };

    if (prefersReduced() || typeof IntersectionObserver === 'undefined') {
      steps.forEach((s) => s.classList.add('is-active'));
      if (bar) bar.style.setProperty('--progress', '100%');
      return;
    }

    setActive(0);

    // Ekranın orta bandına giren adım aktif olur
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setActive(steps.indexOf(entry.target as HTMLElement));
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );

    steps.forEach((s) => io.observe(s));
  });
}

/* ------------------------------------------------------------------ */
/* İmleç manyetiği + eğim (yalnız ince işaretçi)                       */
/* ------------------------------------------------------------------ */
function initPointerFx() {
  if (prefersReduced() || isCoarse()) return;

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic || '0.22');
    const reset = () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - (r.left + r.width / 2)) * strength,
        y: (e.clientY - (r.top + r.height / 2)) * strength,
        duration: 0.5,
        ease: 'power3.out',
      });
    });
    el.addEventListener('pointerleave', reset);
    el.addEventListener('blur', reset);
  });

  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    const max = parseFloat(el.dataset.tilt || '4');
    el.style.transformStyle = 'preserve-3d';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        rotateY: ((e.clientX - r.left) / r.width - 0.5) * max * 2,
        rotateX: -((e.clientY - r.top) / r.height - 0.5) * max * 2,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 900,
      });
    });
    el.addEventListener('pointerleave', () =>
      gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out' }),
    );
  });
}

/* ------------------------------------------------------------------ */
/* Başlat                                                              */
/* ------------------------------------------------------------------ */
export function initMotion() {
  document.documentElement.classList.add('motion-ready');
  gsap.ticker.lagSmoothing(0);

  initWordLight();
  initLineReveal();
  initReveals();
  initDepth();
  initHeroZoom();
  initCounters();
  initMarquee();
  initSequence();
  initPointerFx();

  // Fontlar yüklendikten sonra ölçümleri tazele — yanlış tetikleme noktası olmaz
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

  // GÜVENLİK AĞI: erken kesilen bir tween ya da gözlemcinin kaçırdığı bir öğe
  // yüzünden görünmez kalan hiçbir içerik olmasın.
  const sweep = () => {
    document
      .querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-group] > *, [data-clip-reveal]')
      .forEach((el) => {
        if (el.classList.contains('is-revealed')) return;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.98 && r.bottom > 0) {
          const parent = el.parentElement;
          el.dataset.revealDone = '1';
          if (parent?.hasAttribute('data-reveal-group')) parent.dataset.revealDone = '1';
          gsap.to(el, {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            clipPath: 'inset(0 0 0% 0)',
            duration: 0.6,
            ease: 'expo.out',
            onComplete: () => el.classList.add('is-revealed'),
          });
        }
      });
  };
  window.addEventListener(
    'scroll',
    () => {
      window.clearTimeout(sweepTimer);
      sweepTimer = window.setTimeout(sweep, 220);
    },
    { passive: true },
  );
  window.setTimeout(sweep, 1200);

  // Astro geçişlerinde temizlik — dinleyiciler yalnız bir kez bağlanır
  if (!listenersBound) {
    listenersBound = true;
    document.addEventListener('astro:before-swap', () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      document.documentElement.classList.remove('motion-ready');
    });
    document.addEventListener('astro:page-load', () => initMotion());
  }
}
