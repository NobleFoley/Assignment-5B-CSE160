// Noble Foley
// noafoley@ucsc.edu

import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const fov = 75;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 1, 10);

  class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
      this.obj = obj;
      this.minProp = minProp;
      this.maxProp = maxProp;
      this.minDif = minDif;
    }
    get min() {
      return this.obj[this.minProp];
    }
    set min(v) {
      this.obj[this.minProp] = v;
      this.obj[this.maxProp] = Math.max(
        this.obj[this.maxProp],
        v + this.minDif
      );
    }
    get max() {
      return this.obj[this.maxProp];
    }
    set max(v) {
      this.obj[this.maxProp] = v;
      this.min = this.min; // this will call the min setter
    }
  }

  function updateCamera() {
    camera.updateProjectionMatrix();
  }

  const gui = new GUI();
  gui.add(camera, "fov", 1, 180).onChange(updateCamera);
  const minMaxGUIHelper = new MinMaxGUIHelper(camera, "near", "far", 0.1);
  gui
    .add(minMaxGUIHelper, "min", 0.1, 50, 0.1)
    .name("near")
    .onChange(updateCamera);
  gui
    .add(minMaxGUIHelper, "max", 0.1, 50, 0.1)
    .name("far")
    .onChange(updateCamera);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  controls.update();

  const scene = new THREE.Scene();
  // Plane
  {
    const planeSize = 40;

    const loader = new THREE.TextureLoader();
    const texture = loader.load("./textures/checker.png");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);
    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = Math.PI * -0.5;
    plane.position.set(0, -0.9, 0);
    scene.add(plane);
  }

  // Sphere
  {
    const sphereRadius = 3.5;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereGeometry(
      sphereRadius,
      sphereWidthDivisions,
      sphereHeightDivisions
    );
    const sphereMat = new THREE.MeshPhongMaterial({ color: 0xcfccdb });
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.position.set(1.5, 10, -10);
    scene.add(mesh);
  }

  // Cube
  function makecube(width, height, depth, x, y, z) {
    const boxWidth = width;
    const boxHeight = height;
    const boxDepth = depth;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    // Box material
    const loader = new THREE.TextureLoader();
    const texture = loader.load("./textures/images.jpg");

    const material = new THREE.MeshPhongMaterial({
      map: texture,
      color: 0xbab3db,
    });

    // Making the box and adding it to scene
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x, y, z);
    scene.add(cube);
  }

  function makecylinder(radius, height, x, y, z) {
    const cylinder_geometry = new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      32
    );
    const loader = new THREE.TextureLoader();
    const texture = loader.load("./textures/images.jpg");

    const cylinder_material = new THREE.MeshPhongMaterial({
      map: texture,
      color: 0xbab3db,
    });

    // Making the Cylinder and setting it's position before adding to scene
    const cylinder = new THREE.Mesh(cylinder_geometry, cylinder_material);
    cylinder.position.set(x, y, z);
    scene.add(cylinder);
  }

  function makeCone(radius, height, x, y, z) {
    // Cone Dimensions
    const cone_geometry = new THREE.ConeGeometry(radius, height, 32);
    // Making texture loader
    const loader = new THREE.TextureLoader();
    // Loading textures
    const texture = loader.load("./textures/images.jpg");
    texture.colorSpace = THREE.SRGBColorSpace;
    // Mapping the texture for the cone
    const cone_material = new THREE.MeshPhongMaterial({
      map: texture,
    });
    // Making and adding the cone to the scene
    const cone = new THREE.Mesh(cone_geometry, cone_material);
    cone.position.set(x, y, z);
    scene.add(cone);
  }

  let castle = [
    // Corner left
    makecube(0.4, 2, 2, -1, 0, 0),
    makecylinder(0.27, 2, -1, 0, 1),
    makeCone(0.35, 0.5, -1, 1.22, 1),
    makecylinder(0.27, 2, 0.5, 0, 1),
    makeCone(0.35, 0.5, 0.5, 1.22, 1),
    makecube(1.5, 2, 0.4, -0.4, 0, 1),
    // Entrance
    makecube(1.5, 0.5, 0.4, 1, 0.5, 1),
    makecube(1.3, 0.3, 0.55, 1.2, 0.85, 1),
    makecube(0.25, 1.9, 0.55, 0.7, 0, 1),
    makecube(0.25, 1.9, 0.55, 1.7, 0, 1),
    // Right Corner
    makecube(0.4, 2, 2, 3.5, 0, 0),
    makecylinder(0.27, 2, 3.5, 0, 1),
    makeCone(0.35, 0.5, 3.5, 1.22, 1),
    makecylinder(0.27, 2, 1.9, 0, 1),
    makeCone(0.35, 0.5, 1.9, 1.22, 1),
    makecube(1.5, 2, 0.4, 2.7, 0, 1),

    // Right Wall
    makecylinder(0.27, 2, 3.5, 0, -1.1),
    makeCone(0.35, 0.5, 3.5, 1.22, -1.1),
    makecube(0.4, 2, 2, 3.5, 0, -2.2),
    makecylinder(0.27, 2, 3.5, 0, -3.3),
    makeCone(0.35, 0.5, 3.5, 1.22, -3.3),
    makecube(0.4, 2, 2, 3.5, 0, -4.4),
    makecylinder(0.27, 2, 3.5, 0, -5.5),
    makeCone(0.35, 0.5, 3.5, 1.22, -5.5),
    makecube(0.4, 2, 2, 3.5, 0, -6.6),

    // Left Wall
    makecylinder(0.27, 2, -1, 0, -1.1),
    makeCone(0.35, 0.5, -1, 1.22, -1.1),
    makecube(0.4, 2, 2, -1, 0, -2.2),
    makecylinder(0.27, 2, -1, 0, -3.3),
    makeCone(0.35, 0.5, -1, 1.22, -3.3),
    makecube(0.4, 2, 2, -1, 0, -4.4),
    makecylinder(0.27, 2, -1, 0, -5.5),
    makeCone(0.35, 0.5, -1, 1.22, -5.5),
    makecube(0.4, 2, 2, -1, 0, -6.6),

    // Back-Right Corner
    makecylinder(0.27, 2, 3.5, 0, -7.7),
    makeCone(0.35, 0.5, 3.5, 1.22, -7.7),
    makecube(2.4, 2, 0.4, 2.5, 0, -7.7),
    makecylinder(0.27, 2, 1.25, 0, -7.7),
    makeCone(0.35, 0.5, 1.25, 1.22, -7.7),

    // Back-Left Corner
    makecylinder(0.27, 2, -1, 0, -7.7),
    makeCone(0.35, 0.5, -1, 1.22, -7.7),
    makecube(2.4, 2, 0.4, -0, 0, -7.7),
  ];

  {
    // Cone Dimensions
    const cone_geometry = new THREE.ConeGeometry(0.5, 0.8, 4);
    // Making texture loader
    const loader = new THREE.TextureLoader();
    const texture = loader.load("./textures/images.jpg");

    const cone_material = new THREE.MeshPhongMaterial({
      map: texture,
      color: 0x303030,
    });
    // Making and adding the cone to the scene
    const cone = new THREE.Mesh(cone_geometry, cone_material);
    cone.rotation.y = Math.PI * -0.25;
    cone.position.set(1.25, 0, -5);
    cone.scale.set(5, 2.5, 5);
    scene.add(cone);
  }

  // The directional light
  {
    const color = 0xffffff;
    const intensity = 9;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5, 2, 4);
    scene.add(light);
  }

  // The custom 3d obj model
  function makeCactus(x, y, z) {
    // Loading the mtl texture for the 3d model
    const mtlLoader = new MTLLoader();
    mtlLoader.load("./textures/cactus.mtl", (mtl) => {
      mtl.preload();

      const objLoader = new OBJLoader();
      objLoader.setMaterials(mtl);
      objLoader.load("./objs/cactus.obj", (root) => {
        // Passing the obj outside of the nested block for later use
        const cactus = root;
        // Setting scale and adding to scene

        root.scale.set(0.005, 0.005, 0.005);
        root.position.set(x, y, z);
        root.rotation.x = Math.PI * -0.5;
        scene.add(root);
      });
    });
  }
  let cactuses = [makeCactus(0.5, -1, 1.5), makeCactus(1.9, -1, 1.5)];

  class ColorGUIHelper {
    constructor(object, prop) {
      this.object = object;
      this.prop = prop;
    }
    get value() {
      return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
      this.object[this.prop].set(hexString);
    }
  }

  {
    const color = 0xfa0000;
    const intensity = 0.5;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);

    const light_gui = new GUI();
    light_gui.domElement.style.position = "flex";
    light_gui.domElement.style.top = "7rem";
    light_gui
      .addColor(new ColorGUIHelper(light, "color"), "value")
      .name("color");
    light_gui.add(light, "intensity", 0, 2, 0.01);
  }

  {
    const color = 0xb1e1ff; // light blue
    const intensity = 50;
    const point_light = new THREE.PointLight(color, intensity);
    point_light.position.set(-2.5, 8, -4);

    scene.add(point_light);
  }

  {
    const loader = new THREE.TextureLoader();
    const texture = loader.load("./textures/sky.jpg", () => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      scene.background = texture;
    });
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height);
    }

    return needResize;
  }

  // Rotation function loop that rotates the shapes
  function render(time) {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    time *= 0.001; // convert time to seconds

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
