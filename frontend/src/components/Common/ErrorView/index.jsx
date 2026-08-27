import React, { Component } from "react";
import "./index.css";

class ErrorView extends Component {
  render() {
    // Default props can be handled via destructuring
    const { message = "Something went wrong", onRetry } = this.props;

    return (
      <div className="error-container">
        <p className="error-text">{message}</p>
        {onRetry && (
          <button className="retry-btn" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  }
}

export default ErrorView;
