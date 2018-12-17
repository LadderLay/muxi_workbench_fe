import React, { Component } from "react";
import Member from "../../setting/components/member/member";
import Button from "../../../components/common/button/index";
import Select from "../../../components/common/select/index";
import ManageService from "../../../service/manage";
import ProjectService from "../../../service/project";
import Loading from "../../../components/common/loading";
import WrongPage from "../../../components/common/wrongPage/wrongPage";
import "../../../static/css/common.css";
import "./index.css";

const gotoBack = () => {
  window.history.back();
};

// 每一组的user
const usersByGroup = {};

// 请求grouplist
const fetchGroups = () =>
  ManageService.getGroupList().then(res => {
    const arr = res.groupList.map(el => {
      const el1 = { id: 0, value: "" };
      el1.id = el.groupID;
      el1.value = el.groupName;
      el1.userCount = el.userCount;
      return el1;
    });
    arr.push({ id: 0, value: "全部成员" });
    return arr;
  });

// 同时初始化项目的文件树和文档树
const initProjectTree = pid => {
  const fileRoot = {
    folder: true,
    id: 0,
    name: "全部文件",
    router: [0],
    selected: true,
    finalSelected: true,
    child: []
  };
  const docRoot = {
    folder: true,
    id: 0,
    name: "全部文档",
    router: [0],
    selected: true,
    finalSelected: true,
    child: []
  };
  return Promise.all([
    ProjectService.updateProjectFileTree(pid, JSON.stringify(fileRoot)),
    ProjectService.updateProjectDocTree(pid, JSON.stringify(docRoot))
  ]);
};

class NewProject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectAllText: "全选",
      groups: [],
      groupCheckedIndex: 0,
      members: [],
      selectedAll: false,
      selMembers: [],
      projectname: "",
      intro: ""
    };
    this.groupMemberInit();
  }

  groupMemberInit = () => {
    Loading.show();
    fetchGroups().then(re => {
      this.setState({
        groups: re,
        groupCheckedIndex: re.length - 1
      }, () => {
        this.fetchGroupMember();
      });
    });
  }

  // 请求group的所有组员
  fetchGroupMember = () => {
    ManageService.groupMember(0)
      .then(re => {
        this.setState({
          members: re.list.map(el => (
            {id: el.userID, name: el.username, groupID: el.groupID, selected: false}
          ))
        })
      })
      .finally(() => {
        Loading.hide();
      });
  }

  changeProjectnameText = event => {
    this.setState({
      projectname: event.target.value
    });
  }

  changeProjectintroText = (event) => {
    this.setState({
      intro: event.target.value
    });
  }

  // 获取当前显示的组员
  currentMember = () => {
    const { groups, groupCheckedIndex, members } = this.state;
    if (groups[groupCheckedIndex] && groups[groupCheckedIndex].id === 0) {
      return members
    }
    return members.filter(item => groups[groupCheckedIndex].id === item.groupID)
  }

  changeGroupCheck = (index, id) => {
    this.setState({
      groupCheckedIndex: index
    });
  }

  checkMember = (id) => {
    const { members } = this.state;
    const len = members.length;
    for (let i = 0; i < len; i += 1) {
      if (members[i].id === id) {
        members[i].selected = !members[i].selected;
        break;
      }
    }
    this.setState({
      members
    })
  }

  checkAll = () => {
    const { groups, groupCheckedIndex, members } = this.state;
    const len = members.length;
    const isSelectedAll = this.selectedAll();
    for (let i = 0; i < len; i += 1) {
      if (groups[groupCheckedIndex] && (groups[groupCheckedIndex].id === 0 || groups[groupCheckedIndex].id === members[i].groupID)) {
        members[i].selected = !isSelectedAll;
      }
    }
    this.setState({
      members
    })
  }

  selectedAll = () => {
    if (this.currentMember().length === 0) {
      return false
    }
    return this.currentMember().every(item => item.selected)
  }

  createProject = () => {
    const { members, projectname, intro } = this.state;
    let chooseMe = false;
    const userlist = members.filter(el => el.selected).map(item => {
      /* eslint-disable */
      if (item.id == localStorage.id) {
        /* eslint-enable */
        chooseMe = true;
      }
      const user = { userID: item.id, userName: item.name };
      return user;
    });
    if (!chooseMe) {
      userlist.push({ userID: localStorage.id, userName: localStorage.name });
    }
    if (!(userlist.length && projectname && intro)) {
      return;
    }
    const postData = {
      username: localStorage.username,
      projectname,
      userlist,
      intro
    };
    ProjectService.createProject(postData)
      .then(res => {
        initProjectTree(res.project_id)
          .then(() => {
            window.location.href = `./${res.project_id}/preview`;
          })
          .catch(error => {
            this.setState({ wrong: error });
          });
      })
      .catch(error => {
        this.setState({ wrong: error });
      });
  }

  render() {
    const {
      members,
      selMembers,
      selectedAll,
      groups,
      groupCheckedIndex,
      selectAllText,
      projectname,
      intro,
      wrong
    } = this.state;
    return (
      <div className="newProject-container">
        <div className="newProject-content">
          <div className="title">新建项目</div>
          <input
            type="text"
            className="newProject-name-input"
            placeholder="项目名称"
            value={projectname}
            onChange={this.changeProjectnameText}
          />
          <textarea
            className="newProject-desc-textarea"
            placeholder="简单描述项目，便于他人了解（选填）"
            value={intro}
            onChange={this.changeProjectintroText}
          />
          <div className="newProject-member">
            <div className="title littleSize">选择项目成员</div>
            <div className="newProject-member-option">
              <div className="tip">选择你要设置的成员</div>
              <div className="newProject-member-tip-right">
                {
                  this.currentMember().length ? (
                    <div>
                      <input
                        type="checkbox"
                        checked={this.selectedAll()}
                        onChange={this.checkAll}
                        id="memberCheckedAll"
                      />
                      <label htmlFor="memberCheckedAll">{selectAllText}</label>
                    </div>
                  ) : ''
                }
                <div className="newProject-group-select">
                  <Select
                    items={groups}
                    checkedIndex={groupCheckedIndex}
                    onChange={this.changeGroupCheck}
                  />
                </div>
              </div>
            </div>
            <div className="newProject-member-container">
              {
                this.currentMember().map((item, index) => (
                  <div className="newProject-member-item" key={item.id}>
                    <input 
                      type="checkbox"
                      checked={item.selected}
                      onClick={() => {this.checkMember(item.id)}}
                      id={item.id}
                    />
                     <label htmlFor={item.id}>
                      {item.name}
                     </label>
                  </div>
                ))
              }
              {
                !this.currentMember().length ? (
                  <div className="tip">还没有成员～</div>
                ) : ''
              }
              <div className="newProject-member-over-helper"></div>
              <div className="newProject-member-over-helper"></div>
              <div className="newProject-member-over-helper"></div>
              <div className="newProject-member-over-helper"></div>
              <div className="newProject-member-over-helper"></div>
            </div>
          </div>
          <div className="newProject-bottom">
            <Button text="创建项目" onClick={this.createProject} />
            <div
              className="newProject-bottom-text fakeBtn"
              onClick={gotoBack}
              onKeyDown={() => {}}
              role="presentation"
            >
              取消
            </div>
          </div>
        </div>

        <WrongPage info={wrong} cancel={this.cancel} />
      </div>
    );
  }
}

export default NewProject;
