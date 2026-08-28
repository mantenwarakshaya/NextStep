import React, { Component } from "react";
import "./index.css";

class ErrorView extends Component {
  render() {
    const {
      message = "Something went wrong",
      onRetry,
      className = "",
    } = this.props;

    return (
      <div
        className={`error-container ${className}`.trim()}
        role="alert"
      >
        <div className="error-mark" aria-hidden="true">!</div>
        <p className="error-text">{message}</p>
        {onRetry && (
          <button type="button" className="retry-btn" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  }
}

export default ErrorView;
