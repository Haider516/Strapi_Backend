module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/tree-custom-api',
      handler: 'tree-custom-api.getData',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    //filterTree
    {
      method: 'GET',
      path: '/tree-custom-api/filter/:filterData',
      handler: 'tree-custom-api.findingNodes',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    //findingPaginatedNodes
    {
      method: 'GET',
      path: '/tree-custom-api/withname/:name',
      handler: 'tree-custom-api.findingPaginatedNodes',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    
    {
      method: 'POST',
      path: '/tree-custom-api',
      handler: 'tree-custom-api.createNode',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/tree-custom-api/:id',
      handler: 'tree-custom-api.deleteNode',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/tree-custom-api/:id',
      handler: 'tree-custom-api.updateNode',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/tree-custom-api/postion/:id',
      handler: 'tree-custom-api.updateNodePosition',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/tree-custom-api/:id',
      handler: 'tree-custom-api.getDataWithID',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
