'use strict';

//  ******* Process Data For Roots Node  sending  *******
function processingRootNodes(receivedData) {
  return receivedData.map(item => ({
    ...item,
    status: item.children.length > 0 ? true : false,
    children: []
  }));
}


//  ******* Process Data wrt Nodes id  *******

function processingDatawithID(receivedData, receivedId) {
  // Check if receivedData is an array
  if (!Array.isArray(receivedData)) {
    throw new Error('receivedData should be an array');
  }

  // Find the item with the specified ID
  const item = receivedData.find(item => item.id === receivedId);

  // Check if the item exists and has children property
  if (!item || !Array.isArray(item.children)) {
    return [];
  }

  console.log(!!item.children.length);
  // Process the children
  let childrenList = item.children.map((child) => {
    return { id: child.id, name: child.name, status: !!child.children.length };
  });

  return childrenList;
}


// ******* Fetching All Nodes *************

function processingDataNodes(receivedData) {
  // Initialize nodes with empty children arrays
  const nodes = receivedData.map(item => ({
    id: item.id,
    name: item.name,
    //  status:item.children.length > 0 ? true : false,
    children: [],

  }));

  // Create a map of nodes by their IDs
  const nodeMap = new Map(nodes.map(node => [node.id, node]));

  // Assign children to their respective parents
  receivedData.forEach(item => {
    if (item.parent) {
      const parentId = item.parent.id;
      const parentNode = nodeMap.get(parentId);
      if (parentNode) {
        parentNode.children.push(nodeMap.get(item.id));
      }
    }
  });

  // Include all nodes in the final result
  return Array.from(nodeMap.values());
}


// function processingDatawithString(receivedData, filterValue) {
//   if (!Array.isArray(receivedData)) {
//     throw new Error('receivedData should be an array');
//   }

//   // Find the item with the specified name prefix
//   const item = receivedData.find(item => item.name.substring(0, filterValue.length).toLowerCase() === filterValue.toLowerCase());
//   console.log("item", item);

//   if (!item) {
//     return []; // Return an empty array if no item is found
//   }

//   const objlist = [];
//   getNodes(objlist, item.children);
//   return objlist;
// }

function processingDatawithString(receivedData, filterValue) {
  if (!Array.isArray(receivedData)) {
    throw new Error('receivedData should be an array');
  }

  // Find the item with the specified name prefix
  const item = receivedData.find(item => item.name.substring(0, filterValue.length).toLowerCase() === filterValue.toLowerCase());
  console.log("item", item);

  if (!item) {
    return [];
  }

  const objlist = [];
  objlist.push({ id: item.id, name: item.name });
  getNodes(objlist, item.children);
  return objlist;
}

function getNodes(objlist, children) {
  children.forEach((item) => {
    objlist.push({ id: item.id, name: item.name });
    if (item.children && item.children.length > 0) {
      getNodes(objlist, item.children);
    }
  });
}


// function getNodes(objlist, children) {
//   children.forEach((item) => {
//     objlist.push({ id: item.id, name: item.name });
//     if (item.children && item.children.length > 0) {
//       getNodes(objlist, item.children);
//     }
//   });
// }




// function buildTree(array) {
//   // Start from the last element and work upwards
//   for (let i = array.length - 2; i >= 0; i--) {
//     array[i].children = [array[i + 1]];
//     array[i].status = true;
//     if (i === 0) {
//       array[i].status = false;
//     }
//     array.pop(); // Remove the child node as it has been added to the parent
//   }
//   return array;
// }


function buildTreeFromNestedArray(nestedArray) {
  return nestedArray.map(subArray => {
    subArray = subArray.reverse();
    console.log('subArray.length', subArray)
   
    // Start from the last element and work upwards
    for (let i = subArray.length - 2; i >= 0; i--) {  //3-2;1>0;1--
      subArray[i].children = [subArray[i + 1]];   // 
     // console.log("dvsfd");

      subArray[i].status = true;

      subArray.pop(); // Remove the child node as it has been added to the parent
      subArray[i].status = subArray[i].children.length > 0 ? true : false;
   
    }
   // let  newSubArray =getlastNestedChildStatus(subArray[0])
    return subArray[0]; // Return the root of each subArray
  });
}


// these  two  functions are used for   check the the objects in 
// such that if  the object have same name then if checks for the deply  nested node among 
//them and remove the other   nodes 

// Function to get the depth of an object
function getObjectDepth(obj) {
  let depth = 0;

  if (typeof obj === 'object' && obj !== null) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key) && key === 'children') {
        let tempDepth = getObjectDepth(obj[key][0]); // Only check the first child
        if (tempDepth > depth) {
          depth = tempDepth;
        }
      }
    }
    depth++;
  }

  return depth;
}

// Function to remove duplicates and keep the most deeply nested one
function removeDuplicatesKeepDeepest(arr) {
  // Group objects by name
  const groups = arr.reduce((acc, item) => {
    if (!acc[item.name]) {
      acc[item.name] = [];
    }
    acc[item.name].push(item);
    return acc;
  }, {});

  // Iterate over the groups
  const result = [];
  for (let name in groups) {
    if (groups[name].length === 1) {
      result.push(groups[name][0]);
    } else {
      // Find the object with the maximum depth
      let maxDepth = -1;
      let deepestObject = null;

      groups[name].forEach(item => {
        const depth = getObjectDepth(item);
        if (depth > maxDepth) {
          maxDepth = depth;
          deepestObject = item;
        }
      });

      if (deepestObject) {
        result.push(deepestObject);
      }
    }
  }

  return result;
}


module.exports = {
  //findNodesWithNullParent

  async getData(ctx) {
    try {
      const data = await strapi.service('api::tree-custom-api.tree-custom-api').findNodesWithNullParent();
      ctx.send(data);
    } catch (error) {
      ctx.send({ message: `we got error ${error.message}` });
    }
  },

  // async getData(ctx) {
  //   try {
  //     const data = await strapi.service('api::tree-custom-api.tree-custom-api').getNodes();
  //     //  console.log('data', data);
  //     let newData = processingRootNodes(data)
  //     ctx.send(newData);
  //   } catch (error) {
  //     ctx.send({ message: `we got error ${error.message}` });
  //   }
  // },

  // getDataWithID

  async getDataWithID(ctx) {
    try {
      const { id } = ctx.params;
      let idINT = parseInt(id);
      console.log("id in int", idINT);
      const data = await strapi.service('api::tree-custom-api.tree-custom-api').getNodesTest();
      // console.log("data", data);
      let newData = processingDataNodes(data);
      let childs = processingDatawithID(newData, idINT)
      ctx.send(childs);
    } catch (error) {
      ctx.send({ message: `we got error ${error.message}` });
    }
  },

  async filterTree(ctx) {
    try {
      const { filterData } = ctx.params;
      //  let idINT = parseInt(id);
      //   console.log("filterData", filterData);
      const data = await strapi.service('api::tree-custom-api.tree-custom-api').getNodesTest();
      // console.log("data", data);
      let newData = processingDataNodes(data);
      let childs = processingDatawithString(newData, filterData)
      ctx.send(childs);
    } catch (error) {
      ctx.send({ message: `we got error ${error.message}` });
    }
  },

  async createNode(ctx) {
    try {
      const { name, parent } = ctx.request.body.data;
      console.log({ name, parent });
      const node = await strapi.service('api::tree-custom-api.tree-custom-api').addNode(name, parent);
      ctx.send(node);
    } catch (error) {
      ctx.send({ message: `we got error ${error.message}` });
    }
  },

  async deleteNode(ctx) {
    try {
      const { id } = ctx.params;
      const node = await strapi.service('api::tree-custom-api.tree-custom-api').deleteNode(id);
      ctx.send(node);
    } catch (error) {
      ctx.send({ message: `  ${error.message}` });
    }
  },

  async updateNode(ctx) {

    try {
      const { id } = ctx.params;
      const { name } = ctx.request.body.data;
      console.log({ name })

      const node = await strapi.service('api::tree-custom-api.tree-custom-api').updateNode(name, id);
      ctx.send(node);
    } catch (error) {
      ctx.send({ message: `  ${error.message}` });
    }
  },

  //updateNodePosition
  async updateNodePosition(ctx) {

    try {
      const { id } = ctx.params;
      const { parent } = ctx.request.body.data;
      console.log({ parent })

      const node = await strapi.service('api::tree-custom-api.tree-custom-api').updateNodePosition(parent, id);
      ctx.send(node);
    } catch (error) {
      ctx.send({ message: `  ${error.message}` });
    }
  },

  //findValue 
  async findingNodes(ctx) {
    try {
      const { filterData } = ctx.params;
      const node = await strapi.service('api::tree-custom-api.tree-custom-api').findValue(filterData);
      // console.log('node', node);
      //  console.log("this\n\n");

      let tree = buildTreeFromNestedArray(node);
      //  console.log("tree",tree,"\n");

      let finalizedTree = removeDuplicatesKeepDeepest(tree);
 //     console.log('finalizedTree', finalizedTree);
      ctx.send(finalizedTree);
    } catch (error) {
      ctx.send({ message: `  ${error.message}` });
    }
  },

  async findingPaginatedNodes(ctx) {
    try {
      const { name } = ctx.params;
      console.log("name", name);

      const node = await strapi.service('api::tree-custom-api.tree-custom-api').getChildrenPaginated(name);

      ctx.send(node);
    } catch (error) {
      ctx.send({ message: `  ${error.message}` });
    }
  }

};
