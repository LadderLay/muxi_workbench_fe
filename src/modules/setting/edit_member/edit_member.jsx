/*
项目设置--编辑成员页面组件
承接自项目设置--项目信息页面
接收项目信息参数
*/
import React, { Component } from 'react';
import SelectMem from '../../../components/common/member.jsx';
import '../../../static/css/common.css';
import './edit_member.css';

class EditMem extends Component {
  constructor(props){
    super(props);
    this.state = {
      selMembers: [],
      members: [
        {name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},
        {name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},
        {name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},
        {name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},
        {name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},
        {name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},
        {name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},
        {name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},
        {name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},
        {name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},{name: 'AXX',selected: false},
      ],
    };
  }

  transferMsg(mem, selMem){
    this.setState(
      {
        members: mem,
        selMembers: selMem
      }
    );
  }

  selAll(){
    let arr = this.state.members,
        num = 0;
    arr.map(function(i){
      if(i.selected)
        num++;
    })
    if(num === arr.length){
      arr.map(function(i){
        i.selected = false;
      })
    }
    else{
      arr.map(function(i){
        i.selected = true;
      })
    }
    this.setState({members: arr});
  }

  render() {
    return (
      <div className = "subject minH">
        <div className = "title">编辑项目成员</div><br/>
        <div className = "vice">
          <div className = "title littleSize">设置项目成员</div>
          <div className = "tip">选择你要设置的成员</div>
        </div>
        <button className = "saveBtn littltFont btnMarg" onClick = {this.selAll.bind(this)}>全选</button>
        <SelectMem members = {this.state.members} selMembers = {this.state.selMembers} transferMsg = {this.transferMsg.bind(this)} />
        <button className = "saveBtn footMarg">保存项目成员</button>
        <span className = "fakeBtn">取消</span>
      </div>
    );
  }
}

export default EditMem;