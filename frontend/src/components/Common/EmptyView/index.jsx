import React, { Component } from "react";
import "./index.css";

class EmptyView extends Component {
  render() {
    const { message, actionText, onAction, className = "" } = this.props;

    return (
      <div className={`empty-container ${className}`.trim()} role="status">
        <div className="empty-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="empty-text">{message}</p>
        {actionText && (
          <button type="button" className="empty-btn" onClick={onAction}>
            {actionText}
          </button>
        )}
      </div>
    );
  }
}

export default EmptyView;
