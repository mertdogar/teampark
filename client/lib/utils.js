export const MUTE_DISTANCE = 400;

export const getVolumeByPositions = ({x: x1, y: y1, width: width1, height: height1}, {x: x2, y: y2, width: width2, height: height2}) => {
  if (!width1) width1 = 100;
  if (!width2) width2 = 100;
  if (!height1) height1 = 100;
  if (!height2) height2 = 100;

  x1 = x1 + (width1 / 2);
  y1 = y1 + (width1 / 2);

  x2 = x2 + (width2 / 2);
  y2 = y2 + (width2 / 2);

  const diff = Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));

  if (diff > MUTE_DISTANCE)
    return 0;
  else
    return (MUTE_DISTANCE - diff) / MUTE_DISTANCE;
}

export const getScaleByPositions = ({x: x1, y: y1}, {x: x2, y: y2}) => {
  const diff = Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));

  if (diff > MUTE_DISTANCE)
    return 0.5;
  else
    return 0.5 * ((MUTE_DISTANCE - diff) / MUTE_DISTANCE) + 0.5;
}