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

console.log("=====================");
let a = [3, 3];
let ix = indices(a);
for (let i of ix) {
    console.log(i);
}
// console.log(ix);
// console.log(unsqueeze(arange(5)));
// console.log("----------------------");
// for (let i of iter) {
//     console.log(i);
// }
// Array(4).keys().map(Array.of)
// console.log(Array.from(iterProduct(a)));

// console.log([1, 2, 3].concat([]))
// console.log(res);