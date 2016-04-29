/*
 * Higher Order
 * - Purpose: To make creating mathematical higher-order functions more
 *   comfortable and fun
 *
 */

export const createLengthChooserWithMinAndMax = (min, max) =>
  () => Math.random() * (max - min) + min
