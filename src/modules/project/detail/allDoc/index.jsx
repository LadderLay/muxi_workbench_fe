import React, { Component } from "react";
import PropTypes from "prop-types";
import Loading from "components/common/loading";
import GoBack from "components/common/goBack/index";
import Icon from "components/common/icon/index";
import Button from "components/common/button/index";
import Select from "components/common/select/index";
import ProjectService from "service/project";
import FileService from "service/file";
import AlertMoveFile from "../../components/alertMoveFile";
import AlertDeleteFile from "../../components/alertDeleteFile";
import AlertCreateFolder from "../../components/alertCreateFolder";
import { FileTree } from "../../fileTree";
import FolderItemDoc from "../../components/folderItemDoc/index";
import DocItem from "../../components/docItem/index";
import DocList from "../../components/docList/index";
import "./index.scss";
import "static/css/common.scss";

class ProjectDetailAllDoc extends Component {
  constructor(props) {
    super(props);
    const { match } = this.props;
    this.state = {
      loading: true,
      // 当前项目id
      pid: parseInt(match.params.pid, 10),
      // 当前视图的文档树节点id
      docRootId: parseInt(match.params.id, 10),
      // 当前视图name
      currentRootName: "",
      // 当前路径
      docUrl: "",
      // 文档树
      docTree: {},
      // 是否是item形式排版
      itemLayOut: true,
      // 当前正在操作的docid
      currentDocId: undefined,
      // 当前正在操作的docFolderId
      currentDocFolderId: undefined,
      // 是否显示创建文档树节点id
      showCreateDocFile: false,
      // 是否显示删除文档
      showDletedoc: false,
      // 是否显示移动文档
      showMoveDoc: false,
      // 文档（夹）列表
      docList: {
        FolderList: [],
        DocList: []
      },
      // 创建文档夹和创建文档选项
      docOption: [
        {
          id: 0,
          value: "创建文档"
        },
        {
          id: 1,
          value: "创建文档夹"
        }
      ]
    };
    this.updateDocList = this.updateDocList.bind(this);
    this.getDocUrl = this.getDocUrl.bind(this);
    this.startCreateDoc = this.startCreateDoc.bind(this);
    this.confirmCreateDocFile = this.confirmCreateDocFile.bind(this);
    this.startDeleteDoc = this.startDeleteDoc.bind(this);
    this.confirmDeleteDoc = this.confirmDeleteDoc.bind(this);
    this.deleteDocNode = this.deleteDocNode.bind(this);
    this.moveDoc = this.moveDoc.bind(this);
    this.docToTop = this.docToTop.bind(this);
    this.confirmMoveDoc = this.confirmMoveDoc.bind(this);
    this.hideAlert = this.hideAlert.bind(this);
    this.changeLayoutToItem = this.changeLayoutToItem.bind(this);
    this.changeLayoutToList = this.changeLayoutToList.bind(this);
  }

  componentDidMount() {
    const {
      match: {
        params: { id }
      }
    } = this.props;
    this.updateDocList(parseInt(id, 10));
  }

  componentWillReceiveProps(nextProps) {
    const { docRootId } = this.state;
    const {
      match: {
        params: { id }
      }
    } = nextProps;
    if (docRootId !== parseInt(id, 10)) {
      this.updateDocList(parseInt(id, 10));
    }
  }

  // 算出当前路径
  getDocUrl(id, tree) {
    const node = FileTree.searchNode(id, tree);
    if (node) {
      if (node.router.length) {
        const DocIdUrl = JSON.parse(JSON.stringify(node.router));
        DocIdUrl.shift();
        const postData = {
          folder: DocIdUrl.map(el => parseInt(el, 0)),
          doc: []
        };
        FileService.getDocList(postData)
          .then(res => {
            let docUrl = `${tree.name}`;
            if (res.FolderList && res.FolderList.length) {
              docUrl += `${res.FolderList.map(el => `/${el.name}`).reduce(
                (el1, el2) => el1 + el2
              )}`;
            }
            this.setState({
              docUrl
            });
          })
          .catch(err => {
            console.error(err);
          });
      }
    }
  }

  // 根据文档树更新当前视图的文档
  updateDocList(id) {
    this.setState({
      loading: true,
      docRootId: id
    });
    const { pid } = this.state;
    // 请求树
    FileTree.getDocTree(pid)
      .then(res => {
        this.setState({
          docTree: res,
          currentRootName: FileTree.searchFolder(id, res).name
        });
        // 算出当前路径
        this.getDocUrl(id, res);
        // 请求doclist
        FileService.getDocList(FileTree.findDocIdList(id, res))
          .then(res1 => {
            this.setState({
              docList: res1,
              loading: false
            });
            this.hideAlert();
          })
          .catch(res1 => {
            console.error(res1);
          });
      })
      .catch(error => {
        console.error(error);
      });
  }

  // 开始创建文档
  startCreateDoc(index) {
    const { docRootId } = this.state;
    if (index === 0) {
      window.location.href = `../newDoc/${docRootId}`;
    }
    if (index === 1) {
      this.hideAlert();
      this.setState({
        showCreateDocFile: true
      });
    }
  }

  // 点击确认创建文档夹
  confirmCreateDocFile(inputText) {
    const { pid, docTree, docRootId } = this.state;
    if (inputText) {
      // 请求创建
      FileService.createDocFolder(inputText, pid)
        .then(res => {
          const newNode = {
            folder: true,
            id: res.id,
            name: inputText,
            child: []
          };
          // 更新文档树
          const newTree = FileTree.insertNode(newNode, docRootId, docTree);
          if (newTree) {
            ProjectService.updateProjectDocTree(pid, JSON.stringify(newTree))
              .then(() => {
                // 更新视图
                this.updateDocList(docRootId);
              })
              .catch(res1 => {
                console.error(res1);
              });
          }
        })
        .catch(res => {
          console.error(res);
        });
    }
  }

  // 开始删除文档
  startDeleteDoc(id, str) {
    this.hideAlert();
    this.setState({
      showDletedoc: true
    });
    if (str === "doc") {
      this.setState({
        currentDocId: id
      });
    } else {
      this.setState({
        currentDocFolderId: id
      });
    }
  }

  // 确认删除文档
  confirmDeleteDoc() {
    const { currentDocId, currentDocFolderId, docTree } = this.state;
    if (currentDocId) {
      FileService.deleteDoc(currentDocId)
        .then(() => {
          // 删除成功
          this.deleteDocNode(currentDocId);
        })
        .catch(el => {
          console.error(el);
        });
    }
    if (currentDocFolderId) {
      const postData = FileTree.findAllDocList(currentDocFolderId, docTree);
      FileService.deleteDocFolder(currentDocFolderId, postData)
        .then(() => {
          // 删除成功
          this.deleteDocNode(currentDocFolderId);
        })
        .catch(el => {
          console.error(el);
        });
    }
  }

  // 删除文档树节点并更新视图
  deleteDocNode(id) {
    const { pid, docTree, docRootId } = this.state;
    const newTree = FileTree.deleteNode(id, docTree).root;
    // 更新文档树
    if (newTree) {
      ProjectService.updateProjectDocTree(pid, JSON.stringify(newTree))
        .then(() => {
          // 更新视图
          this.updateDocList(docRootId);
        })
        .catch(el => {
          console.error(el);
        });
    }
  }

  // 开始移动文档
  moveDoc(id, str) {
    this.setState({
      showMoveDoc: true
    });
    if (str === "doc") {
      this.setState({
        currentDocId: id
      });
    } else {
      this.setState({
        currentDocFolderId: id
      });
    }
  }

  // 确认移动文档
  confirmMoveDoc(finalMoveFolderId) {
    const {
      pid,
      docTree,
      // finalMoveDocId,
      currentDocFolderId,
      currentDocId,
      docRootId
    } = this.state;
    const moveId = currentDocFolderId || currentDocId;
    const docTreeTemp = JSON.parse(JSON.stringify(docTree));
    const newTree = FileTree.moveNode(moveId, finalMoveFolderId, docTreeTemp);
    if (newTree) {
      FileTree.initNodeFinalSelected(newTree);
      FileTree.initNodeSelected(newTree);
      newTree.selected = true;
      newTree.finalSelected = true;
      ProjectService.updateProjectDocTree(pid, JSON.stringify(newTree))
        .then(() => {
          // 更新视图
          this.updateDocList(docRootId);
        })
        .catch(el => {
          console.error(el);
        });
    }
  }

  // 置顶
  docToTop(index) {
    const { pid, docRootId, docTree } = this.state;
    if (index) {
      const docTreeTemp = JSON.parse(JSON.stringify(docTree));
      const docArr = FileTree.searchNode(docRootId, docTreeTemp).child;
      let docStart = 0;
      for (let i = 0; i < docArr.length; i++) {
        if (docArr[i].folder) {
          docStart += 1;
        } else break;
      }
      const topItem = docArr.splice(docStart + index, 1);
      docArr.splice(docStart, 0, topItem[0]);
      ProjectService.updateProjectDocTree(pid, JSON.stringify(docTreeTemp))
        .then(() => {
          // 更新视图
          this.updateDocList(docRootId);
        })
        .catch(el => {
          console.error(el);
        });
    }
  }

  // 隐藏弹出框
  hideAlert() {
    this.setState({
      // 当前正在操作的docid
      currentDocId: undefined,
      // 当前正在操作的docFolderId
      currentDocFolderId: undefined,
      // 是否显示创建文档树节点id
      showCreateDocFile: false,
      // 是否显示删除文档
      showDletedoc: false,
      // 是否显示移动文档
      showMoveDoc: false
      // 移动文档最终选择的id
      // finalMoveDocId: 0
    });
  }

  // 改变布局方式
  changeLayoutToList() {
    this.setState({
      itemLayOut: false
    });
  }

  changeLayoutToItem() {
    this.setState({
      itemLayOut: true
    });
  }

  render() {
    const {
      pid,
      docRootId,
      currentRootName,
      docUrl,
      docOption,
      itemLayOut,
      docList,
      showCreateDocFile,
      showDletedoc,
      showMoveDoc,
      docTree,
      loading
    } = this.state;
    const BatchBtStyle = !docList.DocList.length
      ? {
          visibility: "hidden"
        }
      : {
          visibility: "visible"
        };
    return loading ? (
      <Loading />
    ) : (
      <div className="projectDetail-container">
        <GoBack />
        <div className="projectDetail-content">
          <div className="projectDetail-header projectDetail-allFile-header">
            <div className="projectDetail-header-left">
              <div className="title">{currentRootName}</div>
              <div className="projectDetail-header-left-select">
                <Select items={docOption} onChange={this.startCreateDoc} />
              </div>
            </div>
            <div className="projectDetail-header-right projectDetail-allFile-header-right">
              <div style={BatchBtStyle}>
                <Icon
                  type={itemLayOut ? "FileItemsSel" : "FileItems"}
                  onClick={this.changeLayoutToItem}
                />
              </div>
              <div style={BatchBtStyle}>
                <Icon
                  type={itemLayOut ? "FileLists" : "FileListSel"}
                  onClick={this.changeLayoutToList}
                />
              </div>
              <div style={BatchBtStyle}>
                <Button text="批量管理" to={`../batchDoc/${docRootId}`} />
              </div>
            </div>
          </div>
          {itemLayOut ? (
            <div className="projectDetail-file-items peojectDetail-allFile-items">
              {docList.FolderList.map(el => (
                <div className="file-item" key={el.id}>
                  <FolderItemDoc
                    folderItem={el}
                    pid={pid}
                    moveFile={this.moveDoc}
                    deleteFile={this.startDeleteDoc}
                  />
                </div>
              ))}
              {docList.DocList.map(el => (
                <div className="file-item" key={el.id}>
                  <DocItem
                    folderItem={el}
                    pid={pid}
                    moveFile={this.moveDoc}
                    deleteFile={this.startDeleteDoc}
                  />
                </div>
              ))}
              {!docList.FolderList.length && !docList.DocList.length ? (
                <div className="tip">什么都没有哦～</div>
              ) : null}
            </div>
          ) : (
            <div className="projectDetail-allFile-list">
              {docList.DocList.length ? (
                <div className="projectDetail-allFile-list-title">
                  <div className="projectDetail-allFile-list-name">
                    文件名称
                  </div>
                  <div className="projectDetail-allFile-list-uploader">
                    上传者
                  </div>
                  <div className="projectDetail-allFile-list-time">
                    上传时间
                  </div>
                  <div className="projectDetail-allFile-list-url">路径</div>
                </div>
              ) : null}
              {docList.DocList.map((el, index) => (
                <div key={el.id}>
                  <DocList
                    item={el}
                    pid={pid}
                    index={index}
                    docUrl={docUrl}
                    moveDoc={this.moveDoc}
                    deleteDoc={this.startDeleteDoc}
                    docToTop={this.docToTop}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        {/* 创建文档夹弹出框 */}
        {showCreateDocFile && (
          <AlertCreateFolder
            type="文档"
            cancel={this.hideAlert}
            confirmCreate={this.confirmCreateDocFile}
          />
        )}
        {/* 删除文档弹出框 */}
        {showDletedoc && (
          <AlertDeleteFile
            type="文档"
            cancel={this.hideAlert}
            confirmDelete={this.confirmDeleteDoc}
          />
        )}
        {/* 移动文档弹出框 */}
        {showMoveDoc ? (
          <AlertMoveFile
            fileTree={docTree}
            cancel={this.hideAlert}
            confirmMoveFile={this.confirmMoveDoc}
          />
        ) : (
          ""
        )}
      </div>
    );
  }
}

ProjectDetailAllDoc.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string
  })
};

ProjectDetailAllDoc.defaultProps = {
  match: {}
};

export default ProjectDetailAllDoc;
