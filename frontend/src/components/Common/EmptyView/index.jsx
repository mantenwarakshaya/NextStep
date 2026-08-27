import React, { Component } from "react";
import "./index.css";

class EmptyView extends Component {
  render() {
    // Accessing props using this.props in a class component
    const { message, actionText, onAction } = this.props;

    return (
      <div className="empty-container">
        <p className="empty-text">{message}</p>
        {actionText && (
          <button className="empty-btn" onClick={onAction}>
            {actionText}
          </button>
        )}
      </div>
    );
  }
}

export default EmptyView;
