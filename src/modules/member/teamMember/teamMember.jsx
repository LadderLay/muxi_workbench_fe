/*
团队成员页面组件
*/
import React, { Component } from "react";
import { List } from "react-virtualized";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import ManageService from "../../../service/manage";
import MemberInfo from "../memberInfo/memberInfo";
import WrongPage from "../../../components/common/wrongPage/wrongPage";
import Loading from "../../../components/common/loading/index";
import "../../../static/css/common.css";
import "./teamMember.css";

class TeamMember extends Component {
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
      members: [],
      groupList: [],
      selectedID: 0,
      redDot: false,
      wrong: {}
    };
  }

  componentDidMount() {
    const { storeRole } = this.props;

    Loading.show();
    ManageService.getAllMem()
      .then(member => {
        if (member) {
          const arr = member.list.map(mem => {
            const obj = TeamMember.changeGroupMemberFormat(mem);

            return obj;
          });

          this.setState({
            members: arr
          });
        }
      })
      .catch(error => {
        this.setState({ wrong: error });
      });
    ManageService.getAllGroup()
      .then(group => {
        if (group) {
          const arr = group.groupList.map(mem1 => {
            const mem = mem1;
            const obj = {};

            obj.name = mem.groupName;
            obj.id = mem.groupID;
            obj.count = mem.userCount;
            obj.selected = false;
            obj.dealed = false;

            return obj;
          });

          this.setState({
            groupList: arr
          });
        }
      })
      .catch(error => {
        this.setState({ wrong: error });
      })
      .finally(() => {
        Loading.hide();
      });
    if (parseInt(storeRole, 10) > 1) {
      ManageService.getJoinApply()
        .then(obj => {
          if (obj.list.length) {
            this.setState({ redDot: true });
          }
        })
        .catch(error => {
          this.setState({ wrong: error });
        });
    }
  }

  cancel = () => {
    this.setState({ wrong: {} });
  };

  present = id => {
    ManageService.groupMember(id)
      .then(member => {
        if (member) {
          const arr = member.list.map(mem => {
            const obj = TeamMember.changeGroupMemberFormat(mem);

            return obj;
          });

          this.setState({
            members: arr,
            selectedID: id
          });
        }
      })
      .catch(error => {
        this.setState({ wrong: error });
      });
  };

  render() {
    const { members, selectedID, groupList, wrong, redDot } = this.state;
    const { match, storeRole } = this.props;
    const renderRow = info => (
      <div className="teamMember-singleList" key={info.key} style={info.style}>
        <MemberInfo mem={members[info.index]} />
        <span className="teamMember-emailMarg">
          {members[info.index].email}
        </span>
      </div>
    );

    return (
      <div className="subject minH">
        <b className="teamMember-title">木犀团队</b>

        <div className="teamMember-present">
          <div className="teamMember-select">
            <button
              type="button"
              className={`teamMember-singleItem teamMember-selectItem ${
                selectedID === 0 ? "teamMember-singleItemSelected" : ""
              }`}
              onClick={() => {
                this.present(0);
              }}
            >
              团队成员
            </button>
            {groupList.map(group1 => {
              const group = group1;
              return (
                <button
                  type="button"
                  className={`teamMember-singleItem teamMember-selectItem ${
                    group.id === selectedID
                      ? "teamMember-singleItemSelected"
                      : ""
                  }`}
                  key={group.id}
                  onClick={() => {
                    this.present(group.id);
                  }}
                >
                  {group.name}
                </button>
              );
            })}
          </div>
          <div className="teamMember-selectBtn">
            <Link
              className="fakeBtn teamMember-fakeMarg teamMember-applyList"
              to={`${match.url}/joinApply`}
            >
              {parseInt(storeRole, 10) > 1 ? "申请成员列表" : ""}
              <div className={redDot ? "teamMember-inform" : "none"} />
            </Link>
            <Link
              className="fakeBtn teamMember-fakeMarg"
              to={`${match.url}/setManager`}
            >
              {parseInt(storeRole, 10) > 3 ? "设置管理员" : ""}
            </Link>
            <Link
              className="fakeBtn teamMember-fakeMarg"
              to={`${match.url}/addMember`}
            >
              添加成员
            </Link>
            <Link className="fakeBtn" to={`${match.url}/groupManage`}>
              {parseInt(storeRole, 10) > 1 ? "管理分组" : ""}
            </Link>
          </div>
        </div>

        <div className="noneInfoTip">
          {members.length > 0 ? (
            <List
              width={880}
              height={600}
              rowHeight={100}
              rowRenderer={renderRow}
              rowCount={members.length}
            />
          ) : (
            "该分类暂无成员～"
          )}
        </div>

        <WrongPage info={wrong} cancel={this.cancel} />
      </div>
    );
  }
}

TeamMember.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string
  }),
  storeRole: PropTypes.number
};

TeamMember.defaultProps = {
  match: {},
  storeRole: 1
};

const mapStateToProps = state => ({
  storeRole: state.role
});

export default connect(mapStateToProps)(TeamMember);
