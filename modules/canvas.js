function create(id, parent, width, height) {
  let divWrapper = document.createElement('div');
  let canvasElem = document.createElement('canvas');
  parent.appendChild(divWrapper);
  divWrapper.appendChild(canvasElem);

  divWrapper.id = id;
  canvasElem.width = width;
  canvasElem.height = height;
  return canvasElem.getContext('2d');
}

export { create };

// const canvas = document.getElementById("canvas")
// const canvasContext = canvas.getContext('2d')