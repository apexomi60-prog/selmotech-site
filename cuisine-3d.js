// Scène 3D de l'accroche : aliments et fiches techniques qui flottent derrière le texte.
// Tout est construit en code (aucune image ni modèle externe), dans les couleurs du site :
// cuivre, papier thermique, rouge ticket, ardoise, inox.
// Règles : jamais devant le texte (le canevas est sous le contenu), pause hors écran,
// version immobile si l'appareil demande moins d'animation, rien du tout si WebGL manque.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const section = document.querySelector('.accroche');
const canevas = document.getElementById('scene-cuisine');
const reduire = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── Palette du site ─────────────────────────────────────────────────────────
const C = {
  cuivre: 0xb8581b,
  cuivreClair: 0xe08a4f,
  saumon: 0xee9a6a,
  papier: 0xfffdf8,
  rouge: 0xb3261e,
  ardoise: 0x1f2b2a,
  sauge: 0x4f6b5e, // vert tiré de l'ardoise, pour les herbes
  inox: 0x9aa4a1,
  encre: 0x1b2226,
  champignon: 0xe9dcc6,
};

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas: canevas, antialias: true, alpha: true, powerPreference: 'low-power' });
} catch (e) {
  renderer = null;
}

if (renderer && section) demarrer();

function demarrer() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  // Lumière de cuisine : chaude par la gauche, rappel froid (inox) par la droite
  scene.add(new THREE.HemisphereLight(0xfff4e8, 0xc9d0cd, 0.9));
  const cle = new THREE.DirectionalLight(0xffe2c4, 1.6);
  cle.position.set(-5, 6, 8);
  scene.add(cle);
  const contre = new THREE.DirectionalLight(0xdfe8e6, 0.7);
  contre.position.set(6, -2, 4);
  scene.add(contre);

  const monde = new THREE.Group();
  scene.add(monde);

  const mat = (couleur, opts = {}) =>
    new THREE.MeshStandardMaterial({ color: couleur, roughness: 0.55, metalness: 0, flatShading: true, ...opts });

  // ─── Aliments (low-poly, à facettes) ───────────────────────────────────────
  function tomate() {
    const g = new THREE.Group();
    const fruit = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 1), mat(C.rouge, { roughness: 0.35 }));
    fruit.scale.set(1, 0.84, 1);
    g.add(fruit);
    for (let i = 0; i < 5; i++) {
      const sepale = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.42, 4), mat(C.sauge));
      const a = (i / 5) * Math.PI * 2;
      sepale.position.set(Math.cos(a) * 0.14, 0.5, Math.sin(a) * 0.14);
      sepale.rotation.set(Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2);
      g.add(sepale);
    }
    const tige = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.22, 6), mat(C.sauge));
    tige.position.y = 0.6;
    g.add(tige);
    return g;
  }

  function carotte() {
    const g = new THREE.Group();
    const corps = new THREE.Mesh(new THREE.ConeGeometry(0.26, 1.7, 8, 4), mat(C.cuivreClair));
    corps.rotation.z = Math.PI;
    g.add(corps);
    for (let i = 0; i < 3; i++) {
      const fane = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.6, 4), mat(C.sauge));
      fane.position.set((i - 1) * 0.08, 1.05, 0);
      fane.rotation.z = (i - 1) * 0.35;
      g.add(fane);
    }
    g.rotation.z = 0.6;
    return g;
  }

  function saumon() {
    const g = new THREE.Group();
    const chair = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.42, 0.72, 2, 1, 1), mat(C.saumon, { roughness: 0.6 }));
    g.add(chair);
    const peau = new THREE.Mesh(new THREE.BoxGeometry(1.37, 0.07, 0.74), mat(0x48535a, { roughness: 0.4 }));
    peau.position.y = -0.24;
    g.add(peau);
    for (let i = 0; i < 4; i++) {
      const gras = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.74), mat(C.papier));
      gras.position.set(-0.45 + i * 0.3, 0.22, 0);
      gras.rotation.y = 0.35;
      g.add(gras);
    }
    return g;
  }

  function champignon() {
    const g = new THREE.Group();
    const chapeau = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      mat(C.champignon, { side: THREE.DoubleSide })
    );
    chapeau.scale.y = 0.75;
    g.add(chapeau);
    const pied = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.22, 0.55, 8), mat(C.papier));
    pied.position.y = -0.27;
    g.add(pied);
    return g;
  }

  function basilic() {
    const g = new THREE.Group();
    const feuille = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 6), mat(C.sauge, { roughness: 0.45 }));
    feuille.scale.set(1, 0.09, 0.55);
    g.add(feuille);
    const nervure = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 0.03), mat(0x6f8a7d));
    nervure.position.y = 0.04;
    g.add(nervure);
    g.rotation.x = 0.9;
    return g;
  }

  function casserole() {
    const g = new THREE.Group();
    const profil = [
      [0, -0.45], [0.62, -0.45], [0.68, -0.38], [0.7, 0.3], [0.76, 0.36], [0.7, 0.38], [0.64, 0.32], [0.62, -0.38], [0, -0.38],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const cuve = new THREE.Mesh(
      new THREE.LatheGeometry(profil, 24),
      new THREE.MeshStandardMaterial({ color: C.cuivre, metalness: 0.85, roughness: 0.28, side: THREE.DoubleSide })
    );
    g.add(cuve);
    const manche = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.09, 0.16),
      new THREE.MeshStandardMaterial({ color: C.inox, metalness: 0.9, roughness: 0.25 })
    );
    manche.position.set(1.25, 0.22, 0);
    manche.rotation.z = 0.18;
    g.add(manche);
    g.rotation.x = 0.45;
    return g;
  }

  function poivre() {
    const g = new THREE.Group();
    const m = mat(C.encre, { roughness: 0.7 });
    [[0, 0, 0], [0.32, 0.18, 0.1], [-0.28, 0.22, -0.1], [0.12, -0.3, 0.15], [-0.18, -0.22, 0.05]].forEach(([x, y, z]) => {
      const grain = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 0), m);
      grain.position.set(x, y, z);
      g.add(grain);
    });
    return g;
  }

  // ─── Fiches techniques (papier thermique, comme les bons du site) ──────────
  const FICHES = {
    cesar: {
      fr: ['Salade César', '1 portion'], en: ['Caesar salad', '1 serving'],
      lignes: [
        [['Romaine 120 g', 'Romaine 120 g'], 0.58],
        [['Parmesan 15 g', 'Parmesan 15 g'], 0.41],
        [['Croûtons 25 g', 'Croutons 25 g'], 0.22],
        [['Vinaigrette 40 ml', 'Dressing 40 ml'], 0.74],
        [['Bacon 20 g', 'Bacon 20 g'], 0.32],
      ],
      prix: 14,
    },
    poutine: {
      fr: ['Poutine', '1 portion'], en: ['Poutine', '1 serving'],
      lignes: [
        [['Frites 300 g', 'Fries 300 g'], 0.61],
        [['Fromage en grains 120 g', 'Cheese curds 120 g'], 1.48],
        [['Sauce 150 ml', 'Gravy 150 ml'], 0.55],
      ],
      prix: 12,
    },
    saumon: {
      fr: ['Pavé de saumon', '1 portion'], en: ['Salmon fillet', '1 serving'],
      lignes: [
        [['Saumon 160 g', 'Salmon 160 g'], 3.36],
        [['Riz 80 g', 'Rice 80 g'], 0.28],
        [['Légumes 120 g', 'Vegetables 120 g'], 0.62],
        [['Beurre citron 20 g', 'Lemon butter 20 g'], 0.34],
      ],
      prix: 16,
    },
  };

  const LARG = 512;
  const HAUT = 704;

  function dessinerFiche(ctx, cle, langue) {
    const f = FICHES[cle];
    const en = langue === 'en';
    const argent = v => new Intl.NumberFormat(en ? 'en-CA' : 'fr-CA', { style: 'currency', currency: 'CAD' }).format(v);
    const pct = v => new Intl.NumberFormat(en ? 'en-CA' : 'fr-CA', { maximumFractionDigits: 1 }).format(v) + (en ? '%' : ' %');
    const cout = f.lignes.reduce((s, l) => s + l[1], 0);
    const marge = ((f.prix - cout) / f.prix) * 100;

    ctx.clearRect(0, 0, LARG, HAUT);
    // Papier avec bord inférieur dentelé
    const dent = 18;
    ctx.fillStyle = '#FFFDF8';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(LARG, 0);
    ctx.lineTo(LARG, HAUT - dent);
    for (let x = LARG; x > 0; x -= dent * 2) {
      ctx.lineTo(x - dent, HAUT);
      ctx.lineTo(x - dent * 2, HAUT - dent);
    }
    ctx.closePath();
    ctx.fill();

    const mono = '"IBM Plex Mono", Menlo, Consolas, monospace';
    const m = 40;
    let y = 72;
    const tiret = yy => {
      ctx.save();
      ctx.strokeStyle = 'rgba(34,38,42,0.5)';
      ctx.setLineDash([8, 7]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m, yy);
      ctx.lineTo(LARG - m, yy);
      ctx.stroke();
      ctx.restore();
    };
    const ligne = (g, d, police, couleur = '#22262A') => {
      ctx.font = police;
      ctx.fillStyle = couleur;
      ctx.textAlign = 'left';
      ctx.fillText(g, m, y);
      if (d) {
        ctx.textAlign = 'right';
        ctx.fillText(d, LARG - m, y);
      }
    };

    ligne(en ? 'RECIPE CARD' : 'FICHE TECHNIQUE', 'ORDO', `600 26px ${mono}`);
    ctx.fillStyle = '#B8581B';
    ctx.fillRect(LARG - m - 8, y - 40, 8, 8);
    y += 26;
    tiret(y);
    y += 50;
    ligne((en ? f.en : f.fr)[0], null, `600 34px ${mono}`);
    y += 34;
    ligne((en ? f.en : f.fr)[1], null, `400 22px ${mono}`, '#575E62');
    y += 28;
    tiret(y);
    y += 44;
    f.lignes.forEach(([noms, v]) => {
      ligne(noms[en ? 1 : 0], argent(v), `400 23px ${mono}`);
      y += 38;
    });
    y += 2;
    tiret(y);
    y += 46;
    ligne(en ? 'PORTION COST' : 'COÛT PORTION', argent(cout), `600 25px ${mono}`);
    y += 40;
    ligne(en ? 'SELLING PRICE' : 'PRIX DE VENTE', argent(f.prix), `400 23px ${mono}`, '#575E62');
    y += 44;
    ligne(en ? 'MARGIN' : 'MARGE', pct(marge), `600 30px ${mono}`, '#B8581B');
  }

  function dessinerDos(ctx) {
    ctx.clearRect(0, 0, LARG, HAUT);
    // Dos discret : papier, logo cuivre (un aplat cuivre plein attirait trop l'œil derrière le titre)
    ctx.fillStyle = '#F6F1E8';
    ctx.fillRect(0, 0, LARG, HAUT - 18);
    ctx.fillStyle = '#B8581B';
    ctx.textAlign = 'center';
    ctx.font = '800 92px "Archivo", "Arial Narrow", Arial, sans-serif';
    ctx.fillText('Ordo.', LARG / 2, HAUT / 2 + 10);
    ctx.fillStyle = '#9AA4A1';
    ctx.font = '500 24px "IBM Plex Mono", Menlo, monospace';
    ctx.fillText('Selmo Tech', LARG / 2, HAUT / 2 + 60);
  }

  const fiches = [];
  function fiche(cle) {
    const recto = document.createElement('canvas');
    recto.width = LARG;
    recto.height = HAUT;
    const verso = document.createElement('canvas');
    verso.width = LARG;
    verso.height = HAUT;
    const texRecto = new THREE.CanvasTexture(recto);
    const texVerso = new THREE.CanvasTexture(verso);
    [texRecto, texVerso].forEach(t => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
    });
    const geo = new THREE.PlaneGeometry(1.6, 1.6 * (HAUT / LARG));
    const g = new THREE.Group();
    const avant = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: texRecto, roughness: 0.9, alphaTest: 0.5 }));
    const arriere = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: texVerso, roughness: 0.6, alphaTest: 0.5 }));
    arriere.rotation.y = Math.PI;
    g.add(avant, arriere);
    const objet = { cle, recto, verso, texRecto, texVerso };
    fiches.push(objet);
    return g;
  }

  function redessinerFiches() {
    const langue = document.documentElement.lang === 'en' ? 'en' : 'fr';
    fiches.forEach(f => {
      dessinerFiche(f.recto.getContext('2d'), f.cle, langue);
      dessinerDos(f.verso.getContext('2d'));
      f.texRecto.needsUpdate = true;
      f.texVerso.needsUpdate = true;
    });
    if (reduire) rendre();
  }

  // ─── Placement : ancres en fraction de l'écran, loin du texte ──────────────
  // Bureau : nx, ny ∈ [-1, 1] (gauche/droite, bas/haut).
  // Téléphone : nx, puis la hauteur est accrochée à un élément de la page ({ sel, f } = fraction
  // de sa hauteur) ou donnée en pixels depuis le haut, pour rester dans les vides à droite du texte.
  // `mobile: null` = caché sur téléphone.
  const elements = [
    { creer: tomate, bureau: [-0.92, 0.42, 0], mobile: [0.8, { sel: '.h1-autres', f: 0.83 }, 0], taille: 1 },
    { creer: basilic, bureau: [-0.93, -0.32, 0.5], mobile: null, taille: 0.9 },
    { creer: poivre, bureau: [-0.93, -0.78, 1], mobile: [0.84, { sel: '.accroche-actions', f: 0.78 }, 1], taille: 1 },
    { creer: champignon, bureau: [0.18, -0.9, 0], mobile: null, taille: 0.9 },
    { creer: carotte, bureau: [0.7, -0.88, 0.5], mobile: null, taille: 0.9 },
    { creer: saumon, bureau: [0.91, -0.42, 0.5], mobile: null, taille: 0.85 },
    { creer: casserole, bureau: [0.86, 0.72, -0.5], mobile: null, taille: 0.8 },
    { creer: () => fiche('cesar'), bureau: [0.1, 0.8, -5], mobile: [0.8, 70, -3], taille: 1.1, fiche: true },
    { creer: () => fiche('poutine'), bureau: [-0.97, 0.9, -5], mobile: null, taille: 1.1, fiche: true },
    { creer: () => fiche('saumon'), bureau: [0.95, 0.05, -5], mobile: null, taille: 1.25, fiche: true },
  ];

  const objets = elements.map((e, i) => {
    const pivot = new THREE.Group(); // reçoit la position et le flottement
    const corps = e.creer(); // reçoit la rotation propre
    const rot = corps.rotation.clone();
    pivot.add(corps);
    monde.add(pivot);
    return {
      ...e,
      pivot,
      corps,
      rotBase: rot,
      phase: i * 1.37,
      vitesse: e.fiche ? 0.35 + (i % 3) * 0.08 : 0.25 + (i % 4) * 0.07,
      echelle: 0,
      survol: 0,
      base: new THREE.Vector3(),
      visible: true,
    };
  });

  function placer() {
    const w = section.clientWidth;
    const h = section.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const telephone = w < 720;
    // Taille visée à l'écran pour un objet de « taille 1 » (en pixels), quelle que soit la profondeur
    const pixelsVises = telephone ? 46 : Math.min(110, Math.max(70, w / 15));
    objets.forEach(o => {
      const ancre = telephone ? o.mobile : o.bureau;
      o.visible = !!ancre;
      o.pivot.visible = o.visible;
      if (!ancre) return;
      const [nx, vy, z] = ancre;
      let ny = vy;
      if (telephone) {
        let py = vy;
        if (typeof vy === 'object') {
          const el = section.querySelector(vy.sel);
          const r = el ? el.getBoundingClientRect() : null;
          py = r ? r.top - section.getBoundingClientRect().top + r.height * vy.f : 80;
        }
        ny = 1 - (2 * py) / h;
      }
      const distance = camera.position.z - z;
      const hauteur = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
      const largeur = hauteur * camera.aspect;
      o.base.set((nx * largeur) / 2, (ny * hauteur) / 2, z);
      const pixelsParUnite = h / hauteur;
      o.tailleFinale = (o.taille * pixelsVises) / pixelsParUnite;
    });
  }

  // ─── Interaction : souris, défilement, survol ──────────────────────────────
  const souris = new THREE.Vector2(0, 0);
  const sourisCible = new THREE.Vector2(0, 0);
  const pointeurNdc = new THREE.Vector2(9, 9);
  const rayon = new THREE.Raycaster();
  const zoneRail = document.querySelector('.zone-rail');

  if (!reduire) {
    window.addEventListener(
      'pointermove',
      e => {
        const r = section.getBoundingClientRect();
        if (e.clientY > r.bottom) { pointeurNdc.set(9, 9); return; }
        sourisCible.set((e.clientX / window.innerWidth) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
        pointeurNdc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
      },
      { passive: true }
    );
  }

  // ─── Boucle ────────────────────────────────────────────────────────────────
  const horloge = new THREE.Clock();
  let actif = true;
  let debut = null;

  function rendre() {
    renderer.render(scene, camera);
  }

  function image() {
    if (!actif) return;
    requestAnimationFrame(image);
    const t = horloge.getElapsedTime();
    if (debut === null) debut = t;
    const depuis = t - debut;

    souris.lerp(sourisCible, 0.05);
    camera.position.x = souris.x * 0.9;
    camera.position.y = souris.y * 0.55;
    camera.lookAt(0, 0, 0);

    // Le défilement fait monter et pivoter légèrement la scène
    const defile = Math.min(1, window.scrollY / Math.max(1, section.offsetHeight));
    monde.position.y = defile * 2.2;
    monde.rotation.x = defile * 0.25;

    // Survol : l'objet sous la souris tourne plus vite et grossit un peu
    rayon.setFromCamera(pointeurNdc, camera);
    const touche = rayon.intersectObjects(objets.filter(o => o.visible).map(o => o.pivot), true)[0];
    let survole = null;
    if (touche) survole = objets.find(o => o.pivot === touche.object.parent || o.pivot === touche.object.parent?.parent || o.pivot === touche.object.parent?.parent?.parent);

    objets.forEach((o, i) => {
      if (!o.visible) return;
      // Entrée : chaque objet arrive en ressort, décalé de 70 ms
      const p = Math.min(1, Math.max(0, (depuis - i * 0.07) / 0.9));
      const ressort = p === 0 ? 0 : 1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2);
      o.survol += ((o === survole ? 1 : 0) - o.survol) * 0.12;
      o.pivot.scale.setScalar(o.tailleFinale * ressort * (1 + 0.12 * o.survol));

      const flotte = Math.sin(t * 0.8 + o.phase) * 0.18;
      o.pivot.position.set(o.base.x, o.base.y + flotte, o.base.z - (1 - p) * 3);

      const tour = t * o.vitesse * (1 + 2.5 * o.survol);
      if (o.fiche) {
        o.corps.rotation.set(Math.sin(t * 0.5 + o.phase) * 0.15, tour, Math.sin(t * 0.3 + o.phase) * 0.08);
      } else {
        o.corps.rotation.set(o.rotBase.x + Math.sin(t * 0.6 + o.phase) * 0.3, o.rotBase.y + tour, o.rotBase.z + Math.cos(t * 0.4 + o.phase) * 0.2);
      }
    });

    // Les bons HTML s'inclinent un peu vers la souris (profondeur, sans gêner la lecture)
    if (zoneRail) zoneRail.style.transform = `rotateX(${(souris.y * 4).toFixed(2)}deg) rotateY(${(souris.x * 6).toFixed(2)}deg)`;

    rendre();
  }

  function poseFixe() {
    // Mouvement réduit : tout est en place, immobile
    objets.forEach(o => {
      if (!o.visible) return;
      o.pivot.scale.setScalar(o.tailleFinale);
      o.pivot.position.copy(o.base);
      if (o.fiche) o.corps.rotation.set(0.05, -0.35 + o.phase * 0.1, 0.04);
    });
    rendre();
  }

  // Pause quand l'accroche n'est plus visible ou que l'onglet est caché
  let visibleEcran = true;
  function relancer() {
    const doit = visibleEcran && !document.hidden && !reduire;
    if (doit && !actif) {
      actif = true;
      horloge.getDelta();
      image();
    } else if (!doit) {
      actif = false;
    }
  }
  new IntersectionObserver(([e]) => {
    visibleEcran = e.isIntersecting;
    relancer();
  }).observe(section);
  document.addEventListener('visibilitychange', relancer);

  new ResizeObserver(() => {
    placer();
    if (reduire) poseFixe();
  }).observe(section);

  // La langue change → les fiches se réécrivent
  new MutationObserver(redessinerFiches).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  placer();
  const polices = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  polices.then(() => {
    redessinerFiches();
    document.documentElement.classList.add('scene-prete');
    if (reduire) {
      actif = false;
      poseFixe();
    } else {
      image();
    }
  });
}
