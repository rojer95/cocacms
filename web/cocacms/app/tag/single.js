'use strict';
const { asyncBuilder } = require('./util');
const nunjucks = require('nunjucks');

class ModelsExtension {
  constructor() {
    this.tags = [ 'single' ];
    this.lineno = 0;
  }

  parse(parser, nodes, lexer) {
    const tok = parser.nextToken();
    this.lineno = tok.lineno + 1;
    const args = parser.parseSignature(null, true);
    let nodataBody = null;

    parser.advanceAfterBlockEnd(tok.value);

    const body = parser.parseUntilBlocks('nodata', 'endsingle');

    if (parser.skipSymbol('nodata')) {
      parser.skip(lexer.TOKEN_BLOCK_END);
      nodataBody = parser.parseUntilBlocks('endsingle');
    }

    parser.advanceAfterBlockEnd();

    return new nodes.CallExtensionAsync(this, 'run', args, [ body, nodataBody ]);
  }


  async run(context, args, body, nodataBody, callback) {
    callback = arguments[arguments.length - 1];

    if (arguments.length !== 5) {
      return callback(new Error(`single 标签_缺少参数 [行${this.lineno}]`), null);
    }

    const ctx = context.ctx.ctx;

    if (!Object.prototype.hasOwnProperty.call(args, 'name') || !args.name) {
      return callback(new Error(`single 标签_缺少name参数 [行${this.lineno}]`), null);
    }

    if (!Object.prototype.hasOwnProperty.call(args, 'item') || !args.item) {
      args.item = 'item';
    }

    try {
      ctx.service.base._table = `${args.model ? ctx.app.config.model.prefix : ''}${args.name}`;
      const result = await ctx.service.base.single(args.where, args.fields);

      const ret = [];
      if (result === null && nodataBody) {
        ret.push(await asyncBuilder(nodataBody));
      } else {
        context.setVariable(args.item, result);
        ret.push(await asyncBuilder(body));
      }

      return callback(null, new nunjucks.runtime.SafeString(ret.join('')));

    } catch (error) {
      return callback(error, null);

    }

  }

}

module.exports = ModelsExtension;
