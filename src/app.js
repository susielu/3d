import { createLengthChooserWithMinAndMax } from './higher-order'
import * as ColorLists                      from './color-lists'
import { Pink as PinkSpotlight }            from './lighting/spotlights'
import { Purple as PurpleSky }              from './lighting/skies'
import { beginCreatingSegments }            from './creators/segment-creator'
import {
  createCameraControlsWithFocalPoint,
  createMaterialListFromColorList,
  createOverrideForReadOnlyContructor,
  createPlane,
  createSky,
  createSpotlight,
  createRendererForWindow                 } from './genesis'


// Using `require` to facillitate hot module replacement (import ~= const * = require(*))
let conicalDendriteTreeSegments = require('./plantae/conical-dendrite-trees').default // this is saved for reloading

const scene = new THREE.Scene();

const camera =
  // `PerspectiveCamera.position` is read only but it's fields `y` and `z` aren't
  createOverrideForReadOnlyContructor( THREE.PerspectiveCamera, { position : { y : 40, z : 250 }, focus : 100 } )
    ( 45, window.innerWidth / window.innerHeight, 0.1, 2000000 )

let renderer = createRendererForWindow() // `let` instead of `const` for reloading
renderer.shadowMap.endabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const focalPoint = [ 0, 80, 0 ]
const controls = createCameraControlsWithFocalPoint(camera, renderer, focalPoint)


const plane = createPlane({
  mesh      : { color : "#07b63a", emissive: "#343991" },
  geometry  : { width : 7000, height : 7000 }
})

scene.add(plane)



const renderOnce = () => {
  renderer.render( scene, camera );
  controls.update();
}

const startRenderRunLoop = function render () {
  const runLoopId = requestAnimationFrame( render );
  renderOnce()

  return runLoopId
}

const initializeEachSegment = segments => {

  segments.forEach(segment => {

    beginCreatingSegments({
      lengthProducer : createLengthChooserWithMinAndMax(2, 6),
      materials      : createMaterialListFromColorList(ColorLists.BlueToPink),
      scene,
      segment,
      minimumRadius  : 0.3,
      leafThreshold  : 1
    })
  })

}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( 'resize', onWindowResize, false )

let runLoopIdentifier // This is saved for canceling when hot module reloading
const onDOMLoad = () => {
  // Lighting
  scene.add( createSpotlight(PinkSpotlight) );
  scene.add( createSky(PurpleSky) );

  initializeEachSegment(conicalDendriteTreeSegments)
  runLoopIdentifier = startRenderRunLoop()
}

document.addEventListener( 'DOMContentLoaded', onDOMLoad )


export const reload = (/* updatedDependencies */) => {
  console.info('Canceling the run loop...')
  cancelAnimationFrame(runLoopIdentifier)

  console.info('Removing all children...')
  for (let i = scene.children.length - 1; i >= 0 ; i--) { // eslint-disable-line
    let child = scene.children[ i ];

    if ( child !== plane && child !== camera ) {
      scene.remove(child);
    }
  }

  while (renderer.domElement.lastChild)
    renderer.domElement.removeChild(renderer.domElement.lastChild)

  document.removeEventListener( 'DOMContentLoaded', onDOMLoad )
  conicalDendriteTreeSegments = require('./plantae/conical-dendrite-trees').default

  onDOMLoad()

  console.info('Reload complete.')
}

module.hot &&
  module.hot.accept([ './lighting/skies', './lighting/spotlights', './plantae/conical-dendrite-trees' ], reload)
