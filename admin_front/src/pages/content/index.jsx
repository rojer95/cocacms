import React, { Component } from "react";
import { Row, Col, TreeSelect, Tree, Alert } from "antd";
import name from "components/name";
import Can from "components/can";
import { connect } from "dva";

import styles from "./index.less";
import FormPage from "./components/form";
import TablePage from "./components/table";

const TreeNode = Tree.TreeNode;

let isMount = true;
@name("内容管理")
@connect(({ content }) => ({ content }))
class ContentList extends Component {
  state = {
    categoryNodes: []
  };

  componentDidMount() {
    isMount = true;
    const { dispatch } = this.props;
    dispatch({
      type: "content/fetchCategory"
    });
  }

  componentWillUnmount() {
    isMount = false;
    const { dispatch } = this.props;
    dispatch({
      type: "content/save",
      payload: {
        category: [],
        current: {
          model: {}
        },
        attrs: [],
        rules: {},
        indexs: []
      }
    });
  }

  static getDerivedStateFromProps(props) {
    if (!isMount) {
      return null;
    }

    const renderTreeNodes = data => {
      return data.map(item => {
        if (item.children) {
          return (
            <TreeNode key={item.value} title={item.label} dataRef={item}>
              {renderTreeNodes(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode key={item.value} title={item.label} />;
      });
    };

    const {
      content: { category = [] }
    } = props;
    const categoryNodes = renderTreeNodes(category);

    return { categoryNodes };
  }

  onChangeCategory = selectedKeys => {
    const { dispatch } = this.props;
    dispatch({
      type: "content/changeCategory",
      payload: selectedKeys
    });
  };

  renderContent = (current, attrs, rules, indexs) => {
    //1列表页 2单页 3表单页
    if (current.type === 1) {
      return (
        <TablePage
          current={current}
          attrs={attrs}
          rules={rules}
          indexs={indexs}
        />
      );
    }

    if (current.type === 2 || current.type === 2) {
      return <FormPage current={current} attrs={attrs} rules={rules} />;
    }

    if (current.type === -1) {
      return (
        <Alert
          message="暂无可操作内容，原因：栏目未绑定模型或模型不存在"
          type="warning"
          showIcon
        />
      );
    }

    return <Alert message="请选择栏目" type="info" showIcon />;
  };

  render() {
    const {
      content: {
        category = [],
        current = {},
        attrs = [],
        rules = {},
        indexs = []
      }
    } = this.props;
    return (
      <div>
        <Can api="GET@/api/category" cannot={null}>
          <Row>
            <Col xs={24} xl={0}>
              <TreeSelect
                treeDefaultExpandAll
                placeholder="请选择栏目"
                style={{ width: "100%" }}
                treeData={category}
                onSelect={value => {
                  this.onChangeCategory(value);
                }}
              />
            </Col>
          </Row>
        </Can>
        <Row style={{ minHeight: "70vh" }} type="flex">
          <Col xs={0} xl={4} className={styles.category}>
            {this.state.categoryNodes.length > 0 ? (
              <Tree
                showLine
                defaultExpandAll
                onSelect={value => {
                  this.onChangeCategory(value[0]);
                }}
              >
                {this.state.categoryNodes}
              </Tree>
            ) : (
              <span>无栏目</span>
            )}
          </Col>

          <Col xs={24} xl={20} className={styles.content}>
            <h2>{current.label}</h2>
            {this.renderContent(current, attrs, rules, indexs)}
          </Col>
        </Row>
      </div>
    );
  }
}

export default ContentList;
