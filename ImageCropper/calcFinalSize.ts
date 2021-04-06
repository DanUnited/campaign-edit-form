export default (
  cropWidth: number, cropHeight: number,
  minWidth: number, minHeight: number,
  maxWidth: number, maxHeight: number,
): {width: number, height: number} => {
  const cropAspect = cropWidth / cropHeight;

  let targetWidth = cropWidth;
  let targetHeight = cropHeight;

  if (cropHeight > maxHeight || cropWidth > maxWidth) {
    if (cropHeight > maxHeight) {
      targetHeight = maxHeight;
      targetWidth = targetHeight * cropAspect;
    } else {
      targetWidth = maxWidth;
      targetHeight = targetWidth / cropAspect;
    }
  }

  targetWidth = Math.max(targetWidth, minWidth);
  targetHeight = Math.max(targetHeight, minHeight);

  return {width: targetWidth, height: targetHeight};
};
