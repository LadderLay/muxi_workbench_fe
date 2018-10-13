import React, { Component } from "react";
import PropTypes from "prop-types";
import Goback from "../../../components/common/goBack/index";
import Button from "../../../components/common/button";
import "../../../static/css/common.css";
import StatusService from "../../../service/status";
import "./edit.css";
import "../../../service/cookie";

class edit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: "",
      title: ""
    };
    this.handleChange = this.handleChange.bind(this);
    this.onChange = this.onChange.bind(this);
    this.save = this.save.bind(this);
    this.content = React.createRef;
  }

  componentWillMount() {
    const { match } = this.props;
    if (match.path === `/edit`);
    else {
      StatusService.getStatuDetail(match.params.id).then(doc => {
        if (doc) {
          const value = doc.content;
          const name = doc.title;
          this.setState({
            title: name,
            content: value
          });
        }
      });
    }
  }

  onChange(event) {
    this.setState({
      content: event.target.value
    });
  }

  handleChange(event) {
    this.setState({
      title: event.target.value
    });
  }

  save(title, content) {
    const { match } = this.props;
    if (match.path === "/edit") {
      StatusService.addNewStatu(title, content);
      window.history.back();
    } else {
      StatusService.changeStatu(match.params.id, title, content);
      window.history.back();
    }
  }

  render() {
    const { content, title } = this.state;
    return (
      <div className="subject">
        <div className="head">
          <div className="last">
            <Goback width="33px" height="33px" />
          </div>
          <input
            className="write-input"
            type="text"
            value={title}
            onChange={this.handleChange}
            placeholder="请输入标题"
          />
          <div className="status-save-bt">
            <Button
              onClick={() => {
                this.save(title, content);
              }}
              text="保存并返回"
            />
          </div>
        </div>
        <div>
          <textarea
            className="status-markdown"
            value={content}
            onChange={this.onChange}
          />
          {/* <div id="editor"></div>
          <textarea 
            className="status-markdown"
            value={content}
            onChange={this.onChange}
          /> */}
        </div>
      </div>
    );
  }
}

edit.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string
  })
};

edit.defaultProps = {
  match: {}
};
export default edit;
