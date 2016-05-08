/*
 * Genesis
 * - Purpose: To make contructing plantae-specific THREE instances more
 *   comfortable and fun
 *
 */

export const createMaterialListFromColorList = colorList => {
  const materials = Object.assign({ }, colorList);
  Object.keys(colorList).forEach(key => {
    materials[key] = materials[key].map(c =>
      new THREE.MeshStandardMaterial( {
        color: c.color,
        emissive: c.emissive,
        roughness: 1,
        metalness: 0,
        emissiveIntensity: 1
      }));
  });

  return materials
}

export const createCameraControlsWithFocalPoint = (camera, renderer, focalPoint) => {
  const [ x, y, z ] = focalPoint
  const controls    = new THREE.OrbitControls( camera, renderer.domElement );
  controls.target   = new THREE.Vector3( x, y, z )

  return controls
}

export const createRendererForWindow = (element, someWindow = window) => {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( someWindow.innerWidth, someWindow.innerHeight );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  if (document.getElementsByTagName('canvas').length === 0){
      element.appendChild( renderer.domElement )
  }

  return renderer
}

// Create, spread & use a 2-dimensional object to assign to a read-only namespace
export const createOverrideForReadOnlyContructor = ( Contructor, override ) =>

  //TODO: This type of function is confusing to me
  ( ...argumentsToSpread ) =>
    Object.keys(override).reduce(( instance, key1 ) => {
      if (typeof override[key1] === 'object')
        Object.keys( override[key1] ).forEach( key2 => {
          instance[key1][key2] = override[key1][key2]
        })
      else
        instance[key1] = override[key1]


      // console.log('instance', instance, Contructor, override)
      return instance
    }, new Contructor( ...argumentsToSpread ))

//TODO: This type of function is confusing to me
export const createOverrideContructor =  createOverrideForReadOnlyContructor

export const createPlane = ({ mesh, geometry }) => {
  const ground         = new THREE.PlaneBufferGeometry( geometry.width, geometry.height );
  const groundMaterial = new THREE.MeshStandardMaterial( {
      color: mesh.color,
      emissive: mesh.emissive,
      roughness: 1,
      metalness: 0,
      emissiveIntensity: 1
    } );


  let plane = new THREE.Mesh( ground, groundMaterial );

  plane.rotation.x = - Math.PI / 2;
  plane.receiveShadow = true;
  return plane;

  //TODO: the added properties don't seem to be working
  // return createOverrideContructor( THREE.Mesh, { rotation : { x : - Math.PI / 2 }, receiveShadow : true } )
  //     ( ground, groundMaterial )
}

export const createSpotlight = (options) => {
  const spotlight = new THREE.SpotLight(options.color);
  spotlight.position.set(...options.position);
  spotlight.castShadow = options.castShadow;
  spotlight.angle      = options.angle;
  spotlight.exponent   = options.exponent;
  spotlight.penumbra   = options.penumbra;
  spotlight.decay      = options.decay;
  spotlight.distance   = options.distance;
  spotlight.shadow.mapSize.width  = options.shadow.mapSize.width;
  spotlight.shadow.mapSize.height = options.shadow.mapSize.height;

  return spotlight
}

export const createSky = ({ vertexShader, fragmentShader, uniforms, geometry }) => {
  const skyGeo = new THREE.SphereGeometry( ...geometry );
  const skyMat = new THREE.ShaderMaterial({
    fragmentShader,
    side : THREE.BackSide,
    uniforms,
    vertexShader,
  });

  return new THREE.Mesh( skyGeo, skyMat );
}
