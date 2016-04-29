function lengthChooser(min, max) {
  return function() { return Math.random()*(max - min) + min; };
}

let scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 250;
camera.position.y = 40;

let renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let controls = new THREE.OrbitControls( camera, renderer.domElement );
// changes focal point of camera
controls.target = new THREE.Vector3( 0, 80, 0 )


// let gridHelper = new THREE.GridHelper( 200, 10 ); //size and step
// scene.add( gridHelper );

let ground = new THREE.PlaneBufferGeometry( 200, 200 );
let groundMaterial = new THREE.MeshBasicMaterial( {color: "blue", side: THREE.DoubleSide} );
let plane = new THREE.Mesh( ground, groundMaterial );

// plane.position.y = - 250;
plane.rotation.x = - Math.PI / 2;
plane.receiveShadow = true;
scene.add( plane );


// Lights
let lights = [];
lights[ 0 ] = new THREE.PointLight( "#fff", 1, 0 );
lights[ 1 ] = new THREE.PointLight( "#fff", 1, 0 );
lights[ 2 ] = new THREE.PointLight( "#fff", 1, 0 );

lights[ 0 ].position.set( 0, 300, 0 );
lights[ 1 ].position.set( 500, 300, 200 );
lights[ 2 ].position.set( - 200, - 500, - 200 );

// scene.add( lights[ 0 ] );
scene.add( lights[ 1 ] );
scene.add( lights[ 2 ] );



//Colors
let colorList = {
  blue: [{ color: "#07b63a", emissive: "#343991"},
      { color: "#42e873", emissive: "#543491"},
      { color: "#42e873", emissive: "#543491"},
      { color: "#3cc8c8", emissive: "#553491"},
      { color: "#3cc8c8", emissive: "#553491"},
      { color: "#3cc8c8", emissive: "#553491"},
      { color: "#3cc8c8", emissive: "#361572"},
      { color: "#3cc8c8", emissive: "#361572"},
      { color: "#3cc8c8", emissive: "#361572"}
    ],
  pink: [
    { color: "#f55151", emissive: "#343991"},
    { color: "#f551d7", emissive: "#5988fc"},
    { color: "#7f2f71", emissive: "#5962fc"},
    { color: "#500d44", emissive: "#5962fc"},
    { color: "#500d44", emissive: "#5962fc"},
    { color: "#500d44", emissive: "#3f44a2"},
    { color: "#500d44", emissive: "#232778"},
    { color: "#500d44", emissive: "#232778"},
    { color: "#500d44", emissive: "#227878"}
  ]
}

let materials = colorList;
Object.keys(colorList).forEach(function(key) {

  materials[key] = materials[key].map(function(c){

    return new THREE.MeshStandardMaterial( {
      color: c.color,
      emissive: c.emissive,
      roughness: 1,
      metalness: 0,
      emissiveIntensity: 1
    });
  });
});


let MIN = 2, MAX = 6;
let minRadius = 0.3;

let lengthFunction = lengthChooser(MIN, MAX);

function render() {
    requestAnimationFrame( render );
    renderer.render( scene, camera );
    controls.update();
}

let treeData = [{
    radius: 6,
    sizeReduction: .85,
    branchProbability: 0.12,
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Vector3(0, 1, 0),
    color: 'blue'
}, {
    radius: 3,
    sizeReduction: .87,
    branchProbability: 0.25,
    position: new THREE.Vector3(10, 0, -10),
    rotation: new THREE.Vector3(0,  1,  0),
    color: 'blue'
}, {
    radius: 7,
    sizeReduction: .82,
    branchProbability: 0.22,
    position: new THREE.Vector3(20, 0, 10),
    rotation: new THREE.Vector3(0,  1,  0),
    color: 'blue'
},{
    radius: 7,
    sizeReduction: .82,
    branchProbability: 0.22,
    position: new THREE.Vector3(-20, 0, 5),
    rotation: new THREE.Vector3(0,  1,  0),
    color: 'blue'
},{
    radius: 7,
    sizeReduction: .82,
    branchProbability: 0.22,
    position: new THREE.Vector3(-20, 0, -25),
    rotation: new THREE.Vector3(0,  1,  0),
    color: 'blue'
},{
    radius: 7,
    sizeReduction: .92,
    branchProbability: 0.1,
    position: new THREE.Vector3(-15, 0, 15),
    rotation: new THREE.Vector3(0,  1,  0),
    color: 'pink'
},{
    radius: 10,
    sizeReduction: .75,
    branchProbability: 0.28,
    position: new THREE.Vector3(-20, 0, -15),
    rotation: new THREE.Vector3(0,  1,  0),
    color: 'pink'
}];

function createSegment(treeSegment) {

  if (treeSegment.radius < minRadius) {
    return;
  }

  let localPosition = new THREE.Vector3();
  localPosition.copy(treeSegment.position);
  let localRotation = new THREE.Vector3();
  localRotation.copy(treeSegment.rotation);

  let materialIndex = Math.min(Math.floor(treeSegment.radius), materials[treeSegment.color].length - 1 );
  let material = materials[treeSegment.color][materialIndex];
  let topRadius = treeSegment.radius * treeSegment.sizeReduction;
  // console.log("radius old, new", treeSegment.radius, topRadius);
  let length = lengthFunction();

  let geometry = new THREE.CylinderGeometry(
    topRadius,
    treeSegment.radius,
    length,
    10
  );

  let cylinder = new THREE.Mesh(geometry, material);
  cylinder.position.x = localPosition.x;
  cylinder.position.y = localPosition.y;
  cylinder.position.z = localPosition.z;

  cylinder.rotation.x = treeSegment.rotation.x;
  cylinder.rotation.y = treeSegment.rotation.y;
  cylinder.rotation.z = treeSegment.rotation.z;

  scene.add(cylinder);

  let newRecursiveSegment = Object.assign({}, treeSegment);
  newRecursiveSegment.radius = topRadius;
  newRecursiveSegment.position = localPosition;
  newRecursiveSegment.rotation = localRotation;

  let updateVector = new THREE.Vector3(0,1,0);
  let rotationMatrix = new THREE.Matrix4();
  let euler = new THREE.Euler();
  euler.setFromVector3(newRecursiveSegment.rotation, 'XYZ');
  rotationMatrix.makeRotationFromEuler(euler);
  updateVector.transformDirection(rotationMatrix);
  updateVector.multiplyScalar(length);

  newRecursiveSegment.position.add(updateVector);
  // console.log("newrec pos", newRecursiveSegment.position);

  createSegment(newRecursiveSegment);

  if (Math.random() < newRecursiveSegment.branchProbability) {

    let newBranchSegment = Object.assign({}, treeSegment);
    newBranchSegment.position = localPosition;
    newBranchSegment.rotation = localRotation;
    newBranchSegment.rotation.x += Math.random() - 0.5;
    newBranchSegment.rotation.y += Math.random() - 0.5;
    newBranchSegment.rotation.z += Math.random() - 0.5;
    newBranchSegment.rotation.normalize();
    // TODO: update position due to rotation effects here?
    createSegment(newBranchSegment);
  }
}

function renderTree(singleTree){
    createSegment(singleTree)
}

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}, false );

document.addEventListener('DOMContentLoaded', function () {
  //Create all of the trees initially
  treeData.forEach(function(t){ renderTree(t); });

  render();
})
