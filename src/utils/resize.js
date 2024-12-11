// export const resizeImageFile = (imageArray, newSize)=>{
//     const [newRows, newCols] = newSize; // New dimensions
//     const oldRows = imageArray.length;
//     const oldCols = imageArray[0].length;

//     const resizedArray = [];
//     for (let i = 0; i < newRows; i++) {
//         const row = [];
//         for (let j = 0; j < newCols; j++) {
//             // Calculate corresponding index in the original array using modulo
//             const originalRow = i % oldRows;
//             const originalCol = j % oldCols;
//             row.push(imageArray[originalRow][originalCol]);
//         }
//         resizedArray.push(row);
//     }

//     return resizedArray;
// }
