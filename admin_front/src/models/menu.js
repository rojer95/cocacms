import modelExtend from "dva-model-extend";
import { baseModel } from "./base";
import { create, moveUp, moveDown } from "../services/menu";
import base from "../services/base";
import builder from "../common/treebuilder";

const menuService = base("menu");
const modelService = base("model");

export default modelExtend(baseModel("menu", false), {
  namespace: "menu",
  state: {
    tree: [],
    models: []
  },
  subscriptions: {
    setup({ dispatch, history }) {}
  },
  effects: {
    *add({ payload, cb }, { call, put, select }) {
      yield call(create, payload.data, payload.pid);
      if (cb) {
        cb();
      }
      yield put({ type: "reload" });
    },

    *tree({ payload }, { call, put, select }) {
      const { data: tree } = yield call(menuService.index, { root: 1 });

      yield put({
        type: "save",
        payload: {
          tree: builder(tree)
        }
      });
    },

    *fetchProps({ payload }, { call, put }) {
      const { data: models } = yield call(modelService.index);

      yield put({
        type: "save",
        payload: {
          models
        }
      });
    },

    *moveUp({ payload, cb }, { call, put, select }) {
      yield call(moveUp, payload);
      if (cb) {
        cb();
      }
      yield put({ type: "reload" });
    },

    *moveDown({ payload, cb }, { call, put, select }) {
      yield call(moveDown, payload);
      if (cb) {
        cb();
      }
      yield put({ type: "reload" });
    }
  }
});
