'use strict';

const Controller = require('@cocacms/cocacms').Controller;
/**
 * 基础控制器
 *
 * @class BaseController
 * @extends {Controller}
 */
class BaseController extends Controller {
  /**
   * 抛出异常
   *
   * @param {any} msg 异常信息
   * @memberof BaseService
   */
  error(msg) {
    this.ctx.error(msg);
  }

  /**
   * 根据主题渲染
   *
   * @param {any} path 渲染文件（不需要后缀）
   * @param {any} [data={}] 数据
   * @memberof BaseController
   */
  async render(path, data = {}) {
    const theme = await this.service.theme.getActive();
    let themeDir = '';
    if (theme !== null) {
      themeDir = `${theme.dirname}/`;
    }

    const config = await this.service.config.get();

    let hookData = {};
    if (this.app.hooks.render) {
      hookData = await this.app.hooks.render(this.ctx);
    }

    await this.ctx.render(
      `${themeDir}${path}.nj`,
      Object.assign(
        {},
        {
          config,
        },
        hookData,
        data
      )
    );
  }
}

module.exports = BaseController;
