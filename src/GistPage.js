import React, { Component } from 'react';
import { connect } from 'react-redux';

import Spinner from './Spinner.js';
import * as Actions from './Actions.js';
import CodeFile from './CodeFile.js';
import HighlightSelector from './HighlightSelector.js';

class GistPage extends Component {
    constructor(props) {
        super(props);

        this.selectHighlight = this.selectHighlight.bind(this);
        this.showCommentForm = this.showCommentForm.bind(this);
        this.hideCommentForm = this.hideCommentForm.bind(this);
        this.postComment = this.postComment.bind(this);
    }

    componentDidMount() {
        this.props.dispatch(Actions.fetchCode(this.props.match.params.gistId));
        this.props.dispatch(Actions.fetchComments(this.props.match.params.gistId));
    }

    shouldComponentUpdate(nextProps) {
        return !nextProps.loading || (!this.props.loading && nextProps.loading);
    }

    selectHighlight(e) {
        if (e.target) {
            e.preventDefault();
        }
        this.props.dispatch(Actions.changeHighlight(e.target.value));
    }

    showCommentForm(fileName, lineNumber, index, isEdit, e) {
        if (e.target) {
            e.preventDefault();
        }
        this.props.dispatch(this.props.user === null ?
            Actions.showLoginModal() :
            Actions.showCommentForm(this.props.user, fileName, lineNumber, index, isEdit)
        );
    }

    hideCommentForm(e) {
        if (e.target) {
            e.preventDefault();
        }
        this.props.dispatch(Actions.hideCommentForm());
    }

    postComment(comment, commentText, e) {
        if (e.target) {
            e.preventDefault();
        }

        commentText = commentText.trim();

        if (commentText.length > 0) {
            this.props.dispatch(Actions.postComment(
                this.props.match.params.gistId,
                comment,
                commentText
            ));
        }
    }

    render() {
        return (
            <div className={"container main " + this.props.highlight}>
                <HighlightSelector highlight={this.props.highlight} onHighlightChange={this.selectHighlight}/>
                {
                    this.props.loading ?
                        <Spinner/> :
                        this.props.files.map(function(file) {
                            return <CodeFile key={file.name}
                                             name={file.name}
                                             lines={file.lines}
                                             user={this.props.user}
                                             comments={this.props.comments[file.name]}
                                             onAddEditComment={this.showCommentForm}
                                             onCancelComment={this.hideCommentForm}
                                             onSubmitComment={this.postComment}/>
                        }, this)
                }
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        user: state.user.data,
        highlight: state.highlight,
        files: state.code.files,
        comments: state.comments.entries,
        loading: state.code.isFetching || state.comments.isFetching
    }
}

export default connect(mapStateToProps)(GistPage);