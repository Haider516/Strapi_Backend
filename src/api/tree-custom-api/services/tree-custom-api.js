// 'use strict';

// /**
//  * tree-custom-api service
//  */





'use strict';

/**
 * tree-custom-api service
 */

module.exports = {

  // Get Nodes
  async getNodes() {
    try {
      const nodes = await strapi.entityService.findMany('api::node.node', {
        populate: { parent: true },
      });

      // Transform data into a tree structure
      const map = new Map();
      nodes.forEach(node => {
        map.set(node.id, { ...node, children: [] });
      });

      const tree = [];

      map.forEach(node => {
        if (node.parent) {
          const parent = map.get(node.parent.id);
          if (parent) {
            parent.children.push(node);
          }
        } else {
          tree.push(node);
        }
      });

      return tree;

    } catch (err) {
      throw new Error('Error fetching nodes');
    }
  },

  async getNodesTest() {
    try {
      const nodes = await strapi.entityService.findMany('api::node.node', {
        populate: { parent: true },
      });
      return nodes;

    } catch (err) {
      throw new Error('Error fetching nodes');
    }
  },

  //Add
  async addNode(name, parentId) {
    console.log(name, parentId)
    try {
      const node = await strapi.entityService.create('api::node.node', {
        data: {
          "name": name,
          "parent": parentId,
        },
      });
      console.log("node", node)
      return node;
    } catch (err) {
      throw new Error('Error creating node');
    }
  },

  //delete
  async deleteNode(id) {
    try {
      id = parseInt(id); // Ensure the ID is an integer
      console.log("delete service:", id);

      // Fetch the first children of the given node
      const firstChildren = await strapi.entityService.findMany('api::node.node', {
        filters: {
          parent: {
            id: id,
          },
        },
        fields: ['id', 'name'],
      });


      let descendantIds = [];
      if (firstChildren.length > 0) {
        const descendants = await this.getDescendants(firstChildren);
        descendantIds = descendants.map(descendant => descendant.id);
      }

      // Add the original node's ID to the list
      descendantIds.push(id);
      let node;
      // Delete the node and its descendants
      for (let i = 0; i < descendantIds.length; i++) {
        const nodeId = descendantIds[i];
        console.log(`Deleting node with ID: ${nodeId}`);
        node = await strapi.entityService.delete('api::node.node', nodeId);
      }
      console.log(node);

      return node;
    } catch (err) {
      console.error('Error Deleting Node:', err);
      throw new Error('Error Deleting Node');
    }
  },


  //updateNode
  async updateNode(name, id) {
    console.log(name, id)
    try {
      parseInt(id)
      console.log("Update", name, id)
      const node = await strapi.entityService.update('api::node.node', id, {
        data: {
          "name": name
        },
      });
      return node;
    } catch (err) {
      throw new Error('Error Updating Node');
    }
  },

  async updateNodePosition(parent, id) {
    console.log(parent, id)
    try {
      parseInt(id)
      console.log("Update", parent, id)
      const node = await strapi.entityService.update('api::node.node', id, {
        data: {
          "parent": parent
        },
      });
      return node;
    } catch (err) {
      throw new Error('Error Updating Node');
    }
  },


  // async findValue(filtervalue) {

  //   const entries = await strapi.entityService.findMany('api::node.node', {
  //     filters: {
  //       name: {
  //         $containsi: filtervalue,
  //       },
  //     },
  //   });
  //   console.log("entries",entries)
  //   return entries;
  // },


  // async findValue(filtervalue) {
  //   // Step 1: Find Nodes Matching the Filter
  //   const entries = await strapi.entityService.findMany('api::node.node', {
  //     filters: {
  //       name: {
  //         $containsi: filtervalue,
  //       },
  //     },
  //   });

  //   console.log("Filtered Entries", entries,"\n_____________________\n");

  //   // Initialize an object to store parents
  //   let parents = {};

  //   // Step 2: Fetch Each Node's Parent
  //   for (let entry of entries) {
  //     const parentNode = await strapi.entityService.findMany('api::node.node', {
  //       filters: {
  //         id: entry.id,
  //       },
  //       populate: ['parent'],
  //     });

  //     const parent = parentNode[0]?.parent;
  //     if (parent) {
  //       console.log(`Parent for node ${entry.name}:`, parent);
  //       // Store parent by node name
  //       parents[entry.name] = parent;
  //     }
  //   }

  //   // Step 3: Compare Parents
  //   const parentNames = Object.values(parents).map(parent => parent.name);
  //   const uniqueParents = [...new Set(parentNames)];

  //   if (uniqueParents.length === 1) {
  //     console.log("All nodes have the same parent:", uniqueParents[0]);
  //   } else {
  //     console.log("Nodes have different parents:", uniqueParents);

  //     // Step 4: Fetch Siblings if Parents Differ
  //     let siblings = [];
  //     for (let parentName of uniqueParents) {
  //       const siblingNodes = await strapi.entityService.findMany('api::node.node', {
  //         filters: {
  //           parent: {
  //             name: {
  //               $eq: parentName,
  //             },
  //           },
  //         },
  //       });
  //       siblings = siblings.concat(siblingNodes);
  //       console.log(`Siblings for parent ${parentName}:`, siblingNodes);
  //     }

  //     // Step 5: Recursive Check (Optional)
  //     // Here you could continue fetching the next level of parents
  //     // if you want to compare the grandparents, etc.
  //   }

  //   // Return the entries and any further data you collected
  //   return { entries, parents,siblings };
  // }


  async findValue(filtervalue) {
    // Step 1: Find Nodes Matching the Filter
    const entries = await strapi.entityService.findMany('api::node.node', {
      filters: {
        name: {
          $containsi: filtervalue,
        },
      },
    });

    //  console.log("Filtered Entries", entries, "\n_____________________\n");

    // Initialize an array to store the lineages (each lineage is a subarray)
    let nodeLineages = entries.map(entry => [{ ...entry }]);

    // Step 2: For each filtered node, find the parent until one becomes null
    let allParentsFound = false;

    while (!allParentsFound) {
      allParentsFound = true;

      // Iterate over each lineage
      for (let lineage of nodeLineages) {
        const currentNode = lineage[lineage.length - 1];

        if (currentNode.parent) continue; // Skip if already reached the root

        const parentNode = await strapi.entityService.findMany('api::node.node', {
          filters: {
            id: currentNode.id,
          },
          populate: ['parent'],
        });

        const parent = parentNode[0]?.parent;

        if (parent) {
          lineage.push(parent); // Push parent to the current lineage
          allParentsFound = false; // Continue the loop if we added a parent
        }
      }
    }

    // Return the entries and the full lineages
    // console.log("Node Lineages", nodeLineages);

    for (let index = 0; index < nodeLineages.length; index++) {
      // let tempNode = nodeLineages[index];
      console.log('nodeLineages[index]', nodeLineages[index])

      for (let index1 = 0; index <= nodeLineages[index].length; index1++) {
        let tempNode = nodeLineages[index][index1];
        //  console.log('tempNode', tempNode);

        const children = await strapi.entityService.findMany('api::node.node', {
          filters: {
            parent: {
              id: nodeLineages[index][index1].id,
            },
          },
        });

        //       Adding the status property
        nodeLineages[index][index1].status = children.length > 0;
        console.log(' nodeLineages[index][index1].status', nodeLineages[index][index1]);

        break;
      }
    }

    return nodeLineages
  },

  async findNodesWithNullParent() {
    //  Fetch nodes where parent is null
    const nodesWithNullParent = await strapi.entityService.findMany('api::node.node', {
      filters: {
        parent: {
          $null: true,
        },
      },
    });

    //  Iterate over these nodes to check if they are parents to other nodes
    const updatedNodes = await Promise.all(
      nodesWithNullParent.map(async (node) => {
        // Fetch nodes where the current node is the parent
        const children = await strapi.entityService.findMany('api::node.node', {
          filters: {
            parent: {
              name: node.name,
            },
          },
        });

        // Return the node with updated status and empty children array
        return {
          ...node,
          status: children.length > 0, // true if the node has children, false otherwise
          children: [], // Keeping children array empty as per your requirement
        };
      })
    );

    // Step 4: Return the updated nodes
    return updatedNodes;
  },

  //http://localhost:1337/api/nodes?filters[parent][name][$eq]=ab
  async getChildrenPaginated(parentId) {
    // Step 1: Fetch nodes where the given parent id  is the same
    const children = await strapi.entityService.findMany('api::node.node', {
      filters: {
        parent: {
          id: parentId,
        },
      },
    });

    // Step 2: Iterate over the children to check if they are parents to other nodes
    const result = await Promise.all(
      children.map(async (child) => {
        // Fetch nodes where the current child is the parent
        const grandChildren = await strapi.entityService.findMany('api::node.node', {
          filters: {
            parent: {
              id: child.id,
            },
          },
        });

        // Step 3: Set status to true if the child has children, otherwise false
        return {
          id: child.id,
          name: child.name,
          status: grandChildren.length > 0,
        };
      })
    );

    // Step 4: Return the result array of objects
    return result;
  },

  async findAncestors(id) {
    // Retrieve all nodes with only ID and Name
    const allNodes = await strapi.entityService.findMany('api::node.node', {
      fields: ['id', 'name'],
    });

    // Fetch the first children of the given node
    const firstChildren = await strapi.entityService.findMany('api::node.node', {
      filters: {
        parent: {
          id: id,
        },
      },
      fields: ['id', 'name'],
    });

    // Get all descendants recursively
    const descendants = await this.getDescendants(firstChildren);

    // Extract the IDs of all descendants and add the original node's ID
    const descendantIds = descendants.map(descendant => descendant.id);

    descendantIds.push(parseInt(id));//  console.log(descendantIds)

    // Filter out the descendants and the original node from allNodes
    const selectedOptions = allNodes.filter(node => !descendantIds.includes(node.id));

    return selectedOptions
  },


  async getDescendants(childList) {
    let list = [];

    for (const item of childList) {
      list.push(item);

      // Fetch children of the current node
      const children = await strapi.entityService.findMany('api::node.node', {
        filters: {
          parent: {
            id: item.id,
          },
        },
        fields: ['id', 'name'],
      });

      if (children.length > 0) {
        // Recursively fetch descendants of the current children
        const childDescendants = await this.getDescendants(children);
        list = list.concat(childDescendants);
      }
    }

    return list;
  }
};



/**
 *
 * based on the parent name  call the  below api  now api  
 * return object  array each object is the is the child for that parent
 * now for the received child check if they are parent using same api  than 
 *  if they are parent to some nodes then set status to be  true
 * we will send node id  status and name as object in array of object
 *   const children = await strapi.entityService.findMany('api::node.node', {
          filters: {
            parent: {
              name: node.name,
            },
          },
        });


 */