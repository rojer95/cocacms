'use strict';

const Controller = require('./base');
/**
 * 站点管理
 *
 * @class PluginController
 * @extends {Controller}
 */
class PluginController extends Controller {

  /**
   * 列表
   *
   * @memberof PluginController
   */
  async index() {
    this.ctx.body = await this.service.plugin.index(null, null, [], '*', [[ 'id', 'asc' ]], false);
  }

  /**
   * 加载
   *
   * @memberof PluginController
   */
  async load() {
    this.ctx.body = await this.service.plugin.load();
  }

  /**
   * 开启关闭
   *
   * @memberof PluginController
   */
  async updateOne() {
    const data = await this.ctx.validate({
      id: [{ required: true, message: '请输入ID' }],
      enable: [{ required: true, message: '请输入状态' }],
    });

    const target = await this.service.plugin.show(data.id);
    if (target.installed !== 1) this.error('请先安装插件');
    this.ctx.body = await this.service.plugin.update(data);
    this.ctx.reloadPlugin();
  }

  async install() {
    this.ctx.body = await this.service.plugin.install(this.ctx.params.id);
  }

  async uninstall() {
    this.ctx.body = await this.service.plugin.uninstall(this.ctx.params.id);
  }

}

module.exports = PluginController;