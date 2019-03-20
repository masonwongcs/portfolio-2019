// MAIN

// standard global variables
var container, scene, camera, renderer, controls, stats;
var clock = new THREE.Clock();

// custom global variables
var cube;
var textMesh;
var projector,
  mouse = {
    x: 0,
    y: 0
  },
  INTERSECTED;

init();
animate();

// FUNCTIONS
function init() {
  // SCENE
  scene = new THREE.Scene();
  // CAMERA
  var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight;
  var VIEW_ANGLE = 45,
    ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
    NEAR = 0.1,
    FAR = 20000;
  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene.add(camera);
  camera.position.set(0, 150, 400);
  camera.lookAt(scene.position);

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container = document.getElementById("three");
  container.appendChild(renderer.domElement);
  // EVENTS

  // CONTROLS
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  // // STATS
  // stats = new Stats();
  // stats.domElement.style.position = 'absolute';
  // stats.domElement.style.bottom = '0px';
  // stats.domElement.style.zIndex = 100;
  // container.appendChild(stats.domElement);

  // LIGHT
  var light = new THREE.PointLight(0xffffff);
  light.position.set(0, 250, 0);
  scene.add(light);

  // FLOOR
  // var loader = new THREE.TextureLoader();
  // var floorTexture = loader.load('https://stemkoski.github.io/Three.js/images/checkerboard.jpg');
  // floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  // floorTexture.repeat.set(10, 10);
  // var floorMaterial = new THREE.MeshBasicMaterial({
  //     map: floorTexture,
  //     side: THREE.DoubleSide
  // });
  // var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
  // var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  // floor.position.y = -0.5;
  // floor.rotation.x = Math.PI / 2;
  // scene.add(floor);

  // SKYBOX/FOG
  var skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
  var skyBoxMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.BackSide
  });
  var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
  scene.add(skyBox);

  var fontLoader = new THREE.FontLoader();
  var text = "Hello world!"

  fontLoader.load("../fonts/monotype.json", function(font) {
    var textGeo = new THREE.TextGeometry(text, {
      font: font,
      size: 32,
      height: 5,
      // curveSekgments: 12,
      // bevelEnabled: true,
      // bevelThickness: 10,
      // bevelSize: 8,
      // bevelSegments: 5
    });

    var textMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

    textMesh = new THREE.Mesh(textGeo, textMaterial);
    THREE.GeometryUtils.center(textGeo);
    textMesh.position.set(0, 50, 0);

    scene.add(textMesh);
  });

  ////////////
  // CUSTOM //
  ////////////
  // var cubeGeometry = new THREE.CubeGeometry(50, 50, 50);
  // var cubeMaterial = new THREE.MeshBasicMaterial({
  //     color: 0x000088
  // });
  // cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  // cube.position.set(0, 26, 0);
  // scene.add(cube);

  // initialize object to perform world/screen calculations
  projector = new THREE.Projector();

  // when the mouse moves, call the given function
  document.addEventListener("mousemove", onDocumentMouseMove, false);
}

function onDocumentMouseMove(event) {
  // the following line would stop any other event handler from firing
  // (such as the mouse's TrackballControls)
  // event.preventDefault();

  // update the mouse variable
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function animate() {
  requestAnimationFrame(animate);
  render();
  TWEEN.update();
  update();
}

function animateVector3(vectorToAnimate, target, options) {
  options = options || {};
  // get targets from options or set to defaults
  var to = target || THREE.Vector3(),
    easing = options.easing || TWEEN.Easing.Quadratic.In,
    duration = options.duration || 2000;
  // create the tween
  var tweenVector3 = new TWEEN.Tween(vectorToAnimate)
    .to({ x: to.x, y: to.y, z: to.z }, duration)
    .easing(easing)
    .onUpdate(function(d) {
      if (options.update) {
        options.update(d);
      }
    })
    .onComplete(function() {
      if (options.callback) options.callback();
    });
  // start the tween
  tweenVector3.start();
  // return the tween in case we want to manipulate it later on
  return tweenVector3;
}

function setupObjectScaleAnimation(
  object,
  source,
  target,
  duration,
  delay,
  easing
) {
  var l_delay = delay !== undefined ? delay : 0;
  var l_easing = easing !== undefined ? easing : TWEEN.Easing.Linear.None;

  new TWEEN.Tween(source)
    .to(target, duration)
    .delay(l_delay)
    .easing(l_easing)
    .onUpdate(function() {
      object.scale.copy(source);
    })
    .start();
}

function addText(text){
    var fontLoader = new THREE.FontLoader();
    var text = text

    fontLoader.load("../fonts/monotype.json", function(font) {
        var textGeo = new THREE.TextGeometry(text, {
            font: font,
            size: 32,
            height: 5,
            // curveSekgments: 12,
            // bevelEnabled: true,
            // bevelThickness: 10,
            // bevelSize: 8,
            // bevelSegments: 5
        });

        var textMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

        textMesh = new THREE.Mesh(textGeo, textMaterial);
        textMesh.position.set(0, Math.random() * 50, 0);

        scene.add(textMesh);
    });
}

document.addEventListener("keydown", function(e){
    addText(e.key);
})

function update() {
  // find intersections

  // cube.scale.x = mouse.x
  // textMesh.scale.z = mouse.x

  // create a Ray with origin at the mouse position
  //   and direction into the scene (camera direction)
  var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
  vector.unproject(camera);
  var ray = new THREE.Raycaster(
    camera.position,
    vector.sub(camera.position).normalize()
  );

  // create an array containing all objects in the scene with which the ray intersects
  var intersects = ray.intersectObjects(scene.children);

  // INTERSECTED = the object in the scene currently closest to the camera
  //		and intersected by the Ray projected from the mouse position

  // if there is one (or more) intersections
  if (intersects.length > 0) {
    // if the closest object intersected is not the currently stored intersection object
    if (intersects[0].object != INTERSECTED) {
      // restore previous intersection object (if it exists) to its original color
      if (INTERSECTED) {
        INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
        // INTERSECTED.scale.z = 0
        setupObjectScaleAnimation(
          INTERSECTED,
          {
            x: INTERSECTED.scale.x,
            y: INTERSECTED.scale.y,
            z: INTERSECTED.scale.z
          },
          { x: 1, y: 1, z: 1 },
          2000,
          0,
          TWEEN.Easing.Linear.None
        );
      }

      // store reference to closest object as current intersection object
      INTERSECTED = intersects[0].object;
      // store color of closest object (for later restoration)
      INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
      // set a new color for closest object
      // INTERSECTED.material.color.setHex(0xffff00);

      // animateVector3(
      //   textMesh.scale,
      //   { x: 1, y: 1, z: 5 },
      //   {
      //     duration: 1000,
      //
      //     easing: TWEEN.Easing.Quadratic.InOut,
      //
      //     update: function(d) {
      //       console.log("Updating: " + d);
      //     },
      //
      //     callback: function() {
      //       console.log("Completed");
      //     }
      //   }
      // );

      setupObjectScaleAnimation(
        INTERSECTED,
        {
          x: INTERSECTED.scale.x,
          y: INTERSECTED.scale.y,
          z: INTERSECTED.scale.z
        },
        { x: 1, y: 1, z: 2 },
        2000,
        0,
        TWEEN.Easing.Linear.None
      );
    }
  } // there are no intersections
  else {
    // restore previous intersection object (if it exists) to its original color
    if (INTERSECTED) {
      INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
      // INTERSECTED.scale.z = 0
      setupObjectScaleAnimation(
        INTERSECTED,
        {
          x: INTERSECTED.scale.x,
          y: INTERSECTED.scale.y,
          z: INTERSECTED.scale.z
        },
        { x: 1, y: 1, z: 1 },
        2000,
        0,
        TWEEN.Easing.Linear.None
      );
    }

    // remove previous intersection object reference
    //     by setting current intersection object to "nothing"
    INTERSECTED = null;
  }

  controls.update();
  // stats.update();
}

function render() {
  renderer.render(scene, camera);
}
