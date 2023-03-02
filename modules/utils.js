// export function log(i, j, msg) {
//     console.log({"i": i, "j": j, "msg": msg});
// }


function arange(n) {
    return Array.from(Array(n).keys());
}


function unsqueeze(arr) {
    return Array.from(arr.map(item => [item]));
}


function indices(dimensions) {
    if (dimensions.length == 1)
        return unsqueeze(arange(dimensions[0]));

    let child = indices(dimensions.slice(1));
    let res = [];
    for (let i = 0; i < child.length; i++) {
        for (let j = 0; j < dimensions[0]; j++)
            res.push([j].concat(child[i]));
    }
    return res;
}

export {arange, unsqueeze, indices};