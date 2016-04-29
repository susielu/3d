import { PurpleSpinel3 } from '../color-lists'

export const Purple = {
  fragmentShader  : document.getElementById( 'fragmentShader' ).textContent,
  geometry        : [ 4000, 32, 15 ],
  uniforms        : {
    topColor    : { type: 'c', value: new THREE.Color( 'black' )   },
    bottomColor : { type: 'c', value: new THREE.Color( PurpleSpinel3 ) },
    offset      : { type: 'f', value: 33 },
    exponent    : { type: 'f', value: 0.6 }
  },
  vertexShader    : document.getElementById( 'vertexShader' ).textContent,
}
