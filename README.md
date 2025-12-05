# NIRD - Numérique Inclusif, Responsable et Durable

> **Nuit de l'Info 2025 - Défi National**
> *L'école de demain ne jette pas, elle libère.*


## À propos du projet

**NIRD** est une expérience web immersive et narrative développée dans le cadre de la **Nuit de l'Info 2025** (IUT Paris).

Ce projet vise à sensibiliser le monde éducatif à **l'obsolescence programmée** des parcs informatiques scolaires (souvent dictée par les mises à jour Windows) et à proposer une alternative durable : le passage aux **logiciels libres (Linux)** et le reconditionnement.

L'application guide l'utilisateur à travers une narration interactive en 3D, du constat alarmant du gaspillage numérique jusqu'à la solution concrète de la démarche NIRD.

## Fonctionnalités Clés

L'expérience se déroule en plusieurs actes interactifs :

1.  **L'Intro Choc (Le Compteur) :** Visualisation du coût exorbitant du renouvellement matériel inutile via un compteur s'affolant (GSAP).
2.  **L'Immersion 3D (Three.js) :** Une scène 3D représentant une salle de classe où les écrans passent de l'environnement Windows (bleu) à l'obsolescence (rouge), puis à la libération Linux (vert).
3.  **Narration au Scroll (ScrollTrigger) :** L'histoire avance au rythme du défilement de l'utilisateur, déclenchant des animations de caméra et des messages impactants.
4.  **Gamification (Drag & Drop) :** Une phase interactive où l'utilisateur doit physiquement "installer" Linux sur des machines pour les sauver, simulant le reconditionnement.
5.  **Ambiance Sonore :** Design sonore immersif (bruitages clavier, musique de fond, compteur) géré dynamiquement.

## 🛠 Technologies Utilisées

Ce projet est un site statique moderne (Vanilla JS) utilisant des bibliothèques graphiques avancées :

* **HTML5 / CSS3** : Structure et mise en page responsive.
* **JavaScript (ES6+)** : Logique de l'application.
* **[Three.js](https://threejs.org/)** : Rendu 3D temps réel (salle de classe, ordinateurs, éclairages dynamiques).
* **[GSAP](https://greensock.com/gsap/)** :
    * *Core* : Animations fluides.
    * *ScrollTrigger* : Synchronisation des animations avec le scroll.
    * *Draggable* : Interactions tactiles pour la phase de reconditionnement.
* **Font** : Space Grotesk & Inter (Google Fonts).

## Installation et Lancement

Aucune installation complexe (npm/node) n'est requise

### Pré-requis
* Un navigateur web moderne (Chrome, Firefox, Edge).

### Étapes
1.  **Cloner le dépôt :**
    ```bash
    git clone [https://github.com/WalimAC/normal-repo.git](https://github.com/WalimAC/normal-repo.git)
    cd nird-2025
    ```

2.  **Lancer le projet :**
    * **Via VS Code :** Ouvrez le dossier, faites un clic droit sur `index.html` et choisissez "Open with Live Server".

## Structure du Projet

```text
nird-2025/
│
├── assets/
│   ├── img/               # Images (Logos, Wallpaper, Textures)
│   └── sound-effects/     # Fichiers audio (mp3)
│
├── informations/
│   ├── LICENSE            # Licence MIT
│   └── README.md          # Documentation
│
├── index.html             # Point d'entrée de l'application
├── script.js              # Logique principale (Three.js, GSAP, Audio)
└── style.
```
