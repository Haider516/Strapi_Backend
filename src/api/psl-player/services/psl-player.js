'use strict';

/**
 * psl-player service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::psl-player.psl-player');
