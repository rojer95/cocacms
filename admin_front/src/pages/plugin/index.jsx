/**
 * title: 插件管理
 */
import React, { Component } from "react";
import { Table, Form, Row, Col, Button, Popconfirm, Modal, Badge } from "antd";
import Switch from "components/switch";
import Can from "components/can/index";
import { connect } from "dva";
import AutoSetting from "../setting/components/auto";
import Link from "umi/link";

@connect(({ plugin, loading }) => ({ plugin, loading: loading.models.plugin }))
@Form.create()
class PluginPage extends Component {
  state = {
    edit: {
      key: `plugin-setting-0`,
      visible: false,
      attrs: [],
      data: {},
      keyName: 0
    }
  };

  componentDidMount() {
    this.init();
  }

  /**
   * 初始化获取数据
   *
   * @memberof PluginPage
   */
  init = () => {
    const { dispatch, form } = this.props;
    form.resetFields();
    dispatch({
      type: "plugin/list"
    });
  };

  reload = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "plugin/reload"
    });
  };

  toggle = (name, enable) => {
    const { dispatch } = this.props;
    dispatch({
      type: "plugin/toggle",
      payload: {
        name,
        enable
      }
    });
  };

  submit = (setting, name) => {
    const { dispatch } = this.props;
    dispatch({
      type: "plugin/setting",
      payload: {
        name,
        setting
      },
      cb: this.close
    });
  };

  install = name => {
    const { dispatch } = this.props;
    dispatch({
      type: "plugin/install",
      payload: {
        name
      }
    });
  };

  uninstall = name => {
    const { dispatch } = this.props;
    dispatch({
      type: "plugin/uninstall",
      payload: {
        name
      }
    });
  };

  /**
   * 获取搜索表单DOm
   *
   * @memberof PluginPage
   */
  renderFilter = () => {
    return (
      <div>
        <Form className="table-search-form" onSubmit={this.handleSearch}>
          <Row>
            <Col span={24} style={{ textAlign: "right" }}>
              <Can api="GET@/api/plugin/load">
                <Button onClick={this.reload} type="dashed" icon="reload">
                  重新导入
                </Button>
              </Can>
              <Can api="GET@/api/plugin">
                <Button onClick={this.init} className="refresh-btn">
                  刷新
                </Button>
              </Can>
            </Col>
          </Row>
        </Form>
      </div>
    );
  };

  /**
   * 字段定义
   *
   * @memberof PluginPage
   */
  getColumns = () => [
    {
      dataIndex: "name",
      title: "包名"
    },
    {
      dataIndex: "config.name",
      title: "名称"
    },
    {
      dataIndex: "config.type",
      title: "类型",
      render: (text, record) => {
        if (text === 2) {
          return "上传插件";
        }
        return "普通插件";
      }
    },
    {
      dataIndex: "config.author",
      title: "作者"
    },
    {
      dataIndex: "config.mail",
      title: "邮箱"
    },
    {
      dataIndex: "enable",
      title: "启用",
      width: 100,
      align: "center",
      render: (text, record) => {
        return (
          <Switch
            value={text ? 1 : 0}
            onChange={newText => {
              this.toggle(record.name, newText);
            }}
          />
        );
      }
    },
    {
      dataIndex: "setting",
      title: "配置",
      width: 100,
      align: "center",
      render: (text, record) => {
        if (record.type === 2) {
          return <Link to="/setting/uploadSetting">配置</Link>;
        }

        if (record.enable === true) {
          return (
            <a
              onClick={() => {
                this.open(record);
              }}
            >
              配置
            </a>
          );
        }

        return <Badge status="default" text="未开启" />;
      }
    },
    {
      dataIndex: "install",
      title: "安装/卸载",
      width: 180,
      align: "center",
      render: (text, record) => {
        if (text !== true) {
          return (
            <a
              onClick={() => {
                this.install(record.name);
              }}
            >
              安装
            </a>
          );
        }
        return (
          <Popconfirm
            title="确定要卸载吗，卸载后数据有可能不可恢复？"
            okText="卸载"
            cancelText="取消"
            okType="danger"
            placement="topRight"
            onConfirm={() => {
              this.uninstall(record.name);
            }}
          >
            <a className="danger">卸载</a>
          </Popconfirm>
        );
      }
    }
  ];

  close = () => {
    this.setState({
      edit: {
        key: `plugin-setting-0`,
        visible: false,
        attrs: [],
        data: {},
        keyName: ""
      }
    });
  };

  open = record => {
    this.setState({
      edit: {
        key: `plugin-setting-${record.id}`,
        visible: true,
        attrs: record.config.config || [],
        data: record.setting,
        keyName: record.name
      }
    });
  };

  render() {
    const {
      loading,
      plugin: { list = [] }
    } = this.props;
    return (
      <Can api="GET@/api/plugin" cannot={null}>
        <Table
          title={this.renderFilter}
          columns={this.getColumns()}
          loading={loading}
          rowKey="name"
          dataSource={list}
          scroll={{ x: 980 }}
          pagination={false}
        />

        <Modal
          title="编辑配置"
          visible={this.state.edit.visible}
          onCancel={this.close}
          footer={null}
          width="80%"
          style={{ top: "5vh" }}
          bodyStyle={{ maxHeight: "80vh", overflowY: "auto" }}
        >
          <AutoSetting
            key={this.state.edit.key}
            submit={this.submit}
            attrs={this.state.edit.attrs}
            data={this.state.edit.data}
            keyName={this.state.edit.keyName}
          />
        </Modal>
      </Can>
    );
  }
}

export default PluginPage;
