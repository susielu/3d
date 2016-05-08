import { createLengthChooserWithMinAndMax } from './higher-order'
import * as ColorLists                      from './color-lists'
import { Pink as PinkSpotlight }            from './lighting/spotlights'
import { Purple as PurpleSky }              from './lighting/skies'
import { beginCreatingSegments }            from './creators/segment-creator'
import {
  createCameraControlsWithFocalPoint,
  createMaterialListFromColorList,
  createPlane,
  createSky,
  createSpotlight,
  createRendererForWindow                 } from './genesis'

// State variables
const OVERLAY = "#overlay";
const ROWLENGTH = 5;
let selectedTree;
let pause = false;

// Using `require` to facillitate hot module replacement (import ~= const * = require(*))
let conicalDendriteTreeSegments = require('./plantae/conical-dendrite-trees').default // this is saved for reloading
let transitions = {
  trees: {}
};

const scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 2000000 );
camera.position.y = 120;
camera.focus = 100;

let renderer = createRendererForWindow(document.getElementById('container')) // `let` instead of `const` for reloading
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

  if (!pause && selectedTree !== undefined && transitions.trees[selectedTree].length !== 0){

    let objectTransitions = transitions.trees[selectedTree]
    const result = objectTransitions[0];

    if (typeof result === "function"){
      objectTransitions[0] = result();
    } else {
      objectTransitions = objectTransitions.concat(result.new);
      objectTransitions[0] = result.func();
    }
    transitions.trees[selectedTree] = objectTransitions.filter(t => t);

  }
}

//time in seconds
const scaleY = (object, property, onEnd, end=1, initial=0.1) => {
  var increment = .4;

  var scaling = () => {
    if (object[property].y < end){
      object[property].y += increment;
    }

    //continues to call itself until end, then goes to get next transition
    if (object[property].y >= end){
      return onEnd()
    }

    return scaling;
  }

  return scaling;
}

const startRenderRunLoop = function render () {
  const runLoopId = requestAnimationFrame( render );
  renderOnce()

  return runLoopId
}

const initializeEachSegment = (segments, gridLength, plotSize) => {
  const length = segments.length;

  segments.forEach((segment, i) => {
    segment.position = new THREE.Vector3( -plotSize*gridLength/2 + plotSize*(i%gridLength) + plotSize/2 , 0, -plotSize*gridLength/2 + plotSize*(Math.floor(i/gridLength)) + plotSize/2)

    transitions.trees[i] = [ beginCreatingSegments({
      lengthProducer : createLengthChooserWithMinAndMax(2, 6),
      materials      : createMaterialListFromColorList(ColorLists.BlueToPink),
      scene,
      segment,
      minimumRadius  : 0.3,
      leafThreshold  : 1,
      transition: scaleY
    }) ]
  })

}

//Overlay interactions
d3.select("#zoom-out")
  .on('click', () => controls.dollyOut(5))

d3.select("#zoom-in")
  .on('click', () => controls.dollyIn(5))

d3.select("#pause")
  .on('click', () => pause = true)

d3.select("#play")
  .on('click', () => pause = false)

//Window resize and reload
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

  //Create grid of trees
  const PLOT = 100;
  const GRIDLENGTH = Math.ceil(Math.sqrt(conicalDendriteTreeSegments.length));
  var size = PLOT* GRIDLENGTH /2;
  var step = PLOT;

  camera.position.z = GRIDLENGTH*PLOT + 250;

  var gridHelper = new THREE.GridHelper( size, step );
  scene.add( gridHelper );

  initializeEachSegment(conicalDendriteTreeSegments, GRIDLENGTH, PLOT)
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
