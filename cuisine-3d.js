// Scène 3D de l'accroche : aliments et fiches techniques qui flottent derrière le texte.
// Tout est construit en code (aucune image ni modèle externe), dans les couleurs du site :
// cuivre, papier thermique, rouge ticket, ardoise, inox.
// Règles : jamais devant le texte (le canevas est sous le contenu), pause hors écran,
// version immobile si l'appareil demande moins d'animation, rien du tout si WebGL manque.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

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

  // ─── L'atelier : planche, tomate en deux moitiés, couteau, jus ─────────────
  // Joué une seule fois à l'ouverture, à l'endroit où le bon d'action va tomber.
  function texturePulpe() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(128, 128, 10, 128, 128, 128);
    g.addColorStop(0, '#F59A84');
    g.addColorStop(0.55, '#E3523F');
    g.addColorStop(0.86, '#C8321F');
    g.addColorStop(1, '#9E1F16');
    x.fillStyle = g;
    x.beginPath();
    x.arc(128, 128, 128, 0, Math.PI * 2);
    x.fill();
    // Quatre loges avec leurs pépins
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const cx = 128 + Math.cos(a) * 58;
      const cy = 128 + Math.sin(a) * 58;
      x.fillStyle = 'rgba(245, 120, 95, 0.95)';
      x.beginPath();
      x.ellipse(cx, cy, 36, 26, a, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = '#F3D9A0';
      for (let s = 0; s < 6; s++) {
        const b = a + (s - 2.5) * 0.28;
        x.beginPath();
        x.ellipse(128 + Math.cos(b) * 58, 128 + Math.sin(b) * 58, 5, 3, b, 0, Math.PI * 2);
        x.fill();
      }
    }
    // Cœur clair
    x.fillStyle = 'rgba(250, 190, 170, 0.9)';
    x.beginPath();
    x.arc(128, 128, 20, 0, Math.PI * 2);
    x.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function construireAtelier() {
    const atelier = new THREE.Group();
    const R = 0.62;
    const ECRASE = 0.86;

    // Planche à découper (bois clair, chaleureux)
    const planche = new THREE.Mesh(
      new RoundedBoxGeometry(3.0, 0.18, 2.0, 4, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xd6a06a, roughness: 0.75 })
    );
    planche.position.y = -0.09;
    atelier.add(planche);
    const rainure = new THREE.Mesh(
      new THREE.TorusGeometry(0.88, 0.018, 6, 48),
      new THREE.MeshStandardMaterial({ color: 0xb98450, roughness: 0.8 })
    );
    rainure.rotation.x = Math.PI / 2;
    rainure.scale.set(1.45, 0.9, 1);
    rainure.position.y = 0.005;
    atelier.add(rainure);

    // Tomate : deux moitiés lisses et brillantes, la face coupée porte la pulpe
    const peau = new THREE.MeshPhysicalMaterial({ color: 0xc62a1f, roughness: 0.28, clearcoat: 0.7, clearcoatRoughness: 0.2 });
    const pulpe = new THREE.MeshStandardMaterial({ map: texturePulpe(), roughness: 0.45 });
    const moitie = cote => {
      const charniere = new THREE.Group(); // pivot au bas de la coupe
      charniere.position.set(0, 0, 0);
      const corps = new THREE.Group();
      corps.position.y = R * ECRASE;
      corps.scale.y = ECRASE;
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(R, 48, 32, cote < 0 ? -Math.PI / 2 : Math.PI / 2, Math.PI),
        peau
      );
      const face = new THREE.Mesh(new THREE.CircleGeometry(R * 0.995, 48), pulpe);
      face.rotation.y = cote < 0 ? Math.PI / 2 : -Math.PI / 2;
      corps.add(sphere, face);
      charniere.add(corps);
      return charniere;
    };
    const gauche = moitie(-1);
    const droite = moitie(1);
    atelier.add(gauche, droite);
    // Collerette verte sur la moitié gauche
    for (let i = 0; i < 5; i++) {
      const sepale = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.38, 4), mat(C.sauge));
      const a = (i / 5) * Math.PI * 2;
      sepale.position.set(Math.cos(a) * 0.12 - 0.02, R * ECRASE * 2 - 0.02, Math.sin(a) * 0.12);
      sepale.rotation.set(Math.sin(a) * 1.25, 0, -Math.cos(a) * 1.25);
      gauche.add(sepale);
    }

    // Jus : une flaque qui s'étale et quelques gouttes
    const flaque = new THREE.Mesh(
      new THREE.CircleGeometry(0.75, 32),
      new THREE.MeshStandardMaterial({ color: C.rouge, roughness: 0.15, transparent: true, opacity: 0.88 })
    );
    flaque.rotation.x = -Math.PI / 2;
    flaque.position.y = 0.006;
    flaque.scale.set(0.001, 0.001, 1);
    atelier.add(flaque);
    const gouttes = [];
    const matGoutte = new THREE.MeshStandardMaterial({ color: 0xd8382a, roughness: 0.2 });
    for (let i = 0; i < 14; i++) {
      const g = new THREE.Mesh(new THREE.SphereGeometry(0.045 + Math.random() * 0.04, 10, 8), matGoutte);
      g.visible = false;
      const a = Math.random() * Math.PI * 2;
      g.userData.v = new THREE.Vector3(Math.cos(a) * (0.8 + Math.random()), 1.6 + Math.random() * 1.6, Math.sin(a) * (0.8 + Math.random()));
      g.userData.vit = g.userData.v.clone();
      atelier.add(g);
      gouttes.push(g);
    }

    // Couteau de chef : lame inox, manche cuivre (la couleur du site), trois rivets
    const couteau = new THREE.Group();
    const forme = new THREE.Shape();
    forme.moveTo(0, 0);
    forme.lineTo(2.1, 0);
    forme.quadraticCurveTo(2.65, 0.06, 2.85, 0.5);
    forme.lineTo(0, 0.56);
    forme.closePath();
    const lame = new THREE.Mesh(
      new THREE.ExtrudeGeometry(forme, { depth: 0.025, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2 }),
      new THREE.MeshStandardMaterial({ color: 0xd9dfdd, metalness: 0.7, roughness: 0.22, envMapIntensity: 1.6 })
    );
    lame.position.z = -0.0125;
    couteau.add(lame);
    const manche = new THREE.Mesh(
      new RoundedBoxGeometry(1.15, 0.36, 0.2, 3, 0.07),
      new THREE.MeshStandardMaterial({ color: C.cuivre, roughness: 0.45, metalness: 0.15 })
    );
    manche.position.set(-0.6, 0.3, 0);
    couteau.add(manche);
    for (let i = 0; i < 3; i++) {
      const rivet = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.22, 10),
        new THREE.MeshStandardMaterial({ color: 0xe4e8e6, metalness: 1, roughness: 0.2 })
      );
      rivet.rotation.x = Math.PI / 2;
      rivet.position.set(-0.95 + i * 0.32, 0.3, 0);
      couteau.add(rivet);
    }
    // La lame est dans le plan de coupe (x = 0) : on la tourne pour qu'elle coupe la tomate en deux
    const porteCouteau = new THREE.Group();
    couteau.rotation.y = Math.PI / 2;
    couteau.position.z = 1.35; // le milieu du tranchant passe au centre de la tomate
    porteCouteau.add(couteau);
    atelier.add(porteCouteau);

    // Vue de trois quarts, un peu plongeante : on voit la lame et la coupe
    atelier.rotation.set(0.42, -0.85, 0);
    atelier.visible = false;
    return { atelier, gauche, droite, flaque, gouttes, porteCouteau, R, ECRASE };
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
      depart: new THREE.Vector3(),
      visible: true,
    };
  });

  const A = construireAtelier();
  monde.add(A.atelier);

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

    // L'atelier se pose exactement là où le bon d'action va tomber
    const rail = document.querySelector('.zone-rail');
    if (rail) {
      const rs = section.getBoundingClientRect();
      const rr = rail.getBoundingClientRect();
      const z = 1.5;
      const distance = camera.position.z - z;
      const hauteur = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
      const largeur = hauteur * camera.aspect;
      const px = rr.left - rs.left + rr.width / 2;
      const py = rr.top - rs.top + Math.min(rr.height, h) * 0.42;
      A.atelier.position.set(((2 * px) / w - 1) * (largeur / 2), (1 - (2 * py) / h) * (hauteur / 2), z);
      const pixelsParUnite = h / hauteur;
      A.echelle = Math.min(rr.width * 0.78, 400) / (3.0 * pixelsParUnite);
      objets.forEach((o, i) => {
        o.depart.copy(A.atelier.position).add(new THREE.Vector3(Math.sin(i * 2.1) * 0.3, 0.4, 0));
      });
    }
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
  let precedent = null;

  // L'intro ne joue que si la page l'a préparée (grand écran, haut de page, 1re visite de la session)
  // et si la 3D est prête assez vite ; sinon le bon d'action s'affiche normalement.
  const racine = document.documentElement;
  let intro = racine.classList.contains('intro-3d') && performance.now() < 2200 && !reduire;
  if (!intro) racine.classList.remove('intro-3d');
  let introFinie = !intro;
  function terminerIntro() {
    if (introFinie) return;
    introFinie = true;
    racine.classList.remove('intro-3d');
    racine.classList.add('intro-finie');
    try { sessionStorage.setItem('ordo-intro', '1'); } catch (e) { /* stockage indisponible : sans effet */ }
  }

  // Courbes
  const borne = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a)));
  const sortie = x => 1 - Math.pow(1 - x, 3);
  const entree = x => x * x * x;
  const rebond = x => (x === 0 ? 0 : 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2));
  const COUPE = 1.0; // instant où la lame touche la planche
  const GERBE = 1.0; // les aliments jaillissent
  const FIN = 1.75; // le bon d'action tombe

  function animerAtelier(T, dt) {
    const a = A.atelier;
    if (!intro || T > FIN + 0.6) {
      a.visible = false;
      return;
    }
    a.visible = true;
    // Entrée de la planche et de la tomate, puis sortie vers le fond
    const arrive = rebond(borne(T, 0, 0.5));
    const part = entree(borne(T, FIN - 0.15, FIN + 0.45));
    a.scale.setScalar(A.echelle * arrive * (1 - part));
    a.rotation.y = -0.85 + part * 0.6;

    // Couteau : arrive au-dessus, tranche d'un coup sec, repart
    const c = A.porteCouteau;
    const haut = 1.75;
    let y;
    if (T < 0.8) y = 3.4 - (3.4 - haut) * sortie(borne(T, 0.3, 0.8));
    else if (T < COUPE) y = haut - (haut - 0.02) * entree(borne(T, 0.8, COUPE));
    else y = 0.02 + 3.0 * entree(borne(T, COUPE + 0.08, COUPE + 0.55));
    c.position.set(0, y, 0);
    c.visible = T > 0.3 && T < COUPE + 0.55;
    c.rotation.x = T < COUPE ? 0 : -0.5 * borne(T, COUPE + 0.08, COUPE + 0.55);

    // Les deux moitiés s'ouvrent
    const ouvre = rebond(borne(T, COUPE - 0.02, COUPE + 0.45));
    A.gauche.rotation.z = 0.55 * ouvre;
    A.gauche.position.x = -0.22 * ouvre;
    A.droite.rotation.z = -0.55 * ouvre;
    A.droite.position.x = 0.22 * ouvre;

    // Jus : la flaque s'étale, les gouttes giclent puis retombent sur la planche
    const f = sortie(borne(T, COUPE, COUPE + 0.5));
    A.flaque.scale.set(f * 1.1, f * 0.75, 1);
    A.gouttes.forEach(g => {
      if (T < COUPE) {
        g.visible = false;
        g.position.set(0, A.R * A.ECRASE, 0);
        g.userData.vit = g.userData.v.clone();
        return;
      }
      g.visible = T < COUPE + 0.9;
      const v = g.userData.vit;
      v.y -= 9 * dt;
      g.position.addScaledVector(v, dt);
      if (g.position.y < 0.03) {
        g.position.y = 0.03;
        v.set(0, 0, 0);
      }
    });

    if (T >= FIN) terminerIntro();
  }

  function rendre() {
    renderer.render(scene, camera);
  }

  function image() {
    if (!actif) return;
    requestAnimationFrame(image);
    const t = horloge.getElapsedTime();
    if (debut === null) debut = t;
    const depuis = t - debut;
    const dt = precedent === null ? 0 : Math.min(0.05, t - precedent);
    precedent = t;
    animerAtelier(depuis, dt);

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
      o.survol += ((o === survole ? 1 : 0) - o.survol) * 0.12;
      const flotte = Math.sin(t * 0.8 + o.phase) * 0.18;
      if (intro) {
        // Gerbe : chaque aliment jaillit de la planche et file vers sa place, en arc
        const p = borne(depuis, GERBE + i * 0.05, GERBE + i * 0.05 + 0.85);
        const e = sortie(p);
        o.pivot.scale.setScalar(o.tailleFinale * (p === 0 ? 0 : 0.35 + 0.65 * rebond(p)) * (1 + 0.12 * o.survol));
        o.pivot.position.lerpVectors(o.depart, o.base, e);
        o.pivot.position.y += Math.sin(Math.PI * e) * 1.6 + flotte * e;
      } else {
        // Entrée simple : chaque objet arrive en ressort, décalé de 70 ms
        const p = borne(depuis, i * 0.07, i * 0.07 + 0.9);
        o.pivot.scale.setScalar(o.tailleFinale * rebond(p) * (1 + 0.12 * o.survol));
        o.pivot.position.set(o.base.x, o.base.y + flotte, o.base.z - (1 - p) * 3);
      }

      const vrille = intro ? 3 * (1 - borne(depuis, GERBE + i * 0.05, GERBE + i * 0.05 + 0.85)) : 0;
      const tour = t * o.vitesse * (1 + 2.5 * o.survol) + vrille;
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
      terminerIntro();
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
      if (intro) setTimeout(terminerIntro, 3000); // filet de sécurité
      image();
    }
  });
}
