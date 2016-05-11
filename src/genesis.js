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
