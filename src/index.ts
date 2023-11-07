/* eslint-disable import/no-unresolved */
/// Zappar for ThreeJS Examples
/// Look-For Prompt

// In this image tracked example we'll use a variable to detect if
// the user is viewing the tracked image. If they are not, we will
// show a hint HTML Element prompting the user to do so.
import * as THREE from "three";
import { Howl, Howler } from "howler";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import * as ZapparThree from "@zappar/zappar-threejs";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import ZapparSharing from "@zappar/sharing";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";

const targetImage = new URL(
  "./assets/example-tracking-image.zpt",
  import.meta.url
).href;
const model = new URL("./assets/diwali_3d_poster.glb", import.meta.url).href;
const music = new URL("./assets/music.mp3", import.meta.url).href;
const cross1 = new URL("./assets/star1.png", import.meta.url).href;

import "./index.css";

// The SDK is supported on many different browsers, but there are some that
// don't provide camera access. This function detects if the browser is supported
// For more information on support, check out the readme over at
// https://www.npmjs.com/package/@zappar/zappar-threejs
if (ZapparThree.browserIncompatible()) {
  // The browserIncompatibleUI() function shows a full-page dialog that informs the user
  // they're using an unsupported browser, and provides a button to 'copy' the current page
  // URL so they can 'paste' it into the address bar of a compatible alternative.
  ZapparThree.browserIncompatibleUI();

  // If the browser is not compatible, we can avoid setting up the rest of the page
  // so we throw an exception here.
  throw new Error("Unsupported browser");
}

// ZapparThree provides a LoadingManager that shows a progress bar while
// the assets are downloaded. You can use this if it's helpful, or use
// your own loading UI - it's up to you :-)
const manager = new ZapparThree.LoadingManager();

// Construct our ThreeJS renderer and scene as usual
const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
document.body.appendChild(renderer.domElement);

// As with a normal ThreeJS scene, resize the canvas if the window resizes
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Create a Zappar camera that we'll use instead of a ThreeJS camera
const camera = new ZapparThree.Camera();

// In order to use camera and motion data, we need to ask the users for permission
// The Zappar library comes with some UI to help with that, so let's use it
ZapparThree.permissionRequestUI().then((granted) => {
  // If the user granted us the permissions we need then we can start the camera
  // Otherwise let's them know that it's necessary with Zappar's permission denied UI
  if (granted) camera.start();
  else ZapparThree.permissionDeniedUI();
});

// The Zappar component needs to know our WebGL context, so set it like this:
ZapparThree.glContextSet(renderer.getContext());

// Set the background of our scene to be the camera background texture
// that's provided by the Zappar camera
scene.background = camera.backgroundTexture;

// Set an error handler on the loader to help us check if there are issues loading content.
// eslint-disable-next-line no-console
manager.onError = (url) => console.log(`There was an error loading ${url}`);

// Create a zappar image_tracker and wrap it in an image_tracker_group for us
// to put our ThreeJS content into
// Pass our loading manager in to ensure the progress bar works correctly
const imageTracker = new ZapparThree.ImageTrackerLoader(manager).load(
  targetImage
);
const imageTrackerGroup = new ZapparThree.ImageAnchorGroup(
  camera,
  imageTracker
);
const contentGroup = new THREE.Group();

// Add our image tracker group into the ThreeJS scene
scene.add(imageTrackerGroup);

// Create a variable to discern when the target is
// and is not 'seen' (in view)
let targetSeen = false;

const gltfLoader = new GLTFLoader(manager);
let mymodel: any;
gltfLoader.load(
  model,
  (gltf) => {
    // Now the model has been loaded, we can add it to our instant_tracker_group
    mymodel = gltf.scene;

    gltf.scene.visible = false;
    gltf.scene.scale.set(0.15, 0.25, 0.25);
    // gltf.scene.position.set(0, -0.2, 0);

    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(0, 5, 0); // Set the position of the spotlight
    spotLight.target = mymodel; // Optionally, you can set a target for the spotlight
    spotLight.angle = Math.PI / 8; // Set the spotlight cone angle
    spotLight.intensity = 0.8; // Set the intensity of the spotlight

    imageTrackerGroup.add(spotLight);
    imageTrackerGroup.add(gltf.scene);
    // console.log(gltf.scene);
  },
  undefined,
  () => {
    console.log("An error ocurred loading the GLTF model");
  }
);

// // Let's add some lighting, first a directional light above the model pointing down
// const directionalLight = new THREE.DirectionalLight("white", 0.8);
// directionalLight.position.set(0, 5, 0);
// directionalLight.lookAt(0, 0, 0);
// imageTrackerGroup.add(directionalLight);

// And then a little ambient light to brighten the model up a bit
const ambientLight = new THREE.AmbientLight("white", 0.8);
imageTrackerGroup.add(ambientLight);

//============ADDING PARTICLES ===============
const loader = new THREE.TextureLoader();
const cross = loader.load(cross1);
const geometry = new THREE.TorusGeometry(1.3, 0.2, 16, 100);

const pointsGeometry = new THREE.BufferGeometry();
const particlesCount = 20000;

const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * (Math.random() * 5);
}

pointsGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));

// Materials

const material = new THREE.PointsMaterial({
  size: 0.03,
  color: 0xf4a146,
  map: cross,
  transparent: true,
});

const particlesMaterial1 = new THREE.PointsMaterial({
  size: 0.01,
  color: 0xf4a146,
  map: cross,
  transparent: true,
});

// Mesh
const sphere = new THREE.Points(geometry, material);
const particlesMesh = new THREE.Points(pointsGeometry, particlesMaterial1);
particlesMesh.position.z = -2;
sphere.position.z = -3;
sphere.position.y = 0.5;
sphere.visible = false;
particlesMesh.visible = false;
scene.add(particlesMesh, sphere);

//=====================ADDING 3D TEXT===============

// Load your font
// Create a font loader
const fontLoader = new FontLoader();

function createText(font: any) {
  const textGeometry = new TextGeometry("FANISKO \n WISHES \n YOU", {
    font: font,
    size: 0.2, // Adjust the size as needed
    height: 0.05, // Adjust the thickness as needed
  });

  const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Adjust the text color as needed
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.scale.set(0.8, 0.8, 0.8);
  textMesh.position.x = -1.5;
  textMesh.position.y = 2;
  // Position the text within your scene
  // textMesh.position.set(-1, 0.2, -3); // Adjust the position as needed

  // Add the text to the scene
  imageTrackerGroup.add(textMesh);
}

//=========ADDING PARTICLES============

// Particle system parameters
const particleCount = 10000; // Adjust the number of particles as desired
const particleSize = 0.009; // Adjust the size of the particles
const particleColor = 0xf4a146; // Adjust the color of the particles

// Create the particle system
const particlesGeometry = new THREE.BufferGeometry();
const particlesMaterial = new THREE.PointsMaterial({
  size: particleSize,
  color: particleColor,
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
particles.visible = false;
// scene.add(particles);

// Generate random particle positions and colors
const positions = [];
const colors = [];

for (let i = 0; i < particleCount; i++) {
  const x = (Math.random() - 0.5) * 10;
  const y = (Math.random() - 0.5) * 10;
  const z = (Math.random() - 0.5) * 10;
  positions.push(x, y, z);

  const r = Math.random();
  const g = Math.random();
  const b = Math.random();
  colors.push(r, g, b);
}

particlesGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(positions, 3)
);
particlesGeometry.setAttribute(
  "color",
  new THREE.Float32BufferAttribute(colors, 3)
);

const imageBtn =
  document.getElementById("image") || document.createElement("div");
imageBtn.addEventListener("click", () => {
  // Create a copy of the camera's current position and rotation
  const originalCameraPosition = camera.position.clone();
  const originalCameraRotation = camera.rotation.clone();

  // Move the camera to a position that captures the entire scene
  camera.position.set(0, 0, 5); // Adjust the position as needed
  camera.lookAt(0, 0, 0);

  // Render the scene
  renderer.render(scene, camera);

  // Take a snapshot of the entire scene
  const url = renderer.domElement.toDataURL("image/jpeg", 0.8);

  // Restore the original camera position and rotation
  camera.position.copy(originalCameraPosition);
  camera.rotation.copy(originalCameraRotation);

  // Take snapshot
  ZapparSharing(
    {
      data: url,
      fileNamePrepend: "Zappar",
      shareUrl: "www.zappar.com",
      shareTitle: "Hello World!",
      shareText: "Hello World!",

      onSave: () => {
        console.log("Image was saved");
      },
      onShare: () => {
        console.log("Share button was pressed");
      },
      onClose: () => {
        console.log("Dialog was closed");
      },
    },
    {
      buttonImage: {
        pointerEvents: "none",
        display: "flex",
        justifyContent: "center",
        margin: "auto",
        width: "0px",
        height: "40px",
      },
      saveShareAnchor: {
        display: "flex",
        width: "70px",
        height: "70px",
        marginTop: "2.5%",
        marginLeft: "5%",
        marginRight: "5%",
      },
    },
    {
      SAVE: "Fanisko",
      SHARE: "SHARE",
      NowOpenFilesAppToShare: "Now open files app to share",
      TapAndHoldToSave: "Tap and hold the image<br/>to save to your Photos app",
    }
  );

  // Capture the element by its ID
  const zapparSaveButton = document.getElementById("zapparSaveButton");
  if (zapparSaveButton) {
    //Create a new SVG image content
    const newSVGContent = `
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="64" height="64" viewBox="0 0 40 40">
      <path d="M 12.5 1 C 11.125 1 10 2.125 10 3.5 C 10 3.980469 10.144531 4.425781 10.378906 4.808594 L 8.054688 7 L 5.949219 7 C 5.714844 5.863281 4.703125 5 3.5 5 C 2.125 5 1 6.125 1 7.5 C 1 8.875 2.125 10 3.5 10 C 4.703125 10 5.714844 9.136719 5.949219 8 L 8.054688 8 L 10.40625 10.148438 C 10.152344 10.539063 10 11 10 11.5 C 10 12.875 11.125 14 12.5 14 C 13.875 14 15 12.875 15 11.5 C 15 10.125 13.875 9 12.5 9 C 11.984375 9 11.5 9.15625 11.101563 9.429688 L 9 7.507813 L 9 7.476563 L 11.0625 5.539063 C 11.472656 5.824219 11.964844 6 12.5 6 C 13.875 6 15 4.875 15 3.5 C 15 2.125 13.875 1 12.5 1 Z M 12.5 2 C 13.335938 2 14 2.664063 14 3.5 C 14 4.335938 13.335938 5 12.5 5 C 11.664063 5 11 4.335938 11 3.5 C 11 2.664063 11.664063 2 12.5 2 Z M 3.5 6 C 4.335938 6 5 6.664063 5 7.5 C 5 8.335938 4.335938 9 3.5 9 C 2.664063 9 2 8.335938 2 7.5 C 2 6.664063 2.664063 6 3.5 6 Z M 12.5 10 C 13.335938 10 14 10.664063 14 11.5 C 14 12.335938 13.335938 13 12.5 13 C 11.664063 13 11 12.335938 11 11.5 C 11 10.664063 11.664063 10 12.5 10 Z"></path>
     
    <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" fill="black" font-size="10" font-weight="bold">SHARE</text>
    </svg>
  `;
    // Set the new content for the zapparSaveButton
    zapparSaveButton.innerHTML = newSVGContent;
    // Change the src attribute to the new image URL
  }
});

//=========TEXT-PROMPT=========
// Define our prompt element and make it show by default
const Prompt = <HTMLDivElement>document.getElementById("Prompt");
Prompt.style.display = "block";
// Create a plane geometry mesh for the background
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(3.07, 2.05),
  new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    color: new THREE.Color(0, 0, 0),
    transparent: true,
    opacity: 0.8,
  })
);

// add our content to the tracking group.
contentGroup.add(plane);

//============ADD SOUND============

const sound = new Howl({
  src: [music],
});

//=========ADDING FOGS =========

// Define custom shader materials for the fog
// const fogMaterial1 = createGradientFogMaterial(0x00ff00); // Green fog
// const fogMaterial2 = createGradientFogMaterial(0xff0000); // Red fog
// const fogMaterial3 = createGradientFogMaterial(0x0000ff); // Blue fog
// const fogMaterial4 = createGradientFogMaterial(0xffffff); // White fog

// // Function to create gradient fog material
// function createGradientFogMaterial(fogColor) {
//   return new THREE.ShaderMaterial({
//     uniforms: {
//       color: { value: new THREE.Color(fogColor) },
//       near: { value: 1 },
//       far: { value: 10 },
//     },
//     vertexShader: `
//       varying vec2 vUv;
//       void main() {
//         vUv = uv;
//         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//       }
//     `,
//     fragmentShader: `
//       uniform vec3 color;
//       uniform float near;
//       uniform float far;
//       varying vec2 vUv;
//       void main() {
//         float depth = gl_FragCoord.z / gl_FragCoord.w;
//         float fogFactor = smoothstep(near, far, depth);
//         gl_FragColor = vec4(mix(vec3(0), color, fogFactor), 1.0);
//       }
//     `,
//     transparent: true,
//   });
// }

// // Create fog plane geometries and apply the shader materials
// const fogGeometry1 = new THREE.PlaneGeometry(100, 100);
// const fogGeometry2 = new THREE.PlaneGeometry(100, 100);
// const fogGeometry3 = new THREE.PlaneGeometry(100, 100);
// const fogGeometry4 = new THREE.PlaneGeometry(100, 100);

// const fogMesh1 = new THREE.Mesh(fogGeometry1, fogMaterial1);
// const fogMesh2 = new THREE.Mesh(fogGeometry2, fogMaterial2);
// const fogMesh3 = new THREE.Mesh(fogGeometry3, fogMaterial3);
// const fogMesh4 = new THREE.Mesh(fogGeometry4, fogMaterial4);

// // Position the fog meshes appropriately
// fogMesh1.position.set(0, 0, 0); // Adjust the position as needed
// fogMesh2.position.set(0, 0, 0); // Adjust the position as needed
// fogMesh3.position.set(0, 0, 0); // Adjust the position as needed
// fogMesh4.position.set(0, 0, 0); // Adjust the position as needed

// // Add fog meshes to the scene
// imageTrackerGroup.add(fogMesh1);
// imageTrackerGroup.add(fogMesh2);
// imageTrackerGroup.add(fogMesh3);
// imageTrackerGroup.add(fogMesh4);

// // Hide fog meshes by default
// fogMesh1.visible = false;
// fogMesh2.visible = false;
// fogMesh3.visible = false;
// fogMesh4.visible = false;

// // Function to show fog meshes when the target is visible
// function showFogs() {
//   fogMesh1.visible = true;
//   fogMesh2.visible = true;
//   fogMesh3.visible = true;
//   fogMesh4.visible = true;
// }

// // Function to hide fog meshes when the target is not visible
// function hideFogs() {
//   fogMesh1.visible = false;
//   fogMesh2.visible = false;
//   fogMesh3.visible = false;
//   fogMesh4.visible = false;
// }
// showFogs();

// when we lose sight of the camera, hide the scene contents

imageTracker.onVisible.bind(() => {
  // Use the default font (helvetiker) - you can choose a different one if desired
  fontLoader.load(
    "https://cdn.rawgit.com/mrdoob/three.js/r125/examples/fonts/helvetiker_regular.typeface.json",
    function (font) {
      createText(font);
    }
  );
  Prompt.style.display = "none";
  //showFogs();
  sphere.visible = true;
  particlesMesh.visible = true;
  mymodel.visible = true;
  particles.visible = true;
  sound.play();
  if (!targetSeen) {
    // If target was once not seen:
    targetSeen = true;
  }
});

// TARGET NOT SEEN
imageTracker.onNotVisible.bind(() => {
  if (targetSeen) {
    //hideFogs();

    // If target was once seen:
    sphere.visible = false;
    particlesMesh.visible = false;
    targetSeen = false;
    sound.stop();
    mymodel.visible = false;
    Prompt.style.display = "block";
  }
});

const clock = new THREE.Clock();

// Use a function to render our scene as usual
function render(): void {
  const elapsedTime = clock.getElapsedTime();
  // The Zappar camera must have updateFrame called every frame
  camera.updateFrame(renderer);

  // Draw the ThreeJS scene in the usual way, but using the Zappar camera
  renderer.render(scene, camera);

  //rotate particles

  sphere.rotation.y = 0.5 * elapsedTime;
  particlesMesh.position.x += 0.001;
  particlesMesh.position.z += 0.001;
  // Update particle positions or properties here
  // const positions: any = particlesGeometry.getAttribute("position").array;
  // for (let i = 0; i < positions.length; i += 3) {
  //   positions[i + 1] += Math.random() * 0.01; // Move particles upward
  //   if (positions[i + 1] > 5) {
  //     positions[i + 1] = -5; // Reset particles' Y position when they go beyond the screen
  //   }
  // }
  // particlesGeometry.getAttribute("position").needsUpdate = true;
  // Call render() again next frame
  requestAnimationFrame(render);
}

// Start things off
render();
