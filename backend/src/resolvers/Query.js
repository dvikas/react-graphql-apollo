const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, args, ctx, info) {
    // Check if it is user
    if (!ctx.request.userId) return null;

    return ctx.db.query.user({
      where: { id: ctx.request.userId }
    }, info)
  },
  users(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!')
    }
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSION_UPDATE']);
    return ctx.db.query.users({}, info);
  }
};

module.exports = Query;
