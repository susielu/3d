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

export const createRendererForWindow = (someWindow = window) => {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( someWindow.innerWidth, someWindow.innerHeight );
  someWindow.document.body.appendChild( renderer.domElement );

  return renderer
}

// Create, spread & use a 2-dimensional object to assign to a read-only namespace
export const createOverrideForReadOnlyContructor = ( Contructor, override ) =>
  ( ...argumentsToSpread ) =>
    Object.keys(override).reduce(( instance, key1 ) => {
      if (typeof override[key1] === 'object')
        Object.keys( override[key1] ).forEach( key2 => {
          instance[key1][key2] = override[key1][key2]
        })
      else
        instance[key1] = override[key1]

      return instance
    }, new Contructor( ...argumentsToSpread ))

export const createOverrideContructor =  createOverrideForReadOnlyContructor

export const createPlane = ({ mesh, geometry }) => {
  const ground         = new THREE.PlaneBufferGeometry( geometry.width, geometry.height );
  const groundMaterial = new THREE.MeshBasicMaterial( { color : mesh.color, side : mesh.side || THREE.DoubleSide } );

  return createOverrideContructor( THREE.Mesh, { rotation : { x : Math.PI / 2 }, receiveShadow : true } )
      ( ground, groundMaterial )
}
