  //////////////////////////////////////////////////////////////////////////////////
  //		Init
  //////////////////////////////////////////////////////////////////////////////////

  let log = console.log;
  var camera, light, renderer, scene;
  THREEx.ArToolkitContext.baseURL = "./"

  window.onload = () => {
      renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          precision: 'mediump',
      });

      var clock = new THREE.Clock();

      var mixers = [];

      renderer.setPixelRatio(window.devicePixelRatio);

      renderer.setClearColor(new THREE.Color('lightgrey'), 0)
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.domElement.style.position = 'absolute'
      renderer.domElement.style.top = '0px'
      renderer.domElement.style.left = '0px'
      document.body.appendChild(renderer.domElement);

      // init scene and camera
      scene = new THREE.Scene();

      //////////////////////////////////////////////////////////////////////////////////
      //		Initialize a basic camera
      //////////////////////////////////////////////////////////////////////////////////

      // Create a camera
      camera = new THREE.Camera();
      scene.add(camera);

      light = new THREE.AmbientLight(0xffffff);
      scene.add(light);

      ////////////////////////////////////////////////////////////////////////////////
      //          handle arToolkitSource
      ////////////////////////////////////////////////////////////////////////////////

      var arToolkitSource = new THREEx.ArToolkitSource({
          sourceType: 'webcam',
          sourceWidth: 480,
          sourceHeight: 640,
      })

      arToolkitSource.init(function onReady() {
          // use a resize to fullscreen mobile devices
          setTimeout(function () {
              onResize()
          }, 1000);
      })

      // handle resize
      window.addEventListener('resize', function () {
          onResize()
      })

      // listener for end loading of NFT marker
      window.addEventListener('arjs-nft-loaded', function (ev) {
          console.log(ev);
      })

      function onResize() {
          arToolkitSource.onResizeElement()
          arToolkitSource.copyElementSizeTo(renderer.domElement)
          if (arToolkitContext.arController !== null) {
              arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
          }
      }
      log("setup three")

      ////////////////////////////////////////////////////////////////////////////////
      //          initialize arToolkitContext
      ////////////////////////////////////////////////////////////////////////////////

      // create atToolkitContext
      var arToolkitContext = new THREEx.ArToolkitContext({
          detectionMode: 'mono',
          canvasWidth: 480,
          canvasHeight: 640,
      }, {
          sourceWidth: 480,
          sourceHeight: 640,
      })

      // initialize it
      log(camera.projectionMatrix);
      arToolkitContext.init(function onCompleted() {
          // copy projection matrix to camera
          camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
          log("setup camera")
      })
      log("init ar toolkit context")
      ////////////////////////////////////////////////////////////////////////////////
      //          Create a ArMarkerControls
      ////////////////////////////////////////////////////////////////////////////////

      // init controls for camera
      var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
          type: 'nft',
          descriptorsUrl: 'nft_data/test_marker',
          changeMatrixMode: 'cameraTransformMatrix'
      })

      scene.visible = false

      var root = new THREE.Object3D();
      scene.add(root);

      //////////////////////////////////////////////////////////////////////////////////
      //		add an object in the scene
      //////////////////////////////////////////////////////////////////////////////////

      var threeGLTFLoader = new THREE.GLTFLoader();
      var model;

      threeGLTFLoader.load("./models/test_model.glb", function (gltf) {
          model = gltf.scene.children[0];
          model.name = 'Flamingo';

          /* var animation = gltf.animations[0];
          var mixer = new THREE.AnimationMixer(model);
          mixers.push(mixer);
          var action = mixer.clipAction(animation);
          action.play(); */

          root.matrixAutoUpdate = false;
          root.add(model);

          model.position.z = -200;
          model.position.x = 100;
          model.position.y = 100;


          //////////////////////////////////////////////////////////////////////////////////
          //		render the whole thing on the page
          //////////////////////////////////////////////////////////////////////////////////
          log("setup everything")
          var animate = function () {
              requestAnimationFrame(animate);

              /* if (mixers.length > 0) {
                  for (var i = 0; i < mixers.length; i++) {
                      mixers[i].update(clock.getDelta());
                  }
              } */

              if (!arToolkitSource.ready) {
                  return;
              }

              arToolkitContext.update(arToolkitSource.domElement)

              // update scene.visible if the marker is seen
              scene.visible = camera.visible;

              renderer.render(scene, camera);
          };

          requestAnimationFrame(animate);
      });
  }