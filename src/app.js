import { createLengthChooserWithMinAndMax } from './higher-order'
import * as ColorLists                      from './color-lists'
import { beginCreatingSegments }            from './segment-creator'
import {
  createPlane,
  createMaterialListFromColorList,
  createOverrideForReadOnlyContructor,
  createCameraControlsWithFocalPoint,
  createRendererForWindow                 } from './genesis'

// Using `require` to facillitate hot module replacement (import ~= const * = require(*))
let conicalDendriteTreeSegments = require('./plantae/conical-dendrite-trees').default

const scene = new THREE.Scene();

const camera =
  // `PerspectiveCamera.position` is read only but it's fields `y` and `z` aren't
  createOverrideForReadOnlyContructor( THREE.PerspectiveCamera, { position : { y : 40, z : 250 } } )
    ( 45, window.innerWidth / window.innerHeight, 0.1, 1000 )

let renderer = createRendererForWindow()

const focalPoint = [ 0, 80, 0 ]
const controls = createCameraControlsWithFocalPoint(camera, renderer, focalPoint)


const plane = createPlane({
  mesh      : { color : 'blue' },
  geometry  : { width : 200, height : 200 }
})
scene.add(plane)


// Lights
const lights = [];
lights[ 0 ] = new THREE.PointLight( "#fff", 1, 0 );
lights[ 1 ] = new THREE.PointLight( "#fff", 1, 0 );

lights[ 0 ].position.set( 500, 300, 200 );
lights[ 1 ].position.set( - 200, - 500, - 200 );

lights.forEach(light => scene.add(light))


function renderOnce () {
  renderer.render( scene, camera );
  controls.update();
}

const startRenderRunLoop = function render () {
  const runLoopId = requestAnimationFrame( render );
  renderOnce()

  return runLoopId
}

const initializeEachSegment = segments => {
  const colors = [ ]

  segments.forEach(segment => {
    colors.push(segment.color)

    beginCreatingSegments({
      lengthProducer : createLengthChooserWithMinAndMax(2, 6),
      materials      : createMaterialListFromColorList(ColorLists.BlueToPink),
      scene,
      segment,
      minimumRadius  : 0.3
    })
  })

  console.info('colors used:', colors)
}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( 'resize', onWindowResize, false )

let runLoopIdentifier
const onDOMLoad = () => {
  initializeEachSegment(conicalDendriteTreeSegments)
  runLoopIdentifier = startRenderRunLoop()
}

document.addEventListener( 'DOMContentLoaded', onDOMLoad )

export const reload = () => {
  console.info('Rebooting scene & renderer...')

  cancelAnimationFrame(runLoopIdentifier)
  console.info('Canceling the run loop...')

  for (let i = scene.children.length - 1; i >= 0 ; i -- ) { // eslint-disable-line
    let child = scene.children[ i ];

    if ( child !== plane && child !== camera && lights.indexOf(child) === -1 ) {
      scene.remove(child);
    }
  }

  while (renderer.domElement.lastChild) {
    renderer.domElement.removeChild(renderer.domElement.lastChild)
  }

  console.info('Removing all children...')

  document.removeEventListener( 'DOMContentLoaded', onDOMLoad )
  conicalDendriteTreeSegments = require('./plantae/conical-dendrite-trees').default

  onDOMLoad()

  console.info('Update complete.')
}

if (module.hot) {
  // accept update of dependencies
  module.hot.accept([ './plantae/conical-dendrite-trees' ], function (updatedDependencies) {
    const noPlantaeWereUpdated = !updatedDependencies.some(ud => ud.includes('plantae'))
    if (noPlantaeWereUpdated) {
      return
    } else {
      reload()
    }
  });
}
