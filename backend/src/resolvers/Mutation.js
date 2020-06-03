const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const mutations = {
  async createItem(parent, args, ctx, info) {
    const item = await ctx.db.mutation.createItem({
      data: {
        ...args
      }
    }, info);
    return item;
  },

  updateItem(parent, args, ctx, info) {
    // frist take a copy of the updates
    const updates = { ...args }
    // remove the ID from the updates
    delete updates.id
    // run the update method
    return ctx.db.mutation.updateItem({
      data: updates,
      where: {
        id: args.id
      }
    }, info)
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // 1. find the item in the
    const item = await ctx.db.query.item({ where }, `{id title}`);
    // 2. Check for permission (if user own that item)
    // TODO
    // 3. Delete Item
    return ctx.db.mutation.deleteItem({ where }, info);
  },

  async signup(parent, args, ctx, info) {
    // lowercase email
    args.email = args.email.toLowerCase();
    const password = await bcrypt.hash(args.password, 10);
    const data = {
      ...args,
      password,
      permissions: { set: ['USER'] }
    };
    // console.log(data)
    // create User in the DB
    const user = await ctx.db.mutation.createUser({
      data
    }, info);
    // create JWT token for user
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // we set JWT as cookie in response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    })
    return user;

  },

  async signin(parent, { email, password }, ctx, info) {

    // 1. check if there is a user with that email address
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error('Invalid username password');
    }
    // 2. check if their password is correct
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid username password');
    }
    // 3. generate the JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // 4. Set the cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    })
    // 5. return User
    return user;
  }
};

module.exports = mutations;
