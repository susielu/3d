/*
 * Genesis
 * - Purpose: To make contructing plantae-specific THREE instances more
 *   comfortable and fun
 *
 */

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
      Object.keys( override[key1] ).forEach( key2 => {
        instance[key1][key2] = override[key1][key2]
      })

      return instance
    }, new Contructor( ...argumentsToSpread ))
