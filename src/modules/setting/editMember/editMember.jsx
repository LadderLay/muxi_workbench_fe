/*
项目设置--编辑成员页面组件
承接自项目设置--项目信息页面
接收项目信息参数
*/
import React, { Component } from "react";
import PropTypes from "prop-types";
import FirstEditMember from "../../project/components/firstEditMember/firstEditMember";
import ManageService from "../../../service/manage";
import ProjectService from "../../../service/project";
import WrongPage from "../../../components/common/wrongPage/wrongPage";
import Loading from "../../../components/common/loading/index";
import "./editMember.css";

class EditMember extends Component {
  static changeGroupMemberFormat(mem) {
    const obj = {};

    obj.name = mem.username;
    obj.id = mem.userID;
    obj.email = mem.email;
    obj.role = mem.role;
    obj.avatar = mem.avatar;
    obj.group = mem.groupName;
    obj.selected = false;

    return obj;
  }

  constructor(props) {
    super(props);

    this.state = {
      selMembers: [],
      members: [],
      groups: [],
      checkedIndex: 0,
      wrong: {}
    };

    this.selAll = this.selAll.bind(this);
    this.transferMsgMem = this.transferMsgMem.bind(this);
    this.editProjectMember = this.editProjectMember.bind(this);
    this.changeGroupCheck = this.changeGroupCheck.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  componentDidMount() {
    const {
      match: {
        params: { id }
      }
    } = this.props;
    Loading.show();

    ManageService.getAllMem()
      .then(arr => {
        if (arr) {
          ManageService.getProMember(id)
            .then(member => {
              if (member) {
                const idList = member.list.map(mem => mem.userID);

                const members = arr.list.map(mem1 => {
                  const mem = EditMember.changeGroupMemberFormat(mem1);

                  if (idList.indexOf(mem.id) !== -1) mem.selected = true;

                  return mem;
                });

                this.setState({ members });
              }
            })
            .catch(error => {
              this.setState({ wrong: error });
            })
            .finally(() => {
              Loading.hide();
            });
        }
      })
      .catch(error => {
        this.setState({ wrong: error });
      });
    ManageService.getAllGroup()
      .then(group => {
        if (group) {
          const groupList = group.groupList.map(group1 => {
            const obj = {};
            obj.value = group1.groupName;
            obj.id = group1.groupID;

            return obj;
          });

          groupList.push({ id: 0, value: "全部成员" });

          this.setState({
            groups: groupList,
            checkedIndex: groupList.length - 1
          });
        }
      })
      .catch(error => {
        this.setState({ wrong: error });
      });
  }

  cancel() {
    this.setState({ wrong: {} });
  }

  selAll() {
    this.setState(prevState => {
      const { members: arr1 } = prevState;
      const arr2 = [];
      let num = 0;

      if (arr1) {
        arr1.map(i => {
          if (i.selected) num += 1;
          return i;
        });

        if (num === arr1.length) {
          arr1.map(i => {
            const j = i;
            j.selected = false;
            return j;
          });
        } else {
          arr1.map(i => {
            const j = i;
            j.selected = true;
            arr2.push(j.id);
            return j;
          });
        }
      }

      return { members: arr1, selMembers: arr2 };
    });
  }

  transferMsgMem(members, selMembers) {
    this.setState({
      members,
      selMembers
    });
  }

  editProjectMember() {
    const {
      match: {
        params: { id }
      }
    } = this.props;
    const { selMembers } = this.state;

    ProjectService.editProjectMember(id, selMembers).catch(error => {
      this.setState({ wrong: error });
    });
  }

  changeGroupCheck(index) {
    ManageService.groupMember(index)
      .then(member => {
        if (member) {
          const arr = member.list.map(mem =>
            EditMember.changeGroupMemberFormat(mem)
          );

          this.setState({
            checkedIndex: index,
            members: arr
          });
        }
      })
      .catch(error => {
        this.setState({ wrong: error });
      });
  }

  render() {
    const { members, selMembers, groups, checkedIndex, wrong } = this.state;
    const {
      match: {
        params: { id }
      }
    } = this.props;

    return (
      <div>
        <FirstEditMember
          members={members}
          selMembers={selMembers}
          selAll={this.selAll}
          groups={groups}
          checkedIndex={checkedIndex}
          transferMsg={this.transferMsgMem}
          changeGroupCheck={this.changeGroupCheck}
          proId={Number(id)}
        />

        <button
          type="button"
          className="saveBtn footerBtn"
          onClick={this.editProjectMember}
        >
          保存项目成员
        </button>
        <span className="fakeBtn footerBtn editMember-btnMarg">取消</span>
        <WrongPage info={wrong} cancel={this.cancel} />
      </div>
    );
  }
}

export default EditMember;

EditMember.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  })
};

EditMember.defaultProps = {
  match: {}
};
