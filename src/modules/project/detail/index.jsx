import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import ReactSVG from "react-svg";
import { Scrollbars } from "react-custom-scrollbars";
import GoBack from "../../../components/common/goBack/index";
import Icon from "../../../components/common/icon/index";
import FileTreeComponent from "../components/fileTree/index";
import { Root, FileTree } from "../fileTree1";
import Button from "../../../components/common/button/index";
import Select from "../../../components/common/select/index";
import FolderItem from "../components/folderItem/index";
import FileItem from "../components/fileItem/index";
import FolderItemDoc from "../components/folderItemDoc/index";
import DocItem from "../components/docItem/index";
import CreateFileAlertIcon from "../../../assets/svg/commonIcon/editFileAlert.svg";
import ProjectService from "../../../service/project";
import FileService from "../../../service/file";
import "./index.css";
import "../../../static/css/common.css";
// import FileList from '../components/fileList/index';

class ProjectDetailIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pid: undefined,
      // 当前正在操作的fileid
      currentFileId: undefined,
      // 当前正在操作的fileFolderId
      currentFileFolderId: undefined,
      // 当前正在操作的docid
      currentDocId: undefined,
      // 当前正在操作的docFolderId
      currentDocFolderId: undefined,
      // 是否显示创建文件框
      showCreateFile: false,
      // 输入的新文件名
      newFileInputText: "",
      // 是否显示删除文件
      showDleteFile: false,
      // 是否显示移动文件
      showMoveFile: false,
      // 是否显示创建文档
      showCreateDocFile: false,
      // 输入的新文档名
      newDocFileInputText: "",
      // 项目信息
      projectInfo: {},
      // 文件树
      fileTree: {},
      // 文档树
      docTree: {},
      // 当前视图的文件节点id
      fileRootId: 0,
      // 当我视图的文档节点id
      docRootId: 0,
      fileRoot: Root,
      // 创建文件夹和上传文件选项
      fileOption: [
        {
          id: 0,
          value: "上传文件",
          type: "file"
        },
        {
          id: 1,
          value: "创建文件夹"
        }
      ],
      // 创建文档夹和创建文档选项
      docOption: [
        {
          id: 0,
          value: "创建文档"
        },
        {
          id: 1,
          value: "创建文件夹"
        }
      ],
      // 文件（夹）列表
      filesList: {
        FolderList: [],
        FileList: []
      },
      // 文档（夹）列表
      docList: {
        FolderList: [],
        DocList: []
      }
    };
    this.getFileTree = this.getFileTree.bind(this);
    this.getDocTree = this.getDocTree.bind(this);
    this.updateFilesList = this.updateFilesList.bind(this);
    this.updatedocList = this.updatedocList.bind(this);
    this.startCreateFile = this.startCreateFile.bind(this);
    this.changeNewFileInputText = this.changeNewFileInputText.bind(this);
    this.confirmCreateFile = this.confirmCreateFile.bind(this);
    this.moveFile = this.moveFile.bind(this);
    this.startDeleteFile = this.startDeleteFile.bind(this);
    this.deleteFileNode = this.deleteFileNode.bind(this);
    this.confirmDeleteFile = this.confirmDeleteFile.bind(this);
    this.startCreateDoc = this.startCreateDoc.bind(this);
    this.changenewDocFileInputText = this.changenewDocFileInputText.bind(this);
    this.confirmCreateDocFile = this.confirmCreateDocFile.bind(this);
    this.hideAlert = this.hideAlert.bind(this);
  }

  componentWillMount() {
    const { match } = this.props;
    this.setState({
      pid: parseInt(match.params.id, 0)
    });
    const pid = match.params.id;
    ProjectService.getProjectInfo(pid)
      .then(res => {
        this.setState({
          projectInfo: res
        });
      })
      .catch(res => {
        console.error("error", res);
      });
    // this.getFileTree()
    this.updateFilesList();
    this.updatedocList();
    // console.log(getRoot());
    // const child = {folder: true, id: 211, name: "文件夹2-1-1",child:[]}
    // console.log(FileTree.insertNode(child, 21, getRoot()));
    // console.log(FileTree.deleteNode(21, getRoot()));
    // console.log(FileTree.moveNode(21, 1, getRoot()));
  }

  // 获取最新文件树
  getFileTree() {
    const { match } = this.props;
    const pid = match.params.id;
    FileTree.getFileTree(pid)
      .then(res => {
        this.setState({
          fileTree: res
        });
        console.log(res);
      })
      .catch(res => {
        console.error(res);
      });
  }

  // 获取最新文档树
  getDocTree() {
    const { match } = this.props;
    const pid = match.params.id;
    FileTree.getDocTree(pid)
      .then(res => {
        this.setState({
          docTree: res
        });
        console.log(res);
      })
      .catch(res => {
        console.error(res);
      });
  }

  // 根据文件树更新当前视图的文件
  updateFilesList() {
    const { match } = this.props;
    const { fileRootId } = this.state;
    const pid = match.params.id;
    // 请求树
    FileTree.getFileTree(pid)
      .then(res => {
        this.setState({
          fileTree: res
        });
        // 请求filelist
        FileService.getFileList(FileTree.findFileIdList(fileRootId, res))
          .then(res1 => {
            this.setState({
              filesList: res1
            });
            this.hideAlert();
          })
          .catch(res1 => {
            console.error(res1);
          });
      })
      .catch(res => {
        console.error(res);
      });
  }

  // 根据文档树更新当前视图
  updatedocList() {
    const { match } = this.props;
    const { docRootId } = this.state;
    const pid = match.params.id;
    // 请求树
    FileTree.getDocTree(pid)
      .then(res => {
        this.setState({
          docTree: res
        });
        // 请求doclist
        FileService.getDocList(FileTree.findDocIdList(docRootId, res))
          .then(res1 => {
            this.setState({
              docList: res1
            });
          })
          .catch(res1 => {
            console.error(res1);
          });
      })
      .catch(res => {
        console.error(res);
      });
  }

  // 开始创建文件（夹）
  startCreateFile(index) {
    const { pid, fileRootId, fileTree } = this.state;
    if (index === 1) {
      this.hideAlert();
      this.setState({
        showCreateFile: true
      });
    } else {
      /*
      / 这里是上传文件
      */
      const formData = new FormData();
      formData.append("project_id", pid);
      formData.append("file", index);
      FileService.uploadFile(formData)
        .then(res => {
          console.log(res);
          if (res.status === 201) {
            res.json().then(data => {
              // 上传成功，更新文件树
              const newNode = { folder: false, id: data.fid, name: data.name };
              ProjectService.updateProjectFileTree(
                pid,
                JSON.stringify(
                  FileTree.insertNode(newNode, fileRootId, fileTree)
                )
              )
                .then(() => {
                  // 更新视图
                  this.updateFilesList();
                })
                .catch(res1 => {
                  console.error(res1);
                });
              console.log(data);
            });
          }
        })
        .catch(res => {
          console.error(res);
        });
    }
  }

  // 输入新文件夹名字
  changeNewFileInputText(event) {
    this.setState({
      newFileInputText: event.target.value
    });
  }

  // 点击确认创建文件夹
  confirmCreateFile() {
    const { newFileInputText, pid, fileTree, fileRootId } = this.state;
    if (newFileInputText) {
      // 请求创建
      FileService.createFileFolder(newFileInputText, pid)
        .then(res => {
          // 更新树
          const newNode = {
            folder: true,
            id: res.id,
            name: newFileInputText,
            child: []
          };
          ProjectService.updateProjectFileTree(
            pid,
            JSON.stringify(FileTree.insertNode(newNode, fileRootId, fileTree))
          )
            .then(() => {
              // 更新视图
              this.updateFilesList();
              this.setState({
                showCreateFile: false
              });
            })
            .catch(res1 => {
              console.error(res1);
            });
        })
        .catch(res => {
          console.error(res);
        });
    }
  }

  // 开始创建文档（夹）
  startCreateDoc(index) {
    if (index === 0) {
      window.location.href = "/edit";
    }
    if (index === 1) {
      this.hideAlert();
      this.setState({
        showCreateDocFile: true
      });
    }
  }

  // 输入新文档夹名字
  changenewDocFileInputText(event) {
    this.setState({
      newDocFileInputText: event.target.value
    });
  }

  // 点击确认创建文档夹
  confirmCreateDocFile() {
    const { newDocFileInputText, pid, docTree, docRootId } = this.state;
    if (newDocFileInputText) {
      // 请求创建
      FileService.createDocFolder(newDocFileInputText, pid)
        .then(res => {
          const newNode = {
            folder: true,
            id: res.id,
            name: newDocFileInputText,
            child: []
          };
          // 更新文档树
          ProjectService.updateProjectDocTree(
            pid,
            JSON.stringify(FileTree.insertNode(newNode, docRootId, docTree))
          )
            .then(() => {
              // 更新视图
              this.updatedocList();
              this.setState({
                showCreateDocFile: false
              });
            })
            .catch(res1 => {
              console.error(res1);
            });
        })
        .catch(res => {
          console.error(res);
        });
    }
  }

  moveFile(id, pid) {
    this.setState({
      showMoveFile: true
    });
  }

  // 开始删除文件
  startDeleteFile(id, str) {
    this.hideAlert();
    this.setState({
      showDleteFile: true
    });
    if (str === "file") {
      this.setState({
        currentFileId: id
      });
    } else {
      this.setState({
        currentFileFolderId: id
      });
    }
  }

  // 确认删除文件
  confirmDeleteFile() {
    const {
      currentFileId,
      currentFileFolderId,
      fileTree,
      currentDocId,
      currentDocFolderId,
      pid
    } = this.state;
    // 文件
    if (currentFileId) {
      FileService.deleteFile(currentFileId)
        .then(() => {
          // 删除成功
          this.deleteFileNode();
        })
        .catch(el => {
          console.error(el);
        });
    }
    // 文件夹
    if (currentFileFolderId) {
      // FileTree.findFileIdList(21, fileTree)
      // console.log(FileTree.findAllFileList(0, Root))
      // console.log(currentFileFolderId)
      const postData = FileTree.findAllFileList(currentFileFolderId, fileTree);
      console.log(postData);
      FileService.deleteFileFolder(currentFileFolderId, postData)
        .then(() => {
          // 删除成功
          this.deleteFileNode(currentFileFolderId);
        })
        .catch(el => {
          console.error(el);
        });
    }
  }

  // 删除文件树节点并更新视图
  deleteFileNode(id) {
    const { pid, fileTree } = this.state;
    // 更新文档树
    const newTree = FileTree.deleteNode(id, fileTree);
    if (newTree) {
      ProjectService.updateProjectFileTree(
        pid,
        JSON.stringify(FileTree.deleteNode(id, fileTree))
      )
        .then(() => {
          // 更新视图
          this.updateFilesList();
        })
        .catch(el => {
          console.log(el);
        });
    }
  }

  // 隐藏弹出框
  hideAlert() {
    this.setState({
      showCreateDocFile: false,
      showCreateFile: false,
      showDleteFile: false,
      showMoveFile: false,
      currentFileId: undefined,
      currentDocId: undefined
    });
  }

  render() {
    const {
      projectInfo,
      fileOption,
      docOption,
      filesList,
      docList,
      pid,
      showCreateFile,
      newFileInputText,
      showCreateDocFile,
      newDocFileInputText,
      showDleteFile,
      showMoveFile,
      fileRoot
    } = this.state;

    return (
      <div className="projectDetail-container">
        <GoBack />
        <div className="projectDetail-content">
          {/* 头部 */}
          <div className="projectDetail-header">
            <div className="projectDetail-header-left">
              <div className="projectDetail-header-intro">
                <div className="title">{projectInfo.name}</div>
                <div className="tip">{projectInfo.intro}</div>
              </div>
            </div>
            <div className="projectDetail-header-right">
              <div className="projectDetail-header-icon-container">
                <Icon
                  text={`${projectInfo.userCount}`}
                  tip="成员"
                  url="/member"
                />
              </div>
              <div className="projectDetail-header-icon-container">
                <Icon type="trash" tip="回收站" to="/trash" />
              </div>
              <div className="projectDetail-header-icon-container">
                <Icon
                  type="setting"
                  tip="设置"
                  to={`/project/${pid}/setting`}
                />
              </div>
            </div>
          </div>
          {/* 文件内容 */}
          <div className="projectDetail-file-container">
            <div className="projectDetail-file-header">
              <div className="projectDetail-file-title">文件</div>
              <div className="projectDetail-file-select">
                <Select items={fileOption} onChange={this.startCreateFile} />
              </div>
            </div>
            <div className="projectDetail-file-items">
              {filesList.FolderList.map(el => (
                <div className="file-item" key={el.id}>
                  <FolderItem
                    folderItem={el}
                    pid={pid}
                    moveFile={this.moveFile}
                    deleteFile={this.startDeleteFile}
                  />
                </div>
              ))}
              {filesList.FileList.map(el => (
                <div className="file-item" key={el.id}>
                  <FileItem
                    fileItem={el}
                    pid={pid}
                    moveFile={this.moveFile}
                    deleteFile={this.startDeleteFile}
                  />
                </div>
              ))}
            </div>
            <div className="projectDetail-file-footer">
              <Link to={`/project/${pid}/allFile`} className="fakeBtn">
                查看所有文件
              </Link>
            </div>
          </div>
          {/* 文档内容 */}
          <div className="projectDetail-file-container">
            <div className="projectDetail-file-header">
              <div className="projectDetail-file-title">文档</div>
              <div className="projectDetail-file-select">
                <Select items={docOption} onChange={this.startCreateDoc} />
              </div>
            </div>
            <div className="projectDetail-file-items">
              {docList.FolderList.map(el => (
                <div className="file-item" key={el.id}>
                  <FolderItemDoc
                    folderItem={el}
                    pid={pid}
                    moveFile={this.moveFile}
                    deleteFile={this.startDeleteFile}
                  />
                </div>
              ))}
              {docList.DocList.map(el => (
                <div className="file-item" key={el.id}>
                  <DocItem
                    folderItem={el}
                    pid={pid}
                    moveFile={this.moveFile}
                    deleteFile={this.startDeleteFile}
                  />
                </div>
              ))}
            </div>
            <div className="projectDetail-file-footer">
              <Link to={`/project/${pid}/allDoc`} className="fakeBtn">
                查看所有文档
              </Link>
            </div>
          </div>
          {/* 创建文件夹弹出框 */}
          {showCreateFile && (
            <div className="createFileAlert">
              <ReactSVG
                className="create-file-alert-icon"
                path={CreateFileAlertIcon}
              />
              <input
                className="create-file-alert-input"
                type="text"
                placeholder="编辑文件夹名"
                value={newFileInputText}
                onChange={this.changeNewFileInputText}
              />
              <div className="create-file-alert-cancel">
                <Button
                  onClick={this.hideAlert}
                  text="取消"
                  width="65"
                  height="32"
                  border="1px solid RGBA(217, 217, 217, 1)"
                  bgColor="RGBA(255, 255, 255, 1)"
                  textColor="RGBA(64, 64, 64, 1)"
                  fontSize="14"
                />
              </div>
              <div className="create-file-alert-done">
                <Button
                  onClick={this.confirmCreateFile}
                  text="确定"
                  width="65"
                  height="32"
                  fontSize="14"
                />
              </div>
            </div>
          )}
          {/* 删除文件弹出框 */}
          {showDleteFile && (
            <div className="deleteFileAlert">
              <div className="delete-file-alert-tip">确认要删除该文件吗</div>
              <div className="delete-file-alert-cancel">
                <Button
                  onClick={this.hideAlert}
                  text="取消"
                  width="65"
                  height="32"
                  border="1px solid RGBA(217, 217, 217, 1)"
                  bgColor="RGBA(255, 255, 255, 1)"
                  textColor="RGBA(64, 64, 64, 1)"
                  fontSize="14"
                />
              </div>
              <div className="delete-file-alert-done">
                <Button
                  onClick={this.confirmDeleteFile}
                  text="确定"
                  width="65"
                  height="32"
                  fontSize="14"
                />
              </div>
            </div>
          )}
          {/* 移动文件弹出框 */}
          {showMoveFile && (
            <div className="moveFileAlert">
              <div className="move-file-alert-tip">选择保存路径</div>
              <div className="move-file-tree-container">
                <Scrollbars>
                  <FileTreeComponent
                    root={fileRoot}
                    select={() => {
                      const fileRootTemp = Object.assign({}, fileRoot);
                      fileRootTemp.selected = !fileRootTemp.selected;
                      FileTree.initNodeSelected(fileRootTemp);
                      this.setState({
                        fileRoot: fileRootTemp
                      });
                    }}
                    finalSelect={el => {
                      const fileRootTemp = Object.assign({}, fileRoot);
                      FileTree.initNodeFinalSelected(fileRootTemp);
                      let fatherId;
                      if (el.selected || el.router.length === 1) {
                        fatherId = el.id;
                      } else {
                        // 取消选中
                        fatherId = el.router[el.router.length - 2];
                      }
                      const fatherNode = FileTree.searchNode(
                        fatherId,
                        fileRootTemp
                      );
                      fatherNode.finalSelected = true;
                      this.setState({
                        fileRoot: fileRootTemp
                      });
                    }}
                  />
                </Scrollbars>
              </div>
              <div className="move-file-alert-cancel">
                <Button
                  onClick={this.hideAlert}
                  text="取消"
                  width="65"
                  height="32"
                  border="1px solid RGBA(217, 217, 217, 1)"
                  bgColor="RGBA(255, 255, 255, 1)"
                  textColor="RGBA(64, 64, 64, 1)"
                  fontSize="14"
                />
              </div>
              <div className="move-file-alert-done">
                <Button
                  onClick={() => {}}
                  text="确定"
                  width="65"
                  height="32"
                  fontSize="14"
                />
              </div>
            </div>
          )}
          {/* 创建文档夹弹出框 */}
          {showCreateDocFile && (
            <div className="createFileAlert">
              <ReactSVG
                className="create-file-alert-icon"
                path={CreateFileAlertIcon}
              />
              <input
                className="create-file-alert-input"
                type="text"
                placeholder="编辑文档夹名"
                value={newDocFileInputText}
                onChange={this.changenewDocFileInputText}
              />
              <div className="create-file-alert-cancel">
                <Button
                  onClick={this.hideAlert}
                  text="取消"
                  width="65"
                  height="32"
                  border="1px solid RGBA(217, 217, 217, 1)"
                  bgColor="RGBA(255, 255, 255, 1)"
                  textColor="RGBA(64, 64, 64, 1)"
                  fontSize="14"
                />
              </div>
              <div className="create-file-alert-done">
                <Button
                  onClick={this.confirmCreateDocFile}
                  text="确定"
                  width="65"
                  height="32"
                  fontSize="14"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

ProjectDetailIndex.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string
  })
};

ProjectDetailIndex.defaultProps = {
  match: {}
};

export default ProjectDetailIndex;
