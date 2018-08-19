/*
项目设置--编辑成员页面组件
承接自项目设置--项目信息页面
接收项目信息参数
*/
import React from "react";
import SelMem from "../../../components/setting/select_member/select_member";
import "../../../static/css/common.css";
import "./add_group.css";

const AddGroup = () => (
  <div className="subject minH">
    <span className="reArrow" />
    <b className="title">添加成员分组</b>
    <br />
    <input
      type="text"
      className="inputSize AddGroup_inputMarg"
      placeholder="请为分组命名"
    />
    <SelMem />
  </div>
);

export default AddGroup;