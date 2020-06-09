const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');

const mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('Unauthorized user')
    }
    const item = await ctx.db.mutation.createItem({
      data: {
        // This is how to create a relationship between the Item and the User
        user: {
          connect: {
            id: ctx.request.userId,
          },
        },
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
    // const where = { id: 12 };
    // 1. find the item in the
    const item = await ctx.db.query.item({ where }, `{id title user {id}}`);
    // 2. Check for permission (if user own that item)
    const isOwner = item.user.id === ctx.request.userId;
    console.log('Permissions:', ctx.request.user.permissions);
    const canDelete = ctx.request.user.permissions.some(permission => ['ADMIN', 'ITEM_DELETE'].includes(permission));
    console.log(isOwner, canDelete);
    if (!isOwner && !canDelete) {
      throw new Error("You don't have sufficient permissions to delete this item.");
    }
    return ctx.db.mutation.deleteItem({ where }, info);
  },

  async signup(parent, args, ctx, info) {
    // lowercase email
    args.email = args.email.toLowerCase();
    const password = await bcrypt.hash(args.password, 10);
    const data = {
      ...args,
      password,
      permissions: { set: ['USER', 'ADMIN'] }
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
  },

  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Successfully logout' };
  },

  async requestReset(parent, args, ctx, info) {
    console.log(args)
    // 1. check if user exists in db
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`No user found for email ${args.email}`)
    }
    // 2. set reset token and expiry of that user
    const randomBytesPromised = promisify(randomBytes)
    const resetToken = (await randomBytesPromised(20)).toString('hex');
    const resetTokenExpiry = Date.now() + (1000 * 60 * 60) // 1 Hr from now
    const res = await ctx.db.mutation.updateUser({
      data: {
        resetToken, resetTokenExpiry
      },
      where: { email: args.email }
    })
    // 3. email reset token
    const mailRes = await transport.sendMail({
      from: 'support@somedomain.com',
      to: user.email,
      subject: 'Your Password Reset Token',
      html: makeANiceEmail(`Your Password Reset Token is here!
      \n\n
      <a href="${process.env
          .FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>`),
    });
    return { message: resetToken }
  },

  async resetPassword(parent, args, ctx, info) {
    // 1. Check if password match with cnf password
    if (args.password !== args.confirmPassword) {
      throw new Error('Password and confirm password don\'t match.');
    }
    // 2. Check for legit reset token 3. Check if token expires
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - (60 * 60 * 1000)
      }
    })
    if (!user) {
      throw new Error('Invalid or expired token!');
    }

    // 4. hash new password
    const password = await bcrypt.hash(args.password, 10);
    // 5. Set new password to the user and reset old resetToken field
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      }
    });
    // 6. Generate JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    // 7. Set the JWT cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    })
    // 8. return the new User
    return updatedUser;
  },
  async updatePermission(parent, args, ctx, info) {
    // check if user is loggedIn
    if (!ctx.request.userId) {
      throw new Error('You must be logged In')
    }
    // get details of requested user
    const currentUser = await ctx.db.query.user({
      where: {
        id: ctx.request.userId
      }
    }, info);
    // check if loggedin user has permission to do action
    hasPermission(currentUser, ['ADMIN', 'PERMISSION_UPDATE']);
    console.log('args.permissions', args.permissions);

    // update the permission
    ctx.db.mutation.updateUser({
      data: {
        permissions: {
          set: args.permissions
        }
      },
      where: {
        id: args.userId
      }
    }, info);
  },
  async addToCart(parent, args, ctx, info) {
    // 1. make Sure they are signed In
    const userId = ctx.request.userId

    // 2. Query the users current Cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id }
      }
    });

    // 3. Check if that item is already in their Cart if exists then +1
    if (existingCartItem) {
      console.log('This item is already in cart');
      return ctx.db.mutation.updateCartItem({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 }
      })
    }
    // 4. if Item is not in cart then create item
    return ctx.db.mutation.createCartItem({
      data: {
        user: {
          connect: { id: userId }
        },
        item: {
          connect: { id: args.id }
        }
      }
    })
  },

  async removeFromCart(parent, args, ctx, info) {
    // 1. Find the cart item
    const cartItem = await ctx.db.query.cartItem({
      where: {
        id: args.id
      },
    }, `{id, user{ id }}`)
    if (!cartItem) {
      throw new Error('Cart Item not found.')
    }
    // 2. Make sure they own that cart item
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error('Invalid Auth');
    }
    // 3. Delete that cart item
    return ctx.db.mutation.deleteCartItem({
      where: { id: args.id }
    }, info);

  }
};

module.exports = mutations;
